export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchCoupangBestCategory } from '@/infrastructure/clients/coupang-best-category';
import { CoupangProductResponse, CategorySearchRequest, CoupangRawProduct } from '@/shared/types/api';
import { normalizeCoupangProduct, resolveImageRedirectUrl, resolveCoupangKeys } from '@/shared/lib/api-utils';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/infrastructure/clients/prisma";
import { authOptions } from "@/shared/config/auth-options";

/**
 * 쿠팡 베스트 카테고리 상품 검색 API 라우트
 * @param req - NextRequest (POST, { categoryId: string, limit?: number, imageSize?: string })
 * @returns 상품 리스트
 * @example
 * fetch('/api/products/bestcategories', { method: 'POST', body: JSON.stringify({ categoryId: '1014', limit: 20 }) })
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { categoryId, limit = 100, imageSize }: CategorySearchRequest = await req.json();
    
    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId를 입력하세요.' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    const { accessKey, secretKey } = resolveCoupangKeys(dbUser);

    if (!accessKey || !secretKey) {
      return NextResponse.json({ error: '마이페이지에서 쿠팡 API 연동 설정이 필요합니다.' }, { status: 403 });
    }
    
    const products = await fetchCoupangBestCategory({ 
      categoryId, 
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
