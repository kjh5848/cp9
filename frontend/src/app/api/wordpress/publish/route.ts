/**
 * WordPress 발행 전용 API
 * 이미 생성된 기사를 WordPress에 발행합니다.
 * POST: 기존 기사를 WP에 발행
 * GET: WP 연결 테스트
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/clients/prisma'
import { getWordPressClient } from '@/infrastructure/clients/wordpress'
import { convertToGutenbergBlocks } from '@/infrastructure/utils/gutenberg-converter'

/**
 * GET /api/wordpress/publish — WP 연결 테스트
 */
export async function GET() {
  const wp = getWordPressClient()
  if (!wp) {
    return NextResponse.json({
      success: false,
      message: 'WordPress 환경변수가 설정되지 않았습니다 (WORDPRESS_SITE_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD)',
    }, { status: 400 })
  }

  const result = await wp.testConnection()
  return NextResponse.json(result)
}

/**
 * POST /api/wordpress/publish — 기존 기사를 WP에 발행
 * Body: { projectId, itemId, categoryIds?: number[] }
 */
export async function POST(request: NextRequest) {
  try {
    const { projectId, itemId, categoryIds } = await request.json()

    if (!projectId || !itemId) {
      return NextResponse.json({ error: 'projectId, itemId 필수' }, { status: 400 })
    }

    // WP 클라이언트 확인
    const wp = getWordPressClient()
    if (!wp) {
      return NextResponse.json({
        error: 'WordPress 환경변수가 설정되지 않았습니다',
      }, { status: 400 })
    }

    // DB에서 기사 조회
    const research = await prisma.research.findUnique({
      where: { projectId_itemId: { projectId, itemId } },
    })

    if (!research) {
      return NextResponse.json({ error: '기사를 찾을 수 없습니다' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pack = JSON.parse(research.pack) as any

    if (!pack.content) {
      return NextResponse.json({ error: '발행할 콘텐츠가 없습니다 (글 생성이 완료되지 않음)' }, { status: 400 })
    }

    // ── Gutenberg 블록 포맷으로 변환 ──
    // CTA는 wp:html 블록으로 보존, 본문은 wp:paragraph 등으로 변환
    // [이미지 제안: ...] 등 AI 가이드 텍스트도 자동 제거
    const contentWithStyles = convertToGutenbergBlocks(pack.content)

    // ── 썸네일 업로드 (있는 경우) ──
    let featuredMediaId: number | undefined
    if (pack.thumbnailUrl) {
      try {
        console.log('🖼️ [WP-Publish] 썸네일 업로드 중...')
        const media = await wp.uploadMediaFromUrl(
          pack.thumbnailUrl,
          (pack.title || 'thumbnail').slice(0, 50),
          pack.title,
        )
        featuredMediaId = media.id
      } catch (mediaError) {
        console.warn('⚠️ [WP-Publish] 썸네일 업로드 실패:', mediaError)
      }
    }

    // ── WP 포스트 생성 ──
    const post = await wp.createPost({
      title: pack.title || itemId,
      content: contentWithStyles,
      status: 'publish',
      excerpt: `${pack.personaName || ''}가 추천하는 ${pack.title || ''}`,
      categories: categoryIds || [],
      featured_media: featuredMediaId,
      meta: {
        cp9_item_id: itemId,
        cp9_project_id: projectId,
        cp9_article_type: pack.articleType || 'single',
        cp9_persona: pack.persona || '',
      },
    })

    // ── DB 업데이트 (WP 발행 결과 저장) ──
    const wpResult = {
      postId: post.id,
      postUrl: post.link,
      wpStatus: post.status,
      publishedAt: new Date().toISOString(),
    }

    pack.wordpress = wpResult
    pack.status = 'WP_PUBLISHED'

    await prisma.research.update({
      where: { projectId_itemId: { projectId, itemId } },
      data: { pack: JSON.stringify(pack) },
    })

    console.log(`✅ [WP-Publish] 발행 완료: ${post.link}`)

    return NextResponse.json({
      success: true,
      postId: post.id,
      postUrl: post.link,
      status: post.status,
    })

  } catch (error) {
    console.error('❌ [WP-Publish] 발행 실패:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
