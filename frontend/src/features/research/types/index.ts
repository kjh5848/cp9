/**
 * 리서치 결과 관련 타입 정의 (API 포맷 기반)
 */

/**
 * 리서치 제품 인터페이스 (새로운 API 응답 포맷)
 */
export interface ResearchProduct {
  product_name: string;
  brand: string;
  category: string;
  model_or_variant: string;
  price_exact: number;
  currency: string;
  price_last_verified: string;
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  seller_or_store: string;
  deeplink_or_product_url: string;

  specs_or_features: {
    main_specs: string[];
    attributes: Array<{ name: string; value: string }>;
    size_or_weight: string;
    materials: string[];
    color_options: string[];
    included_items: string[];
  };

  seo: {
    focus_keyword: string;
    keyword_cluster: string[];
    lsi_terms: string[];
    search_intent: 'informational' | 'commercial' | 'transactional' | 'comparison';
    title_variants: string[];
    h1: string;
    meta_title: string;
    meta_description: string;
    slug: string;
    outline: {
      h2: string[];
      h3_map: Record<string, string[]>;
    };
    hooks: string[];
    cta: string[];
    internal_link_candidates: string[];
    external_authorities: string[];
    image_alts: {
      main: string;
      gallery: string[];
    };
    jsonld_suggestions: {
      product: boolean;
      faq: boolean;
      review: boolean;
    };
  };

  positioning: {
    use_cases: string[];
    target_audience: string[];
    unique_selling_points: string[];
    comparison_points: string[];
    competitors: string[];
  };

  reviews: {
    rating_avg: number | null;
    review_count: number | null;
    summary_positive: string[];
    summary_negative: string[];
    notable_reviews: Array<{
      source: string;
      quote: string;
      url: string;
    }>;
  };

  faqs: Array<{
    q: string;
    a: string;
    source: string;
  }>;

  sources: string[];
  captured_at: string;
}

/**
 * 리서치 세션 인터페이스
 */
export interface ResearchSession {
  id: string;
  title: string;
  description: string;
  products: ResearchProduct[];
  total_products: number;
  created_at: string;
  category_focus: string;
  job_id?: string; // WebSocket 연결용 job_id
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

/**
 * 기존 리서치 아이템 인터페이스 (호환성을 위해 유지)
 */
export interface ResearchItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  productUrl: string;
  category: string;
  analysis: {
    pros: string[];
    cons: string[];
    summary: string;
    rating: number;
    keywords: string[];
  };
  seoContent?: {
    title: string;
    description: string;
    content: string;
    tags: string[];
  };
  metadata?: {
    totalItems: number;
    researchDate: Date;
    researchType: string;
  };
  createdAt: Date;
}

/**
 * 뷰 모드 타입
 */
export type ViewMode = 'gallery' | 'card' | 'table' | 'blog';

/**
 * 리서치 데이터 상태
 */
export interface ResearchDataState {
  items: ResearchItem[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
}

/**
 * 필터 옵션
 */
export interface FilterOptions {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  keywords?: string[];
}

/**
 * 정렬 옵션
 */
export interface SortOptions {
  field: 'name' | 'price' | 'rating' | 'date';
  order: 'asc' | 'desc';
}

/**
 * 쿠팡 파트너스 상품 인터페이스
 */
export interface CoupangProduct {
  productName: string;
  productImage: string;
  productPrice: number;
  productUrl: string;
  productId: number;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryName: string;
}

/**
 * 백엔드 리서치 API - 제품 속성
 */
export interface ProductAttribute {
  name: string;
  value: string;
}

/**
 * 백엔드 리서치 API - 제품 스펙
 */
export interface ProductSpecs {
  main: string[];
  attributes: ProductAttribute[];
  size_or_weight?: string;
  options: string[];
  included_items: string[];
}

/**
 * 백엔드 리서치 API - 주목할 만한 리뷰
 */
export interface NotableReview {
  source: string;
  quote: string;
  url?: string;
}

/**
 * 백엔드 리서치 API - 제품 리뷰
 */
export interface ProductReviews {
  rating_avg: number;
  review_count: number;
  summary_positive: string[];
  summary_negative: string[];
  notable_reviews: NotableReview[];
}

/**
 * 백엔드 리서치 API - 제품 결과
 */
export interface ProductResult {
  product_name: string;
  brand: string;
  category: string;
  model_or_variant: string;
  price_exact: number;
  currency: string;
  seller_or_store?: string;
  deeplink_or_product_url?: string;
  coupang_price?: number;
  specs: ProductSpecs;
  reviews: ProductReviews;
  sources: string[];
  captured_at: string;
  status: 'success' | 'error' | 'insufficient_sources';
  error_message?: string;
  missing_fields?: string[];
  suggested_queries?: string[];
}

/**
 * 리서치 상태
 */
export interface ResearchState {
  jobId: string | null;
  status: 'idle' | 'requesting' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: ProductResult[] | null;
  error: string | null;
}

/**
 * 갤러리 카드 상태
 */
export interface GalleryCardState {
  coupangData: CoupangProduct;
  researchStatus: 'pending' | 'processing' | 'completed' | 'failed';
  researchProgress?: number;
  researchResult?: ProductResult;
}

/**
 * 통합 제품 데이터 (쿠팡 우선 + 리서치 보완)
 */
export interface IntegratedProductData {
  // 쿠팡 우선 데이터
  name: string; // coupang.productName 우선
  price: number; // coupang.productPrice 우선  
  image: string; // coupang.productImage 우선
  url: string; // coupang.productUrl 우선
  category: string; // coupang.categoryName 우선
  productId: number; // coupang.productId
  isRocket: boolean; // coupang.isRocket
  isFreeShipping: boolean; // coupang.isFreeShipping
  
  // 리서치 전용 데이터 (있는 경우만)
  brand?: string;
  model?: string;
  specs?: ProductSpecs;
  reviews?: ProductReviews;
  sources?: string[];
  capturedAt?: string;
  researchStatus?: 'success' | 'error' | 'insufficient_sources';
}