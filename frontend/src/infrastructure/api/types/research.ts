/**
 * Research API 관련 타입 정의
 * 백엔드 API 가이드와 완전히 동기화된 타입들
 */

/**
 * 제품 아이템 요청 타입 (백엔드 API 가이드와 일치)
 */
export interface ProductItemRequest {
  // 기본 필수 필드
  product_name: string;           // 1-500자, 필수
  category: string;              // 1-100자, 필수
  price_exact: number;           // 양수, 필수
  currency?: string;             // 기본값: "KRW"
  seller_or_store?: string;      // 최대 200자
  
  // 쿠팡 API 필드들
  product_id?: number;           // productId
  product_image?: string;        // productImage
  product_url?: string;          // productUrl
  is_rocket?: boolean;           // isRocket
  is_free_shipping?: boolean;    // isFreeShipping
  category_name?: string;        // categoryName
  
  // 키워드 검색 필드
  keyword?: string;              // keyword
  rank?: number;                 // rank
  
  metadata?: Record<string, any>; // 추가 메타데이터
}

/**
 * 리서치 생성 요청 타입
 */
export interface ResearchCreateRequest {
  items: ProductItemRequest[];
  return_coupang_preview?: boolean;
  priority?: number; // 1-10 (높을수록 우선순위)
  session_config?: {
    title?: string;
    description?: string;
    analysis_type?: 'research_only' | 'full_analysis';
    enable_seo_generation?: boolean;
    enable_content_creation?: boolean;
  };
}

/**
 * 리서치 생성 응답 타입
 */
export interface ResearchCreateResponse {
  job_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results?: CoupangPreviewResult[]; // 쿠팡 즉시 리턴 데이터
  session_id?: string;
  message: string;
  created_at?: string;
  items_count?: number;
}

/**
 * 쿠팡 미리보기 결과 타입
 */
export interface CoupangPreviewResult {
  item_hash: string;
  product_id?: number;
  product_name: string;
  category: string;
  price_exact: number;
  product_url?: string;
  product_image?: string;
  is_rocket?: boolean;
  is_free_shipping?: boolean;
  category_name?: string;
  seller_or_store?: string;
}

/**
 * 리서치 상태 응답 타입
 */
export interface ResearchStatusResponse {
  job_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  total_items: number;
  successful_items: number;
  failed_items: number;
  success_rate: number;
  processing_time_ms: number;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  error_details?: {
    error_code: string;
    error_message: string;
    failed_items: unknown[];
  };
}

/**
 * 리서치 결과 응답 타입
 */
export interface ResearchResultsResponse {
  job_id: string;
  status: 'completed' | 'failed';
  results: ResearchResultItem[];
  total_results: number;
  processing_summary: {
    total_time_ms: number;
    successful_items: number;
    failed_items: number;
    success_rate: number;
  };
}

/**
 * 개별 리서치 결과 아이템 타입
 */
export interface ResearchResultItem {
  item_hash: string;
  status: 'success' | 'failed';
  research_data?: {
    summary: string;
    rating?: number;
    review_count?: number;
    pros: string[];
    cons: string[];
    price_analysis: {
      current_price: number;
      is_reasonable: boolean;
      price_trend: 'rising' | 'falling' | 'stable';
      competitor_prices?: number[];
    };
    market_analysis?: {
      market_size: string;
      competition_level: 'low' | 'medium' | 'high';
      growth_trend: string;
    };
    seo_keywords?: string[];
    content_suggestions?: string[];
  };
  coupang_data?: CoupangPreviewResult;
  error_details?: {
    error_code: string;
    error_message: string;
    details: string;
  };
  processing_time_ms: number;
  created_at: string;
}

/**
 * 리서치 세션 목록 요청 파라미터
 */
export interface SessionListParams {
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'updated_at' | 'status';
  order?: 'asc' | 'desc';
  status_filter?: 'pending' | 'in_progress' | 'completed' | 'failed';
  search?: string;
}

/**
 * 리서치 세션 목록 응답 타입
 */
export interface SessionListResponse {
  sessions: ResearchSession[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * 리서치 세션 타입
 */
export interface ResearchSession {
  id: string;
  title?: string;
  description?: string;
  status: 'created' | 'in_progress' | 'completed' | 'failed';
  products_count: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  analysis_type?: 'research_only' | 'full_analysis';
  job_ids?: string[]; // 관련된 job ID들
}

/**
 * 특정 세션 상세 응답 타입
 */
export interface SessionDetailResponse {
  session: ResearchSession;
  products: ProductItemRequest[];
  jobs: {
    job_id: string;
    status: string;
    created_at: string;
    completed_at?: string;
  }[];
  results?: ResearchResultItem[];
}

/**
 * WebSocket 메시지 타입들 (기존과 동일하지만 여기서 재정의)
 */
export interface WebSocketMessage {
  type: "job_status" | "job_progress" | "job_complete" | "job_error";
  job_id: string;
  data: unknown;
  timestamp: string;
}

export interface JobStatusData {
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  total_items: number;
  successful_items: number;
  failed_items: number;
  success_rate: number;
  processing_time_ms: number;
}

export interface JobProgressData {
  current_item: number;
  total_items: number;
  progress_percentage: number;
  current_item_name: string;
}

export interface JobCompleteData {
  status: "completed";
  results_count: number;
  total_processing_time_ms: number;
}

export interface JobErrorData {
  error_code: string;
  error_message: string;
  details?: string;
}

/**
 * 리서치 취소 응답 타입
 */
export interface ResearchCancelResponse {
  job_id: string;
  status: 'cancelled';
  message: string;
  cancelled_at: string;
}