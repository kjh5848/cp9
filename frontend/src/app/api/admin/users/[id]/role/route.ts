import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/config/auth-options';
import { prisma } from '@/infrastructure/clients/prisma';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { role } = body;

    // 역할 오타 방지
    if (!['USER', 'PRO', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
    }

    // 관리자가 자신 스스로의 등급을 내리는 것을 방지 (안전 장치)
    if (session.user.id === id && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Cannot downgrade your own admin account' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('[Admin Role Update API Error]', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
