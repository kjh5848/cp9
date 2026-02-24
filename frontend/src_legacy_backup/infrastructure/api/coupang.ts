import { generateCoupangSignature } from '../utils/coupang-hmac';
import { config } from '@/shared/lib/config';

const COUPANG_ACCESS_KEY = config.COUPANG_ACCESS_KEY;
const COUPANG_SECRET_KEY = config.COUPANG_SECRET_KEY;
const COUPANG_API_HOST = 'https://api-gateway.coupang.com';

/**
 * 쿠팡 상품 검색 API 호출
 * @param keyword - 검색어
 * @param limit - 최대 개수
 * @returns 상품 리스트
 */
export async function searchCoupangProducts(keyword: string, limit = 10) {
  const method = 'GET';
  const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
  const url = COUPANG_API_HOST + path;
  const authorization = generateCoupangSignature(method, path, COUPANG_SECRET_KEY, COUPANG_ACCESS_KEY);
  const headers = {
    'Authorization': authorization,
    'X-EXTENDED-TIMEOUT': '60000',
  };
  const res = await fetch(url, { method, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('쿠팡 상품 검색 실패: ' + errorText);
  }
  const data = await res.json();
  return data.data?.productData || [];
} 