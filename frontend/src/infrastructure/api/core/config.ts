/**
 * API 설정 관리 클래스
 * 환경별 설정 및 공통 설정을 관리
 */

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition: (error: unknown) => boolean;
}

export class ApiConfig {
  /**
   * 서비스별 기본 URL 반환
   */
  static getBaseUrl(service: 'internal' | 'backend' | 'supabase' | 'external'): string {
    switch (service) {
      case 'internal':
        return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      case 'backend':
        // 백엔드 Python API URL
        return process.env.BACKEND_API_URL || 'http://localhost:8000';
      
      case 'supabase':
        // Supabase Edge Functions URL
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        return `${supabaseUrl}/functions/v1`;
      
      case 'external':
        // 외부 API들은 개별적으로 URL 지정
        return '';
      
      default:
        return 'http://localhost:3000';
    }
  }

  /**
   * 서비스별 기본 헤더 반환
   */
  static getHeaders(service: string): Headers {
    const headers = new Headers();
    
    // 공통 헤더
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    // User-Agent 설정 (서버 사이드에서만)
    if (typeof window === 'undefined') {
      headers.set('User-Agent', 'CP9-Frontend/1.0');
    }
    
    // 서비스별 특수 헤더
    switch (service) {
      case 'backend':
        // 백엔드 API용 헤더
        if (process.env.BACKEND_API_KEY) {
          headers.set('Authorization', `Bearer ${process.env.BACKEND_API_KEY}`);
        }
        break;
      
      case 'supabase':
        // Supabase Edge Functions용 헤더
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (anonKey) {
          headers.set('Authorization', `Bearer ${anonKey}`);
        }
        break;
      
      case 'coupang':
        // 쿠팡 API용 헤더 (서명 인증은 별도 처리)
        headers.set('Content-Type', 'application/json;charset=UTF-8');
        break;
    }
    
    return headers;
  }

  /**
   * 서비스별 타임아웃 설정 반환 (밀리초)
   */
  static getTimeout(service: string): number {
    switch (service) {
      case 'internal':
        return 30000; // 30초 (Next.js API Routes)
      
      case 'backend':
        return 60000; // 60초 (백엔드 Python API - 리서치 등 오래 걸릴 수 있음)
      
      case 'supabase':
        return 30000; // 30초 (Supabase Edge Functions)
      
      case 'external':
        return 45000; // 45초 (외부 API)
      
      default:
        return 30000; // 기본 30초
    }
  }

  /**
   * 서비스별 재시도 설정 반환
   */
  static getRetryConfig(service: string): RetryConfig {
    const baseConfig: RetryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryCondition: (error: unknown) => {
        // 네트워크 오류나 5xx 서버 오류만 재시도
        const apiError = error as { name?: string; statusCode?: number };
        return (
          apiError.name === 'NetworkError' ||
          (apiError.statusCode && apiError.statusCode >= 500 && apiError.statusCode < 600) ||
          apiError.statusCode === 429 // Rate Limit
        );
      }
    };

    switch (service) {
      case 'backend':
        // 백엔드는 더 관대한 재시도 정책
        return {
          ...baseConfig,
          maxRetries: 5,
          retryDelay: 2000,
        };
      
      case 'external':
        // 외부 API는 보수적인 재시도
        return {
          ...baseConfig,
          maxRetries: 2,
          retryDelay: 3000,
        };
      
      default:
        return baseConfig;
    }
  }

  /**
   * 환경별 설정 반환
   */
  static getEnvironmentConfig() {
    return {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      enableLogging: process.env.NODE_ENV === 'development',
      enableDetailedErrors: process.env.NODE_ENV === 'development',
    };
  }

  /**
   * API 엔드포인트 상수
   */
  static readonly ENDPOINTS = {
    // Internal Next.js API Routes
    PRODUCTS: {
      SEARCH: '/api/products/search',
      BEST_CATEGORIES: '/api/products/bestcategories',
      DEEPLINK: '/api/products/deeplink',
    },
    
    RESEARCH: {
      SESSIONS: '/api/research/sessions',
      SESSION_BY_ID: (id: string) => `/api/research/sessions/${id}`,
      RESULTS: '/api/research/results',
      CREATE: '/api/v1/research/products', // 실제 백엔드 API 사용
    },
    
    LANGGRAPH: {
      SEO_GENERATION: '/api/langgraph/seo-generation',
      WORKFLOW: '/api/workflow',
      WORKFLOW_STREAM: '/api/workflow/stream',
    },
    
    // Backend Python API Endpoints
    BACKEND: {
      RESEARCH_PRODUCTS: '/api/v1/research/products',
      RESEARCH_STATUS: (jobId: string) => `/api/v1/research/products/${jobId}/status`,
      RESEARCH_RESULTS: (jobId: string) => `/api/v1/research/products/${jobId}`,
      RESEARCH_CANCEL: (jobId: string) => `/api/v1/research/products/${jobId}`,
      RESEARCH_SESSIONS: '/api/v1/research/sessions',
      RESEARCH_SESSION_BY_ID: (id: string) => `/api/v1/research/sessions/${id}`,
      WEBSOCKET_RESEARCH: (jobId: string) => `/api/v1/ws/research/${jobId}`,
    },
    
    // Test endpoints
    TEST: {
      PERPLEXITY: '/api/test-perplexity',
      CRAWLER: '/api/crawler-test',
      EDGE_FUNCTION: '/api/test/edge-function',
    }
  } as const;

  /**
   * 쿠팡 API 설정
   */
  static getCoupangConfig() {
    return {
      accessKey: process.env.COUPANG_ACCESS_KEY,
      secretKey: process.env.COUPANG_SECRET_KEY,
      baseUrl: 'https://api-gateway.coupang.com',
      timeout: 30000,
    };
  }

  /**
   * WordPress API 설정
   */
  static getWordPressConfig() {
    return {
      apiKey: process.env.WORDPRESS_API_KEY,
      siteUrl: process.env.WORDPRESS_SITE_URL,
      timeout: 45000,
    };
  }

  /**
   * Perplexity API 설정
   */
  static getPerplexityConfig() {
    return {
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseUrl: 'https://api.perplexity.ai',
      timeout: 60000,
    };
  }

  /**
   * OpenAI API 설정
   */
  static getOpenAIConfig() {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1',
      timeout: 60000,
    };
  }

  /**
   * 개발 환경에서 API 호출 로깅 활성화 여부
   */
  static shouldLog(): boolean {
    return process.env.NODE_ENV === 'development' && 
           process.env.NEXT_PUBLIC_API_LOGGING !== 'false';
  }

  /**
   * API Rate Limiting 설정
   */
  static getRateLimitConfig(service: string) {
    switch (service) {
      case 'coupang':
        return {
          requestsPerSecond: 10,
          burstLimit: 50,
        };
      
      case 'perplexity':
        return {
          requestsPerSecond: 1,
          burstLimit: 5,
        };
      
      default:
        return {
          requestsPerSecond: 100,
          burstLimit: 200,
        };
    }
  }
}