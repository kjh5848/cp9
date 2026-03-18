import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { runSeoPipeline } from '../../item-research/pipeline/run-pipeline';
import type { ItemResearchRequest } from '../../item-research/pipeline/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. 보안을 위해 cron 요청인지 확인 (Vercel 환경 등)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 스케줄된 아이템 조회
    // prisma의 JSON 컬럼 필터링 한계상, 모든 스케줄 아이템을 가져온 후 JS에서 필터링합니다.
    // 데이터량이 방대하지 않으므로 문제 없습니다.
    const allItems = await prisma.research.findMany();
    
    const now = new Date();
    const overdueItems = allItems.filter(item => {
      try {
        const pack = typeof item.pack === 'string' ? JSON.parse(item.pack) : item.pack;
        if (pack.status === 'SCHEDULED' && pack.scheduledAt) {
          const scheduledTime = new Date(pack.scheduledAt);
          return scheduledTime <= now;
        }
      } catch (e) {
        console.warn('Failed to parse pack for item', item.itemId);
      }
      return false;
    });

    if (overdueItems.length === 0) {
      return NextResponse.json({ message: 'No overdue scheduled items found.', count: 0 });
    }

    console.log(`⏰ [SEO-Cron] ${overdueItems.length}개의 밀린 작업을 실행합니다.`);

    // 3. 병렬적으로 파이프라인 트리거
    await Promise.all(overdueItems.map(async (item) => {
      const pack = typeof item.pack === 'string' ? JSON.parse(item.pack) : item.pack;
      
      const body: ItemResearchRequest = pack.originalRequest || {
        itemName: pack.title || '상품',
        projectId: item.projectId,
        itemId: item.itemId,
        productData: {
          productName: pack.title || '상품',
          productPrice: pack.priceKRW || 0,
          productImage: pack.productImage || '',
          productUrl: pack.productUrl || '',
          categoryName: pack.categoryName || '',
          isRocket: pack.isRocket || false,
          isFreeShipping: pack.isFreeShipping || false,
        },
        seoConfig: {
          persona: pack.persona || pack.seoConfig?.persona || 'IT',
          toneAndManner: pack.toneAndManner || '전문적이면서 친근한',
          textModel: pack.textModel || 'gpt-4o',
          imageModel: pack.imageModel || 'dall-e-3',
          actionType: 'NOW',
          charLimit: pack.charLimit || 2000,
          articleType: pack.articleType || 'single',
          publishTarget: pack.publishTarget || 'DB_ONLY',
          publishTargets: pack.publishTargets || pack.seoConfig?.publishTargets || [],
          themeId: pack.themeId,
        },
      };

      const persona = body.seoConfig!.persona;
      const tone = body.seoConfig!.toneAndManner!;
      const textModel = body.seoConfig!.textModel!;
      const imageModel = body.seoConfig!.imageModel!;
      const charLimit = body.seoConfig!.charLimit!;
      const articleType = body.seoConfig!.articleType!;
      const publishTarget = body.seoConfig!.publishTarget!;
      const publishTargets = body.seoConfig!.publishTargets;
      const themeId = body.seoConfig!.themeId;

      // PROCESSING 상태로 업데이트
      const processingPack = {
        ...pack,
        status: 'PROCESSING',
        startedAt: new Date().toISOString(),
      };

      await prisma.research.upsert({
        where: { projectId_itemId: { projectId: item.projectId, itemId: item.itemId } },
        update: { pack: JSON.stringify(processingPack) },
        create: { projectId: item.projectId, itemId: item.itemId, pack: JSON.stringify(processingPack) }
      });

      // 비동기 실행 (await하지 않음)
      runSeoPipeline(body, { persona, tone, textModel, imageModel, charLimit, articleType, publishTarget, publishTargets, themeId });
    }));

    return NextResponse.json({ 
      success: true, 
      message: `Started ${overdueItems.length} scheduled items.`,
      count: overdueItems.length
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
