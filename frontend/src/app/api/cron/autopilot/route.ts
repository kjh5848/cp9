import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { searchCoupangProducts } from '@/infrastructure/clients/coupang';
import { normalizeCoupangProduct, resolveImageRedirectUrl } from '@/shared/lib/api-utils';
import { runSeoPipeline } from '../../item-research/pipeline/run-pipeline';
import type { ItemResearchRequest } from '../../item-research/pipeline/types';
import { CoupangRawProduct } from '@/shared/types/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 최대 5분 허용

export async function GET(request: Request) {
  try {
    // 1. 보안을 위해 cron 요청인지 확인 (Vercel 환경)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 가장 오래된 PENDING 상태의 큐 아이템 하나 조회
    const pendingItem = await prisma.autopilotQueue.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    });

    if (!pendingItem) {
      return NextResponse.json({ message: 'No pending items found in autopilot queue.', count: 0 });
    }

    console.log(`🚀 [Autopilot] 큐 처리 시작: ${pendingItem.keyword}`);

    // 3. 상태를 PROCESSING으로 변경하여 중복 실행 방지
    await prisma.autopilotQueue.update({
      where: { id: pendingItem.id },
      data: { status: 'PROCESSING' }
    });

    // 4. 쿠팡 상품 검색
    const products = await searchCoupangProducts(pendingItem.keyword, 3);
    if (!products || products.length === 0) {
      await prisma.autopilotQueue.update({
        where: { id: pendingItem.id },
        data: { status: 'FAILED', errorMessage: 'No Coupang products found.' }
      });
      return NextResponse.json({ error: 'No Coupang products found.', id: pendingItem.id }, { status: 400 });
    }

    // 첫 번째 상품 선택 및 정규화
    const rawProduct = products[0] as CoupangRawProduct;
    let selectedProduct = normalizeCoupangProduct(rawProduct);
    
    // 이미지 애드블록 우회 처리
    try {
      selectedProduct.productImage = await resolveImageRedirectUrl(selectedProduct.productImage);
    } catch (e) {
      console.warn('Failed to resolve image redirect url', e);
    }

    // 5. SEO Pipeline Request 파라미터 구성
    // 기본 설정: IT 페르소나, GPT-4o, 단일(single) 타입, WP 자동배포(WP_PUBLISH) 추천
    const projectId = 'autopilot'; // 기본 프로젝트 ID (원하는 대로 수정 가능)
    const itemId = String(selectedProduct.productId);
    const itemName = selectedProduct.productName;
    
    const body: ItemResearchRequest = {
      itemName,
      projectId,
      itemId,
      productData: selectedProduct,
      seoConfig: {
        persona: 'IT',
        toneAndManner: '전문적이면서 친근한',
        textModel: 'gpt-4o',
        imageModel: 'dall-e-3',
        actionType: 'NOW',
        charLimit: 2000,
        articleType: 'single', // 향후 비교 분석 등 지능화 가능
        publishTarget: 'WORDPRESS', // 워드프레스 즉시 포스팅
      },
    };

    const persona = body.seoConfig!.persona;
    const tone = body.seoConfig!.toneAndManner!;
    const textModel = body.seoConfig!.textModel!;
    const imageModel = body.seoConfig!.imageModel!;
    const charLimit = body.seoConfig!.charLimit!;
    const articleType = body.seoConfig!.articleType!;
    const publishTarget = body.seoConfig!.publishTarget!;
    const themeId = body.seoConfig!.themeId;

    // 6. Research 테이블에 PROCESSING 상태로 레코드 생성
    const processingPack = {
      itemId,
      title: itemName,
      content: null,
      thumbnailUrl: null,
      productUrl: selectedProduct.productUrl,
      productImage: selectedProduct.productImage,
      researchRaw: null,
      status: 'PROCESSING',
      persona,
      personaName: 'Autopilot Bot',
      textModel,
      startedAt: new Date().toISOString(),
      autopilotQueueId: pendingItem.id // 추후 추적용
    };

    await prisma.research.upsert({
      where: { projectId_itemId: { projectId, itemId } },
      update: { pack: JSON.stringify(processingPack) },
      create: { projectId, itemId, pack: JSON.stringify(processingPack) }
    });

    // 7. 파이프라인 트리거 (비동기)
    // 에러 체이닝을 위해 Promise.resolve 체인에서 에러를 확인하고 AutopilotQueue 상태를 방어적으로 업데이트할 수 있음
    runSeoPipeline(body, { persona, tone, textModel, imageModel, charLimit, articleType, publishTarget, themeId })
      .then(async () => {
        // 성공적으로 파이프라인이 호출됨(완료됨)
        await prisma.autopilotQueue.update({
          where: { id: pendingItem.id },
          data: { status: 'COMPLETED' }
        });
      })
      .catch(async (e) => {
        console.error('Autopilot Pipeline Error:', e);
        await prisma.autopilotQueue.update({
          where: { id: pendingItem.id },
          data: { status: 'FAILED', errorMessage: e instanceof Error ? e.message : 'Unknown error' }
        });
      });

    return NextResponse.json({ 
      success: true, 
      message: `Started autopilot processing for keyword: ${pendingItem.keyword}`,
      keyword: pendingItem.keyword,
      itemId
    });

  } catch (error) {
    console.error('Autopilot Cron Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
