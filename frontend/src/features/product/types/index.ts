/**
 * 상품 아이템 타입
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
  // 추가 필드들 (선택적)
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
 * 상품 검색 요청 타입
 */
export interface ProductSearchRequest {
  keyword: string;
  limit?: number;
  page?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isRocket?: boolean;
}

/**
 * 카테고리 베스트 상품 요청 타입
 */
export interface CategoryBestRequest {
  categoryId: string;
  limit?: number;
  imageSize?: string;
}

/**
 * 상품 필터 옵션 타입
 */
export interface ProductFilterOptions {
  rocketOnly: boolean;
  priceMin: number;
  priceMax: number;
  categoryId?: string;
  sortBy?: 'price' | 'rating' | 'review' | 'discount';
  sortOrder?: 'asc' | 'desc';
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
  searchType: 'keyword' | 'category' | 'link';
  filterOptions?: ProductFilterOptions;
}

/**
 * 검색 모드 타입
 */
export type SearchMode = 'link' | 'keyword' | 'category';

/**
 * 뷰 타입
 */
export type ViewType = 'grid' | 'list';

/**
 * 정렬 옵션 타입
 */
export type SortOption = 'none' | 'asc' | 'desc';

/**
 * 쿠팡 카테고리 타입
 */
export interface CoupangCategory {
  id: string;
  name: string;
  parentId?: string;
  level: number;
}

/**
 * 이미지 크기 옵션 타입
 */
export type ImageSizeOption = 256 | 512 | 768 | 1024;

/**
 * API 응답 래퍼 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 검색 옵션 타입 (그룹화된 상태)
 */
export interface SearchOptions {
  categoryId: string;
  imageSize: number;
  bestLimit: number;
  priceRange: [number, number];
}

/**
 * 가격 범위 타입
 */
export type PriceRange = [number, number];

/**
 * 표시용 가격 범위 타입
 */
export interface DisplayPriceRange {
  min: string;
  max: string;
}

/**
 * 폼 상태 타입
 */
export interface FormState {
  loading: boolean;
  showPresetForm: boolean;
}

/**
 * 카테고리 옵션 타입
 */
export interface CategoryOption {
  value: string;
  label: string;
} 