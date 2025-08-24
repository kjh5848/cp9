/**
 * Product API 관련 타입 정의
 * 쿠팡 상품 검색, 카테고리, 딥링크 변환 등의 타입들
 */

/**
 * 키워드 검색 요청 파라미터
 */
export interface KeywordSearchParams {
  keyword: string;
  limit?: number;
  sortBy?: ApiProductSortOption;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  rocketShipping?: boolean;
}

/**
 * 카테고리 검색 요청 파라미터
 */
export interface CategorySearchParams {
  categoryId: string;
  limit?: number;
  sortBy?: ApiProductSortOption;
  minPrice?: number;
  maxPrice?: number;
  rocketShipping?: boolean;
}

/**
 * 상품 검색 공통 응답 타입
 */
export interface ProductItem {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  categoryName: string;
  categoryId: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  rating?: number;
  reviewCount?: number;
  discountRate?: number;
  originalPrice?: number;
  sellerName?: string;
  brand?: string;
  
  // 검색 관련 메타데이터
  searchRank?: number;
  searchKeyword?: string;
  relevanceScore?: number;
}

/**
 * 키워드 검색 응답 타입
 */
export interface ProductSearchResponse {
  success: boolean;
  data: {
    products: ProductItem[];
    totalCount: number;
    keyword: string;
    searchTime: number;
    hasMore: boolean;
    nextOffset?: number;
  };
  message?: string;
}

/**
 * 카테고리 검색 응답 타입
 */
export interface CategorySearchResponse {
  success: boolean;
  data: {
    products: ProductItem[];
    totalCount: number;
    categoryId: string;
    categoryName: string;
    searchTime: number;
    hasMore: boolean;
    nextOffset?: number;
  };
  message?: string;
}

/**
 * 딥링크 변환 요청 파라미터
 */
export interface DeeplinkConversionParams {
  urls: string[];
  trackingCode?: string;
  subId?: string;
}

/**
 * 딥링크 응답 개별 아이템
 */
export interface DeepLinkResponse {
  productId?: string;
  url: string;
  originalUrl?: string;
  deepLink?: string;
  title?: string;
  price?: number;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  categoryName?: string;
  isRocket?: boolean;
  isFreeShipping?: boolean;
  
  // 변환 상태
  success: boolean;
  error?: string;
  conversionTime?: number;
}

/**
 * 딥링크 변환 응답 타입
 */
export interface DeeplinkConversionResponse {
  success: boolean;
  data: {
    results: DeepLinkResponse[];
    totalCount: number;
    successCount: number;
    failureCount: number;
    processingTime: number;
  };
  message?: string;
}

/**
 * 베스트 카테고리 응답 타입
 */
export interface BestCategoryResponse {
  success: boolean;
  data: {
    products: ProductItem[];
    categoryInfo: {
      categoryId: string;
      categoryName: string;
      parentCategoryId?: string;
      parentCategoryName?: string;
    };
    totalCount: number;
    searchTime: number;
  };
  message?: string;
}

/**
 * 그룹화된 상품 아이템 (UI에서 사용)
 */
export interface GroupedProductItem {
  category: string;
  categoryId: string;
  items: ProductItem[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalCount: number;
  rocketCount: number;
  freeShippingCount: number;
}

/**
 * 상품 필터 옵션
 */
export interface ProductFilter {
  minPrice?: number;
  maxPrice?: number;
  rocketOnly?: boolean;
  freeShippingOnly?: boolean;
  minRating?: number;
  minReviewCount?: number;
  categories?: string[];
  brands?: string[];
}

/**
 * 상품 정렬 옵션
 */
export type ProductSortOption = 
  | 'SCORE'      // 정확도순
  | 'PRICE_ASC'  // 낮은 가격순
  | 'PRICE_DESC' // 높은 가격순
  | 'SALE'       // 판매량순
  | 'REVIEW'     // 리뷰 많은순
  | 'RATING'     // 평점 높은순
  | 'NEWEST'     // 최신순
  | 'DISCOUNT';  // 할인율 높은순

export type ApiProductSortOption = 
  | 'SCORE'      // API에서 지원하는 정렬 옵션
  | 'PRICE_ASC' 
  | 'PRICE_DESC'
  | 'SALE'
  | 'REVIEW';

/**
 * 검색 히스토리 아이템
 */
export interface SearchHistoryItem {
  id: string;
  type: 'keyword' | 'category' | 'deeplink';
  query: string;
  displayName: string;
  resultCount: number;
  searchedAt: string;
  filters?: ProductFilter;
  sortBy?: ProductSortOption;
}

/**
 * 상품 통계 정보
 */
export interface ProductStats {
  totalProducts: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  rocketPercentage: number;
  freeShippingPercentage: number;
  averageRating: number;
  averageReviewCount: number;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    percentage: number;
  }>;
  topBrands: Array<{
    brandName: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * 에러 응답 타입 (공통)
 */
export interface ProductApiError {
  success: false;
  error: string;
  errorCode?: string;
  details?: unknown;
  timestamp: string;
}

/**
 * API 응답의 공통 래퍼 타입
 */
export type ProductApiResponse<T> = T | ProductApiError;