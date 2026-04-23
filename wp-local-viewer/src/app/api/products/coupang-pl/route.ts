export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchCoupangPL } from '@/infrastructure/clients/coupang-extended';
import { CoupangProductResponse, CoupangRawProduct } from '@/shared/types/api';
import { normalizeCoupangProduct, resolveImageRedirectUrl, resolveCoupangKeys } from '@/shared/lib/api-utils';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/infrastructure/clients/prisma";
import { authOptions } from "@/shared/config/auth-options";

/**
 * 쿠팡 PL 통합 브랜드 베스트 상품 검색 API 라우트
 * @example
 * fetch('/api/products/coupang-pl', { method: 'POST', body: JSON.stringify({ limit: 50 }) })
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
    
    const { accessKey, secretKey } = resolveCoupangKeys(dbUser);
    
    if (!accessKey || !secretKey) {
      return NextResponse.json({ error: '마이페이지에서 쿠팡 API 연동 설정이 필요합니다.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 20;
    const imageSize = body.imageSize;
    
    const products = await fetchCoupangPL({ 
      limit, 
      imageSize, 
      accessKey, 
      secretKey 
    });
    
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
