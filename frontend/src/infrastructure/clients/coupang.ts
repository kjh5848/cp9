import { generateCoupangSignature } from '../utils/coupang-hmac';
import { cache } from 'react';

const COUPANG_API_HOST = 'https://api-gateway.coupang.com';

/**
 * 쿠팡 상품 검색 API 호출
 * @param keyword - 검색어
 * @param limit - 최대 개수
 * @param accessKey - (Optional) Current user's Coupang Access Key
 * @param secretKey - (Optional) Current user's Coupang Secret Key
 * @returns 상품 리스트
 */
export const searchCoupangProducts = cache(async (keyword: string, limit = 10, accessKey?: string, secretKey?: string) => {
  if (!accessKey || !secretKey) {
    throw new Error('쿠팡 API 키가 설정되지 않았습니다. (마이페이지 - API 연동)');
  }
  
  console.log(`[Coupang API] Requesting search... keyword: ${keyword}`);
  console.log(`[Coupang API Debug] accessKey length: ${accessKey?.length}, secretKey length: ${secretKey?.length}`);
  console.log(`[Coupang API Debug] accessKey starts with: ${accessKey?.substring(0, 4)}...`);

  const method = 'GET';
  const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
  const url = COUPANG_API_HOST + path;
  const authorization = generateCoupangSignature(method, path, secretKey, accessKey);
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
}); 