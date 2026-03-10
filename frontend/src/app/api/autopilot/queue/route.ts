import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { getNextRunAtKST } from '@/features/autopilot/lib/scheduler';

export const dynamic = 'force-dynamic';

// 큐 목록 조회
export async function GET(request: Request) {
  try {
    const queue = await prisma.autopilotQueue.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        persona: {
          select: { name: true }
        }
      }
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
    const {
      keyword,
      personaId,
      articleType,
      textModel,
      imageModel,
      charLimit,
      sortCriteria,
      minPrice,
      maxPrice,
      isRocketOnly,
      intervalHours,
      activeTimeStart,
      activeTimeEnd
    } = body;
    
    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const parsedInterval = intervalHours ? parseInt(intervalHours, 10) : null;
    const parsedStart = activeTimeStart !== undefined && activeTimeStart !== null ? parseInt(activeTimeStart, 10) : null;
    const parsedEnd = activeTimeEnd !== undefined && activeTimeEnd !== null ? parseInt(activeTimeEnd, 10) : null;

    const nextRunAt = getNextRunAtKST(parsedInterval, parsedStart, parsedEnd);

    const newItem = await prisma.autopilotQueue.create({
      data: {
        keyword,
        status: 'PENDING',
        personaId: personaId || null,
        
        // Phase 3 Configs
        articleType: articleType ?? 'single',
        textModel: textModel ?? 'gpt-4o',
        imageModel: imageModel ?? 'dall-e-3',
        charLimit: charLimit ? parseInt(charLimit, 10) : 5000,
        
        sortCriteria: sortCriteria || 'salePriceAsc',
        minPrice: minPrice ? parseInt(minPrice, 10) : null,
        maxPrice: maxPrice ? parseInt(maxPrice, 10) : null,
        isRocketOnly: isRocketOnly || false,
        
        intervalHours: parsedInterval,
        activeTimeStart: parsedStart,
        activeTimeEnd: parsedEnd,
        nextRunAt,
      },
      include: {
        persona: {
          select: { name: true }
        }
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
// 큐 아이템 상태 또는 예약 시간 수정
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nextRunAt, status, errorMessage } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data: any = {};
    if (nextRunAt !== undefined) data.nextRunAt = new Date(nextRunAt);
    if (status) data.status = status;
    if (errorMessage !== undefined) data.errorMessage = errorMessage;

    const updatedItem = await prisma.autopilotQueue.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Failed to update autopilot queue item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
