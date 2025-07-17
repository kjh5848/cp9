import { NextRequest, NextResponse } from 'next/server';

/**
 * 쿠팡 상품 링크 → 딥링크 변환 API 라우트
 * @param req - NextRequest (POST, { links: string[] })
 * @returns 변환된 상품 리스트
 * @example
 * fetch('/api/products/link', { method: 'POST', body: JSON.stringify({ links: [...] }) })
 */
export async function POST(req: NextRequest) {
  try {
    const { links } = await req.json();
    if (!Array.isArray(links) || links.length === 0) {
      return NextResponse.json({ error: 'links 배열을 입력하세요.' }, { status: 400 });
    }
    // mock 변환: 각 링크를 상품 객체로 변환
    const items = links.slice(0, 20).map((url: string) => ({
      title: url,
      image: '',
      price: 0,
      url,
      productId: url,
      deepLink: url + '?deeplink=1',
      rocketShipping: false,
    }));
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '서버 오류' }, { status: 500 });
  }
} 