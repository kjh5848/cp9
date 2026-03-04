/**
 * Phase 5: WordPress 발행
 * 생성된 HTML 콘텐츠를 WordPress REST API를 통해 발행합니다.
 * 썸네일 이미지가 있으면 WP 미디어 라이브러리에 업로드 후 featured_media로 설정합니다.
 */

import { getWordPressClient } from '@/infrastructure/clients/wordpress'
import type { PipelineContext, WordPressPublishResult } from './types'

/**
 * WordPress 발행을 실행합니다.
 * @param ctx 파이프라인 컨텍스트
 * @param seoContent 최종 HTML 콘텐츠
 * @param thumbnailUrl 썸네일 이미지 URL (선택)
 * @param title 포스트 제목
 * @returns WordPress 발행 결과 (postId, postUrl) 또는 null (WP 미설정 시)
 */
export async function runWordPressPhase(
  ctx: PipelineContext,
  seoContent: string,
  thumbnailUrl: string | null,
  title: string,
): Promise<WordPressPublishResult | null> {
  const wp = getWordPressClient()

  if (!wp) {
    console.warn('⚠️ [Phase 5] WordPress 환경변수가 설정되지 않아 발행을 건너뜁니다.')
    return null
  }

  console.log(`🚀 [Phase 5] WordPress 발행 시작: "${title}"`)
  const phase5Start = Date.now()

  try {
    // ── 1. 썸네일 이미지 업로드 (있는 경우) ──
    let featuredMediaId: number | undefined
    if (thumbnailUrl) {
      try {
        console.log('🖼️ [Phase 5] 썸네일 이미지 WP 미디어 업로드 중...')
        const media = await wp.uploadMediaFromUrl(
          thumbnailUrl,
          title.slice(0, 50), // 파일명으로 제목 일부 사용
          title, // alt 텍스트
        )
        featuredMediaId = media.id
        console.log(`✅ [Phase 5] 썸네일 업로드 완료 (미디어 ID: ${media.id})`)
      } catch (mediaError) {
        // 썸네일 업로드 실패는 발행을 중단하지 않음
        console.warn('⚠️ [Phase 5] 썸네일 업로드 실패 (발행은 계속):', mediaError)
      }
    }

    // ── 2. 포스트 생성 (바로 공개) ──
    const post = await wp.createPost({
      title,
      content: seoContent,
      status: 'publish',
      excerpt: `${ctx.finalPersonaName}가 추천하는 ${title}`, // 메타 디스크립션
      featured_media: featuredMediaId,
      meta: {
        cp9_item_id: ctx.body.itemId,
        cp9_project_id: ctx.body.projectId,
        cp9_article_type: ctx.articleType,
        cp9_persona: ctx.persona,
      },
    })

    const phase5Ms = Date.now() - phase5Start
    console.log(`✅ [Phase 5] WordPress 발행 완료! (${(phase5Ms / 1000).toFixed(1)}s)`)
    console.log(`   📎 포스트 URL: ${post.link}`)

    return {
      postId: post.id,
      postUrl: post.link,
      wpStatus: post.status,
      publishedAt: new Date().toISOString(),
      latencyMs: phase5Ms,
    }

  } catch (error) {
    const phase5Ms = Date.now() - phase5Start
    console.error('❌ [Phase 5] WordPress 발행 실패:', error)

    return {
      postId: null,
      postUrl: null,
      wpStatus: 'failed',
      publishedAt: null,
      latencyMs: phase5Ms,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
