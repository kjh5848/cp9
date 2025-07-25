/**
 * LangGraph 기반 자동화 시스템 타입 정의
 */

/**
 * LangGraph 상태 인터페이스
 */
export interface LangGraphState {
  // 입력 데이터
  input: {
    urls: string[];
    productIds: string[];
    keyword?: string;
    categoryId?: string;
  };
  
  // 중간 처리 데이터
  scrapedData: {
    productInfo: ProductInfo[];
    enrichedData: EnrichedProductInfo[];
  };
  
  // SEO 생성 데이터
  seoContent: {
    title: string;
    content: string;
    keywords: string[];
    summary: string;
  };
  
  // WordPress 발행 데이터
  wordpressPost: {
    postId?: string;
    postUrl?: string;
    status: 'draft' | 'published' | 'failed';
    error?: string;
  };
  
  // 메타데이터
  metadata: {
    threadId: string;
    createdAt: number;
    updatedAt: number;
    currentNode: string;
    completedNodes: string[];
  };
}

/**
 * 상품 정보 인터페이스
 */
export interface ProductInfo {
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  category: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  rating?: number;
  reviewCount?: number;
}

/**
 * 보강된 상품 정보 인터페이스
 */
export interface EnrichedProductInfo extends ProductInfo {
  description?: string;
  features?: string[];
  reviews?: ReviewInfo[];
  relatedProducts?: string[];
  seoKeywords?: string[];
}

/**
 * 리뷰 정보 인터페이스
 */
export interface ReviewInfo {
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

/**
 * LangGraph 노드 타입
 */
export type LangGraphNode = 
  | 'extractIds'
  | 'cacheGateway'
  | 'staticCrawler'
  | 'dynCrawler'
  | 'fallbackLLM'
  | 'seoAgent'
  | 'wordpressPublisher';

/**
 * 체크포인트 저장소 타입
 */
export type CheckpointSaver = 'redis' | 'memory' | 'sqlite';

/**
 * 메모리 관리 전략
 */
export interface MemoryStrategy {
  type: 'summary' | 'sliding_window' | 'token_limit';
  maxMessages?: number;
  maxTokens?: number;
  summaryThreshold?: number;
}

/**
 * WordPress 포스트 데이터
 */
export interface WordPressPost {
  title: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'publish';
  categories?: number[];
  tags?: string[];
  featured_media?: number;
  meta?: Record<string, any>;
}

/**
 * WordPress API 응답
 */
export interface WordPressResponse {
  id: number;
  link: string;
  status: 'draft' | 'publish';
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  modified: string;
}

/**
 * 큐 작업 타입
 */
export interface QueueJob {
  id: string;
  type: 'scrape' | 'seo' | 'publish';
  data: any;
  priority: 'low' | 'normal' | 'high';
  retries: number;
  maxRetries: number;
  createdAt: number;
  scheduledAt?: number;
}

/**
 * 캐시 엔트리 타입
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

/**
 * 오류 타입
 */
export interface LangGraphError {
  code: string;
  message: string;
  node: LangGraphNode;
  timestamp: number;
  retryable: boolean;
  context?: Record<string, any>;
} 