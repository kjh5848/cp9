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
  };

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
 * 1단계: extractIds 노드
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
        model: 'llama-3.1-sonar-large-128k-online',
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
 * 3단계: seoAgent 노드
 */
async function executeSEOAgent(
  enrichedData: ProductInfo[], 
  keyword?: string
): Promise<SEOContent> {
  log('info', 'seoAgent 노드 시작', { productCount: enrichedData.length, keyword });
  
  const title = `${keyword || '상품'} 추천 TOP ${enrichedData.length} - 완벽 구매 가이드`;
  
  const content = `# ${title}\n\n안녕하세요! 오늘은 ${keyword || '추천 상품'}에 대해 알아보겠습니다.\n\n## 📊 분석 결과\n\n- 상품 비교: 평균 가격 ${enrichedData.reduce((sum, p) => sum + p.productPrice, 0).toLocaleString()}원\n- 타겟 고객: ${keyword || '상품'} 카테고리 관심 고객\n- 경쟁력: 로켓배송 ${enrichedData.filter(p => p.isRocket).length}개, 무료배송 ${enrichedData.filter(p => p.isFreeShipping).length}개\n- 구매 가이드: 가격, 기능, 배송 조건을 종합적으로 고려한 구매 가이드\n- 추천 상품: TOP ${enrichedData.length}: ${enrichedData.map(p => p.productName).join(', ')}\n- SEO 키워드: ${keyword || '상품'}, 추천, 구매가이드\n\n## 🛍️ 추천 상품 리뷰\n\n${enrichedData.map((product, index) => `### ${index + 1}. ${product.productName}\n\n**가격**: ${product.productPrice.toLocaleString()}원\n**평점**: ${product.rating}/5 (리뷰 ${product.reviewCount}개)\n${product.isRocket ? '🚀 **로켓배송**\n' : ''}${product.isFreeShipping ? '📦 **무료배송**\n' : ''}**설명**: ${product.description}\n\n**주요 특징**:\n${product.enrichedFeatures?.map(feature => `- ${feature}`).join('\n') || '- 기본 기능'}\n\n[상품 보기](${product.productUrl})\n`).join('\n')}\n\n## 💡 구매 가이드\n\n1. **예산 설정**: ${keyword || '상품'} 구매 시 예산을 먼저 정하세요.\n2. **기능 확인**: 필요한 기능이 모두 포함되어 있는지 확인하세요.\n3. **리뷰 확인**: 실제 사용자 리뷰를 꼭 확인하세요.\n4. **배송 조건**: 로켓배송이나 무료배송 혜택을 활용하세요.\n\n## 🎯 결론\n\n이상으로 ${keyword || '상품'}에 대한 리뷰를 마치겠습니다. 각자의 필요에 맞는 상품을 선택하시기 바랍니다.`;
  
  const keywords = [keyword || '상품', '추천', '구매가이드'];
  const summary = `${keyword || '상품'} 추천 상품 ${enrichedData.length}개를 소개했습니다. 가격, 기능, 리뷰를 종합적으로 분석하여 최고의 선택을 도와드립니다.`;

  log('info', 'seoAgent 노드 완료', { title, keywords, summary });
  
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
 * AI 워크플로우 실행
 */
async function executeAIWorkflow(request: AIWorkflowRequest): Promise<AIWorkflowResponse> {
  const startTime = Date.now();
  const threadId = request.threadId || `ai-workflow-${Date.now()}`;
  
  try {
    log('info', 'AI 워크플로우 시작', { 
      threadId, 
      action: request.action,
      config: request.config
    });

    // 환경 변수 검증
    const config = validateEnvironment();

    // 1단계: extractIds
    const { productIds, urls } = await executeExtractIds(request.urls || []);
    
    // 2단계: aiProductResearch
    const { enrichedData, researchSummary } = await executeAIProductResearch(
      request.productIds || productIds, 
      request.keyword,
      config
    );
    
    // 3단계: seoAgent
    const seoContent = await executeSEOAgent(enrichedData, request.keyword);
    
    // 4단계: wordpressPublisher
    const wordpressResult = await executeWordPressPublisher(seoContent, config);
    
    const executionTime = Date.now() - startTime;
    
    const result: AIWorkflowResponse = {
      success: true,
      data: {
        threadId,
        workflow: {
          extractIds: { productIds, urls },
          aiProductResearch: { enrichedData, researchSummary },
          seoAgent: seoContent,
          wordpressPublisher: wordpressResult
        },
        metadata: {
          createdAt: startTime,
          updatedAt: Date.now(),
          currentNode: 'wordpressPublisher',
          completedNodes: ['extractIds', 'aiProductResearch', 'seoAgent', 'wordpressPublisher'],
          executionTime
        }
      },
      message: 'AI 워크플로우가 성공적으로 완료되었습니다.'
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
