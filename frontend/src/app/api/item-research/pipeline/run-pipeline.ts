/**
 * SEO 파이프라인 오케스트레이터
 * Phase 1~4를 조합하여 전체 파이프라인을 실행하고, DB에 결과를 저장합니다.
 */
import { prisma } from '@/infrastructure/clients/prisma'
import { getLangfuse } from '@/infrastructure/clients/langfuse'
import { PERSONA_DISPLAY_NAME } from './config'
import { runResearchPhase } from './research-phase'
import { runArticlePhase } from './article-phase'
import { runImagePhase } from './image-phase'
import { runHtmlPhase } from './html-phase'
import type { ItemResearchRequest, PipelineContext } from './types'

/** 파이프라인 설정 (route.ts에서 전달) */
export interface PipelineConfig {
  persona: string
  tone: string
  textModel: string
  imageModel: string
  charLimit: number
  articleType: string
}

/**
 * 백그라운드에서 SEO 파이프라인 전체를 실행합니다.
 * Phase 1 → (Phase 2 + Phase 3 병렬) → Phase 4 → DB 저장
 */
export async function runSeoPipeline(body: ItemResearchRequest, config: PipelineConfig): Promise<void> {
  const { persona, tone, textModel, imageModel, charLimit, articleType } = config;
  const finalPersonaName = persona === 'MASTER_CURATOR_H'
    ? '마스터 큐레이터 H'
    : PERSONA_DISPLAY_NAME[persona] || persona;

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

    // 파이프라인 컨텍스트 생성
    const ctx: PipelineContext = {
      body, persona, finalPersonaName, tone,
      textModel, imageModel, charLimit, articleType, trace,
    };

    // ── Phase 1: Perplexity 리서치 ──
    const phase1Start = Date.now();
    const researchData = await runResearchPhase(ctx);
    const phase1Ms = Date.now() - phase1Start;

    // ── Phase 2 + Phase 3: 병렬 실행 (~20초 단축) ──
    console.log(`⚡ [Phase 2+3] LLM 본문(${textModel}) + 이미지(${imageModel}) 병렬 실행 시작...`);
    const phase2Start = Date.now();
    const phase3Start = Date.now();

    const [markdownRaw, actualImageUrl] = await Promise.all([
      runArticlePhase(ctx, researchData),
      runImagePhase(ctx),
    ]);

    const phase2Ms = Date.now() - phase2Start;
    const phase3Ms = Date.now() - phase3Start;
    console.log(`⚡ [Phase 2+3] 병렬 실행 완료 (본문: ${markdownRaw.length}자, 이미지: ${actualImageUrl ? '있음' : '없음'})`);

    // ── Phase 4: HTML 변환 + CTA 주입 ──
    const phase4Start = Date.now();
    const seoContent = await runHtmlPhase(ctx, markdownRaw, actualImageUrl);
    const phase4Ms = Date.now() - phase4Start;

    // ── 전체 소요시간 ──
    const totalMs = Date.now() - pipelineStartMs;

    // ── 모니터링 데이터 구성 (DB에 직접 저장) ──
    const monitoring = {
      totalLatencyMs: totalMs,
      phases: [
        { name: 'phase1-perplexity-research', latencyMs: phase1Ms },
        { name: 'phase2-llm-article', latencyMs: phase2Ms },
        { name: 'phase3-image-generation', latencyMs: phase3Ms },
        { name: 'phase4-html-transform', latencyMs: phase4Ms },
      ],
      // DALL-E 비용은 고정 ($0.04/장), LLM 비용은 Langfuse에서만 정확
      estimatedImageCost: imageModel === 'dall-e-3' ? 0.04 : 0,
      langfuseTraceId: trace?.id || null,
    };

    // ── DB 저장 (status: PUBLISHED) ──
    console.log('✅ [SEO-Pipeline] 파이프라인 생성 완료!');
    console.log(`📊 [모니터링] 총 ${(totalMs / 1000).toFixed(1)}s | P1: ${(phase1Ms / 1000).toFixed(1)}s | P2: ${(phase2Ms / 1000).toFixed(1)}s | P3: ${(phase3Ms / 1000).toFixed(1)}s | P4: ${(phase4Ms / 1000).toFixed(1)}s`);

    const finalResearchPack = {
      itemId: body.itemId,
      title: body.itemName,
      content: seoContent,
      contentType: 'html' as const,
      thumbnailUrl: actualImageUrl,
      productUrl: body.productData?.productUrl || `https://www.coupang.com/vp/products/${body.itemId}`,
      productImage: body.productData?.productImage || null,
      researchRaw: researchData,
      status: 'PUBLISHED',
      completedAt: new Date().toISOString(),
      persona,
      personaName: finalPersonaName,
      textModel,
      imageModel,
      langfuseTraceId: trace?.id || null,
      // 기초 데이터 (상세 페이지용)
      priceKRW: body.productData?.productPrice || null,
      isRocket: body.productData?.isRocket || false,
      isFreeShipping: body.productData?.isFreeShipping || false,
      categoryName: body.productData?.categoryName || null,
      // 모니터링 데이터 (상세 페이지 사이드바용)
      monitoring,
    };

    try {
      await prisma.research.upsert({
        where: { projectId_itemId: { projectId: body.projectId, itemId: body.itemId } },
        update: { pack: JSON.stringify(finalResearchPack) },
        create: { projectId: body.projectId, itemId: body.itemId, pack: JSON.stringify(finalResearchPack) }
      });
      console.log('✅ [SEO-Pipeline] DB 저장 완료 (PUBLISHED)');
      trace?.update({ output: { status: 'PUBLISHED', contentLength: seoContent.length } });
    } catch (dbError) {
      console.warn('DB Upsert Error (Prisma):', dbError);
    }

    // Langfuse 트레이스 전송
    await langfuse?.flushAsync();

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
  }
}
