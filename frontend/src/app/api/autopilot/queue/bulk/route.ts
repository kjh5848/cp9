import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { getNextRunAtKST } from '@/features/autopilot/lib/scheduler';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body as { items: any[] };
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Valid items array is required' }, { status: 400 });
    }

    const now = new Date();
    
    const dataToInsert = items.map((payload, index) => {
      const charLimit = payload.charLimit ? parseInt(payload.charLimit, 10) : 5000;
      const minPrice = payload.minPrice ? parseInt(payload.minPrice, 10) : null;
      const maxPrice = payload.maxPrice ? parseInt(payload.maxPrice, 10) : null;
      const intervalHours = payload.intervalHours ? parseInt(payload.intervalHours, 10) : null;
      const activeTimeStart = payload.activeTimeStart !== undefined && payload.activeTimeStart !== null ? parseInt(payload.activeTimeStart, 10) : null;
      const activeTimeEnd = payload.activeTimeEnd !== undefined && payload.activeTimeEnd !== null ? parseInt(payload.activeTimeEnd, 10) : null;

      const offsetHours = intervalHours ? (index * intervalHours) : 0;
      const nextRunAt = getNextRunAtKST(intervalHours, activeTimeStart, activeTimeEnd, offsetHours, payload.startDate || null);

      return {
        keyword: payload.keyword,
        trafficKeyword: payload.trafficKeyword || null,
        coupangSearchTerm: payload.coupangSearchTerm || null,
        recommendedItemCount: payload.recommendedItemCount || null,
        searchIntent: payload.searchIntent || null,
        
        status: 'PENDING',
        personaId: payload.personaId || null,
        themeId: payload.themeId || null,
        
        articleType: payload.articleType ?? 'single',
        textModel: payload.textModel ?? 'gpt-4o',
        imageModel: payload.imageModel ?? 'dall-e-3',
        charLimit,
        
        sortCriteria: payload.sortCriteria || 'salePriceAsc',
        minPrice,
        maxPrice,
        isRocketOnly: payload.isRocketOnly || false,
        
        intervalHours,
        activeTimeStart,
        activeTimeEnd,
        nextRunAt,
        maxRuns: payload.maxRuns ? parseInt(payload.maxRuns, 10) : null,
        expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
        titleRegenRule: payload.titleRegenRule || 'reuse',
      };
    });

    const result = await prisma.autopilotQueue.createMany({
      data: dataToInsert,
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Failed to add autopilot queue items in bulk:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
