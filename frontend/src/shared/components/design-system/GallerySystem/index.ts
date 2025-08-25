/**
 * GallerySystem - Awwwards 스타일 갤러리 시스템
 * 
 * 현대적인 웹 갤러리와 그리드 레이아웃을 위한 컴포넌트 시스템
 * - 완전 반응형 CSS Grid 기반
 * - Masonry 및 AutoHeight 레이아웃 지원
 * - 우아한 빈 상태 처리
 * - 로딩 스켈레톤 UI
 */

// Grid Components
export { 
  ResponsiveGrid,
  MasonryGrid, 
  AutoHeightGrid
} from './ResponsiveGrid'

// Empty State Components
export {
  EmptyStateGrid,
  ResearchEmptyStateGrid,
  ProductsEmptyStateGrid,
  GalleryEmptyStateGrid,
  MinimalEmptyStateGrid
} from './EmptyStateGrid'

// Placeholder Components
export {
  PlaceholderCard,
  PlaceholderGroup,
  InlinePlaceholder
} from './PlaceholderCard'

// Gallery System 전체 export
import { ResponsiveGrid, MasonryGrid, AutoHeightGrid } from './ResponsiveGrid';
import { 
  EmptyStateGrid,
  ResearchEmptyStateGrid,
  ProductsEmptyStateGrid,
  GalleryEmptyStateGrid,
  MinimalEmptyStateGrid
} from './EmptyStateGrid';
import { PlaceholderCard, PlaceholderGroup, InlinePlaceholder } from './PlaceholderCard';

export const GallerySystemComponents = {
  // Grid Layouts
  ResponsiveGrid,
  MasonryGrid,
  AutoHeightGrid,
  
  // Empty States
  EmptyStateGrid,
  ResearchEmptyStateGrid,
  ProductsEmptyStateGrid,
  GalleryEmptyStateGrid,
  MinimalEmptyStateGrid,
  
  // Placeholders
  PlaceholderCard,
  PlaceholderGroup,
  InlinePlaceholder
} as const

// 미리 정의된 그리드 설정들
export const gridPresets = {
  // Research 페이지용
  research: {
    columns: { sm: 1, md: 2, lg: 3, xl: 3 },
    gap: 'lg' as const,
    minItemWidth: '320px'
  },
  
  // 상품 그리드용  
  products: {
    columns: { sm: 2, md: 3, lg: 4, xl: 5 },
    gap: 'md' as const,
    minItemWidth: '240px'
  },
  
  // 갤러리용
  gallery: {
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    gap: 'lg' as const,
    minItemWidth: '280px'
  },
  
  // 프로필/카드용
  cards: {
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    gap: 'md' as const,
    minItemWidth: '300px'
  },
  
  // 아티클/블로그용
  articles: {
    columns: { sm: 1, md: 1, lg: 2, xl: 2 },
    gap: 'xl' as const,
    minItemWidth: '400px'
  }
} as const

// 유틸리티 함수들
export const GalleryUtils = {
  /**
   * 아이템 개수에 따른 최적 그리드 설정 반환
   */
  getOptimalGridConfig: (itemCount: number) => {
    if (itemCount <= 3) {
      return { columns: { sm: 1, md: itemCount, lg: itemCount, xl: itemCount }, gap: 'xl' as const }
    } else if (itemCount <= 8) {
      return gridPresets.cards
    } else {
      return gridPresets.gallery
    }
  },

  /**
   * 화면 크기에 따른 최적 플레이스홀더 개수 반환
   */
  getOptimalPlaceholderCount: (screenSize: 'sm' | 'md' | 'lg' | 'xl' = 'lg') => {
    const counts = {
      sm: 3,
      md: 6,
      lg: 9,
      xl: 12
    }
    return counts[screenSize]
  },

  /**
   * 변형에 따른 최적 높이 반환
   */
  getOptimalHeight: (variant: string, aspectRatio: number = 1.2) => {
    const baseHeights = {
      research: 280,
      product: 320,
      gallery: 240,
      profile: 200,
      article: 180
    }
    
    const baseHeight = baseHeights[variant as keyof typeof baseHeights] || 240
    return `${Math.round(baseHeight / aspectRatio)}px`
  }
} as const