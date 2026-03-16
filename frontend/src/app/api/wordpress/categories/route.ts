/**
 * WordPress 카테고리 목록 조회 API
 * GET /api/wordpress/categories
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getWordPressClient } from '@/infrastructure/clients/wordpress'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/shared/config/auth-options'
import { prisma } from '@/infrastructure/clients/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      wordpressUrl: true,
      wordpressUsername: true,
      wordpressAppPassword: true,
    }
  })

  // getWordPressClient uses user credentials if full, otherwise falls back to config envs
  const wp = getWordPressClient(
    user?.wordpressUrl,
    user?.wordpressUsername,
    user?.wordpressAppPassword
  )

  if (!wp) {
    return NextResponse.json({
      error: 'WordPress 환경변수 또는 개별 사용자 설정이 누락되었습니다.',
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
