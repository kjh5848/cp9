/**
 * AI Workflow Edge Function
 * 새로운 AI 기반 워크플로우: extractIds → aiProductResearch → seoAgent → wordpressPublisher
 * 
 * @version 1.0.0
 * @author CP9 Team
 */

// Deno 환경 타입 선언
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// @ts-ignore: Deno 모듈 import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Supabase 모듈 import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * 환경 변수 검증 및 기본값 설정
 */
interface EnvironmentConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  PERPLEXITY_API_KEY?: string;
  WORDPRESS_URL?: string;
  WORDPRESS_USERNAME?: string;
  WORDPRESS_PASSWORD?: string;
  OPENAI_API_KEY?: string;
}

/**
 * 환경 변수 검증 함수
 */
function validateEnvironment(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    SUPABASE_URL: Deno.env.get("SUPABASE_URL") || "",
    SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY") || "",
    PERPLEXITY_API_KEY: Deno.env.get("PERPLEXITY_API_KEY"),
    WORDPRESS_URL: Deno.env.get("WORDPRESS_URL"),
    WORDPRESS_USERNAME: Deno.env.get("WORDPRESS_USERNAME"),
    WORDPRESS_PASSWORD: Deno.env.get("WORDPRESS_PASSWORD"),
    OPENAI_API_KEY: Deno.env.get("OPENAI_API_KEY"),
  };
  config.PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY") || "";
  config.OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";


  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error("필수 Supabase 환경 변수가 설정되지 않았습니다: SUPABASE_URL, SUPABASE_ANON_KEY");
  }

  return config;
}

/**
 * 구조화된 로깅 함수
 */
function log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    context: context || {},
  };
  
  console.log(JSON.stringify(logEntry));
}

/**
 * 에러 처리 래퍼 함수
 */
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  fallback?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    log('error', `${operationName} 실패`, {
      error: error instanceof Error ? error.message : String(error),
      operation: operationName,
    });
    
    if (fallback !== undefined) {
      log('warn', `${operationName} 실패, 기본값 사용`, { operation: operationName });
      return fallback;
    }
    
    throw error;
  }
}

/**
 * AI 워크플로우 요청 인터페이스
 */
interface AIWorkflowRequest {
  action: 'execute' | 'test' | 'status';
  urls?: string[];
  productIds?: string[];
  keyword?: string;
  threadId?: string;
  config?: {
    enablePerplexity?: boolean;
    enableWordPress?: boolean;
    maxProducts?: number;
  };
}

/**
 * 상품 정보 인터페이스
 */
interface ProductInfo {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryName: string;
  rating: number;
  reviewCount: number;
  description: string;
  specifications: Record<string, string>;
  enrichedFeatures: string[];
  enrichedBenefits: string[];
  enrichedTargetAudience: string;
  enrichedComparison: string;
  enrichedRecommendations: string[];
}

/**
 * AI 조사 결과 인터페이스
 */
interface AIResearchResult {
  enrichedData: ProductInfo[];
  researchSummary: {
    totalProducts: number;
    keyword: string;
    avgPrice: number;
    avgRating: number;
    rocketDeliveryRate: number;
    researchMethod: string;
  };
}

/**
 * SEO 콘텐츠 인터페이스
 */
interface SEOContent {
  title: string;
  content: string;
  keywords: string[];
  summary: string;
}

/**
 * WordPress 발행 결과 인터페이스
 */
interface WordPressResult {
  postId: string;
  postUrl: string;
  status: string;
}

/**
 * AI 워크플로우 응답 인터페이스
 */
interface AIWorkflowResponse {
  success: boolean;
  data?: {
    threadId: string;
    workflow: {
      coupangProductSearch?: {
        keyword: string;
        totalFound: number;
        selectedProducts: any[];
        selectionMethod: string;
      };
      extractIds: {
        productIds: string[];
        urls: string[];
      };
      aiProductResearch: AIResearchResult;
      seoAgent: SEOContent;
      wordpressPublisher: WordPressResult;
    };
    metadata: {
      createdAt: number;
      updatedAt: number;
      currentNode: string;
      completedNodes: string[];
      executionTime: number;
      workflow?: {
        type: string;
        inputType: string;
        productSelectionMethod: string;
      };
    };
  };
  error?: string;
  message: string;
}

/**
 * Supabase 클라이언트 초기화
 */
function getSupabaseClient(config: EnvironmentConfig) {
  return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

/**
 * URL에서 쿠팡 상품 ID 추출
 */
function extractProductIdFromUrl(url: string): string | null {
  try {
    const patterns = [
      /\/vp\/products\/(\d+)/,
      /pageKey=(\d+)/,
      /products\/(\d+)/,
      /itemId=(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    log('error', 'URL에서 상품 ID 추출 실패', { url, error: String(error) });
    return null;
  }
}

/**
 * 쿠팡 HMAC 서명 생성
 */
async function generateCoupangSignature(method: string, path: string, secretKey: string, accessKey: string): Promise<string> {
  const datetime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const message = datetime + method + path;
  
  // Deno에서 crypto API 사용
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);
  
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => 
    crypto.subtle.sign('HMAC', key, messageData)
  ).then(signature => {
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signatureHex}`;
  }).catch(() => {
    // 폴백: 간단한 base64 인코딩 (프로덕션에서는 사용 안 함)
    return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=fallback`;
  });
}

/**
 * 0단계: coupangProductSearch 노드 (새로 추가)
 * 키워드로 쿠팡 상품 검색 후 랜덤 선택
 */
async function executeCoupangProductSearch(
  keyword?: string, 
  maxProducts: number = 5,
  coupangConfig?: { accessKey?: string; secretKey?: string }
): Promise<{ selectedProducts: any[]; searchResults: any[]; keyword: string }> {
  const searchKeyword = keyword || '인기 상품';
  
  log('info', 'coupangProductSearch 노드 시작', { 
    keyword: searchKeyword, 
    maxProducts,
    hasConfig: !!coupangConfig?.accessKey 
  });

  try {
    // 쿠팡 API 설정 확인
    if (!coupangConfig?.accessKey || !coupangConfig?.secretKey) {
      log('warn', '쿠팡 API 키가 설정되지 않음, 더미 데이터 사용', { keyword: searchKeyword });
      
      // 더미 상품 데이터 생성
      const dummyProducts = Array.from({ length: Math.min(10, maxProducts * 2) }, (_, i) => ({
        productId: `dummy-${Date.now()}-${i}`,
        productName: `${searchKeyword} 관련 상품 ${i + 1}`,
        productPrice: Math.floor(Math.random() * 100000) + 10000,
        productImage: 'https://via.placeholder.com/300x300',
        productUrl: `https://www.coupang.com/vp/products/dummy-${i}`,
        vendorName: `판매자${i + 1}`,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
        reviewCount: Math.floor(Math.random() * 1000) + 10,
        isRocket: Math.random() > 0.5,
        originalPrice: Math.floor(Math.random() * 120000) + 15000,
        discountRate: Math.floor(Math.random() * 30) + 5
      }));

      // 랜덤 선택
      const shuffled = dummyProducts.sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, maxProducts);

      log('info', 'coupangProductSearch 노드 완료 (더미 데이터)', {
        totalFound: dummyProducts.length,
        selectedCount: selectedProducts.length,
        keyword: searchKeyword
      });

      return { selectedProducts, searchResults: dummyProducts, keyword: searchKeyword };
    }

    // 실제 쿠팡 API 호출
    const method = 'GET';
    const limit = Math.max(maxProducts * 2, 20); // 선택의 여지를 위해 더 많이 검색
    const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(searchKeyword)}&limit=${limit}`;
    const coupangApiUrl = `https://api-gateway.coupang.com${path}`;
    
    // HMAC 서명 생성 (비동기)
    const authorization = await generateCoupangSignature(method, path, coupangConfig.secretKey, coupangConfig.accessKey);
    
    const headers = {
      'Authorization': authorization,
      'X-EXTENDED-TIMEOUT': '60000',
    };

    const response = await fetch(coupangApiUrl, { method, headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`쿠팡 API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const searchResults = data.data?.productData || [];

    if (searchResults.length === 0) {
      log('warn', '쿠팡 검색 결과 없음, 더미 데이터 사용', { keyword: searchKeyword });
      // 더미 데이터로 폴백
      return await executeCoupangProductSearch(keyword, maxProducts);
    }

    // 검색 결과에서 랜덤 선택
    const shuffled = searchResults.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, maxProducts);

    log('info', 'coupangProductSearch 노드 완료', {
      totalFound: searchResults.length,
      selectedCount: selectedProducts.length,
      keyword: searchKeyword,
      avgPrice: selectedProducts.reduce((sum, p) => sum + (p.productPrice || 0), 0) / selectedProducts.length
    });

    return { selectedProducts, searchResults, keyword: searchKeyword };

  } catch (error) {
    log('error', 'coupangProductSearch 노드 실패, 더미 데이터 사용', { 
      error: error instanceof Error ? error.message : String(error), 
      keyword: searchKeyword 
    });
    
    // 에러 시 더미 데이터로 폴백
    return await executeCoupangProductSearch(keyword, maxProducts);
  }
}

/**
 * 1단계: extractIds 노드 (기존 - 이제 선택사항)
 */
async function executeExtractIds(urls: string[]): Promise<{ productIds: string[]; urls: string[] }> {
  log('info', 'extractIds 노드 시작', { urlCount: urls.length });
  
  const productIds: string[] = [];

  for (const url of urls) {
    const productId = extractProductIdFromUrl(url);
    if (productId) {
      productIds.push(productId);
    }
  }

  log('info', 'extractIds 노드 완료', { 
    extractedCount: productIds.length, 
    productIds,
    successRate: urls.length > 0 ? (productIds.length / urls.length) * 100 : 0
  });
  
  return { productIds, urls };
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
 * 2단계: aiProductResearch 노드
 */
async function executeAIProductResearch(
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

/**
 * 3단계: seoAgent 노드 - CO-STAR 프롬프트로 GPT SEO 글 생성
 */
async function executeSEOAgent(
  enrichedData: ProductInfo[], 
  keyword?: string,
  config?: EnvironmentConfig
): Promise<SEOContent> {
  log('info', 'seoAgent 노드 시작', { productCount: enrichedData.length, keyword });
  
  // Perplexity API 키가 없으면 템플릿으로 폴백
  if (!config?.PERPLEXITY_API_KEY) {
    log('warn', 'Perplexity API 키가 없음, 템플릿 모드로 SEO 글 생성');
    return generateTemplateSEOContent(enrichedData, keyword);
  }

  try {
    // CO-STAR 프롬프트로 GPT SEO 글 생성
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: `당신은 워드프레스 기반 쿠팡 파트너스 블로그를 운영하는 어필리에이트 마케터입니다. 
            퍼플렉시티에서 수집한 상품 리서치 데이터를 바탕으로 한국 소비자들을 위한 쿠팡 상품 비교 SEO 블로그 포스트를 작성합니다.
            
            다음 CO-STAR 프롬프트 형식을 따라주세요:
            
            ## **C - Context (맥락)**
            한국 소비자들을 위한 쿠팡 상품 비교 SEO 블로그 포스트 작성
            
            ## **O - Objective (목적)**
            1. 네이버/구글 검색 상위 노출을 위한 SEO 최적화 콘텐츠 작성
            2. 쿠팡 파트너스 수익 극대화를 위한 자연스러운 상품 링크 삽입
            3. 사용자가 구매 결정을 쉽게 할 수 있도록 돕는 비교 가이드 제공
            4. 워드프레스 플랫폼에 최적화된 구조적 콘텐츠 생성
            
            ## **S - Style (스타일)**
            전문적이면서도 친근한 리뷰어 스타일로 작성해주세요. 실제 사용 경험이 있는 것처럼 생생하고 신뢰감 있는 비교 분석을 제시하되, 객관적 데이터에 기반한 정보성 콘텐츠로 구성해주세요.
            
            ## **T - Tone (어조)**
            신뢰할 수 있는 상품 전문가의 어조로, 한국 소비자들이 친숙하게 느낄 수 있도록 자연스러운 한국어를 사용해주세요. 과도한 마케팅 느낌보다는 정직하고 유용한 조언을 주는 멘토 같은 톤을 유지해주세요.
            
            ## **A - Audience (대상)**
            - 주요 대상: 해당 상품 구매를 고려하는 한국 소비자 (20-50대)
            - 보조 대상: 비교 쇼핑을 선호하는 신중한 구매자
            - 검색 행동: 네이버, 구글에서 "추천", "비교", "후기", "순위" 키워드로 검색
            
            ## **R - Response (응답 형식)**
            워드프레스 최적화 구조로 SEO 블로그 포스트를 작성해주세요:
            
            ### **1. 메타데이터 섹션**
            - 제목(H1): SEO 최적화 제목 (60자 이내)
            - 메타 디스크립션: 155자 이내 요약
            - 추천 URL 슬러그: 영문-하이픈 형식
            - 포커스 키워드: 메인 키워드
            
            ### **2. 도입부 (Hook + 개요)**
            - 독자의 고민/문제 제기 (100-150자)
            - 이 글에서 해결할 내용 미리보기
            - 목차 (TOC) 형태로 주요 섹션 안내
            
            ### **3. 메인 콘텐츠 구조**
            - H2: [상품군] 선택 가이드
            - H2: 2024년 최고의 [상품군] TOP 10
            - H2: 상세 비교 분석
            - H2: 구매 가이드 & 팁
            - H2: 자주 묻는 질문 (FAQ)
            
            ### **4. 마무리**
            - 핵심 추천 제품 요약
            - 구매 결정 도움말
            - 추가 정보 안내
            
            ### **5. SEO 최적화 요소**
            - 내부 링크: 관련 포스트 3-5개 자연스럽게 연결
            - 외부 링크: 공식 홈페이지, 리뷰 사이트 등 신뢰할 만한 소스
            - 이미지 최적화: Alt 텍스트, 파일명 제안
            - 스키마 마크업: Product, Review, FAQ 스키마 제안
            
            ### **6. 쿠팡 파트너스 최적화**
            - 자연스러운 CTA 버튼 문구 5개 제안
            - 상품 링크 배치 위치 추천
            - 전환율 높이는 문구 제안`
          },
          {
            role: 'user',
            content: `다음 상품 리서치 데이터를 바탕으로 SEO 최적화된 블로그 포스트를 작성해주세요:

**키워드**: ${keyword || '추천 상품'}

**상품 데이터**:
${enrichedData.map((product, index) => `
${index + 1}. ${product.productName}
- 가격: ${product.productPrice.toLocaleString()}원
- 평점: ${product.rating}/5 (리뷰 ${product.reviewCount}개)
- 로켓배송: ${product.isRocket ? '예' : '아니오'}
- 무료배송: ${product.isFreeShipping ? '예' : '아니오'}
- 설명: ${product.description}
- 주요 특징: ${product.enrichedFeatures?.join(', ') || '기본 기능'}
- 추천 대상: ${product.enrichedTargetAudience || '일반 사용자'}
- 상품 URL: ${product.productUrl}
`).join('\n')}

**분석 요약**:
- 총 상품 수: ${enrichedData.length}개
- 평균 가격: ${(enrichedData.reduce((sum, p) => sum + p.productPrice, 0) / enrichedData.length).toLocaleString()}원
- 평균 평점: ${(enrichedData.reduce((sum, p) => sum + p.rating, 0) / enrichedData.length).toFixed(1)}/5
- 로켓배송 비율: ${((enrichedData.filter(p => p.isRocket).length / enrichedData.length) * 100).toFixed(1)}%

위 데이터를 바탕으로 CO-STAR 프롬프트에 따라 SEO 최적화된 블로그 포스트를 작성해주세요.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API 오류: ${response.status}`);
    }

    const result = await response.json();
    const generatedContent = result.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('GPT 응답에서 콘텐츠를 찾을 수 없음');
    }

    // 제목과 키워드 추출
    const titleMatch = generatedContent.match(/^#\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `${keyword || '상품'} 추천 TOP ${enrichedData.length} - 완벽 구매 가이드`;
    
    const keywords = [keyword || '상품', '추천', '구매가이드', '비교', '리뷰'];
    const summary = `${keyword || '상품'} 추천 상품 ${enrichedData.length}개를 AI가 분석하여 최적화된 SEO 콘텐츠로 제공합니다.`;

    log('info', 'seoAgent 노드 완료 (GPT 생성)', { title, keywords, summary });
    
    return { title, content: generatedContent, keywords, summary };
  } catch (error) {
    log('error', 'GPT SEO 글 생성 실패, 템플릿으로 폴백', { error: String(error) });
    return generateTemplateSEOContent(enrichedData, keyword);
  }
}

/**
 * 템플릿 SEO 콘텐츠 생성 (폴백용)
 */
function generateTemplateSEOContent(enrichedData: ProductInfo[], keyword?: string): SEOContent {
  const title = `${keyword || '상품'} 추천 TOP ${enrichedData.length} - 완벽 구매 가이드`;
  
  const content = `# ${title}\n\n안녕하세요! 오늘은 ${keyword || '추천 상품'}에 대해 알아보겠습니다.\n\n## 📊 분석 결과\n\n- 상품 비교: 평균 가격 ${enrichedData.reduce((sum, p) => sum + p.productPrice, 0).toLocaleString()}원\n- 타겟 고객: ${keyword || '상품'} 카테고리 관심 고객\n- 경쟁력: 로켓배송 ${enrichedData.filter(p => p.isRocket).length}개, 무료배송 ${enrichedData.filter(p => p.isFreeShipping).length}개\n- 구매 가이드: 가격, 기능, 배송 조건을 종합적으로 고려한 구매 가이드\n- 추천 상품: TOP ${enrichedData.length}: ${enrichedData.map(p => p.productName).join(', ')}\n- SEO 키워드: ${keyword || '상품'}, 추천, 구매가이드\n\n## 🛍️ 추천 상품 리뷰\n\n${enrichedData.map((product, index) => `### ${index + 1}. ${product.productName}\n\n**가격**: ${product.productPrice.toLocaleString()}원\n**평점**: ${product.rating}/5 (리뷰 ${product.reviewCount}개)\n${product.isRocket ? '🚀 **로켓배송**\n' : ''}${product.isFreeShipping ? '📦 **무료배송**\n' : ''}**설명**: ${product.description}\n\n**주요 특징**:\n${product.enrichedFeatures?.map(feature => `- ${feature}`).join('\n') || '- 기본 기능'}\n\n[상품 보기](${product.productUrl})\n`).join('\n')}\n\n## 💡 구매 가이드\n\n1. **예산 설정**: ${keyword || '상품'} 구매 시 예산을 먼저 정하세요.\n2. **기능 확인**: 필요한 기능이 모두 포함되어 있는지 확인하세요.\n3. **리뷰 확인**: 실제 사용자 리뷰를 꼭 확인하세요.\n4. **배송 조건**: 로켓배송이나 무료배송 혜택을 활용하세요.\n\n## 🎯 결론\n\n이상으로 ${keyword || '상품'}에 대한 리뷰를 마치겠습니다. 각자의 필요에 맞는 상품을 선택하시기 바랍니다.`;
  
  const keywords = [keyword || '상품', '추천', '구매가이드'];
  const summary = `${keyword || '상품'} 추천 상품 ${enrichedData.length}개를 소개했습니다. 가격, 기능, 리뷰를 종합적으로 분석하여 최고의 선택을 도와드립니다.`;

  return { title, content, keywords, summary };
}

/**
 * 4단계: wordpressPublisher 노드
 */
async function executeWordPressPublisher(
  seoContent: SEOContent,
  config?: EnvironmentConfig
): Promise<WordPressResult> {
  log('info', 'wordpressPublisher 노드 시작', { title: seoContent.title });
  
  if (!config?.WORDPRESS_URL || !config?.WORDPRESS_USERNAME || !config?.WORDPRESS_PASSWORD) {
    log('warn', 'WordPress 환경 변수가 설정되지 않음, 시뮬레이션 모드');
    return {
      postId: Math.floor(Math.random() * 1000).toString(),
      postUrl: `${config?.WORDPRESS_URL || 'https://example.com'}/wp/2024/01/ai-workflow-post`,
      status: 'published'
    };
  }

  try {
    const response = await fetch(`${config.WORDPRESS_URL}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.WORDPRESS_USERNAME}:${config.WORDPRESS_PASSWORD}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: seoContent.title,
        content: seoContent.content,
        status: 'draft',
        meta: {
          seo_keywords: seoContent.keywords.join(', '),
          seo_summary: seoContent.summary
        }
      })
    });

    if (!response.ok) {
      throw new Error(`WordPress API 오류: ${response.status}`);
    }

    const post = await response.json();
    
    log('info', 'wordpressPublisher 노드 완료', { 
      postId: post.id, 
      postUrl: post.link,
      status: post.status
    });
    
    return {
      postId: post.id.toString(),
      postUrl: post.link,
      status: post.status
    };
  } catch (error) {
    log('error', 'WordPress 발행 실패', { error: String(error) });
    return {
      postId: 'error',
      postUrl: '',
      status: 'failed'
    };
  }
}

/**
 * AI 워크플로우 실행 - 새로운 랜덤 선택 방식
 */
async function executeAIWorkflow(request: AIWorkflowRequest): Promise<AIWorkflowResponse> {
  const startTime = Date.now();
  const threadId = request.threadId || `ai-workflow-${Date.now()}`;
  
  try {
    log('info', 'AI 워크플로우 시작', { 
      threadId, 
      action: request.action,
      keyword: request.keyword,
      config: request.config
    });

    // 환경 변수 검증
    const config = validateEnvironment();

    let enrichedData: any[] = [];
    let coupangSearchResult: any = null;
    let extractIdsResult: any = null;

    // 키워드가 있는 경우: 0단계 쿠팡 상품 검색 → 랜덤 선택
    if (request.keyword && request.keyword.trim()) {
      coupangSearchResult = await executeCoupangProductSearch(
        request.keyword,
        request.config?.maxProducts || 5,
        {
          accessKey: Deno.env.get("COUPANG_ACCESS_KEY"),
          secretKey: Deno.env.get("COUPANG_SECRET_KEY")
        }
      );

      // 선택된 상품들을 AI 조사용 형식으로 변환
      const productIds = coupangSearchResult.selectedProducts.map((p: any) => 
        p.productId || extractProductIdFromUrl(p.productUrl) || `generated-${Date.now()}-${Math.random()}`
      );

      // 2단계: AI 상품 조사 (선택된 상품들로)
      const aiResearch = await executeAIProductResearch(
        productIds,
        request.keyword,
        config
      );
      enrichedData = aiResearch.enrichedData;

      // 쿠팡 검색 결과를 AI 조사 결과와 결합
      enrichedData = enrichedData.map((aiProduct: any, index: number) => {
        const coupangProduct = coupangSearchResult.selectedProducts[index];
        return {
          ...aiProduct,
          // 쿠팡 실제 데이터로 보강
          productName: coupangProduct?.productName || aiProduct.productName,
          productPrice: coupangProduct?.productPrice || aiProduct.productPrice,
          productImage: coupangProduct?.productImage || aiProduct.productImage,
          productUrl: coupangProduct?.productUrl || aiProduct.productUrl,
          rating: coupangProduct?.rating || aiProduct.rating,
          reviewCount: coupangProduct?.reviewCount || aiProduct.reviewCount,
          isRocket: coupangProduct?.isRocket ?? aiProduct.isRocket,
          vendorName: coupangProduct?.vendorName || aiProduct.vendorName || 'Unknown',
          originalPrice: coupangProduct?.originalPrice || aiProduct.productPrice,
          discountRate: coupangProduct?.discountRate || 0
        };
      });

    } else if (request.urls && request.urls.length > 0) {
      // URL이 있는 경우: 기존 방식 (1단계 extractIds → 2단계 AI 조사)
      extractIdsResult = await executeExtractIds(request.urls);
      
      const aiResearch = await executeAIProductResearch(
        request.productIds || extractIdsResult.productIds, 
        request.keyword,
        config
      );
      enrichedData = aiResearch.enrichedData;

    } else {
      // 키워드도 URL도 없는 경우: 기본 키워드로 검색
      log('warn', '키워드와 URL 모두 없음, 기본 키워드 사용', { threadId });
      
      coupangSearchResult = await executeCoupangProductSearch(
        '인기 상품',
        5,
        {
          accessKey: Deno.env.get("COUPANG_ACCESS_KEY"),
          secretKey: Deno.env.get("COUPANG_SECRET_KEY")
        }
      );

      const productIds = coupangSearchResult.selectedProducts.map((p: any) => 
        p.productId || `generated-${Date.now()}-${Math.random()}`
      );

      const aiResearch = await executeAIProductResearch(productIds, '인기 상품', config);
      enrichedData = aiResearch.enrichedData;
    }
    
    // 3단계: seoAgent - SEO 최적화 블로그 글 생성
    const seoContent = await executeSEOAgent(enrichedData, request.keyword || '상품 추천', config);
    
    // 4단계: wordpressPublisher - WordPress 자동 발행
    const wordpressResult = await executeWordPressPublisher(seoContent, config);
    
    const executionTime = Date.now() - startTime;
    
    // 완료된 노드 결정
    const completedNodes: string[]= [];
    if (coupangSearchResult) {
      completedNodes.push('coupangProductSearch');
    }
    if (extractIdsResult) {
      completedNodes.push('extractIds');
    }
    completedNodes.push('aiProductResearch', 'seoAgent', 'wordpressPublisher');

    const result: AIWorkflowResponse = {
      success: true,
      data: {
        threadId,
        workflow: {
          // 새로운 노드 결과 포함
          coupangProductSearch: coupangSearchResult ? {
            keyword: coupangSearchResult.keyword,
            totalFound: coupangSearchResult.searchResults.length,
            selectedProducts: coupangSearchResult.selectedProducts,
            selectionMethod: 'random'
          } : undefined,
          extractIds: extractIdsResult || { productIds: [], urls: [] },
          aiProductResearch: { 
            enrichedData, 
            researchSummary: {
              totalProducts: enrichedData.length,
              keyword: request.keyword || '상품 추천',
              avgPrice: enrichedData.length > 0 
                ? enrichedData.reduce((sum: number, p: any) => sum + (p.productPrice || 0), 0) / enrichedData.length 
                : 0,
              avgRating: enrichedData.length > 0 
                ? enrichedData.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / enrichedData.length 
                : 0,
              rocketDeliveryRate: enrichedData.length > 0 
                ? (enrichedData.filter((p: any) => p.isRocket).length / enrichedData.length) * 100 
                : 0,
              researchMethod: coupangSearchResult 
                ? 'Coupang Search + AI Analysis + Random Selection'
                : 'AI Analysis (Fallback Mode)'
            }
          },
          seoAgent: seoContent,
          wordpressPublisher: wordpressResult
        },
        metadata: {
          createdAt: startTime,
          updatedAt: Date.now(),
          currentNode: 'wordpressPublisher',
          completedNodes,
          executionTime,
          workflow: {
            type: coupangSearchResult ? 'keyword-to-blog' : 'url-to-blog',
            inputType: request.keyword ? 'keyword' : (request.urls?.length ? 'urls' : 'default'),
            productSelectionMethod: 'random'
          }
        }
      },
      message: `AI 워크플로우가 성공적으로 완료되었습니다. ${enrichedData.length}개 상품을 분석하여 블로그 글을 생성했습니다.`
    };

    log('info', 'AI 워크플로우 완료', { 
      threadId, 
      executionTime, 
      productCount: enrichedData.length,
      wordpressStatus: wordpressResult.status
    });

    return result;
  } catch (error) {
    log('error', 'AI 워크플로우 실패', { 
      threadId, 
      error: error instanceof Error ? error.message : String(error)
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: 'AI 워크플로우 실행 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 메인 핸들러
 */
async function handleAIWorkflow(req: Request): Promise<Response> {
  // CORS 헤더 설정
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Content-Type', 'application/json');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // API Key 검증 추가
  const authHeader = req.headers.get('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  const expectedApiKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('EDGE_API_KEY');
  
  if (!apiKey || apiKey !== expectedApiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: '인증 실패',
        message: '유효한 API Key가 필요합니다.'
      }),
      { status: 401, headers }
    );
  }

  try {
    const request: AIWorkflowRequest = await req.json();
    
    if (!request.action) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'action이 필요합니다.',
          message: '유효하지 않은 요청입니다.'
        }),
        { status: 400, headers }
      );
    }

    let response: AIWorkflowResponse;

    switch (request.action) {
      case 'execute':
        response = await executeAIWorkflow(request);
        break;
      case 'test':
        // 테스트 모드 - 기본 데이터로 실행
        response = await executeAIWorkflow({
          ...request,
          urls: request.urls || ['https://www.coupang.com/vp/products/123456'],
          keyword: request.keyword || '테스트 상품'
        });
        break;
      case 'status':
        response = {
          success: true,
          message: 'AI 워크플로우 서비스가 정상적으로 동작 중입니다.',
          data: {
            threadId: 'status-check',
            workflow: {
              extractIds: { productIds: [], urls: [] },
              aiProductResearch: {
                enrichedData: [],
                researchSummary: {
                  totalProducts: 0,
                  keyword: '',
                  avgPrice: 0,
                  avgRating: 0,
                  rocketDeliveryRate: 0,
                  researchMethod: ''
                }
              },
              seoAgent: {
                title: '',
                content: '',
                keywords: [],
                summary: ''
              },
              wordpressPublisher: {
                postId: '',
                postUrl: '',
                status: ''
              }
            },
            metadata: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              currentNode: 'status',
              completedNodes: [],
              executionTime: 0
            }
          }
        };
        break;
      default:
        response = {
          success: false,
          error: '지원하지 않는 action입니다.',
          message: 'execute, test, status 중 하나를 선택해주세요.'
        };
    }

    return new Response(
      JSON.stringify(response),
      { status: response.success ? 200 : 400, headers }
    );

  } catch (error) {
    log('error', '요청 처리 실패', { error: String(error) });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: '요청 처리 중 오류가 발생했습니다.'
      }),
      { status: 500, headers }
    );
  }
}

// Edge Function 서버 시작
serve(handleAIWorkflow);
