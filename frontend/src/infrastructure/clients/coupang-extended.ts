import { generateCoupangSignature } from '../utils/coupang-hmac';
import { config } from '@/shared/lib/config';
import { cache } from 'react';

const COUPANG_ACCESS_KEY = config.COUPANG_ACCESS_KEY;
const COUPANG_SECRET_KEY = config.COUPANG_SECRET_KEY;
const COUPANG_API_HOST = 'https://api-gateway.coupang.com';

export interface CoupangExtendedParams {
  limit?: number;
  imageSize?: string;
  subId?: string;
}

export interface CoupangPLBrandParams extends CoupangExtendedParams {
  brandId: number;
}

/**
 * 범용 쿠팡 API Fetcher (내부 공통 로직)
 */
async function fetchCoupangApi(path: string, errorMessage: string) {
  const method = 'GET';
  const url = COUPANG_API_HOST + path;
  const authorization = generateCoupangSignature(method, path, COUPANG_SECRET_KEY, COUPANG_ACCESS_KEY);
  
  const headers = {
    'Authorization': authorization,
    'X-EXTENDED-TIMEOUT': '60000',
  };
  
  const res = await fetch(url, { method, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${errorMessage}: ${errorText}`);
  }
  
  const data = await res.json();
  return data.data || [];
}

/**
 * 1. 쿠팡 PL 브랜드별 상품 API
 * @param params brandId (필수), limit(선택, 최대 100), imageSize, subId
 */
export const fetchCoupangPLBrand = cache(async (params: CoupangPLBrandParams) => {
  const { brandId, limit = 20, imageSize } = params;
  let path = `/v2/providers/affiliate_open_api/apis/openapi/products/coupangPL/${brandId}?limit=${limit}`;
  if (imageSize) path += `&imageSize=${encodeURIComponent(imageSize)}`;
  
  return fetchCoupangApi(path, `쿠팡 PL 브랜드(${brandId}) 상품 조회 실패`);
});

/**
 * 2. 쿠팡 PL 상품 API (탐사, 코멧, 곰곰 등 통합)
 * @param params limit(선택, 최대 100), imageSize, subId
 */
export const fetchCoupangPL = cache(async (params: CoupangExtendedParams = {}) => {
  const { limit = 20, imageSize } = params;
  let path = `/v2/providers/affiliate_open_api/apis/openapi/products/coupangPL?limit=${limit}`;
  if (imageSize) path += `&imageSize=${encodeURIComponent(imageSize)}`;
  
  return fetchCoupangApi(path, '쿠팡 PL 상품 조회 실패');
});

/**
 * 3. 골드박스 상품 API (당일 일일 특가)
 * @param params imageSize, subId
 */
export const fetchCoupangGoldbox = cache(async (params: Omit<CoupangExtendedParams, 'limit'> = {}) => {
  const { imageSize } = params;
  // 골드박스는 limit 파라미터가 없음 (당일 한정 리스트 반환)
  let path = `/v2/providers/affiliate_open_api/apis/openapi/products/goldbox`;
  let hasQuery = false;
  
  if (imageSize) {
    path += `?imageSize=${encodeURIComponent(imageSize)}`;
    hasQuery = true;
  }
  
  return fetchCoupangApi(path, '골드박스 상품 조회 실패');
});
