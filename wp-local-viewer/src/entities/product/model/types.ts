/**
 * 상품 아이템 타입 (Entities Domain Model)
 */
export interface ProductItem {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  categoryName: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryId?: string;
  rating?: number;
  reviewCount?: number;
  brandName?: string;
  discountRate?: number;
  originalPrice?: number;
}

/**
 * 딥링크 응답 타입
 */
export interface DeepLinkResponse {
  originalUrl: string;
  shortenUrl: string;
  landingUrl: string;
  productId?: string;
  success: boolean;
  error?: string;
}

/**
 * 상품 필터 옵션 타입
 */
export interface ProductFilterOptions {
  rocketOnly: boolean;
  priceMin: number;
  priceMax: number;
  categoryId?: string;
  sortBy?: "price" | "rating" | "review" | "discount";
  sortOrder?: "asc" | "desc";
}

/**
 * 가격 프리셋 타입
 */
export interface PricePreset {
  label: string;
  min: number;
  max: number;
}

/**
 * 상품 검색 히스토리 타입
 */
export interface ProductHistory {
  id: string;
  keyword: string;
  results: ProductItem[];
  date: string;
  searchType: "keyword" | "category" | "link";
  filterOptions?: ProductFilterOptions;
}

/**
 * API 공통 응답 래퍼 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
