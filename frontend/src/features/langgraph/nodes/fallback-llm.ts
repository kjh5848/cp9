'use server';

import { LangGraphState, EnrichedProductInfo } from '../types';

/**
 * Perplexity API를 사용한 LLM 보강 노드
 * 정적/동적 크롤링이 실패했을 때 상품 정보를 보강하는 역할
 * 
 * @param state - LangGraph 상태 객체
 * @returns 업데이트된 상태 객체
 */
export async function fallbackLLMNode(state: LangGraphState): Promise<Partial<LangGraphState>> {
  try {
    const { productIds, keyword } = state.input;
    const enrichedData: EnrichedProductInfo[] = [];

    console.log(`[fallbackLLM] ${productIds.length}개 상품 LLM 보강 시작`);

    for (const productId of productIds) {
      try {
        const enrichedProduct = await enrichProductWithLLM(productId, keyword);
        if (enrichedProduct) {
          enrichedData.push(enrichedProduct);
        }
      } catch (error) {
        console.error(`[fallbackLLM] 상품 ${productId} LLM 보강 실패:`, error);
        // 개별 상품 실패는 전체 프로세스를 중단하지 않음
      }
    }

    console.log(`[fallbackLLM] LLM 보강 완료: ${enrichedData.length}개 상품 정보 보강`);

    return {
      scrapedData: {
        ...state.scrapedData,
        enrichedData
      },
      metadata: {
        ...state.metadata,
        currentNode: 'fallbackLLM',
        completedNodes: [...state.metadata.completedNodes, 'fallbackLLM'],
        updatedAt: Date.now()
      }
    };
  } catch (error) {
    console.error('[fallbackLLM] 오류:', error);
    throw new Error(`LLM 보강 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * Perplexity API를 사용하여 상품 정보를 보강하는 함수
 * 
 * @param productId - 상품 ID
 * @param keyword - 검색 키워드
 * @returns 보강된 상품 정보 또는 null
 */
async function enrichProductWithLLM(productId: string, keyword?: string): Promise<EnrichedProductInfo | null> {
  try {
    // Perplexity API 호출을 위한 프롬프트 구성
    const prompt = generateEnrichmentPrompt(productId, keyword);
    
    // 실제 환경에서는 Perplexity API 클라이언트를 사용
    const enrichedInfo = await callPerplexityAPI(prompt);
    
    if (!enrichedInfo) {
      return null;
    }

    // 기본 상품 정보와 보강 정보를 결합
    const enrichedProduct: EnrichedProductInfo = {
      productId,
      productName: enrichedInfo.productName || `상품 ${productId}`,
      productPrice: enrichedInfo.price || 0,
      productImage: enrichedInfo.image || '',
      productUrl: `https://www.coupang.com/vp/products/${productId}`,
      isRocket: enrichedInfo.isRocket || false,
      isFreeShipping: enrichedInfo.isFreeShipping || false,
      categoryName: enrichedInfo.category || '카테고리 없음',
      rating: enrichedInfo.rating || 0,
      reviewCount: enrichedInfo.reviewCount || 0,
      description: enrichedInfo.description || '',
      specifications: enrichedInfo.specifications || {},
      
      // 보강된 정보
      enrichedFeatures: enrichedInfo.features || [],
      enrichedBenefits: enrichedInfo.benefits || [],
      enrichedTargetAudience: enrichedInfo.targetAudience || '',
      enrichedComparison: enrichedInfo.comparison || '',
      enrichedRecommendations: enrichedInfo.recommendations || []
    };

    return enrichedProduct;
  } catch (error) {
    console.error(`[enrichProductWithLLM] 상품 ${productId} LLM 보강 실패:`, error);
    return null;
  }
}

/**
 * LLM 보강을 위한 프롬프트 생성
 * 
 * @param productId - 상품 ID
 * @param keyword - 검색 키워드
 * @returns 프롬프트 문자열
 */
function generateEnrichmentPrompt(productId: string, keyword?: string): string {
  return `
쿠팡 상품 ID ${productId}에 대한 상세 정보를 제공해주세요.
${keyword ? `검색 키워드: ${keyword}` : ''}

다음 정보를 JSON 형식으로 제공해주세요:
{
  "productName": "상품명",
  "price": "예상 가격 (숫자)",
  "image": "상품 이미지 URL",
  "isRocket": "로켓배송 여부 (boolean)",
  "isFreeShipping": "무료배송 여부 (boolean)",
  "category": "카테고리명",
  "rating": "평점 (0-5)",
  "reviewCount": "리뷰 수",
  "description": "상품 설명",
  "specifications": {
    "스펙명": "스펙값"
  },
  "features": ["주요 특징 1", "주요 특징 2"],
  "benefits": ["주요 장점 1", "주요 장점 2"],
  "targetAudience": "타겟 고객층",
  "comparison": "경쟁 제품과의 비교",
  "recommendations": ["추천 이유 1", "추천 이유 2"]
}

실제 정보를 바탕으로 정확하고 유용한 정보를 제공해주세요.
`;
}

/**
 * Perplexity API 호출 함수 (실제 구현 필요)
 * 
 * @param prompt - 프롬프트
 * @returns API 응답 또는 null
 */
async function callPerplexityAPI(prompt: string): Promise<any | null> {
  try {
    // 실제 환경에서는 Perplexity API 키를 환경변수에서 가져와야 함
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.warn('[callPerplexityAPI] Perplexity API 키가 설정되지 않음');
      return null;
    }

    // Perplexity API 호출 (실제 구현 필요)
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2048,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API 오류: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Perplexity API 응답에 내용이 없음');
    }

    // JSON 파싱 시도
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('[callPerplexityAPI] JSON 파싱 실패:', parseError);
      // JSON 파싱 실패 시 텍스트에서 정보 추출 시도
      return extractInfoFromText(content);
    }
  } catch (error) {
    console.error('[callPerplexityAPI] API 호출 실패:', error);
    return null;
  }
}

/**
 * 텍스트에서 상품 정보를 추출하는 함수 (JSON 파싱 실패 시 사용)
 * 
 * @param text - API 응답 텍스트
 * @returns 추출된 정보 객체
 */
function extractInfoFromText(text: string): any {
  const extracted: any = {};
  
  // 간단한 패턴 매칭으로 정보 추출
  const patterns = {
    productName: /상품명[:\s]*([^\n]+)/i,
    price: /가격[:\s]*([0-9,]+)/i,
    category: /카테고리[:\s]*([^\n]+)/i,
    rating: /평점[:\s]*([0-9.]+)/i,
    reviewCount: /리뷰[:\s]*([0-9,]+)/i
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      extracted[key] = match[1].trim();
    }
  }

  return extracted;
}

/**
 * fallbackLLM 노드의 조건부 실행 함수
 * 
 * @param state - LangGraph 상태 객체
 * @returns 다음 노드 이름
 */
export function fallbackLLMCondition(state: LangGraphState): string {
  const { enrichedData } = state.scrapedData;
  
  // LLM 보강이 성공했으면 다음 노드로 진행
  if (enrichedData && enrichedData.length > 0) {
    return 'seoAgent';
  }
  
  // LLM 보강도 실패했으면 종료
  console.log('[fallbackLLM] LLM 보강 실패, 프로세스 종료');
  return 'END';
}

/**
 * fallbackLLM 노드 테스트 함수
 */
export async function testFallbackLLMNode() {
  const initialState: LangGraphState = {
    input: {
      urls: [],
      productIds: ['123456', '789012'],
      keyword: '노트북'
    },
    scrapedData: { 
      productInfo: [], 
      enrichedData: [] 
    },
    seoContent: { title: '', content: '', keywords: [], summary: '' },
    wordpressPost: { status: 'draft' },
    metadata: {
      threadId: 'test-thread-123',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentNode: 'fallbackLLM',
      completedNodes: ['extractIds', 'staticCrawler', 'dynCrawler']
    }
  };

  try {
    const result = await fallbackLLMNode(initialState);
    console.log('테스트 결과:', result);
    return result;
  } catch (error) {
    console.error('테스트 실패:', error);
    throw error;
  }
} 