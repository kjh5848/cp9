import { generateCoupangSignature } from '../utils/coupang-hmac';
import { config } from '@/shared/lib/config';

const COUPANG_ACCESS_KEY = config.COUPANG_ACCESS_KEY;
const COUPANG_SECRET_KEY = config.COUPANG_SECRET_KEY;
const COUPANG_API_HOST = 'https://api-gateway.coupang.com';

/**
 * 쿠팡 베스트 카테고리 상품 API
 *
 * @see https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories/{categoryId}
 *
 * @param categoryId - 카테고리 코드 (예: 1001)
 * @param limit - 최대 상품 수 (1~100, 기본 20)
 * @param imageSize - 이미지 사이즈 (예: 512x512)
 * @returns 상품 리스트 (categoryName, isRocket, isFreeShipping, productId, productImage, productName, productPrice, productUrl)
 *
 * @example
 * const products = await fetchCoupangBestCategory({ categoryId: '1001', limit: 50, imageSize: '512x512' });
 */
export interface CoupangBestCategoryProduct {
  categoryName: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  productId: number;
  productImage: string;
  productName: string;
  productPrice: number;
  productUrl: string;
}

export interface CoupangBestCategoryParams {
  categoryId: string;
  limit?: number;
  imageSize?: string;
}

export async function fetchCoupangBestCategory(params: CoupangBestCategoryParams): Promise<CoupangBestCategoryProduct[]> {
  const { categoryId, limit = 20, imageSize } = params;
  const method = 'GET';
  let path = `/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories/${categoryId}?limit=${limit}`;
  if (imageSize) path += `&imageSize=${encodeURIComponent(imageSize)}`;
  const url = COUPANG_API_HOST + path;
  const authorization = generateCoupangSignature(method, path, COUPANG_SECRET_KEY, COUPANG_ACCESS_KEY);
  const headers = {
    'Authorization': authorization,
    'X-EXTENDED-TIMEOUT': '60000',
  };
  const res = await fetch(url, { method, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('쿠팡 카테고리 상품 검색 실패: ' + errorText);
  }
  const data = await res.json();
  return data.data || [];
} 