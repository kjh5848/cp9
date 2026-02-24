export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSeoSkillTemplate } from './seo-skill-parser'
import { gptModel, openAiSdk } from '@/infrastructure/clients/openai'
import { perplexityModel } from '@/infrastructure/clients/perplexity'

// 환경변수
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 인스턴스는 키가 있을 때만 생성하여 런타임/빌드 에러 방지
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

interface ItemResearchRequest {
  itemName: string
  projectId: string
  itemId: string
  productData?: {
    productName: string
    productPrice: number
    productImage: string
    productUrl: string
    categoryName: string
    isRocket: boolean
    isFreeShipping: boolean
  }
  seoConfig?: {
    persona: string
    toneAndManner: string
  }
}

interface ItemResearchResponse {
  itemName: string
  projectId: string
  itemId: string
  researchData: any
  success: boolean
}

export async function POST(request: NextRequest) {
  try {
    const requestText = await request.text()
    const body: ItemResearchRequest = JSON.parse(requestText)

    if (!body.itemName || !body.projectId || !body.itemId) {
      return NextResponse.json(
        { error: 'itemName, projectId, and itemId are required' },
        { status: 400 }
      )
    }

    const persona = body.seoConfig?.persona || "Single_Expert"
    const tone = body.seoConfig?.toneAndManner || "Professional"

    console.log('🚀 [SEO-Pipeline] 작업을 시작합니다:', {
      itemName: body.itemName,
      persona,
      tone
    });

    // 1. LLM 클라이언트 준비 (Infrastructure 분리)
    // 상단에서 import하여 사용합니다.

    // 스킬 프롬프트 로딩
    const perplexityPromptStr = await getSeoSkillTemplate('perplexity-prompts.md');
    const gptPromptStr = await getSeoSkillTemplate('gpt-prompts.md');
    const dallePromptStr = await getSeoSkillTemplate('dalle-prompts.md');

    // 프롬프트 정규표현식 파싱 (간이 구현 - 실제론 섹션별 파싱 로직 권장)
    // 1. Phase 1: Perplexity 리서치 시작
    console.log('🔍 [Phase 1] Perplexity 리서치 진행 중...');
    const itemsJson = JSON.stringify([{
      name: body.itemName,
      price: body.productData?.productPrice,
      url: body.productData?.productUrl,
      features: "쿠팡 인기 파트너스 상품"
    }]);
    
    // 임시 시스템+유저 프롬프트 조합
    const perplexityChainInput = `
      ${perplexityPromptStr}
      
[요청 페르소나]: ${persona}
      
[상품 데이터]: ${itemsJson}
      
위 지침에 맞추어 최신 리서치 데이터를 작성하라.
    `;
    let researchData = "";
    try {
      const perplexityRes = await perplexityModel.invoke(perplexityChainInput);
      researchData = perplexityRes.content.toString();
    } catch (err) {
      console.warn("⚠️ Perplexity API 호출 실패, Mock 데이터로 대체합니다.", err);
      researchData = `[Mock 리서치 데이터]\n\n목표 상품: ${body.itemName}\n페르소나: ${persona}\n\n이 데이터는 Perplexity API 키 미설정 혹은 호출 에러로 인해 대체 생성된 가상 리서치 텍스트입니다.`;
    }

    // 2. Phase 2: GPT SEO 블로그 본문 작성
    console.log('✍️ [Phase 2] GPT SEO 본문 작성 중...');
    const gptChainInput = `
      ${gptPromptStr}
      
[설정 톤앤매너]: ${tone}
      
[페르소나]: ${persona}
      
[리서치 데이터]: ${researchData}
      
위 리서치 데이터를 바탕으로 완벽한 SEO 마크다운 포스트를 작성하라.
    `;
    let seoContent = "";
    try {
      const gptRes = await gptModel.invoke(gptChainInput);
      seoContent = gptRes.content.toString();
    } catch (err) {
      console.warn("⚠️ GPT API 호출 실패, Mock 데이터로 대체합니다.", err);
      seoContent = `# ${body.itemName} - 추천 가이드\n\n이 글은 GPT API 키 미설정 혹은 호출 에러로 인해 대체 생성된 샘플 SEO 마크다운 포스트입니다.\n\n## 1. 개요\n${persona} 페르소나 및 ${tone} 톤앤매너가 적용되는 구간입니다.\n\n## 2. 결론\n이 상품은 테스트 데이터를 시연하기 위함입니다.`;
    }

    // 3. Phase 3: DALL-E 대표 썸네일 이미지 추출 프롬프트
    console.log('🎨 [Phase 3] DALL-E 썸네일 생성 중...');
    const dalleChainInput = `
      ${dallePromptStr}
      
[블로그 제목/카테고리]: ${body.itemName} / ${body.productData?.categoryName || '상품'}
    `;
    let imagePrompt = "";
    try {
      const dalleRes = await gptModel.invoke(dalleChainInput);
      imagePrompt = dalleRes.content.toString();
    } catch (err) {
      console.warn("⚠️ GPT 프롬프트 추론 실패, Mock 데이터로 대체합니다.", err);
      imagePrompt = `A high quality, aesthetic promo picture of ${body.itemName}`;
    }
    
    // 실제 DALL-E 3 이미지 API 연동
    let actualImageUrl = null;
    try {
      console.log('🖼️ DALL-E API 호출 시작...', { prompt: imagePrompt.substring(0, 50) + '...' });
      const imageResponse = await openAiSdk.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024"
      });
      actualImageUrl = imageResponse.data?.[0]?.url || null;
      if (actualImageUrl) {
        console.log('✅ DALL-E 이미지 생성 성공:', actualImageUrl);
      } else {
        throw new Error('No URL returned from DALL-E');
      }
    } catch (dalleError) {
      console.error('❌ DALL-E 이미지 생성 실패 (Mock으로 폴백):', dalleError);
      actualImageUrl = "https://via.placeholder.com/1024x1024?text=DALL-E+Generation+Failed";
    }

    console.log('✅ [SEO-Pipeline] 파이프라인 생성 완료!');
    
    // DB 저장 (원래 Edge Function이 하던 역할)
    // 임시로 ResearchItem 테이블에 바로 업데이트/삽입
    const finalResearchPack = {
      itemId: body.itemId,
      title: body.itemName,
      content: seoContent,
      thumbnailPrompt: imagePrompt,
      thumbnailUrl: actualImageUrl,
      researchRaw: researchData,
    };

    if (supabase) {
      const { error: dbError } = await supabase
        .from('ResearchItem')
        .upsert({
          projectId: body.projectId,
          itemId: body.itemId,
          pack: finalResearchPack,
          updatedAt: new Date().toISOString()
        }, { onConflict: 'projectId, itemId' });

      if (dbError) {
        console.warn('DB Upsert Error:', dbError);
      }
    } else {
      console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다. DB 저장을 스킵합니다.');
    }

    return NextResponse.json({
      projectId: body.projectId,
      itemId: body.itemId,
      itemName: body.itemName,
      success: true,
      researchData: {
        content: seoContent,
        thumbnailPrompt: imagePrompt,
        researchRaw: researchData
      }
    } as ItemResearchResponse)

  } catch (error) {
    console.error('Item research error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'SEO Pipeline endpoint is active.' })
}
