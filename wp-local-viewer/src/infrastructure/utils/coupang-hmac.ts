/**
 * 쿠팡 오픈API HMAC 서명 생성 유틸
 *
 * @param method - HTTP 메서드 (GET, POST 등)
 * @param url - 요청 URL (쿼리 포함)
 * @param secretKey - 시크릿 키
 * @param accessKey - 액세스 키
 * @returns Authorization 헤더 값
 * @example
 * const signature = generateCoupangSignature('GET', '/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories/1001?limit=50', secret, access);
 */
import crypto from 'crypto';
import moment from 'moment';

export function generateCoupangSignature(method: string, url: string, secretKey: string, accessKey: string): string {
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