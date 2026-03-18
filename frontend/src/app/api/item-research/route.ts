/**
 * SEO 파이프라인 API 라우트 핸들러
 * 요청 파싱 + 검증 → DB 상태 관리 → 파이프라인 비동기 실행
 *
 * 실제 파이프라인 로직은 pipeline/ 모듈에 위임합니다.
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/clients/prisma'
import { PERSONA_DISPLAY_NAME } from './pipeline/config'
import { runSeoPipeline } from './pipeline/run-pipeline'
import type { ItemResearchRequest } from './pipeline/types'

export async function POST(request: NextRequest) {
  try {
    const requestText = await request.text()
    const body: ItemResearchRequest = JSON.parse(requestText)

    // ── 유효성 검증 ──
    if (!body.itemName || !body.projectId || !body.itemId) {
      return NextResponse.json(
        { error: 'itemName, projectId, and itemId are required' },
        { status: 400 }
      )
    }

    const persona = body.seoConfig?.persona || 'IT'
    const tone = body.seoConfig?.toneAndManner || 'Professional'
    const textModel = body.seoConfig?.textModel || 'gpt-4o'
    const imageModel = body.seoConfig?.imageModel || 'dall-e-3'
    const actionType = body.seoConfig?.actionType || 'NOW'
    const scheduledAt = body.seoConfig?.scheduledAt || null
    const charLimit = body.seoConfig?.charLimit || 2000
    const articleType = body.seoConfig?.articleType || 'single'
    const publishTarget = body.seoConfig?.publishTarget || 'DB_ONLY'
    const themeId = body.seoConfig?.themeId || undefined
    const personaName = body.seoConfig?.personaName || undefined
    const finalPersonaName = personaName || (persona === 'MASTER_CURATOR_H'
      ? '마스터 큐레이터 H'
      : PERSONA_DISPLAY_NAME[persona] || persona)

    console.log('🚀 [SEO-Pipeline] 작업을 시작합니다:', {
      itemName: body.itemName, persona, tone,
      textModel, imageModel, actionType, scheduledAt, charLimit, publishTarget,
    });

    // ── 스케줄 예약 처리 ──
    if (actionType === 'SCHEDULE') {
      console.log(`⏰ [SEO-Pipeline] 스케줄 모드 - ${scheduledAt}`);
      const schedulePack = {
        itemId: body.itemId, title: body.itemName,
        content: null, thumbnailPrompt: null, thumbnailUrl: null,
        researchRaw: null, status: 'SCHEDULED', scheduledAt,
        persona, personaName: finalPersonaName, textModel, imageModel,
        charLimit, articleType, publishTarget, publishTargets: body.seoConfig?.publishTargets, themeId, toneAndManner: tone,
        productUrl: body.productData?.productUrl || `https://www.coupang.com/vp/products/${body.itemId}`,
        productImage: body.productData?.productImage || null,
        priceKRW: body.productData?.productPrice || 0,
        categoryName: body.productData?.categoryName || '',
        isRocket: body.productData?.isRocket || false,
        isFreeShipping: body.productData?.isFreeShipping || false,
        originalRequest: body,
      };
      try {
        await prisma.research.upsert({
          where: { projectId_itemId: { projectId: body.projectId, itemId: body.itemId } },
          update: { pack: JSON.stringify(schedulePack) },
          create: { projectId: body.projectId, itemId: body.itemId, pack: JSON.stringify(schedulePack) }
        });
      } catch (dbError) {
        console.warn('DB Upsert Error:', dbError);
      }
      return NextResponse.json({
        projectId: body.projectId, itemId: body.itemId,
        itemName: body.itemName, success: true,
        researchData: { content: null, thumbnailPrompt: null, researchRaw: null }
      });
    }

    // ── PROCESSING 상태 저장 → 비동기 파이프라인 실행 ──
    const processingPack = {
      itemId: body.itemId, title: body.itemName,
      content: null, thumbnailUrl: null,
      productUrl: body.productData?.productUrl || `https://www.coupang.com/vp/products/${body.itemId}`,
      productImage: body.productData?.productImage || null,
      researchRaw: null, status: 'PROCESSING',
      persona, personaName: finalPersonaName, textModel,
      publishTargets: body.seoConfig?.publishTargets,
      startedAt: new Date().toISOString(),
    };
    try {
      await prisma.research.upsert({
        where: { projectId_itemId: { projectId: body.projectId, itemId: body.itemId } },
        update: { pack: JSON.stringify(processingPack) },
        create: { projectId: body.projectId, itemId: body.itemId, pack: JSON.stringify(processingPack) }
      });
    } catch (dbError) {
      console.warn('DB PROCESSING Upsert Error:', dbError);
    }

    // 백그라운드 파이프라인 실행 (응답 후 비동기)
    runSeoPipeline(body, { persona, personaName, tone, textModel, imageModel, charLimit, articleType, publishTarget, publishTargets: body.seoConfig?.publishTargets, themeId });

    // 즉시 응답
    return NextResponse.json({
      projectId: body.projectId, itemId: body.itemId,
      itemName: body.itemName, success: true, status: 'PROCESSING',
      message: '글 생성이 시작되었습니다. 완료 시 알림을 받으실 수 있습니다.',
    });

  } catch (error) {
    console.error('Item research error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'SEO Pipeline endpoint is active.' })
}
