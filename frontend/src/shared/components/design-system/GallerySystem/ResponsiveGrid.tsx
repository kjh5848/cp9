'use client'

import React, { ReactNode, useMemo } from 'react'
import { animations } from '@/shared/design-tokens/animations'

interface ResponsiveGridProps {
  children: ReactNode[]
  className?: string
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  minItemWidth?: string
  autoFit?: boolean
  staggerAnimation?: boolean
  animationDelay?: number
}

/**
 * Awwwards 스타일 반응형 그리드 컴포넌트
 * CSS Grid와 clamp()를 활용한 완전 반응형 레이아웃
 */
export function ResponsiveGrid({
  children,
  className = '',
  gap = 'md',
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  minItemWidth = '300px',
  autoFit = true,
  staggerAnimation = true,
  animationDelay = 100
}: ResponsiveGridProps) {
  // Gap 설정
  const gapClasses = {
    sm: 'gap-4',      // 1rem
    md: 'gap-6',      // 1.5rem  
    lg: 'gap-8',      // 2rem
    xl: 'gap-10'      // 2.5rem
  }

  // CSS Grid 컬럼 설정
  const gridColumns = useMemo(() => {
    if (autoFit) {
      return `repeat(auto-fit, minmax(min(${minItemWidth}, 100%), 1fr))`
    }
    
    return {
      '--grid-cols-sm': columns.sm?.toString() || '1',
      '--grid-cols-md': columns.md?.toString() || '2', 
      '--grid-cols-lg': columns.lg?.toString() || '3',
      '--grid-cols-xl': columns.xl?.toString() || '4'
    }
  }, [autoFit, minItemWidth, columns])

  // Stagger animation 스타일
  const getStaggerStyle = (index: number) => {
    if (!staggerAnimation) return {}
    
    return {
      animation: `${animations.keyframes.fadeInUp} ${animations.duration.slow} ${animations.easing.easeOut} ${index * animationDelay}ms both`
    }
  }

  return (
    <div 
      className={`
        responsive-grid
        ${gapClasses[gap]}
        ${className}
      `}
      style={{
        display: 'grid',
        ...(autoFit 
          ? { gridTemplateColumns: gridColumns as string }
          : gridColumns as React.CSSProperties
        )
      }}
    >
      {children.map((child, index) => (
        <div
          key={index}
          className="grid-item"
          style={getStaggerStyle(index)}
        >
          {child}
        </div>
      ))}

      {/* CSS-in-JS 스타일 정의 */}
      <style jsx>{`
        .responsive-grid {
          ${!autoFit ? `
            grid-template-columns: repeat(var(--grid-cols-sm), 1fr);
            
            @media (min-width: 768px) {
              grid-template-columns: repeat(var(--grid-cols-md), 1fr);
            }
            
            @media (min-width: 1024px) {
              grid-template-columns: repeat(var(--grid-cols-lg), 1fr);
            }
            
            @media (min-width: 1280px) {
              grid-template-columns: repeat(var(--grid-cols-xl), 1fr);
            }
          ` : ''}
        }

        .grid-item {
          /* 그리드 아이템 기본 스타일 */
          min-width: 0; /* overflow 방지 */
        }

        /* 매끄러운 레이아웃 변경 애니메이션 */
        .responsive-grid {
          transition: all ${animations.duration.normal} ${animations.easing.easeOut};
        }

        /* Masonry 스타일 (옵션) */
        .responsive-grid.masonry {
          grid-auto-rows: max-content;
        }

        /* Hover 효과 */
        .grid-item:hover {
          transform: translateY(-4px);
          transition: transform ${animations.duration.hover} ${animations.easing.smooth};
        }
      `}</style>
    </div>
  )
}

/**
 * Masonry 스타일 그리드 (Pinterest 스타일)
 */
export function MasonryGrid({
  children,
  className = '',
  gap = 'md',
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  staggerAnimation = true,
  animationDelay = 100
}: Omit<ResponsiveGridProps, 'minItemWidth' | 'autoFit'>) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6', 
    lg: 'gap-8',
    xl: 'gap-10'
  }

  const getStaggerStyle = (index: number) => {
    if (!staggerAnimation) return {}
    
    return {
      animation: `${animations.keyframes.fadeInUp} ${animations.duration.slow} ${animations.easing.easeOut} ${index * animationDelay}ms both`
    }
  }

  return (
    <div className={`masonry-grid ${gapClasses[gap]} ${className}`}>
      {children.map((child, index) => (
        <div
          key={index}
          className="masonry-item"
          style={getStaggerStyle(index)}
        >
          {child}
        </div>
      ))}

      <style jsx>{`
        .masonry-grid {
          column-count: ${columns.sm || 1};
          column-gap: 1rem;
        }

        @media (min-width: 768px) {
          .masonry-grid {
            column-count: ${columns.md || 2};
          }
        }

        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: ${columns.lg || 3};
          }
        }

        @media (min-width: 1280px) {
          .masonry-grid {
            column-count: ${columns.xl || 4};
          }
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1rem;
          transition: transform ${animations.duration.hover} ${animations.easing.smooth};
        }

        .masonry-item:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}

/**
 * 자동 높이 조절 그리드 (카드 높이가 다를 때)
 */
export function AutoHeightGrid({
  children,
  className = '',
  gap = 'md',
  minItemWidth = '300px',
  staggerAnimation = true,
  animationDelay = 100
}: Omit<ResponsiveGridProps, 'columns' | 'autoFit'>) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8', 
    xl: 'gap-10'
  }

  const getStaggerStyle = (index: number) => {
    if (!staggerAnimation) return {}
    
    return {
      animation: `${animations.keyframes.fadeInUp} ${animations.duration.slow} ${animations.easing.easeOut} ${index * animationDelay}ms both`
    }
  }

  return (
    <div 
      className={`auto-height-grid ${gapClasses[gap]} ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(min(${minItemWidth}, 100%), 1fr))`,
        gridAutoRows: 'max-content'
      }}
    >
      {children.map((child, index) => (
        <div
          key={index}
          className="auto-height-item"
          style={getStaggerStyle(index)}
        >
          {child}
        </div>
      ))}

      <style jsx>{`
        .auto-height-grid {
          align-items: start;
        }

        .auto-height-item {
          transition: transform ${animations.duration.hover} ${animations.easing.smooth};
        }

        .auto-height-item:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  )
}

export default ResponsiveGrid