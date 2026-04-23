/**
 * WordPress 발행 전용 API (Local Viewer)
 * 클라이언트 뷰어에서 생성된 기사를 WordPress에 직접 발행합니다.
 * POST: 기존 기사를 WP에 발행
 * GET: WP 연결 테스트
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { getWordPressClient } from '@/infrastructure/clients/wordpress'

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
 * POST /api/wordpress/publish — 클라이언트 문서를 WP에 발행
 * Body: { title, content, categoryIds?: number[], thumbnailUrl?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { title, content, categoryIds, thumbnailUrl } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'title, content 필수' }, { status: 400 })
    }

    // WP 클라이언트 확인
    const wp = getWordPressClient()
    if (!wp) {
      return NextResponse.json({
        error: 'WordPress 환경변수가 설정되지 않았습니다',
      }, { status: 400 })
    }

    // ── 썸네일 업로드 (있는 경우) ──
    let featuredMediaId: number | undefined
    if (thumbnailUrl) {
      try {
        console.log('🖼️ [WP-Publish] 썸네일 업로드 중...')
        const media = await wp.uploadMediaFromUrl(
          thumbnailUrl,
          (title || 'thumbnail').slice(0, 50),
          title,
        )
        featuredMediaId = media.id
      } catch (mediaError) {
        console.warn('⚠️ [WP-Publish] 썸네일 업로드 실패:', mediaError)
      }
    }

    // ── WP 포스트 생성 ──
    const post = await wp.createPost({
      title: title,
      content: content,
      status: 'publish',
      categories: categoryIds || [],
      featured_media: featuredMediaId,
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
