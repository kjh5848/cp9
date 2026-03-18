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
  publishTargets?: any[]
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

    // ── Phase 2: LLM 본문 생성 (`textModel`) ──
    console.log(`⚡ [Phase 2] LLM 본문(${textModel}) 생성 시작...`);
    const phase2Start = Date.now();
    const articleResult = await runArticlePhase(ctx, researchData);
    const markdownRaw = articleResult.content;
    const extractedTitle = articleResult.title;
    const phase2Ms = Date.now() - phase2Start;
    console.log(`⚡ [Phase 2] 본문 생성 완료 (${markdownRaw.length}자)`);

    // ── 본문에서 이미지 제안 텍스트 추출 ──
    // 정규식: [이미지 제안: xxx] 형태의 텍스트 모두 추출 (띄어쓰기, 콜론, 하이픈 형태 유연하게 매칭)
    const suggestionRegex = /\[이미지\s*제안(?:[:\-\s]*)(.*?)\]/g;
    const imageSuggestions: string[] = [];
    let match;
    while ((match = suggestionRegex.exec(markdownRaw)) !== null) {
      if (match[1]) {
        imageSuggestions.push(match[1].trim());
      }
    }
    // 중복 제거
    const uniqueSuggestions = Array.from(new Set(imageSuggestions));
    console.log(`🔍 [Phase 2.5] 본문에서 ${uniqueSuggestions.length}개의 이미지 제안 추출됨`);

    // ── Phase 3: 다중 이미지 생성/검색 (`imageModel`) ──
    console.log(`⚡ [Phase 3] 이미지 확보 시작...`);
    const phase3Start = Date.now();
    const imageUrlMap: Record<string, string | null> = await runImagePhase(ctx, uniqueSuggestions);
    const phase3Ms = Date.now() - phase3Start;
    
    // 대표 이미지(썸네일)는 추출된 첫 번째 이미지 혹은 default 이미지, 없으면 상품 이미지로 설정
    const actualImageUrl = Object.values(imageUrlMap).find(url => url !== null) || body.productData?.productImage || null;
    
    console.log(`⚡ [Phase 3] 이미지 확보 완료 (확보된 이미지 수: ${Object.values(imageUrlMap).filter(Boolean).length}개)`);
    
    // 최종 사용할 제목
    // 1순위: 사용자가 직접 수정한 커스텀 제목 (itemName이 원본 productName과 다를 때)
    // 2순위: 키워드모드 지정 제목
    // 3순위: LLM 본문 추출 제목 (extractedTitle)
    // 4순위: 원본 상품명 (fallback)
    const isCustomTitle = body.itemName && body.itemName !== body.productData?.productName;
    const finalTitleRaw = isCustomTitle 
      ? body.itemName 
      : (body.keywordMode?.selectedTitle || extractedTitle || body.itemName || '제목 없음');
    const finalTitle = finalTitleRaw.replace(/:/g, ' - ').replace(/\s+/g, ' ').trim();

    // ── Phase 4: HTML 변환 + CTA 주입 ──
    const phase4Start = Date.now();
    const seoContent = await runHtmlPhase(ctx, markdownRaw, imageUrlMap, actualImageUrl);
    const phase4Ms = Date.now() - phase4Start;

    // ── Phase 5: 다중 플랫폼 발행 (조건부) ──
    let wpResult = null;
    let phase5Ms = 0;
    
    // 다중 목적지 정보 파싱
    const publishTargetsRaw = ctx.autopilotData?.publishTargets || config.publishTargets;
    let publishTargets: any[] = [];
    if (typeof publishTargetsRaw === 'string') {
      try {
        publishTargets = JSON.parse(publishTargetsRaw);
      } catch (e) {
        console.warn('Failed to parse publishTargets', e);
      }
    } else if (Array.isArray(publishTargetsRaw)) {
      publishTargets = publishTargetsRaw;
    }

    if (publishTargets.length > 0) {
      const phase5Start = Date.now();
      console.log(`🚀 [Phase 5] 다중 플랫폼 발행 시작 (${publishTargets.length}개 타겟 설정됨)`);
      
      const publishPromises = publishTargets.map(async (target) => {
        if (!target.enabled) return null;
        
        if (target.platform === 'wordpress') {
          const categoryId = target.meta?.categoryId ? Number(target.meta.categoryId) : undefined;
          return runWordPressPhase(ctx, seoContent, actualImageUrl, finalTitle, categoryId);
        }
        
        // 향후 구글, 네이버 카페 등 확장 시 추가
        if (target.platform === 'google' || target.platform === 'naver_cafe') {
          console.log(`⚠️ [Phase 5] ${target.platform} 발행 기능은 아직 구현되지 않았습니다.`);
          return null; // TODO: 구현
        }
        
        return null; // 알 수 없는 플랫폼
      });

      const results = await Promise.allSettled(publishPromises);
      
      results.forEach((res, idx) => {
        const platform = publishTargets[idx].platform;
        if (res.status === 'rejected') {
          console.error(`❌ [Phase 5] ${platform} 발행 실패:`, res.reason);
        } else if (res.value && platform === 'wordpress') {
          wpResult = res.value; // 워드프레스 결과는 파이프라인의 메인 결과로 리턴하기 위해 저장
        }
      });
      
      phase5Ms = Date.now() - phase5Start;
    } else if (publishTarget === 'WORDPRESS') {
      // 레거시 단일 워드프레스 발행 호환성 유지
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
      charLimit: ctx.charLimit,
      themeName: (ctx.themeConfig as any)?.name || '커스텀 테마',
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
