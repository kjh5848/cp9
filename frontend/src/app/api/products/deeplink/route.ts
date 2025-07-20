import { NextRequest, NextResponse } from 'next/server';
import { generateCoupangSignature } from '@/infrastructure/utils/coupang-hmac';
import { DeepLinkResponse, DeepLinkRequest, CoupangDeepLinkApiResponse } from '@/shared/types/api';
import { normalizeDeepLinkResponse } from '@/shared/lib/api-utils';

/**
 * 쿠팡 파트너스 딥링크 변환 API 라우트
 * @param req - NextRequest (POST, { urls: string[] })
 * @returns 딥링크 변환 결과
 * @example
 * fetch('/api/products/deeplink', { method: 'POST', body: JSON.stringify({ urls: ['https://...'] }) })
 */
export async function POST(req: NextRequest) {
  try {
    const { urls }: DeepLinkRequest = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs 배열이 필요합니다.' }, { status: 400 });
    }

    const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
    const SECRET_KEY = process.env.COUPANG_SECRET_KEY;

    if (!ACCESS_KEY || !SECRET_KEY) {
      return NextResponse.json({ error: '쿠팡 API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const method = 'POST';
    const path = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
    const host = 'https://api-gateway.coupang.com';
    const requestUrl = host + path;

    const authorization = generateCoupangSignature(method, path, SECRET_KEY, ACCESS_KEY);

    const response = await fetch(requestUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: authorization,
      },
      body: JSON.stringify({ coupangUrls: urls }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('쿠팡 API 오류:', errorText);
      return NextResponse.json({ error: `쿠팡 API 오류: ${response.statusText} - ${errorText}` }, { status: response.status });
    }

    const data: CoupangDeepLinkApiResponse = await response.json();

    // 일관된 응답 형식으로 변환
    const deeplinkResults: DeepLinkResponse[] = data.data.deeplinkList.map(normalizeDeepLinkResponse);

    return NextResponse.json(deeplinkResults);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : '딥링크 변환 실패';
    console.error('딥링크 변환 실패:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
