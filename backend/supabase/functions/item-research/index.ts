// @ts-ignore: Deno 모듈 import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { createEdgeFunctionHandler, safeJsonParse, validateEnvVars } from '../_shared/server.ts';
import { ok, fail } from '../_shared/response.ts';
import { ResearchPack } from '../_shared/type.ts';

// Deno 환경 타입 선언
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface ItemResearchRequest {
  itemName: string;
  projectId: string;
  itemId: string;
  productData?: {
    productName: string;
    productPrice: number;
    productImage: string;
    productUrl: string;
    categoryName: string;
    isRocket: boolean;
    isFreeShipping: boolean;
  };
}

interface ItemResearchResponse {
  itemName: string
  researchData: {
    overview: string
    features: string[]
    benefits: string[]
    targetAudience: string
    marketAnalysis: string
    recommendations: string[]
    priceRange: string
    popularBrands: string[]
  }
  success: boolean
}

async function researchItemWithPerplexity(itemName: string): Promise<ItemResearchResponse['researchData']> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')
  
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not found')
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: '당신은 상품 분석 전문가입니다. 주어진 상품명에 대해 최신 시장 정보를 바탕으로 상세한 분석을 제공하세요. 응답은 반드시 JSON 형식으로만 제공해주세요. 한글 상품명을 정확히 인식하고 처리해주세요.'
          },
          {
            role: 'user',
            content: `상품명: "${itemName}"

위 상품에 대해 다음 정보를 JSON 형식으로 분석해주세요:
{
  "overview": "상품 개요 (2-3문장)",
  "features": ["주요 기능 1", "주요 기능 2", "주요 기능 3"],
  "benefits": ["장점 1", "장점 2", "장점 3"],
  "targetAudience": "타겟 고객층",
  "marketAnalysis": "시장 분석 (트렌드, 경쟁 상황)",
  "recommendations": ["구매 추천 이유 1", "구매 추천 이유 2"],
  "priceRange": "일반적인 가격대",
  "popularBrands": ["인기 브랜드 1", "인기 브랜드 2", "인기 브랜드 3"]
}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content in Perplexity response')
    }

    // JSON 파싱 시도
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
      const parsedData = JSON.parse(cleanContent)
      
      return {
        overview: parsedData.overview || '상품 개요를 찾을 수 없습니다.',
        features: Array.isArray(parsedData.features) ? parsedData.features : [],
        benefits: Array.isArray(parsedData.benefits) ? parsedData.benefits : [],
        targetAudience: parsedData.targetAudience || '타겟 고객층 정보가 없습니다.',
        marketAnalysis: parsedData.marketAnalysis || '시장 분석 정보가 없습니다.',
        recommendations: Array.isArray(parsedData.recommendations) ? parsedData.recommendations : [],
        priceRange: parsedData.priceRange || '가격 정보가 없습니다.',
        popularBrands: Array.isArray(parsedData.popularBrands) ? parsedData.popularBrands : []
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // 파싱 실패 시 기본 데이터 반환
      return {
        overview: content.substring(0, 200) + '...',
        features: ['AI 분석 중...'],
        benefits: ['분석 결과 처리 중...'],
        targetAudience: '분석 중...',
        marketAnalysis: content.substring(0, 300) + '...',
        recommendations: ['상세 분석 진행 중...'],
        priceRange: '분석 중...',
        popularBrands: ['분석 중...']
      }
    }
  } catch (error) {
    console.error('Perplexity API call failed:', error)
    // 기본 응답 반환
    return {
      overview: `${itemName}에 대한 기본 정보를 제공합니다.`,
      features: ['주요 기능 분석 중'],
      benefits: ['장점 분석 중'],
      targetAudience: '일반 사용자',
      marketAnalysis: '시장 분석 진행 중...',
      recommendations: ['추후 상세 분석 예정'],
      priceRange: '가격 조사 중...',
      popularBrands: ['브랜드 조사 중']
    }
  }
}

async function handleItemResearch(req: Request): Promise<Response> {
  // 필수 환경 변수 검증
  const missingEnvVars = validateEnvVars([
    'SUPABASE_URL', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'PERPLEXITY_API_KEY'
  ]);
  
  if (missingEnvVars.length > 0) {
    return fail(
      `필수 환경 변수가 설정되지 않았습니다: ${missingEnvVars.join(', ')}`,
      "ENV_VARS_MISSING",
      500
    );
  }

  // Supabase 클라이언트 초기화
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // 요청 데이터 파싱
  const body = await safeJsonParse<ItemResearchRequest>(req);
  if (!body) {
    return fail("요청 데이터를 파싱할 수 없습니다.", "INVALID_JSON", 400);
  }

  const { itemName, projectId, itemId, productData } = body;
  
  if (!itemName || !projectId || !itemId) {
    return fail(
      'itemName, projectId, itemId가 필요합니다.',
      "VALIDATION_ERROR", 
      400
    );
  }

    console.log('Research request:', { itemName, projectId, itemId })
    
    const researchData = await researchItemWithPerplexity(itemName)

    // ResearchPack 형태로 데이터 구성
    const researchPack = {
      itemId,
      title: productData?.productName || itemName,
      priceKRW: productData?.productPrice || null,
      isRocket: productData?.isRocket || null,
      features: researchData.features,
      pros: researchData.benefits,
      cons: ['AI 분석으로 단점 파악 중...'], // 기본값
      keywords: researchData.popularBrands,
      metaTitle: `${itemName} 리뷰 및 구매 가이드`,
      metaDescription: researchData.overview,
      slug: itemName.toLowerCase().replace(/\s+/g, '-')
    };

    // research 테이블에 저장
    const { error: dbError } = await supabase
      .from('research')
      .upsert({
        project_id: projectId,
        item_id: itemId,
        pack: researchPack,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id,item_id' });

  if (dbError) {
    console.error('Database error:', dbError);
    return fail(
      'Database save failed',
      "DATABASE_ERROR",
      500,
      { details: dbError.message }
    );
  }

  const response: ItemResearchResponse = {
    itemName,
    researchData,
    success: true
  }

  console.log('Research completed and saved for:', itemName);

  return ok(response);
}

serve(createEdgeFunctionHandler(handleItemResearch));