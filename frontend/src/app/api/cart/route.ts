import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/config/auth-options';
import { prisma } from '@/infrastructure/clients/prisma';

// GET: 로그인된 유저의 장바구니 키워드 목록 조회
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const cartItems = await prisma.keywordCartItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // ExtractedKeyword 타입에 맞게 매핑
    const keywords = cartItems.map((item: any) => ({
      keyword: item.keyword,
      monthlySearchVol: item.monthlySearchVol || 0,
      monthlySearchRate: 0,
      monthlyBlogRate: 0,
      pubRate: '0%',
      competition: item.competition || '조회불가',
      cpc: 0,
      intent: item.intent || '정보검색',
    }));

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error('Failed to fetch cart keywords:', error);
    return NextResponse.json({ error: 'Failed to fetch cart keywords' }, { status: 500 });
  }
}

// POST: 클라이언트 장바구니 상태를 DB에 동기화 (전체 덮어쓰기 로직)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { keywords } = body;

    if (!Array.isArray(keywords)) {
      return NextResponse.json({ error: 'Invalid payload: keywords must be an array' }, { status: 400 });
    }

    // 간단한 동기화를 위해 트랜잭션 사용: 기존 데이터 전부 날리고 새로 삽입
    await prisma.$transaction([
      prisma.keywordCartItem.deleteMany({
        where: { userId },
      }),
      prisma.keywordCartItem.createMany({
        data: keywords.map((k: any) => ({
          userId,
          keyword: k.keyword,
          monthlySearchVol: k.monthlySearchVol,
          competition: k.competition,
          intent: k.intent,
        })),
        skipDuplicates: true, // 복합 유니크 키 충돌 방지
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Cart synced successfully' });
  } catch (error) {
    console.error('Failed to sync cart:', error);
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}
