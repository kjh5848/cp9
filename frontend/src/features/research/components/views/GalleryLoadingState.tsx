'use client'

import React from 'react'
import { ResponsiveGrid, PlaceholderCard } from '@/shared/components/design-system'

/**
 * 갤러리 로딩 상태 컴포넌트
 * 전체 페이지 대신 갤러리 영역에서만 로딩 상태를 표시
 */
export function GalleryLoadingState() {
  return (
    <div className="space-y-6">
      {/* 로딩 메시지 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
          <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <span className="text-sm font-medium">리서치 결과를 불러오는 중...</span>
        </div>
      </div>

      {/* 플레이스홀더 그리드 */}
      <ResponsiveGrid
        columns={{ sm: 1, md: 2, lg: 3, xl: 3 }}
        gap="lg"
        staggerAnimation={true}
        animationDelay={150}
      >
        {Array.from({ length: 9 }, (_, index) => (
          <PlaceholderCard
            key={index}
            variant="research"
            animated={true}
          />
        ))}
      </ResponsiveGrid>

      {/* 추가 로딩 정보 - 백엔드 표준 메시지 반영 */}
      <div className="text-center text-gray-400 text-sm">
        <p>AI가 상품을 분석하고 리서치 보고서를 생성하고 있습니다</p>
        <p className="text-xs mt-1 opacity-70">분석 완료까지 잠시만 기다려주세요</p>
      </div>
    </div>
  )
}

export default GalleryLoadingState