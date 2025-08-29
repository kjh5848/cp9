/**
 * SEO 컨텐츠 관련 타입 정의
 */

import { ProductItem } from '@/features/product/types'

/**
 * SEO 컨텐츠 아이템 타입
 */
export interface SeoContentItem {
  id: string
  title: string           // SEO 글 제목
  excerpt: string         // 글 요약
  content: string         // 전체 글 내용
  productInfo: {
    productId: number
    productName: string
    productPrice: number
    productImage: string
    categoryName: string
    discountRate?: number
    isRocket?: boolean
    originalPrice?: number
  }
  seoScore: number        // SEO 분석 점수 (0-100)
  keywords: string[]      // SEO 키워드
  publishedAt: string     // 발행일
  readingTime: number     // 읽기 시간 (분)
  author: {
    name: string
    avatar: string
  }
  featured: boolean       // 추천 여부
  seoTitle: string        // SEO 메타 제목
  seoDescription: string  // SEO 메타 설명
  viewCount?: number      // 조회수
  likeCount?: number      // 좋아요 수
}

/**
 * 쿠팡 상품 카테고리 타입
 */
export interface CoupangProductCategory {
  id: string
  name: string
  slug: string
  count?: number
}

/**
 * SEO 점수 등급 타입
 */
export type SeoGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D'

/**
 * 필터 옵션 타입
 */
export interface SeoContentFilterOptions {
  category: string
  keywords: string[]
  sortBy: 'latest' | 'oldest' | 'seoScore' | 'viewCount' | 'readTime'
  searchQuery: string
  seoScoreRange?: [number, number]
  priceRange?: [number, number]
}

/**
 * 정렬 옵션 인터페이스
 */
export interface SortOption {
  value: string
  label: string
  icon: string
}

/**
 * 필터 상태 타입
 */
export interface FilterState {
  isOpen: boolean
  activeFilters: number
  hasResults: boolean
}