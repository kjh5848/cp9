import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const campaigns = await prisma.categoryCampaign.findMany({
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
    const body = await request.json();
    const { categoryName, personaId, themeId, intervalHours, activeTimeStart, activeTimeEnd, batchSize, isAutoApprove } = body;

    if (!categoryName) {
      return NextResponse.json({ error: 'Category Name is required' }, { status: 400 });
    }

    const newCampaign = await prisma.categoryCampaign.create({
      data: {
        categoryName,
        personaId: personaId || null,
        themeId: themeId || null,
        intervalHours: intervalHours ? parseInt(intervalHours, 10) : 24,
        activeTimeStart: activeTimeStart !== undefined && activeTimeStart !== null ? parseInt(activeTimeStart, 10) : null,
        activeTimeEnd: activeTimeEnd !== undefined && activeTimeEnd !== null ? parseInt(activeTimeEnd, 10) : null,
        batchSize: batchSize ? parseInt(batchSize, 10) : 15,
        isAutoApprove: isAutoApprove || false,
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

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.categoryCampaign.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
