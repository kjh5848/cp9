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

/**
 * DB에 저장된 유저 키와 환경변수 키를 비교하여
 * 사용자에게 맞는 쿠팡 API 키를 반환합니다.
 * 개발 환경(NODE_ENV = development)에서는 로컬 .env 환경변수를 최우선으로, 
 * 운영/프로덕션 환경에서는 사용자 DB 설정을 최우선으로 라우팅합니다.
 */
export function resolveCoupangKeys(dbUser: any | null | undefined): { accessKey: string | undefined; secretKey: string | undefined } {
  const envAccessKey = process.env.COUPANG_ACCESS_KEY;
  const envSecretKey = process.env.COUPANG_SECRET_KEY;

  if (process.env.NODE_ENV === 'development') {
    return {
      accessKey: envAccessKey || dbUser?.coupangAccessKey,
      secretKey: envSecretKey || dbUser?.coupangSecretKey,
    };
  }

  return {
    accessKey: dbUser?.coupangAccessKey || envAccessKey,
    secretKey: dbUser?.coupangSecretKey || envSecretKey,
  };
}