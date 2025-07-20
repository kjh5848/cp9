/**
 * 쿠팡 API 원본 응답 타입
 */
export interface CoupangRawProduct {
  productName?: string;
  title?: string;
  productImage?: string;
  image?: string;
  productPrice?: number;
  price?: number;
  productUrl?: string;
  url?: string;
  productId?: number;
  isRocket?: boolean;
  rocketShipping?: boolean;
  isFreeShipping?: boolean;
  categoryName?: string;
}

/**
 * 쿠팡 상품 API 응답 타입
 */
export interface CoupangProductResponse {
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
 * 쿠팡 딥링크 원본 응답 타입
 */
export interface CoupangRawDeepLink extends CoupangRawProduct {
  originalUrl?: string;
  deeplinkUrl?: string;
  deepLink?: string;
  isRocketShipping?: boolean;
}

/**
 * 딥링크 변환 응답 타입
 */
export interface DeepLinkResponse extends CoupangProductResponse {
  deepLinkUrl: string;
}

/**
 * API 오류 응답 타입
 */
export interface ApiErrorResponse {
  error: string;
}

/**
 * 쿠팡 상품 검색 요청 타입
 */
export interface ProductSearchRequest {
  keyword: string;
  limit?: number;
}

/**
 * 쿠팡 카테고리 검색 요청 타입
 */
export interface CategorySearchRequest {
  categoryId: string;
  limit?: number;
  imageSize?: string;
}

/**
 * 딥링크 변환 요청 타입
 */
export interface DeepLinkRequest {
  urls: string[];
}

/**
 * 쿠팡 API 응답 래퍼 타입
 */
export interface CoupangApiResponse<T> {
  data: T;
  code?: string;
  message?: string;
}

/**
 * 쿠팡 딥링크 API 응답 타입
 */
export interface CoupangDeepLinkApiResponse {
  data: {
    deeplinkList: CoupangRawDeepLink[];
  };
} 