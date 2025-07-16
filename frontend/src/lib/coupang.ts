import crypto from 'crypto';
import moment from 'moment';

const COUPANG_ACCESS_KEY = process.env.COUPANG_ACCESS_KEY!;
const COUPANG_SECRET_KEY = process.env.COUPANG_SECRET_KEY!;
const COUPANG_PARTNER_ID = process.env.COUPANG_PARTNER_ID || '';
const COUPANG_API_HOST = 'https://api-gateway.coupang.com';

/**
 * 쿠팡 파트너스 API 요청 서명 생성 (공식문서 방식)
 * @param method - HTTP 메서드
 * @param url - 요청 URL (쿼리 포함)
 * @param secretKey - 시크릿 키
 * @param accessKey - 액세스 키
 * @returns Authorization 헤더 값
 */
export function generateCoupangSignature(method: string, url: string, secretKey: string, accessKey: string) {
  const parts = url.split('?');
  const path = parts[0];
  const query = parts[1] || '';
  const datetime = moment.utc().format('YYMMDD[T]HHmmss[Z]');
  const message = datetime + method + path + query;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}

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