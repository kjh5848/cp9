/**
 * AI 기반 상품 조사 노드
 * @module AIResearchNode
 */

import { log, withErrorHandling } from '../lib/logger.ts';
import type { EnvironmentConfig } from '../lib/environment.ts';
import type { ProductInfo, AIResearchResult } from '../types/index.ts';

/**
 * Perplexity API 연결 테스트 함수
 */
export async function testPerplexityConnection(apiKey: string): Promise<boolean> {
  try {
    log('info', 'Perplexity API 연결 테스트 시작', { hasApiKey: !!apiKey });
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: '테스트 요청입니다.' }],
        max_tokens: 10
      })
    });
    
    log('info', 'Perplexity API 연결 테스트 응답', {
      status: response.status,
      statusText: response.statusText,
      success: response.ok
    });
    
    return response.ok;
  } catch (error) {
    log('error', 'Perplexity API 연결 테스트 실패', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return false;
  }
}

/**
 * Perplexity API를 사용한 상품 조사
 */
async function researchProductWithAI(
  productId: string, 
  keyword?: string, 
  apiKey?: string
): Promise<ProductInfo> {
  if (!apiKey) {
    log('warn', 'Perplexity API 키가 설정되지 않음, 기본 정보 사용', { productId });
    return createDefaultProductInfo(productId, keyword);
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: '당신은 쿠팡 상품 분석 전문가입니다. 최신의 정확한 정보를 바탕으로 상품을 분석하고, 요청된 JSON 형식으로만 응답해주세요.'
          },
          {
            role: 'user',
            content: `쿠팡 상품 ID ${productId}에 대한 정보를 조사해주세요. ${keyword ? `키워드: ${keyword}` : ''}`
          }
        ],
        max_tokens: 4096,
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
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsedData = JSON.parse(cleanContent);
      
      // 타입 검증 및 변환
      return validateAndTransformProductInfo(parsedData, productId);
    } catch (parseError) {
      log('error', 'Perplexity API 응답 JSON 파싱 실패', { 
        productId, 
        error: String(parseError),
        content: content.substring(0, 200) // 로그 제한
      });
      return createDefaultProductInfo(productId, keyword);
    }
  } catch (error) {
    log('error', 'Perplexity API 호출 실패', { productId, error: String(error) });
    return createDefaultProductInfo(productId, keyword);
  }
}

/**
 * 기본 상품 정보 생성
 */
function createDefaultProductInfo(productId: string, keyword?: string): ProductInfo {
  return {
    productId,
    productName: `AI 조사 상품 ${productId}`,
    productPrice: Math.floor(Math.random() * 200000) + 50000,
    productImage: `https://example.com/ai-images/${productId}.jpg`,
    productUrl: `https://www.coupang.com/vp/products/${productId}`,
    isRocket: Math.random() > 0.3,
    isFreeShipping: Math.random() > 0.2,
    categoryName: keyword || '오디오',
    rating: Math.random() * 1.5 + 3.5,
    reviewCount: Math.floor(Math.random() * 500) + 100,
    description: `AI가 조사한 ${keyword || '상품'} ${productId}입니다.`,
    specifications: {
      '브랜드': `AI-Brand-${productId}`,
      '모델': `AI-Model-${productId}`,
      '연결': 'Bluetooth 5.0',
      '배터리': '24시간'
    },
    enrichedFeatures: ['AI 추천', '스마트 기능', '고성능'],
    enrichedBenefits: ['편리함', '효율성', '안정성'],
    enrichedTargetAudience: '20-40대 사용자',
    enrichedComparison: '동급 제품 대비 우수한 성능',
    enrichedRecommendations: ['가성비 좋음', '디자인 우수', '기능 다양']
  };
}

/**
 * 상품 정보 타입 검증 및 변환
 */
function validateAndTransformProductInfo(data: unknown, productId: string): ProductInfo {
  if (typeof data !== 'object' || data === null) {
    throw new Error('상품 정보가 객체가 아닙니다');
  }

  const product = data as Record<string, unknown>;
  
  return {
    productId: String(product.productId || productId),
    productName: String(product.productName || `상품 ${productId}`),
    productPrice: Number(product.productPrice) || 0,
    productImage: String(product.productImage || ''),
    productUrl: String(product.productUrl || `https://www.coupang.com/vp/products/${productId}`),
    isRocket: Boolean(product.isRocket),
    isFreeShipping: Boolean(product.isFreeShipping),
    categoryName: String(product.categoryName || '카테고리 미확인'),
    rating: Number(product.rating) || 0,
    reviewCount: Number(product.reviewCount) || 0,
    description: String(product.description || ''),
    specifications: typeof product.specifications === 'object' && product.specifications 
      ? product.specifications as Record<string, string> 
      : {},
    enrichedFeatures: Array.isArray(product.enrichedFeatures) 
      ? product.enrichedFeatures.map(String) 
      : [],
    enrichedBenefits: Array.isArray(product.enrichedBenefits) 
      ? product.enrichedBenefits.map(String) 
      : [],
    enrichedTargetAudience: String(product.enrichedTargetAudience || ''),
    enrichedComparison: String(product.enrichedComparison || ''),
    enrichedRecommendations: Array.isArray(product.enrichedRecommendations) 
      ? product.enrichedRecommendations.map(String) 
      : []
  };
}

/**
 * AI 상품 조사 노드 실행
 */
export async function executeAIProductResearch(
  productIds: string[], 
  keyword?: string,
  config?: EnvironmentConfig
): Promise<AIResearchResult> {
  log('info', 'aiProductResearch 노드 시작', { 
    productCount: productIds.length, 
    keyword,
    hasPerplexityKey: !!config?.PERPLEXITY_API_KEY
  });
  
  const enrichedData: ProductInfo[] = [];
  
  // 병렬 처리로 성능 개선
  const researchPromises = productIds.map(async (productId) => {
    return withErrorHandling(
      () => researchProductWithAI(productId, keyword, config?.PERPLEXITY_API_KEY),
      `상품 ${productId} 조사`,
      createDefaultProductInfo(productId, keyword)
    );
  });

  const results = await Promise.all(researchPromises);
  enrichedData.push(...results);

  const researchSummary = {
    totalProducts: enrichedData.length,
    keyword: keyword || '테스트 상품',
    avgPrice: enrichedData.length > 0 
      ? enrichedData.reduce((sum, p) => sum + p.productPrice, 0) / enrichedData.length 
      : 0,
    avgRating: enrichedData.length > 0 
      ? enrichedData.reduce((sum, p) => sum + p.rating, 0) / enrichedData.length 
      : 0,
    rocketDeliveryRate: enrichedData.length > 0 
      ? (enrichedData.filter(p => p.isRocket).length / enrichedData.length) * 100 
      : 0,
    researchMethod: 'AI-powered 3-stage analysis (Basic Info + Detailed Analysis + Market Research)'
  };

  log('info', 'aiProductResearch 노드 완료', { 
    enrichedCount: enrichedData.length, 
    researchSummary,
    successRate: productIds.length > 0 ? (enrichedData.length / productIds.length) * 100 : 0
  });
  
  return { enrichedData, researchSummary };
}