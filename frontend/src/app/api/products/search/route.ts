import { NextRequest, NextResponse } from 'next/server';

/**
 * 쿠팡 파트너스 상품 검색 API 라우트
 * @param req - NextRequest (POST, { keyword: string })
 * @returns 상품 리스트 (mock)
 * @example
 * fetch('/api/products/search', { method: 'POST', body: JSON.stringify({ keyword: '노트북' }) })
 */
export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    if (!keyword) {
      return NextResponse.json({ error: '키워드를 입력하세요.' }, { status: 400 });
    }

    // TODO: 실제 쿠팡 파트너스 상품 검색 API 연동
    // const result = await fetchCoupangProducts(keyword);
    // return NextResponse.json(result);

    // 임시 mock 데이터 반환
    const mock = [
      {
        title: `${keyword} 초특가 노트북`,
        image: 'https://via.placeholder.com/200x200',
        price: 999000,
        url: 'https://www.coupang.com/vp/products/123456',
        productId: '123456',
      },
      {
        title: `${keyword} 인기 게이밍 마우스`,
        image: 'https://via.placeholder.com/200x200',
        price: 39000,
        url: 'https://www.coupang.com/vp/products/654321',
        productId: '654321',
      },
    ];
    return NextResponse.json(mock);
  } catch (e) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
} 