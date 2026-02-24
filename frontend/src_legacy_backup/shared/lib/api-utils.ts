import { 
  CoupangProductResponse, 
  DeepLinkResponse, 
  CoupangRawProduct, 
  CoupangRawDeepLink 
} from '@/shared/types/api';

/**
 * 쿠팡 상품 데이터를 일관된 응답 형식으로 변환
 */
export function normalizeCoupangProduct(product: CoupangRawProduct): CoupangProductResponse {
  return {
    productName: product.productName || product.title || '',
    productImage: product.productImage || product.image || '',
    productPrice: product.productPrice || product.price || 0,
    productUrl: product.productUrl || product.url || '',
    productId: product.productId || 0,
    isRocket: product.isRocket || product.rocketShipping || false,
    isFreeShipping: product.isFreeShipping || false,
    categoryName: product.categoryName || '',
  };
}

/**
 * 딥링크 응답을 일관된 형식으로 변환
 */
export function normalizeDeepLinkResponse(item: CoupangRawDeepLink): DeepLinkResponse {
  return {
    originalUrl: item.originalUrl || '',
    shortenUrl: item.shortenUrl || '',
    landingUrl: item.landingUrl || '',
  };
}

/**
 * API 오류 응답 생성
 */
export function createErrorResponse(message: string, status: number = 500) {
  return {
    error: message,
    status,
  };
}

/**
 * API 성공 응답 생성
 */
export function createSuccessResponse<T>(data: T) {
  return {
    data,
    success: true,
  };
} 