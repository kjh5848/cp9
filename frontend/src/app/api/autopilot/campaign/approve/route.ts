import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { getNextRunAtKST } from '@/features/autopilot/lib/scheduler';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queueIds } = body; 

    if (!queueIds || !Array.isArray(queueIds) || queueIds.length === 0) {
      return NextResponse.json({ error: 'queueIds array is required' }, { status: 400 });
    }

    const queues = await prisma.autopilotQueue.findMany({
      where: {
        id: { in: queueIds },
        status: 'WAITING_APPROVAL'
      },
      include: {
        campaign: true
      }
    });

    if (queues.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // 트랜잭션으로 상태를 PENDING으로 변경하고 각각 nextRunAt 배정 (간격 분리)
    const updates = queues.map((q, index) => {
      // campaign 정보가 있으면 우선시, 없으면 큐 내부 정보 사용
      const intervalHours = q.campaign?.intervalHours || q.intervalHours || 24;
      const intervalMinutes = intervalHours * 60;
      const activeStart = q.campaign?.activeTimeStart ?? q.activeTimeStart;
      const activeEnd = q.campaign?.activeTimeEnd ?? q.activeTimeEnd;
      
      // index * intervalMinutes (혹은 단순 spacing)
      // 여기서는 각 아이템을 intervalMinutes 단위로 순차적 배치 (getNextRunAtKST 내부에서 index 기반으로 계산되므로 index만 전달)
      const nextRunAt = getNextRunAtKST(intervalMinutes, activeStart, activeEnd, index, new Date());

      return prisma.autopilotQueue.update({
        where: { id: q.id },
        data: {
          status: 'PENDING',
          nextRunAt,
          intervalHours,     // 스냅샷으로 저장
          activeTimeStart: activeStart,
          activeTimeEnd: activeEnd
        }
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, count: updates.length });
  } catch (error) {
    console.error('Failed to approve queues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
