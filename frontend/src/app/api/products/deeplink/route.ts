import { NextResponse } from 'next/server';
import { generateCoupangSignature } from '@/lib/coupang-hmac';

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs are required and must be an array.' }, { status: 400 });
    }

    const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
    const SECRET_KEY = process.env.COUPANG_SECRET_KEY;

    if (!ACCESS_KEY || !SECRET_KEY) {
      return NextResponse.json({ error: 'Coupang API keys are not configured.' }, { status: 500 });
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
      console.error('Coupang API error:', errorText);
      return NextResponse.json({ error: `Coupang API error: ${response.statusText} - ${errorText}` }, { status: response.status });
    }

    const data = await response.json();

    // Coupang API 응답에서 필요한 정보만 추출하여 반환
    const deeplinkResults = data.data.deeplinkList.map((item: any) => ({
      title: item.productName || item.originalUrl, // 상품 이름이 없으면 원본 URL 사용
      image: item.productImage, // 상품 이미지 URL
      price: item.productPrice, // 상품 가격
      url: item.originalUrl, // 원본 URL
      productId: item.productId, // 상품 ID
      deepLink: item.deeplinkUrl, // 변환된 딥링크 URL
      rocketShipping: item.isRocketShipping, // 로켓배송 여부
    }));

    return NextResponse.json(deeplinkResults);
  } catch (error) {
    console.error('Deep link conversion failed:', error);
    return NextResponse.json({ error: 'Failed to convert deep links.' }, { status: 500 });
  }
}
