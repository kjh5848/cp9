import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { searchCoupangProducts } from '@/infrastructure/clients/coupang';
import { normalizeCoupangProduct, resolveImageRedirectUrl } from '@/shared/lib/api-utils';
import { runSeoPipeline } from '../../item-research/pipeline/run-pipeline';
import { getNextRunAtKST } from '@/features/autopilot/lib/scheduler';
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

    const { searchParams } = new URL(request.url);
    const forceId = searchParams.get('id');

    // 2. 실행 가능한 큐 아이템 조회 (미래 시간으로 설정된 nextRunAt 제외)
    const now = new Date();
    let candidateItems;
    
    if (forceId) {
      candidateItems = await prisma.autopilotQueue.findMany({
        where: { id: forceId, status: 'PENDING' }
      });
    } else {
      candidateItems = await prisma.autopilotQueue.findMany({
        where: { 
          status: 'PENDING',
          OR: [
            { nextRunAt: null },
            { nextRunAt: { lte: now } }
          ]
        },
        orderBy: [
          { nextRunAt: 'asc' }, // 스케줄된 것 중 가장 오래 지연된 것 우선
          { createdAt: 'asc' }  // 신규 등록된 것 우선
        ]
      });
    }

    if (candidateItems.length === 0) {
      return NextResponse.json({ message: 'No eligible pending items found.', count: 0 });
    }

    // 2.1 동작 허용 시간(activeTimeStart ~ activeTimeEnd) 필터링 (KST 기준)
    let pendingItem;
    
    if (forceId) {
      pendingItem = candidateItems[0]; // 강제 실행 시에는 시간 윈도우 무시
    } else {
      const kstHour = new Date(now.getTime() + 9 * 60 * 60 * 1000).getUTCHours();
      
      pendingItem = candidateItems.find(item => {
        const start = item.activeTimeStart ?? 0;
        const end = item.activeTimeEnd ?? 23;
        if (start <= end) {
          return kstHour >= start && kstHour <= end; // 예: 09:00 ~ 22:00
        } else {
          return kstHour >= start || kstHour <= end; // 예: 22:00 ~ 04:00 (밤샘)
        }
      });
    }

    if (!pendingItem) {
      return NextResponse.json({ message: 'Items are pending but outside of allowed active hour window.', count: 0 });
    }

    const replaceDatePlaceholders = (text: string, d: Date = new Date()) => {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      return text
        .replace(/\{YYYY\}/g, String(year))
        .replace(/\{YY\}/g, String(year).slice(2))
        .replace(/\{MM\}/g, String(month).padStart(2, '0'))
        .replace(/\{M\}/g, String(month))
        .replace(/\{DD\}/g, String(day).padStart(2, '0'))
        .replace(/\{D\}/g, String(day));
    };

    const currentExecuteKeyword = replaceDatePlaceholders(pendingItem.keyword, now);

    console.log(`🚀 [Autopilot] 큐 처리 시작: ${currentExecuteKeyword} (ID: ${pendingItem.id})`);

    // 3. 상태를 PROCESSING으로 변경하여 중복 실행 방지
    await prisma.autopilotQueue.update({
      where: { id: pendingItem.id },
      data: { status: 'PROCESSING' }
    });

    // 4. 지능형 아이템 소싱 에이전트 파이프라인 (Phase 6)
    // 4.0 페르소나 컨텍스트 및 User 정보 확보 (병렬 처리)
    const personaId = pendingItem.personaId || 'IT';
    console.log(`🎭 [Autopilot] 선택된 페르소나 ID: ${personaId}`);
    
    const personaRecordPromise = prisma.persona.findUnique({ where: { id: personaId } });
    const userPromise = pendingItem.userId ? prisma.user.findUnique({
      where: { id: pendingItem.userId },
      select: { coupangAccessKey: true, coupangSecretKey: true }
    }) : Promise.resolve(null);

    const [personaRecord, user] = await Promise.all([personaRecordPromise, userPromise]);

    const personaName = personaRecord?.name || '기본 페르소나';
    const personaPrompt = personaRecord?.systemPrompt || '전문 커머스 블로거입니다.';

    let selectedProducts = [];
    let intentContent = null;
    
    try {
      // 4.1 의도 기획 에이전트 (Intent Planner)
      const { runIntentPlanner } = await import('@/features/autopilot/lib/agent/intent-planner');
      console.log(`🧠 [Autopilot] Intent Planner 시작 (키워드: ${currentExecuteKeyword})`);
      
      const pendingItemAny = pendingItem as any;
      
      if (pendingItemAny.coupangSearchTerm && pendingItemAny.searchIntent) {
        // 이미 Perplexity API를 통해 최적화된 기획 데이터가 있는 경우 (Bulk 모드)
        console.log(`⚡ [Autopilot] Perplexity 검색 인텐트 감지. Intent Planner 단계를 바이패스합니다.`);
        intentContent = {
          title: currentExecuteKeyword, // Bulk 모드에서는 keyword 필드에 blogTitle 이 저장됨
          searchIntent: pendingItemAny.searchIntent,
          recommendedArticleType: pendingItem.articleType || 'single',
          requiredItemCount: pendingItemAny.recommendedItemCount || 3,
          suggestedSearchQueries: [pendingItemAny.coupangSearchTerm, pendingItemAny.trafficKeyword].filter(Boolean) as string[]
        };
      } else {
        intentContent = await runIntentPlanner({
          keyword: currentExecuteKeyword,
          articleType: pendingItem.articleType || 'single',
          personaName,
          personaPrompt
        });
      }
      
      console.log(`📝 [Autopilot] 기획 완료: ${intentContent.title}`);

      // 4.2 소싱 에이전트 (Sourcing Agent)
      const { runSourcingAgent } = await import('@/features/autopilot/lib/agent/sourcing-agent');
      console.log(`🛍️ [Autopilot] Sourcing Agent 시작 (필요 개수: ${intentContent.requiredItemCount})`);
      
      const sourcingConstraints = {
        minPrice: pendingItem.minPrice,
        maxPrice: pendingItem.maxPrice,
        isRocketOnly: pendingItem.isRocketOnly
      };

      let coupangAccessKey;
      let coupangSecretKey;
      
      if (user) {
        coupangAccessKey = user.coupangAccessKey || undefined;
        coupangSecretKey = user.coupangSecretKey || undefined;
      }

      if (!coupangAccessKey || !coupangSecretKey) {
        throw new Error('쿠팡 API 키가 설정되지 않았습니다. (마이페이지 - API 연동)');
      }

      const rawAgentProducts = await runSourcingAgent(intentContent, sourcingConstraints, coupangAccessKey, coupangSecretKey);
      
      // 정렬 (Sort)
      const productsFiltered = [...rawAgentProducts];
      if (pendingItem.sortCriteria === 'salePriceAsc') {
        productsFiltered.sort((a, b) => a.productPrice - b.productPrice);
      } else if (pendingItem.sortCriteria === 'salePriceDesc') {
        productsFiltered.sort((a, b) => b.productPrice - a.productPrice);
      }

      if (productsFiltered.length === 0) {
        throw new Error('에이전트 소싱 결과가 비어 있습니다.');
      }
      
      selectedProducts = productsFiltered;
    } catch (agentError: any) {
      console.error('Agent Pipeline Error:', agentError);
      await prisma.autopilotQueue.update({
        where: { id: pendingItem.id },
        data: { status: 'FAILED', errorMessage: `Agent Sourcing Failed: ${agentError.message}` }
      });
      return NextResponse.json({ error: 'Agent Sourcing Failed', id: pendingItem.id }, { status: 400 });
    }

    // 대표 상품 1개 추출 및 이미지 애드블록 우회 처리
    const primaryProduct = normalizeCoupangProduct({
      ...selectedProducts[0],
      price: selectedProducts[0].productPrice // normalizeCoupangProduct 호환성 맞춤
    } as unknown as CoupangRawProduct);
    
    try {
      primaryProduct.productImage = await resolveImageRedirectUrl(primaryProduct.productImage);
    } catch (e) {
      console.warn('Failed to resolve image redirect url', e);
    }

    // 5. SEO Pipeline Request 파라미터 구성
    const projectId = 'autopilot'; // 기본 프로젝트 ID (원하는 대로 수정 가능)
    const itemId = String(primaryProduct.productId);
    const itemName = primaryProduct.productName;
    
    const body: ItemResearchRequest = {
      itemName,
      projectId,
      itemId,
      productData: primaryProduct,
      items: selectedProducts.map(p => ({
        productId: String(p.productId),
        productName: p.productName,
        productPrice: p.productPrice,
        productImage: p.productImage,
        productUrl: p.productUrl,
        categoryName: p.categoryName || '',
        isRocket: p.isRocket || false,
        isFreeShipping: p.isFreeShipping || false
      })),
      keywordMode: {
        keyword: currentExecuteKeyword,
        selectedTitle: intentContent?.title || currentExecuteKeyword
      },
      seoConfig: {
        persona: personaId,
        toneAndManner: '', // 페르소나의 toneDescription으로 대체됨
        textModel: pendingItem.textModel ?? 'gpt-4o',
        imageModel: pendingItem.imageModel ?? 'dall-e-3',
        actionType: 'NOW',
        charLimit: pendingItem.charLimit || 5000,
        articleType: (pendingItem.articleType === 'auto' ? intentContent?.recommendedArticleType : pendingItem.articleType) as 'single' | 'compare' | 'curation' || 'single', 
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
      title: intentContent?.title || itemName,
      content: null,
      thumbnailUrl: null,
      productUrl: primaryProduct.productUrl,
      productImage: primaryProduct.productImage,
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
    try {
      const autopilotData = {
        queueId: pendingItem.id,
        keyword: pendingItem.keyword,
        createdAt: pendingItem.createdAt,
        minPrice: pendingItem.minPrice,
        maxPrice: pendingItem.maxPrice,
        isRocketOnly: pendingItem.isRocketOnly,
        sortCriteria: pendingItem.sortCriteria,
        intervalHours: pendingItem.intervalHours,
        articleType: pendingItem.articleType,
        publishTargets: pendingItem.publishTargets,
      };

      const pipelineResult = await runSeoPipeline(body, { persona, tone, textModel, imageModel, charLimit, articleType: articleType as 'single' | 'compare' | 'curation', publishTarget, themeId, autopilotData });
      
      // 실행 완료 시점 기준 resultUrl 확보
      const resultUrl = pipelineResult || null;

      // 사용자가 파이프라인 진행 중(수 분 동안) 해당 스케줄을 삭제했을 수 있으므로 확인
      const stillExists = await prisma.autopilotQueue.findUnique({
        where: { id: pendingItem.id },
        select: { id: true }
      });

      if (!stillExists) {
        console.warn(`⚠️ [Autopilot] 큐(ID: ${pendingItem.id})가 실행 중 삭제되었습니다. 후속 큐 생성 및 업데이트를 중단합니다.`);
        return NextResponse.json({ success: true, message: 'Processing finished but queue item was deleted by user.' });
      }

      // 반복 발행 로직: intervalHours가 설정되어 있을 때
      if (pendingItem.intervalHours && pendingItem.intervalHours > 0) {
        const newRunCount = (pendingItem.currentRuns ?? 0) + 1;
        
        // 종결 조건 1: 최대 발행 횟수 도달
        const isMaxRunsReached = pendingItem.maxRuns && newRunCount >= pendingItem.maxRuns;
        // 종결 조건 2: 발행 종료일 초과
        const isExpired = pendingItem.expiresAt && new Date() >= new Date(pendingItem.expiresAt);

        // 현재 아이템은 항상 COMPLETED로 보존 (이력 유지)
        await prisma.autopilotQueue.update({
          where: { id: pendingItem.id },
          data: { 
            status: isMaxRunsReached || isExpired ? 'EXPIRED' : 'COMPLETED',
            currentRuns: newRunCount,
            resultUrl
          }
        });

        if (isMaxRunsReached || isExpired) {
          console.log(`🏁 [Autopilot] 큐 종결 (${isMaxRunsReached ? '횟수 제한' : '기간 만료'}): ${currentExecuteKeyword}`);
        } else {
          // --- 다음 턴을 위해 동일 설정의 새 PENDING 레코드 생성 ---
          // 제목 재생성 로직 적용
          let nextKeyword = pendingItem.keyword;
          
          if ((pendingItem as any).titleRegenRule === 'generate') {
            try {
              console.log(`[Autopilot] 제목 재생성 로직 진입: 기존 제목 '${pendingItem.keyword}'`);
              const { createTextModel } = await import('../../item-research/pipeline/config');
              const model = createTextModel('claude-sonnet-4-5');
              
              const systemPrompt = "당신은 SEO 블로그 제목 전문가입니다. 주어진 기존 블로그 제목과 의미적으로 연관성이 높으면서도, 문장 구조나 후킹 포인트(관점)가 전혀 다른 새로운 종류의 SEO 최적화 제목을 1개만 만들어주세요. 오직 새로 생성된 제목 텍스트 한 줄만 반환하고, 따옴표나 특수기호를 제목 맨 앞뒤에 붙이지 마세요. 이모지는 금지입니다.";
              const userPrompt = `기존 제목: ${pendingItem.keyword}\n\n새로운 제목:`;
              
              const aiResponse = await model.invoke([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ]);
              
              const generated = aiResponse.content.toString().trim().replace(/^["']|["']$/g, '');
              if (generated) {
                nextKeyword = generated;
                console.log(`✅ [Autopilot] 제목 재생성 성공: ${nextKeyword}`);
              } else {
                console.warn(`⚠️ [Autopilot] 제목 재생성 실패 (빈 결과), 기존 제목 유지`);
              }
            } catch (e) {
              console.error('❌ [Autopilot] 제목 재생성 오류, 기존 제목 유지:', e);
            }
          }

          const nextTime = getNextRunAtKST(
            pendingItem.intervalHours ? pendingItem.intervalHours : 0,
            pendingItem.activeTimeStart,
            pendingItem.activeTimeEnd,
            0,        // 단일 재예약이므로 index=0
            new Date() // 실행 완료 시점 기준
          );

          await (prisma.autopilotQueue as any).create({
            data: {
              keyword: nextKeyword,
              status: 'PENDING',
              personaId: pendingItem.personaId || null,
              themeId: (pendingItem as any).themeId || null,
              articleType: pendingItem.articleType,
              textModel: (pendingItem as any).textModel || 'gpt-4o',
              imageModel: (pendingItem as any).imageModel || 'dall-e-3',
              charLimit: (pendingItem as any).charLimit || 5000,
              sortCriteria: pendingItem.sortCriteria,
              minPrice: pendingItem.minPrice,
              maxPrice: pendingItem.maxPrice,
              isRocketOnly: pendingItem.isRocketOnly,
              intervalHours: pendingItem.intervalHours,
              activeTimeStart: pendingItem.activeTimeStart,
              activeTimeEnd: pendingItem.activeTimeEnd,
              nextRunAt: nextTime,
              maxRuns: pendingItem.maxRuns,
              currentRuns: newRunCount,
              expiresAt: pendingItem.expiresAt,
              titleRegenRule: (pendingItem as any).titleRegenRule,
            },
          });
          console.log(`🔄 [Autopilot] 다음 실행 예약 (새 레코드): ${nextTime.toISOString()} (${newRunCount}/${pendingItem.maxRuns ?? '∞'}회)`);
        }
      } else {
        // 단발성 큐라면 완료 상태로 종결
        await prisma.autopilotQueue.update({
          where: { id: pendingItem.id },
          data: { 
            status: 'COMPLETED',
            currentRuns: (pendingItem.currentRuns ?? 0) + 1,
            resultUrl
          }
        });
      }
    } catch (e) {
      console.error('Autopilot Pipeline Error:', e);
      try {
        await prisma.autopilotQueue.update({
          where: { id: pendingItem.id },
          data: { status: 'FAILED', errorMessage: e instanceof Error ? e.message : 'Unknown error' }
        });
      } catch (updateErr) {
        console.warn(`⚠️ [Autopilot] FAILED 상태 업데이트 중 오류 (큐가 삭제되었을 수 있음)`, updateErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Started autopilot processing for keyword: ${currentExecuteKeyword}`,
      keyword: currentExecuteKeyword,
      itemId
    });

  } catch (error) {
    console.error('Autopilot Cron Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
