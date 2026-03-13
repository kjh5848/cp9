export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchCoupangPLBrand } from '@/infrastructure/clients/coupang-extended';
import { CoupangProductResponse, CoupangRawProduct } from '@/shared/types/api';
import { normalizeCoupangProduct, resolveImageRedirectUrl } from '@/shared/lib/api-utils';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/infrastructure/clients/prisma";
import { authOptions } from "@/shared/config/auth-options";

/**
 * 쿠팡 PL 브랜드별 베스트 상품 검색 API 라우트
 * @example
 * fetch('/api/products/coupang-pl-brand', { method: 'POST', body: JSON.stringify({ brandId: 1001, limit: 20 }) })
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { brandId, limit = 20, imageSize } = await req.json();
    
    if (!brandId) {
      return NextResponse.json({ error: 'brandId(브랜드 코드)를 입력하세요.' }, { status: 400 });
    }
    
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!dbUser?.coupangAccessKey || !dbUser?.coupangSecretKey) {
      return NextResponse.json({ error: '마이페이지에서 쿠팡 API 연동 설정이 필요합니다.' }, { status: 403 });
    }

    // 브랜드 아이디는 숫자형(또는 문자열) 허용
    const parsedBrandId = typeof brandId === 'string' ? parseInt(brandId, 10) : brandId;
    
    const products = await fetchCoupangPLBrand({ 
      brandId: parsedBrandId, 
      limit, 
      imageSize, 
      accessKey: dbUser.coupangAccessKey, 
      secretKey: dbUser.coupangSecretKey 
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
