/**
 * 상품 정보 보강 시스템 타입 정의
 */

/**
 * 크롤링된 기본 상품 정보
 */
export interface ScrapedProductInfo {
  productId: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  reviews: number;
  rating: number;
  category: string[];
  description: string;
  availability: boolean;
  specifications?: Record<string, string>;
}

/**
 * Perplexity API로 생성된 SEO 정보
 */
export interface SEOInfo {
  description: string;
  pros: string[];
  cons: string[];
  keywords: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  relatedProducts?: string[];
}

/**
 * 최종 보강된 상품 정보
 */
export interface EnrichedProductInfo extends ScrapedProductInfo, SEOInfo {
  enrichedAt: string;
  source: 'scraping' | 'perplexity' | 'both';
}

/**
 * 상품 정보 보강 API 요청
 */
export interface EnrichRequest {
  deepLink: string;
  forceRefresh?: boolean;
}

/**
 * 상품 정보 보강 API 응답
 */
export interface EnrichResponse {
  success: boolean;
  data?: EnrichedProductInfo;
  error?: string;
  cached?: boolean;
}

/**
 * 크롤링 설정
 */
export interface ScrapingConfig {
  usePlaywright: boolean;
  timeout: number;
  retryCount: number;
  userAgent?: string;
}

/**
 * Perplexity API 설정
 */
export interface PerplexityConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  retryCount: number;
}

/**
 * 캐싱 설정
 */
export interface CacheConfig {
  ttl: number; // 초 단위
  prefix: string;
}

/**
 * 크롤링 상태
 */
export type ScrapingStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * 크롤링 결과
 */
export interface ScrapingResult {
  status: ScrapingStatus;
  data?: ScrapedProductInfo;
  error?: string;
  duration?: number;
} 