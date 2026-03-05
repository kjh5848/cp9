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
    brand: product.brand || undefined,
  };
}

/**
 * 이미지 URL 리다이렉트를 추적하여 실제 CDN 주소 반환 (애드블록 우회용)
 */
export async function resolveImageRedirectUrl(url: string): Promise<string> {
  if (!url || !url.includes('ads-partners.coupang.com')) return url;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.url || url;
  } catch (e) {
    return url;
  }
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