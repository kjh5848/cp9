'use client'

import React from 'react'
import { animations } from '@/shared/design-tokens/animations'
import { colors } from '@/shared/design-tokens/colors'

interface PlaceholderCardProps {
  variant?: 'research' | 'product' | 'gallery' | 'profile' | 'article'
  animated?: boolean
  width?: string
  height?: string
  className?: string
}

/**
 * 로딩 및 빈 상태용 플레이스홀더 카드 컴포넌트
 * Awwwards 스타일의 세련된 스켈레톤 UI
 */
export function PlaceholderCard({
  variant = 'research',
  animated = true,
  width,
  height,
  className = ''
}: PlaceholderCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'research':
        return {
          height: height || '280px',
          content: 'research'
        }
      case 'product':
        return {
          height: height || '320px', 
          content: 'product'
        }
      case 'gallery':
        return {
          height: height || '240px',
          content: 'gallery'
        }
      case 'profile':
        return {
          height: height || '200px',
          content: 'profile'
        }
      case 'article':
        return {
          height: height || '180px',
          content: 'article'
        }
      default:
        return {
          height: height || '240px',
          content: 'default'
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <div
      className={`
        placeholder-card
        relative overflow-hidden rounded-lg
        bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700
        ${animated ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{
        width,
        height: variantStyles.height
      }}
    >
      {/* 배경 그라디언트 애니메이션 */}
      {animated && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-600/20"
          style={{
            animation: `shimmer 2s ease-in-out infinite`,
            transform: 'translateX(-100%)'
          }}
        />
      )}

      {/* 콘텐츠 영역 */}
      <div className="p-4 h-full flex flex-col">
        {/* 상단 영역 */}
        <div className="flex-1">
          {renderContentByVariant(variant)}
        </div>

        {/* 하단 액션 영역 */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="skeleton-box w-20 h-4 rounded" />
            <div className="skeleton-box w-16 h-4 rounded" />
          </div>
        </div>
      </div>

      {/* CSS-in-JS 스타일 */}
      <style jsx>{`
        .placeholder-card {
          border: 1px solid rgba(229, 231, 235, 0.3);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .skeleton-box {
          background: linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6);
          background-size: 200% 100%;
          ${animated ? 'animation: skeleton-wave 2s ease-in-out infinite;' : ''}
        }

        .dark .skeleton-box {
          background: linear-gradient(90deg, #374151, #4b5563, #374151);
          background-size: 200% 100%;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes skeleton-wave {
          0%, 100% {
            background-position: 200% 0;
          }
          50% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * 변형별 콘텐츠 렌더링
 */
function renderContentByVariant(variant: PlaceholderCardProps['variant']) {
  switch (variant) {
    case 'research':
      return (
        <div className="space-y-4">
          {/* 제목 */}
          <div className="skeleton-box w-4/5 h-6 rounded" />
          
          {/* 설명 */}
          <div className="space-y-2">
            <div className="skeleton-box w-full h-4 rounded" />
            <div className="skeleton-box w-3/4 h-4 rounded" />
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="skeleton-box w-12 h-4 rounded" />
            <div className="skeleton-box w-16 h-4 rounded" />
            <div className="skeleton-box w-14 h-4 rounded" />
          </div>

          {/* 프로그레스 바 */}
          <div className="mt-6">
            <div className="skeleton-box w-full h-2 rounded-full" />
          </div>
        </div>
      )

    case 'product':
      return (
        <div className="space-y-4">
          {/* 상품 이미지 */}
          <div className="skeleton-box w-full h-32 rounded-lg" />
          
          {/* 상품명 */}
          <div className="skeleton-box w-full h-5 rounded" />
          
          {/* 브랜드 */}
          <div className="skeleton-box w-1/2 h-4 rounded" />

          {/* 가격 */}
          <div className="flex items-center justify-between">
            <div className="skeleton-box w-20 h-6 rounded" />
            <div className="skeleton-box w-16 h-4 rounded" />
          </div>

          {/* 평점 */}
          <div className="flex items-center space-x-2">
            <div className="skeleton-box w-20 h-4 rounded" />
            <div className="skeleton-box w-12 h-4 rounded" />
          </div>
        </div>
      )

    case 'gallery':
      return (
        <div className="space-y-4">
          {/* 이미지 영역 */}
          <div className="skeleton-box w-full flex-1 rounded-lg" />
          
          {/* 캡션 */}
          <div className="space-y-2">
            <div className="skeleton-box w-3/4 h-4 rounded" />
            <div className="skeleton-box w-1/2 h-3 rounded" />
          </div>
        </div>
      )

    case 'profile':
      return (
        <div className="space-y-4">
          {/* 프로필 이미지 */}
          <div className="skeleton-box w-16 h-16 rounded-full mx-auto" />
          
          {/* 이름 */}
          <div className="skeleton-box w-2/3 h-5 rounded mx-auto" />
          
          {/* 설명 */}
          <div className="space-y-2">
            <div className="skeleton-box w-full h-3 rounded" />
            <div className="skeleton-box w-4/5 h-3 rounded" />
          </div>

          {/* 통계 */}
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="skeleton-box w-8 h-4 rounded mx-auto mb-1" />
              <div className="skeleton-box w-6 h-3 rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="skeleton-box w-8 h-4 rounded mx-auto mb-1" />
              <div className="skeleton-box w-6 h-3 rounded mx-auto" />
            </div>
          </div>
        </div>
      )

    case 'article':
      return (
        <div className="space-y-4">
          {/* 제목 */}
          <div className="space-y-2">
            <div className="skeleton-box w-full h-5 rounded" />
            <div className="skeleton-box w-4/5 h-5 rounded" />
          </div>
          
          {/* 내용 */}
          <div className="space-y-2">
            <div className="skeleton-box w-full h-3 rounded" />
            <div className="skeleton-box w-full h-3 rounded" />
            <div className="skeleton-box w-3/4 h-3 rounded" />
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="skeleton-box w-12 h-3 rounded" />
            <div className="skeleton-box w-16 h-3 rounded" />
          </div>
        </div>
      )

    default:
      return (
        <div className="space-y-4">
          <div className="skeleton-box w-4/5 h-6 rounded" />
          <div className="space-y-2">
            <div className="skeleton-box w-full h-4 rounded" />
            <div className="skeleton-box w-3/4 h-4 rounded" />
          </div>
        </div>
      )
  }
}

/**
 * 플레이스홀더 그룹 컴포넌트
 */
export function PlaceholderGroup({
  count = 6,
  variant = 'research',
  animated = true,
  className = ''
}: {
  count?: number
  variant?: PlaceholderCardProps['variant']
  animated?: boolean
  className?: string
}) {
  return (
    <div className={`placeholder-group ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <PlaceholderCard
          key={index}
          variant={variant}
          animated={animated}
        />
      ))}
    </div>
  )
}

/**
 * 인라인 플레이스홀더 (텍스트용)
 */
export function InlinePlaceholder({
  width = 'w-20',
  height = 'h-4',
  animated = true,
  className = ''
}: {
  width?: string
  height?: string
  animated?: boolean
  className?: string
}) {
  return (
    <div
      className={`
        skeleton-box inline-block rounded
        ${width} ${height} ${animated ? 'animate-pulse' : ''} ${className}
      `}
    />
  )
}

export default PlaceholderCard