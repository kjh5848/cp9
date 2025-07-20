import { NextRequest, NextResponse } from 'next/server';
import { searchCoupangProducts } from '@/infrastructure/api/coupang';
import { CoupangProductResponse, ProductSearchRequest, CoupangRawProduct } from '@/shared/types/api';
import { normalizeCoupangProduct } from '@/shared/lib/api-utils';

/**
 * 쿠팡 파트너스 상품 검색 API 라우트
 * @param req - NextRequest (POST, { keyword: string, limit?: number })
 * @returns 상품 리스트
 * @example
 * fetch('/api/products/search', { method: 'POST', body: JSON.stringify({ keyword: '노트북' }) })
 */
export async function POST(req: NextRequest) {
  try {
    const { keyword, limit = 10 }: ProductSearchRequest = await req.json();
    
    if (!keyword) {
      return NextResponse.json({ error: '키워드를 입력하세요.' }, { status: 400 });
    }
    
    const products = await searchCoupangProducts(keyword, limit);
    
    // 일관된 응답 형식으로 변환
    const result: CoupangProductResponse[] = (products as CoupangRawProduct[]).map(normalizeCoupangProduct);
    
    return NextResponse.json(result);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : '서버 오류';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 