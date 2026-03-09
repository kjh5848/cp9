import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

export const dynamic = 'force-dynamic';

// 큐 목록 조회
export async function GET(request: Request) {
  try {
    const queue = await prisma.autopilotQueue.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: queue });
  } catch (error) {
    console.error('Failed to fetch autopilot queue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 큐에 키워드 추가
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword } = body;
    
    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const newItem = await prisma.autopilotQueue.create({
      data: {
        keyword,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    console.error('Failed to add autopilot queue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 큐 아이템 삭제 또는 상태 변경
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.autopilotQueue.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete autopilot queue item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
