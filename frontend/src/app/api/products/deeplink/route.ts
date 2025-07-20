import { NextRequest, NextResponse } from 'next/server';
import { generateCoupangSignature } from '@/infrastructure/utils/coupang-hmac';
import { DeepLinkResponse, DeepLinkRequest, CoupangRawDeepLink } from '@/shared/types/api';
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

    console.log('ACCESS_KEY 존재:', !!ACCESS_KEY);
    console.log('SECRET_KEY 존재:', !!SECRET_KEY);

    const method = 'POST';
    const path = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
    const host = 'https://api-gateway.coupang.com';
    const requestUrl = host + path;

    const authorization = generateCoupangSignature(method, path, SECRET_KEY, ACCESS_KEY);

    console.log('요청 URL:', requestUrl);
    console.log('요청 본문:', JSON.stringify({ coupangUrls: urls }));

    const response = await fetch(requestUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: authorization,
      },
      body: JSON.stringify({ coupangUrls: urls }),
    });

    console.log('응답 상태:', response.status);
    console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('쿠팡 API 오류:', errorText);
      return NextResponse.json({ error: `쿠팡 API 오류: ${response.statusText} - ${errorText}` }, { status: response.status });
    }

    const data = await response.json();

    // 응답 구조 로깅
    console.log('쿠팡 API 응답:', JSON.stringify(data, null, 2));
    console.log('응답 타입:', typeof data);
    console.log('data.data 존재:', !!data?.data);
    console.log('data.data 타입:', typeof data?.data);
    console.log('Array.isArray(data):', Array.isArray(data));

    // 오류 응답 확인
    if (data?.error || data?.message) {
      console.error('쿠팡 API 오류 응답:', data);
      return NextResponse.json({ error: `쿠팡 API 오류: ${data.error || data.message}` }, { status: 400 });
    }

    // rCode 확인 (쿠팡 API 응답 코드)
    if (data?.rCode !== '0') {
      console.error('쿠팡 API 오류 코드:', data?.rCode, data?.rMessage);
      return NextResponse.json({ error: `쿠팡 API 오류: ${data?.rMessage || '알 수 없는 오류'}` }, { status: 400 });
    }

    // 딥링크 리스트 추출
    let deeplinkList: CoupangRawDeepLink[] = [];
    
    if (data?.data && Array.isArray(data.data)) {
      console.log('data.data 배열 사용');
      deeplinkList = data.data as CoupangRawDeepLink[];
    } else if (Array.isArray(data)) {
      console.log('data가 배열로 사용');
      deeplinkList = data as CoupangRawDeepLink[];
    } else {
      console.error('쿠팡 API 응답 구조 오류:', data);
      return NextResponse.json({ error: '쿠팡 API 응답 구조가 올바르지 않습니다.' }, { status: 500 });
    }

    // 일관된 응답 형식으로 변환
    const deeplinkResults: DeepLinkResponse[] = deeplinkList.map(normalizeDeepLinkResponse);

    return NextResponse.json(deeplinkResults);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : '딥링크 변환 실패';
    console.error('딥링크 변환 실패:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
