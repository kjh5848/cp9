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
              where: { status: { in: ['WAITING_APPROVAL', 'PENDING', 'PROCESSING'] } }
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
      textModel, imageModel, articleType, sortCriteria, minPrice, maxPrice, isRocketOnly,
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
        textModel: textModel || 'gpt-4o',
        imageModel: imageModel || 'dall-e-3',
        articleType: articleType || 'auto',
        sortCriteria: sortCriteria || 'salePriceAsc',
        minPrice: minPrice !== undefined && minPrice !== null ? parseInt(minPrice, 10) : null,
        maxPrice: maxPrice !== undefined && maxPrice !== null ? parseInt(maxPrice, 10) : null,
        isRocketOnly: isRocketOnly || false,
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

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { 
      id,
      personaId, themeId, 
      intervalHours, publishTimes, publishDays, jitterMinutes, dailyCap,
      activeTimeStart, activeTimeEnd, batchSize, isAutoApprove,
      targetAge, targetGender, targetPrice, targetIndustry,
      textModel, imageModel, articleType, sortCriteria, minPrice, maxPrice, isRocketOnly,
      publishTargets
    } = body;

    if (!id) {
    return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    // Ensure the campaign belongs to the user
    const existing = await prisma.categoryCampaign.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found or unauthorized' }, { status: 404 });
    }

    const updatedCampaign = await prisma.categoryCampaign.update({
      where: { id },
      data: {
        personaId: personaId !== undefined ? personaId : existing.personaId,
        themeId: themeId !== undefined ? themeId : existing.themeId,
        intervalHours: intervalHours !== undefined ? parseInt(intervalHours, 10) : existing.intervalHours,
        publishTimes: publishTimes !== undefined ? publishTimes : existing.publishTimes,
        publishDays: publishDays !== undefined ? publishDays : existing.publishDays,
        jitterMinutes: jitterMinutes !== undefined ? parseInt(jitterMinutes, 10) : existing.jitterMinutes,
        dailyCap: dailyCap !== undefined && dailyCap !== null ? parseInt(dailyCap, 10) : existing.dailyCap,
        activeTimeStart: activeTimeStart !== undefined && activeTimeStart !== null ? parseInt(activeTimeStart, 10) : existing.activeTimeStart,
        activeTimeEnd: activeTimeEnd !== undefined && activeTimeEnd !== null ? parseInt(activeTimeEnd, 10) : existing.activeTimeEnd,
        batchSize: batchSize !== undefined ? parseInt(batchSize, 10) : existing.batchSize,
        targetAge: targetAge !== undefined ? targetAge : existing.targetAge,
        targetGender: targetGender !== undefined ? targetGender : existing.targetGender,
        targetPrice: targetPrice !== undefined ? targetPrice : existing.targetPrice,
        targetIndustry: targetIndustry !== undefined ? targetIndustry : existing.targetIndustry,
        textModel: textModel !== undefined ? textModel : existing.textModel,
        imageModel: imageModel !== undefined ? imageModel : existing.imageModel,
        articleType: articleType !== undefined ? articleType : existing.articleType,
        sortCriteria: sortCriteria !== undefined ? sortCriteria : existing.sortCriteria,
        minPrice: minPrice !== undefined ? (minPrice === null ? null : parseInt(minPrice, 10)) : existing.minPrice,
        maxPrice: maxPrice !== undefined ? (maxPrice === null ? null : parseInt(maxPrice, 10)) : existing.maxPrice,
        isRocketOnly: isRocketOnly !== undefined ? isRocketOnly : existing.isRocketOnly,
        publishTargets: publishTargets !== undefined ? JSON.stringify(publishTargets) : existing.publishTargets,
      },
      include: {
        persona: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, data: updatedCampaign });
  } catch (error) {
    console.error('Failed to update category campaign:', error);
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
