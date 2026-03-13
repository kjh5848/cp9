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

    const [queues, total] = await Promise.all([
      prisma.autopilotQueue.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, nickname: true } }
        }
      }),
      prisma.autopilotQueue.count()
    ]);

    return NextResponse.json({
      queues,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('[Admin Queue API Error]', error);
    return NextResponse.json({ error: 'Failed to fetch queues' }, { status: 500 });
  }
}
