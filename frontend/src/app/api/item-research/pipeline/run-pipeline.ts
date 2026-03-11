/**
 * SEO 파이프라인 오케스트레이터
 * Phase 1~4를 조합하여 전체 파이프라인을 실행하고, DB에 결과를 저장합니다.
 * Phase 5(WordPress 발행)는 publishTarget에 따라 조건부 실행됩니다.
 */
import { prisma } from '@/infrastructure/clients/prisma'
import { getLangfuse } from '@/infrastructure/clients/langfuse'
import { PERSONA_DISPLAY_NAME, upgradeModelForArticleType } from './config'
import { runResearchPhase } from './research-phase'
import { runArticlePhase } from './article-phase'
import { runImagePhase } from './image-phase'
import { runHtmlPhase } from './html-phase'
import { runWordPressPhase } from './wordpress-phase'
import { resolveImageRedirectUrl } from '@/shared/lib/api-utils'
import type { ItemResearchRequest, PipelineContext } from './types'

/** 파이프라인 설정 (route.ts에서 전달) */
export interface PipelineConfig {
  persona: string
  personaName?: string
  tone: string
  textModel: string
  imageModel: string
  charLimit: number
  articleType: string
  publishTarget: string
  themeId?: string
  autopilotData?: any
}

/**
 * 백그라운드에서 SEO 파이프라인 전체를 실행합니다.
 * Phase 1 → (Phase 2 + Phase 3 병렬) → Phase 4 → DB 저장
 */
export async function runSeoPipeline(body: ItemResearchRequest, config: PipelineConfig): Promise<string | null> {
  const { persona, personaName, tone, imageModel, charLimit, articleType } = config;
  // 비교/큐레이션: 하위 모델 자동 업그레이드
  const textModel = upgradeModelForArticleType(config.textModel, articleType);
  const finalPersonaName = personaName || (persona === 'MASTER_CURATOR_H'
    ? '마스터 큐레이터 H'
    : PERSONA_DISPLAY_NAME[persona] || persona);

  // 파이프라인 전체 시작 시각
  const pipelineStartMs = Date.now();

  try {
    // ── Langfuse 트레이싱 시작 ──
    const langfuse = getLangfuse();
    const trace = langfuse?.trace({
      name: 'seo-pipeline',
      metadata: {
        persona, textModel, imageModel, charLimit, articleType,
        itemName: body.itemName, itemId: body.itemId,
      },
    });

    // ── 이미지 링크(Redirect URL) 사전 Resolve 처리 ──
    const itemsToResolve = [body.productData, ...(body.items || [])].filter(Boolean) as Array<{ productImage?: string | null }>;
    await Promise.all(itemsToResolve.map(async (item) => {
      if (item.productImage && !item.productImage.includes('coupangcdn.com')) {
        try {
          item.productImage = await resolveImageRedirectUrl(item.productImage);
        } catch (e) {
          console.warn('Failed to resolve image redirect url:', item.productImage, e);
        }
      }
    }));

    // ── 디자인 테마 조회 ──
    let themeConfig: Record<string, unknown> | undefined;
    if (config.themeId) {
      try {
        const theme = await prisma.articleTheme.findUnique({ where: { id: config.themeId } });
        if (theme) {
          themeConfig = JSON.parse(theme.config);
          console.log(`🎨 [테마] '${theme.name}' 적용`);
        }
      } catch (e) {
        console.warn('[테마] 조회 실패, 기본 스타일 사용:', e);
      }
    } else {
      // themeId 없으면 기본 테마 사용
      try {
        const defaultTheme = await prisma.articleTheme.findFirst({ where: { isDefault: true } });
        if (defaultTheme) {
          themeConfig = JSON.parse(defaultTheme.config);
          console.log(`🎨 [테마] 기본 테마 '${defaultTheme.name}' 적용`);
        }
      } catch (e) {
        console.warn('[테마] 기본 테마 조회 실패:', e);
      }
    }

    // ── 커스텀 페르소나 (DB) 조회 ──
    let personaSystemPrompt: string | undefined;
    let personaToneDesc: string | undefined;
    let personaNegativePrompt: string | undefined;
    try {
      const dbPersona = await prisma.persona.findUnique({ where: { id: persona } });
      if (dbPersona) {
        personaSystemPrompt = dbPersona.systemPrompt;
        personaToneDesc = dbPersona.toneDescription;
        personaNegativePrompt = dbPersona.negativePrompt || undefined;
        console.log(`🎭 [페르소나] DB 커스텀 페르소나 '${dbPersona.name}' 사용`);
      }
    } catch (e) {
      console.warn('DB 페르소나 조회 중 에러 발생:', e);
    }

    // 파이프라인 컨텍스트 생성
    const publishTarget = config.publishTarget || 'DB_ONLY';
    const ctx: PipelineContext = {
      body, persona, finalPersonaName, tone,
      personaSystemPrompt, personaToneDesc, personaNegativePrompt,
      textModel, imageModel, charLimit, articleType, publishTarget, themeConfig, trace,
      autopilotData: config.autopilotData || undefined,
    };

    // ── Phase 1: Perplexity 리서치 ──
    const phase1Start = Date.now();
    const researchData = await runResearchPhase(ctx);
    const phase1Ms = Date.now() - phase1Start;

    // ── Phase 2 + Phase 3: 병렬 실행 (~20초 단축) ──
    console.log(`⚡ [Phase 2+3] LLM 본문(${textModel}) + 이미지(${imageModel}) 병렬 실행 시작...`);
    const phase2Start = Date.now();
    const phase3Start = Date.now();

    const [articleResult, actualImageUrl] = await Promise.all([
      runArticlePhase(ctx, researchData),
      runImagePhase(ctx),
    ]);
    const markdownRaw = articleResult.content;
    const extractedTitle = articleResult.title;
    
    // 최종 사용할 제목 (1순위: 사용자가 직접 선택/수정한 커스텀 제목(itemName에 바인딩됨), 2순위: 키워드모드 제목, 3순위: LLM 추출 제목)
    // frontend의 ProductCreation.tsx에서 itemName에 customTitle을 넣어서 보내므로, body.itemName을 1순위로 사용합니다.
    const finalTitle = body.itemName || body.keywordMode?.selectedTitle || extractedTitle || '제목 없음';

    const phase2Ms = Date.now() - phase2Start;
    const phase3Ms = Date.now() - phase3Start;
    console.log(`⚡ [Phase 2+3] 병렬 실행 완료 (본문: ${markdownRaw.length}자, 이미지: ${actualImageUrl ? '있음' : '없음'})`);

    // ── Phase 4: HTML 변환 + CTA 주입 ──
    const phase4Start = Date.now();
    const seoContent = await runHtmlPhase(ctx, markdownRaw, actualImageUrl);
    const phase4Ms = Date.now() - phase4Start;

    // ── Phase 5: WordPress 발행 (조건부) ──
    let wpResult = null;
    let phase5Ms = 0;
    if (publishTarget === 'WORDPRESS') {
      const phase5Start = Date.now();
      wpResult = await runWordPressPhase(ctx, seoContent, actualImageUrl, finalTitle);
      phase5Ms = Date.now() - phase5Start;
    }

    // ── 전체 소요시간 ──
    const totalMs = Date.now() - pipelineStartMs;

    // ── 최종 상태 결정 ──
    const finalStatus = wpResult?.wpStatus === 'publish'
      ? 'WP_PUBLISHED'
      : wpResult?.wpStatus === 'failed'
        ? 'PUBLISHED'  // WP 실패해도 콘텐츠 자체는 생성 완료
        : 'PUBLISHED';

    // ── 모니터링 데이터 구성 (DB에 직접 저장) ──
    const monitoringPhases = [
      { name: 'phase1-perplexity-research', latencyMs: phase1Ms },
      { name: 'phase2-llm-article', latencyMs: phase2Ms },
      { name: 'phase3-image-generation', latencyMs: phase3Ms },
      { name: 'phase4-html-transform', latencyMs: phase4Ms },
    ];
    if (publishTarget === 'WORDPRESS') {
      monitoringPhases.push({ name: 'phase5-wordpress-publish', latencyMs: phase5Ms });
    }
    const monitoring = {
      totalLatencyMs: totalMs,
      phases: monitoringPhases,
      // DALL-E 비용은 고정 ($0.04/장), LLM 비용은 Langfuse에서만 정확
      estimatedImageCost: imageModel === 'dall-e-3' ? 0.04 : 0,
      langfuseTraceId: trace?.id || null,
    };

    // ── DB 저장 ──
    console.log('✅ [SEO-Pipeline] 파이프라인 생성 완료!');
    const phaseLog = `P1: ${(phase1Ms / 1000).toFixed(1)}s | P2: ${(phase2Ms / 1000).toFixed(1)}s | P3: ${(phase3Ms / 1000).toFixed(1)}s | P4: ${(phase4Ms / 1000).toFixed(1)}s${phase5Ms ? ` | P5: ${(phase5Ms / 1000).toFixed(1)}s` : ''}`;
    console.log(`📊 [모니터링] 총 ${(totalMs / 1000).toFixed(1)}s | ${phaseLog}`);

    const finalResearchPack = {
      itemId: body.itemId,
      title: finalTitle,
      content: seoContent,
      contentType: 'html' as const,
      thumbnailUrl: actualImageUrl,
      productUrl: body.productData?.productUrl
        || (body.keywordMode ? 'https://www.coupang.com' : `https://www.coupang.com/vp/products/${body.itemId}`),
      productImage: body.productData?.productImage || null,
      researchRaw: researchData,
      status: finalStatus,
      completedAt: new Date().toISOString(),
      persona,
      personaName: finalPersonaName,
      textModel,
      imageModel,
      langfuseTraceId: trace?.id || null,
      // 글 유형 메타데이터
      articleType,
      // 오토파일럿 기반 실행 메타데이터
      autopilotData: config.autopilotData || null,
      // 키워드 모드 메타데이터
      keywordMode: body.keywordMode || null,
      // 비교/큐레이션 시 관련 아이템 정보 저장
      relatedItems: (articleType !== 'single' && body.items)
        ? body.items.map(item => ({
            productName: item.productName,
            productPrice: item.productPrice,
            productUrl: item.productUrl,
            productImage: item.productImage,
            isRocket: item.isRocket,
          }))
        : null,
      // 기초 데이터 (상세 페이지용)
      priceKRW: body.productData?.productPrice || null,
      isRocket: body.productData?.isRocket || false,
      isFreeShipping: body.productData?.isFreeShipping || false,
      categoryName: body.productData?.categoryName || null,
      // 모니터링 데이터 (상세 페이지 사이드바용)
      monitoring,
      // WordPress 발행 결과
      wordpress: wpResult || null,
    };

    try {
      await prisma.research.upsert({
        where: { projectId_itemId: { projectId: body.projectId, itemId: body.itemId } },
        update: { pack: JSON.stringify(finalResearchPack) },
        create: { projectId: body.projectId, itemId: body.itemId, pack: JSON.stringify(finalResearchPack) }
      });
      console.log(`✅ [SEO-Pipeline] DB 저장 완료 (${finalStatus})`);
      trace?.update({ output: { status: finalStatus, contentLength: seoContent.length, wpPostUrl: wpResult?.postUrl } });
    } catch (dbError) {
      console.warn('DB Upsert Error (Prisma):', dbError);
    }

    // Langfuse 트레이스 전송
    await langfuse?.flushAsync();

    // 워드프레스 발행 URL 반환 (오토파일럿 크론에서 resultUrl로 활용)
    return wpResult?.postUrl || null;

  } catch (error) {
    // 파이프라인 실패 시 FAILED 상태로 DB 업데이트
    console.error('❌ [SEO-Pipeline] 백그라운드 파이프라인 실패:', error);
    const langfuse = getLangfuse();
    await langfuse?.flushAsync();

    const failedPack = {
      itemId: body.itemId,
      title: body.itemName,
      content: null,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      failedAt: new Date().toISOString(),
      monitoring: {
        totalLatencyMs: Date.now() - pipelineStartMs,
        phases: [],
        error: true,
      },
    };
    try {
      await prisma.research.upsert({
        where: { projectId_itemId: { projectId: body.projectId, itemId: body.itemId } },
        update: { pack: JSON.stringify(failedPack) },
        create: { projectId: body.projectId, itemId: body.itemId, pack: JSON.stringify(failedPack) }
      });
    } catch (dbError) {
      console.warn('DB FAILED Upsert Error:', dbError);
    }
    return null;
  }
}
