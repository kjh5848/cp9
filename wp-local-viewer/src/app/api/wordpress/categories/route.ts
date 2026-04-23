/**
 * WordPress 카테고리 목록 조회 API (Local Viewer)
 * GET /api/wordpress/categories
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getWordPressClient } from '@/infrastructure/clients/wordpress'

export async function GET() {
  // 로컬 환경변수 기반 싱글톤 클라이언트 가져오기
  const wp = getWordPressClient()

  if (!wp) {
    return NextResponse.json({
      error: 'WordPress 환경변수가 누락되었습니다 (.env.local 확인).',
    }, { status: 400 })
  }

  try {
    const categories = await wp.getCategories()
    return NextResponse.json({ success: true, categories })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : '카테고리 조회 실패',
    }, { status: 500 })
  }
}
