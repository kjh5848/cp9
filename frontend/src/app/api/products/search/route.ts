import { NextRequest, NextResponse } from 'next/server';
import { searchCoupangProducts } from '@/lib/coupang';

/**
 * 쿠팡 파트너스 상품 검색 API 라우트
 * @param req - NextRequest (POST, { keyword: string, limit?: number })
 * @returns 상품 리스트
 * @example
 * fetch('/api/products/search', { method: 'POST', body: JSON.stringify({ keyword: '노트북' }) })
 */
export async function POST(req: NextRequest) {
  try {
    const { keyword, limit = 10 } = await req.json();
    if (!keyword) {
      return NextResponse.json({ error: '키워드를 입력하세요.' }, { status: 400 });
    }
    const products = await searchCoupangProducts(keyword, limit);
    // 필요한 필드만 추출 (rocketShipping 등)
    const result = products.map((item: any) => ({
      title: item.productName,
      image: item.productImage,
      price: item.productPrice,
      url: item.productUrl,
      productId: item.productId,
      rocketShipping: item.rocketShipping || false,
    }));
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '서버 오류' }, { status: 500 });
  }
} 