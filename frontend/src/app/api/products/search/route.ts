export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { searchCoupangProducts } from '@/infrastructure/clients/coupang';
import { CoupangProductResponse, ProductSearchRequest, CoupangRawProduct } from '@/shared/types/api';
import { normalizeCoupangProduct, resolveImageRedirectUrl } from '@/shared/lib/api-utils';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/infrastructure/clients/prisma";
import { authOptions } from "@/shared/config/auth-options";

/**
 * @param req - NextRequest (POST, { keyword: string, limit?: number })
 * @returns 상품 리스트
 * @example
 * fetch('/api/products/search', { method: 'POST', body: JSON.stringify({ keyword: '노트북' }) })
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!dbUser?.coupangAccessKey || !dbUser?.coupangSecretKey) {
      return NextResponse.json({ error: '마이페이지에서 쿠팡 API 연동 설정이 필요합니다.' }, { status: 403 });
    }

    const { keyword, limit = 10 }: ProductSearchRequest = await req.json();
    
    if (!keyword) {
      return NextResponse.json({ error: '키워드를 입력하세요.' }, { status: 400 });
    }
    
    const products = await searchCoupangProducts(keyword, limit, dbUser.coupangAccessKey, dbUser.coupangSecretKey);

    
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
    console.error('[products/search] 에러:', e);
    const errorMessage = e instanceof Error ? e.message : '서버 오류';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

