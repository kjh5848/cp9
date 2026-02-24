export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { searchCoupangProducts } from '@/infrastructure/clients/coupang';
import { CoupangProductResponse, ProductSearchRequest, CoupangRawProduct } from '@/shared/types/api';
import { normalizeCoupangProduct, resolveImageRedirectUrl } from '@/shared/lib/api-utils';

/**
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
    
    // 일관된 응답 형식으로 변환 및 이미지 리다이렉트 처리(애드블록 우회)
    const result: CoupangProductResponse[] = await Promise.all(
      (products as CoupangRawProduct[]).map(async (raw) => {
        const item = normalizeCoupangProduct(raw);
        item.productImage = await resolveImageRedirectUrl(item.productImage);
        return item;
      })
    );
    
    return NextResponse.json(result);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : '서버 오류';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
