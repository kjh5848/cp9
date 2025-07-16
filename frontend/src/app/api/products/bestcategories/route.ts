import { NextRequest, NextResponse } from 'next/server';
import { fetchCoupangBestCategory } from '@/lib/coupang-best-category';

/**
 * 쿠팡 베스트 카테고리 상품 검색 API 라우트
 * @param req - NextRequest (POST, { categoryId: string, limit?: number, imageSize?: string })
 * @returns 상품 리스트
 * @example
 * fetch('/api/products/bestcategories', { method: 'POST', body: JSON.stringify({ categoryId: '1014', limit: 20 }) })
 */
export async function POST(req: NextRequest) {
  try {
    const { categoryId, limit = 20, imageSize } = await req.json();
    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId를 입력하세요.' }, { status: 400 });
    }
    const products = await fetchCoupangBestCategory({ categoryId, limit, imageSize });
    return NextResponse.json(products);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '서버 오류' }, { status: 500 });
  }
} 