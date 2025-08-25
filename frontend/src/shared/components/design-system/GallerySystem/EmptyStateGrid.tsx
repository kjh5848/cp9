'use client'

import React from 'react'
import { ResponsiveGrid, AutoHeightGrid } from './ResponsiveGrid'
import { PlaceholderCard } from './PlaceholderCard'
import { EmptyState, emptyStatePresets } from '../ErrorSystem/EmptyState'
import { animations } from '@/shared/design-tokens/animations'

interface EmptyStateGridProps {
  type: 'research' | 'products' | 'files' | 'data' | 'custom'
  customConfig?: React.ComponentProps<typeof EmptyState>['config']
  showPlaceholders?: boolean
  placeholderCount?: number
  gridProps?: Omit<React.ComponentProps<typeof ResponsiveGrid>, 'children'>
  className?: string
}

/**
 * 빈 상태를 위한 그리드 컴포넌트
 * 플레이스홀더 카드들과 EmptyState를 조합하여 시각적으로 풍부한 빈 상태 제공
 */
export function EmptyStateGrid({
  type,
  customConfig,
  showPlaceholders = true,
  placeholderCount = 6,
  gridProps,
  className = ''
}: EmptyStateGridProps) {
  // 타입별 미리 정의된 설정
  const getConfigByType = () => {
    switch (type) {
      case 'research':
        return emptyStatePresets.noResearch
      case 'products':
        return emptyStatePresets.noProducts
      case 'files':
        return emptyStatePresets.noFiles
      case 'data':
        return emptyStatePresets.noData
      case 'custom':
        return customConfig
      default:
        return emptyStatePresets.noData
    }
  }

  const config = getConfigByType()

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">빈 상태 설정을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={`empty-state-grid ${className}`}>
      {showPlaceholders ? (
        <div className="space-y-12">
          {/* 플레이스홀더 그리드 */}
          <div className="relative">
            <ResponsiveGrid
              {...gridProps}
              staggerAnimation={false}
              className="opacity-30"
            >
              {Array.from({ length: placeholderCount }, (_, index) => (
                <PlaceholderCard
                  key={index}
                  variant="research"
                  animated={false}
                />
              ))}
            </ResponsiveGrid>
            
            {/* 오버레이 그라디언트 */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900" />
          </div>

          {/* 중앙 EmptyState */}
          <div className="relative z-10 -mt-24">
            <EmptyState config={config} />
          </div>
        </div>
      ) : (
        <EmptyState config={config} />
      )}

      <style jsx>{`
        .empty-state-grid {
          min-height: 50vh;
          position: relative;
        }
      `}</style>
    </div>
  )
}

/**
 * Research 전용 EmptyStateGrid
 */
export function ResearchEmptyStateGrid({
  showPlaceholders = true,
  onStartResearch,
  onViewGuide,
  className = ''
}: {
  showPlaceholders?: boolean
  onStartResearch?: () => void
  onViewGuide?: () => void
  className?: string
}) {
  const customConfig = {
    ...emptyStatePresets.noResearch,
    primaryAction: {
      ...emptyStatePresets.noResearch.primaryAction!,
      onClick: onStartResearch || (() => window.location.href = '/products')
    },
    secondaryAction: onViewGuide ? {
      ...emptyStatePresets.noResearch.secondaryAction!,
      onClick: onViewGuide
    } : emptyStatePresets.noResearch.secondaryAction
  }

  return (
    <EmptyStateGrid
      type="custom"
      customConfig={customConfig}
      showPlaceholders={showPlaceholders}
      placeholderCount={9}
      gridProps={{
        columns: { sm: 1, md: 2, lg: 3, xl: 3 },
        gap: 'lg'
      }}
      className={className}
    />
  )
}

/**
 * 상품 검색 결과 빈 상태 그리드
 */
export function ProductsEmptyStateGrid({
  searchKeyword,
  onRetrySearch,
  showPlaceholders = true,
  className = ''
}: {
  searchKeyword?: string
  onRetrySearch?: () => void
  showPlaceholders?: boolean
  className?: string
}) {
  const customConfig = {
    ...emptyStatePresets.noProducts,
    title: searchKeyword 
      ? `"${searchKeyword}"에 대한 검색 결과가 없습니다`
      : emptyStatePresets.noProducts.title,
    primaryAction: {
      ...emptyStatePresets.noProducts.primaryAction!,
      onClick: onRetrySearch || (() => {})
    }
  }

  return (
    <EmptyStateGrid
      type="custom"
      customConfig={customConfig}
      showPlaceholders={showPlaceholders}
      placeholderCount={8}
      gridProps={{
        columns: { sm: 2, md: 3, lg: 4, xl: 4 },
        gap: 'md'
      }}
      className={className}
    />
  )
}

/**
 * 갤러리 스타일 EmptyStateGrid (Masonry 레이아웃)
 */
export function GalleryEmptyStateGrid({
  type = 'data',
  customConfig,
  showPlaceholders = true,
  className = ''
}: Omit<EmptyStateGridProps, 'gridProps'>) {
  const config = type === 'custom' ? customConfig : emptyStatePresets[type as keyof typeof emptyStatePresets]

  if (!config) return null

  return (
    <div className={`gallery-empty-state ${className}`}>
      {showPlaceholders ? (
        <div className="space-y-12">
          {/* 플레이스홀더 Masonry 그리드 */}
          <div className="relative">
            <AutoHeightGrid
              minItemWidth="280px"
              gap="lg"
              staggerAnimation={false}
              className="opacity-20"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <PlaceholderCard
                  key={index}
                  variant="gallery"
                  animated={false}
                  height={`${200 + (index % 3) * 100}px`}
                />
              ))}
            </AutoHeightGrid>
            
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80" />
          </div>

          {/* 중앙 EmptyState */}
          <div className="relative z-10 -mt-32">
            <EmptyState config={config} />
          </div>
        </div>
      ) : (
        <EmptyState config={config} />
      )}

      <style jsx>{`
        .gallery-empty-state {
          min-height: 60vh;
          position: relative;
        }
      `}</style>
    </div>
  )
}

/**
 * 미니멀 스타일 EmptyStateGrid (플레이스홀더 없음)
 */
export function MinimalEmptyStateGrid({
  type,
  customConfig,
  className = ''
}: Pick<EmptyStateGridProps, 'type' | 'customConfig' | 'className'>) {
  return (
    <EmptyStateGrid
      type={type}
      customConfig={customConfig}
      showPlaceholders={false}
      className={`minimal-empty-state ${className}`}
    />
  )
}

export default EmptyStateGrid