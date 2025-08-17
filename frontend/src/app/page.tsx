import { HomePageClient } from '@/features/home/components/HomePageClient'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SimpleLoadingSpinner } from '@/shared/components/advanced-ui'

export const metadata: Metadata = {
  title: 'CP9 - 쿠팡 파트너스 자동화 플랫폼',
  description: 'AI 기술과 자동화 워크플로우로 쿠팡 파트너스 비즈니스를 한 단계 업그레이드하세요',
  keywords: '쿠팡 파트너스, 자동화, AI, 블로그, SEO, 콘텐츠 생성',
  openGraph: {
    title: 'CP9 - 쿠팡 파트너스 자동화 플랫폼',
    description: 'AI 기술과 자동화 워크플로우로 쿠팡 파트너스 비즈니스를 한 단계 업그레이드하세요',
    type: 'website',
  },
}

// 서버 컴포넌트로 실행됨 (SSR)
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* 클라이언트 컴포넌트는 여기서 렌더링 */}
      <Suspense fallback={<SimpleLoadingSpinner message="홈페이지 로딩 중..." />}>
        <HomePageClient />
      </Suspense>
    </div>
  )
}