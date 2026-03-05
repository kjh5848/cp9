/**
 * [Shared Types]
 * Coupang Partners API 응답 관련 공통 타입 정의
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
  brand?: string;
  deepLinkUrl?: string;
}

export interface DeepLinkResponse {
  originalUrl: string;
  shortenUrl: string;
  landingUrl: string;
}

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
  brand?: string;
  [key: string]: unknown;
}

export interface CoupangRawDeepLink {
  originalUrl?: string;
  shortenUrl?: string;
  landingUrl?: string;
  [key: string]: unknown;
}

export interface ProductSearchRequest {
  keyword: string;
  limit?: number;
}

export interface CategorySearchRequest {
  categoryId: string;
  limit?: number;
  imageSize?: string;
}

export interface DeepLinkRequest {
  urls: string[];
}
