import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { getNextRunAtKST } from '@/features/autopilot/lib/scheduler';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/config/auth-options';

export const dynamic = 'force-dynamic';

// 큐 목록 조회
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const queue = await prisma.autopilotQueue.findMany({
      where: { userId },
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

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
      publishTimes,
      publishDays,
      jitterMinutes,
      dailyCap,
      activeTimeStart,
      activeTimeEnd,
      startDate,
      themeId,
      maxRuns,
      expiresAt,
      publishTargets
    } = body;
    
    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const parsedInterval = intervalHours ? parseInt(intervalHours, 10) : null;
    const parsedStart = activeTimeStart !== undefined && activeTimeStart !== null ? parseInt(activeTimeStart, 10) : null;
    const parsedEnd = activeTimeEnd !== undefined && activeTimeEnd !== null ? parseInt(activeTimeEnd, 10) : null;
    
    // Parse advance fields
    const parsedPublishTimes = publishTimes ? publishTimes.split(',').map((s: string) => s.trim()) : undefined;
    const parsedPublishDays = publishDays ? publishDays.split(',').map((s: string) => parseInt(s.trim(), 10)) : undefined;
    const parsedJitter = jitterMinutes !== undefined && jitterMinutes !== null ? parseInt(jitterMinutes, 10) : 15;
    const parsedDailyCap = dailyCap !== undefined && dailyCap !== null ? parseInt(dailyCap, 10) : null;

    const nextRunAt = getNextRunAtKST(
      parsedInterval, 
      parsedStart, 
      parsedEnd, 
      0, 
      startDate || null,
      parsedPublishTimes,
      parsedPublishDays,
      parsedJitter
    );

    const newItem = await prisma.autopilotQueue.create({
      data: {
        keyword,
        userId,
        status: 'PENDING',
        personaId: personaId || null,
        themeId: themeId || null,
        
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
        publishTimes: publishTimes || null,
        publishDays: publishDays || null,
        jitterMinutes: parsedJitter,
        dailyCap: parsedDailyCap,
        activeTimeStart: parsedStart,
        activeTimeEnd: parsedEnd,
        nextRunAt,
        maxRuns: maxRuns ? parseInt(maxRuns, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        publishTargets: publishTargets ? JSON.stringify(publishTargets) : null,
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
    const { id, ids } = body;
    
    if (!id && (!ids || ids.length === 0)) {
      return NextResponse.json({ error: 'ID or IDs array is required' }, { status: 400 });
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      await prisma.autopilotQueue.deleteMany({
        where: { id: { in: ids } }
      });
    } else {
      await prisma.autopilotQueue.delete({
        where: { id }
      });
    }

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
    const { id, nextRunAt, status, errorMessage, resultUrl } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data: any = {};
    if (nextRunAt !== undefined) data.nextRunAt = new Date(nextRunAt);
    if (status) data.status = status;
    if (errorMessage !== undefined) data.errorMessage = errorMessage;
    if (resultUrl !== undefined) data.resultUrl = resultUrl;

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
