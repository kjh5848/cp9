export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchCoupangGoldbox } from '@/infrastructure/clients/coupang-extended';
import { CoupangProductResponse, CoupangRawProduct } from '@/shared/types/api';
import { normalizeCoupangProduct, resolveImageRedirectUrl } from '@/shared/lib/api-utils';

/**
 * 당일 쿠팡 골드박스 특가 상품 리스트 조회 API 라우트
 * @example
 * fetch('/api/products/goldbox', { method: 'POST' })
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const imageSize = body.imageSize;
    
    // 골드박스는 당일 리스트가 고정되어 있어 별도의 limit을 사용하지 않습니다.
    const products = await fetchCoupangGoldbox({ imageSize });
    
    // 일관된 응답 형식으로 변환 및 이미지 애드블록 우회 처리
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
