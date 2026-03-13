import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/config/auth-options';
import { prisma } from '@/infrastructure/clients/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          nickname: true,
          role: true,
          createdAt: true,
          // API 연동 여부만 체크하기 위한 boolean 변환 (보안상 실제 키값은 숨김)
          coupangAccessKey: true, 
        }
      }),
      prisma.user.count()
    ]);

    // boolean 형태로 매핑
    const mappedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt,
      hasCoupangKey: !!user.coupangAccessKey
    }));

    return NextResponse.json({
      users: mappedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('[Admin Users API Error]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
