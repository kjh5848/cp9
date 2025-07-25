/**
 * LangGraph 설정 및 아키텍처 구성
 */

import { LangGraphState, LangGraphNode, CheckpointSaver, MemoryStrategy } from '../types';

/**
 * LangGraph 설정 인터페이스
 */
export interface LangGraphConfig {
  // 체크포인트 설정
  checkpoint: {
    saver: CheckpointSaver;
    redisUrl?: string;
    ttl: number;
  };
  
  // 메모리 관리 설정
  memory: MemoryStrategy;
  
  // 노드별 설정
  nodes: {
    extractIds: ExtractIdsConfig;
    cacheGateway: CacheGatewayConfig;
    staticCrawler: StaticCrawlerConfig;
    dynCrawler: DynCrawlerConfig;
    fallbackLLM: FallbackLLMConfig;
    seoAgent: SEOAgentConfig;
    wordpressPublisher: WordPressPublisherConfig;
  };
  
  // 재시도 설정
  retry: {
    maxRetries: number;
    backoffMs: number;
    jitter: boolean;
  };
  
  // 타임아웃 설정
  timeout: {
    nodeTimeout: number;
    graphTimeout: number;
  };
}

/**
 * ExtractIds 노드 설정
 */
export interface ExtractIdsConfig {
  urlPatterns: RegExp[];
  fallbackToKeyword: boolean;
}

/**
 * Cache Gateway 노드 설정
 */
export interface CacheGatewayConfig {
  cachePrefix: string;
  hitThreshold: number;
  queueName: string;
}

/**
 * Static Crawler 노드 설정
 */
export interface StaticCrawlerConfig {
  userAgent: string;
  timeout: number;
  maxRedirects: number;
  selectors: {
    title: string;
    price: string;
    image: string;
    description: string;
    rating: string;
    reviews: string;
  };
}

/**
 * Dynamic Crawler 노드 설정
 */
export interface DynCrawlerConfig {
  browserOptions: {
    headless: boolean;
    timeout: number;
    userAgent: string;
  };
  waitForSelectors: string[];
  maxWaitTime: number;
}

/**
 * Fallback LLM 노드 설정
 */
export interface FallbackLLMConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  promptTemplate: string;
}

/**
 * SEO Agent 노드 설정
 */
export interface SEOAgentConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  tools: string[];
  memoryStrategy: MemoryStrategy;
  promptTemplate: string;
}

/**
 * WordPress Publisher 노드 설정
 */
export interface WordPressPublisherConfig {
  apiUrl: string;
  username: string;
  password: string;
  defaultStatus: 'draft' | 'publish';
  duplicateCheck: boolean;
  categories: number[];
  tags: string[];
}

/**
 * 기본 LangGraph 설정
 */
export const defaultLangGraphConfig: LangGraphConfig = {
  checkpoint: {
    saver: 'redis',
    ttl: 86400, // 24시간
  },
  
  memory: {
    type: 'summary',
    maxMessages: 10,
    summaryThreshold: 5,
  },
  
  nodes: {
    extractIds: {
      urlPatterns: [
        /coupang\.com\/vp\/products\/(\d+)/,
        /coupang\.com\/products\/(\d+)/,
      ],
      fallbackToKeyword: true,
    },
    
    cacheGateway: {
      cachePrefix: 'langgraph:',
      hitThreshold: 0.8,
      queueName: 'langgraph-queue',
    },
    
    staticCrawler: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timeout: 10000,
      maxRedirects: 3,
      selectors: {
        title: 'h1, .product-title, [data-testid="product-title"]',
        price: '.price, .product-price, [data-testid="price"]',
        image: 'img[src*="product"], .product-image img',
        description: '.description, .product-description',
        rating: '.rating, .star-rating',
        reviews: '.reviews, .review-count',
      },
    },
    
    dynCrawler: {
      browserOptions: {
        headless: true,
        timeout: 30000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      waitForSelectors: ['.product-title', '.price'],
      maxWaitTime: 10000,
    },
    
    fallbackLLM: {
      model: 'gpt-4o',
      maxTokens: 1000,
      temperature: 0.3,
      promptTemplate: `다음 상품 정보를 기반으로 구조화된 데이터를 생성해주세요:
      
상품 URL: {url}
사용 가능한 정보: {availableInfo}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "title": "상품명",
  "price": "가격",
  "description": "상품 설명",
  "features": ["특징1", "특징2"],
  "rating": "평점",
  "reviewCount": "리뷰 수"
}`,
    },
    
    seoAgent: {
      model: 'gpt-4o',
      maxTokens: 2000,
      temperature: 0.7,
      tools: ['perplexity_search', 'web_search'],
      memoryStrategy: {
        type: 'summary',
        maxMessages: 10,
        summaryThreshold: 5,
      },
      promptTemplate: `당신은 SEO 전문가입니다. 다음 상품 정보를 기반으로 SEO 최적화된 블로그 글을 작성해주세요.

상품 정보:
{productInfo}

요구사항:
- 제목: 60자 이내, 키워드 포함
- 본문: 2000자 이상, PASONA 구조
- 키워드: 5-8개, 자연스럽게 배치
- 메타 설명: 160자 이내

PASONA 구조:
- Problem: 문제 상황
- Agitation: 문제 심화
- Solution: 해결책 제시
- Offer: 상품 소개
- New Reality: 새로운 현실
- Action: 행동 유도`,
    },
    
    wordpressPublisher: {
      apiUrl: '',
      username: '',
      password: '',
      defaultStatus: 'draft',
      duplicateCheck: true,
      categories: [],
      tags: [],
    },
  },
  
  retry: {
    maxRetries: 3,
    backoffMs: 1000,
    jitter: true,
  },
  
  timeout: {
    nodeTimeout: 30000,
    graphTimeout: 300000, // 5분
  },
};

/**
 * 노드 실행 순서 정의
 */
export const nodeExecutionOrder: LangGraphNode[] = [
  'extractIds',
  'cacheGateway',
  'staticCrawler',
  'dynCrawler',
  'fallbackLLM',
  'seoAgent',
  'wordpressPublisher',
];

/**
 * 노드 의존성 정의
 */
export const nodeDependencies: Record<LangGraphNode, LangGraphNode[]> = {
  extractIds: [],
  cacheGateway: ['extractIds'],
  staticCrawler: ['cacheGateway'],
  dynCrawler: ['staticCrawler'],
  fallbackLLM: ['dynCrawler'],
  seoAgent: ['fallbackLLM'],
  wordpressPublisher: ['seoAgent'],
};

/**
 * 조건부 실행 규칙
 */
export const conditionalExecution = {
  // 캐시 히트 시 스킵할 노드들
  skipOnCacheHit: ['staticCrawler', 'dynCrawler', 'fallbackLLM'],
  
  // 오류 발생 시 대체 노드
  fallbackNodes: {
    staticCrawler: 'dynCrawler',
    dynCrawler: 'fallbackLLM',
    fallbackLLM: null, // 최종 실패
  },
  
  // 성공 조건
  successConditions: {
    extractIds: (state: LangGraphState) => state.input.productIds.length > 0,
    cacheGateway: (state: LangGraphState) => true, // 항상 성공
    staticCrawler: (state: LangGraphState) => state.scrapedData.productInfo.length > 0,
    dynCrawler: (state: LangGraphState) => state.scrapedData.productInfo.length > 0,
    fallbackLLM: (state: LangGraphState) => state.scrapedData.productInfo.length > 0,
    seoAgent: (state: LangGraphState) => state.seoContent.content.length > 0,
    wordpressPublisher: (state: LangGraphState) => state.wordpressPost.status !== 'failed',
  },
}; 