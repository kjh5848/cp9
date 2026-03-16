import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/config/auth-options';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const campaigns = await prisma.categoryCampaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        persona: { select: { name: true } },
        _count: {
          select: {
            queues: {
              where: { status: 'WAITING_APPROVAL' }
            }
          }
        }
      }
    });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('Failed to fetch category campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    const { 
      categoryName, personaId, themeId, 
      intervalHours, publishTimes, publishDays, jitterMinutes, dailyCap,
      activeTimeStart, activeTimeEnd, batchSize, isAutoApprove,
      targetAge, targetGender, targetPrice, targetIndustry,
      publishTargets
    } = body;

    if (!categoryName) {
      return NextResponse.json({ error: 'Category Name is required' }, { status: 400 });
    }

    const newCampaign = await prisma.categoryCampaign.create({
      data: {
        categoryName,
        userId,
        personaId: personaId || null,
        themeId: themeId || null,
        intervalHours: intervalHours ? parseInt(intervalHours, 10) : 24,
        publishTimes: publishTimes || null,
        publishDays: publishDays || null,
        jitterMinutes: jitterMinutes !== undefined && jitterMinutes !== null ? parseInt(jitterMinutes, 10) : 15,
        dailyCap: dailyCap !== undefined && dailyCap !== null ? parseInt(dailyCap, 10) : null,
        activeTimeStart: activeTimeStart !== undefined && activeTimeStart !== null ? parseInt(activeTimeStart, 10) : null,
        activeTimeEnd: activeTimeEnd !== undefined && activeTimeEnd !== null ? parseInt(activeTimeEnd, 10) : null,
        batchSize: batchSize ? parseInt(batchSize, 10) : 15,
        isAutoApprove: isAutoApprove || false,
        targetAge: targetAge || null,
        targetGender: targetGender || null,
        targetPrice: targetPrice || null,
        targetIndustry: targetIndustry || null,
        publishTargets: publishTargets ? JSON.stringify(publishTargets) : null,
      },
      include: {
        persona: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, data: newCampaign });
  } catch (error) {
    console.error('Failed to create category campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const ids = url.searchParams.get('ids');

    if (ids) {
      const idList = ids.split(',').filter(Boolean);
      await prisma.categoryCampaign.deleteMany({
        where: { id: { in: idList } }
      });
      return NextResponse.json({ success: true, count: idList.length });
    } else if (id) {
      await prisma.categoryCampaign.delete({
        where: { id }
      });
      return NextResponse.json({ success: true, count: 1 });
    } else {
      return NextResponse.json({ error: 'id or ids parameter is required' }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to delete category campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
