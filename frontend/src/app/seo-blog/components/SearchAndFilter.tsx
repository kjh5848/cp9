'use client'

import { useState } from 'react'
import { Input, Button } from '@/shared/components/custom-ui'
import { SeoContentFilterOptions } from '../types'
import { colors, spacing, typography, borderRadius } from '@/shared/design-tokens'

interface SearchAndFilterProps {
  onFilter: (filters: SeoContentFilterOptions) => void
  totalPosts: number
}

const categories = [
  { value: 'all', label: '전체' },
  { value: '생활용품', label: '생활용품' },
  { value: '전자제품', label: '전자제품' },
  { value: '패션의류', label: '패션의류' },
  { value: '뷰티', label: '뷰티' },
  { value: '식품', label: '식품' },
  { value: '스포츠', label: '스포츠' },
  { value: '도서', label: '도서' },
  { value: '반려용품', label: '반려용품' },
]

const popularKeywords = [
  '가성비', '베스트셀러', '후기', '리뷰', '추천', 
  '할인', '로켓배송', '인기', '신제품', '특가',
  '브랜드', '품질', '실용성', '디자인', '내구성'
]

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'seoScore', label: 'SEO 점수순' },
  { value: 'viewCount', label: '조회수순' },
  { value: 'readTime', label: '읽기시간순' },
]

export function SearchAndFilter({ onFilter, totalPosts }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SeoContentFilterOptions['sortBy']>('latest')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilters = (newSearchQuery = searchQuery, newCategory = selectedCategory, newKeywords = selectedKeywords, newSort = sortBy) => {
    onFilter({
      searchQuery: newSearchQuery,
      category: newCategory,
      keywords: newKeywords,
      sortBy: newSort
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    updateFilters(value)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    updateFilters(searchQuery, category)
  }

  const handleKeywordToggle = (keyword: string) => {
    const newKeywords = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword]
    
    setSelectedKeywords(newKeywords)
    updateFilters(searchQuery, selectedCategory, newKeywords)
  }

  const handleSortChange = (sort: string) => {
    const validSort = sort as SeoContentFilterOptions['sortBy']
    setSortBy(validSort)
    updateFilters(searchQuery, selectedCategory, selectedKeywords, validSort)
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedKeywords([])
    setSortBy('latest')
    updateFilters('', 'all', [], 'latest')
  }

  return (
    <div 
      className="p-6 backdrop-blur-xl rounded-2xl shadow-2xl border"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="space-y-6">
        {/* 통합 검색바 */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className="w-5 h-5"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          
          <Input
            type="text"
            placeholder="제품명, 키워드로 검색..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-4 w-full text-lg backdrop-blur-sm border-2 focus:ring-2 transition-all duration-300"
            style={{
              fontSize: typography.textStyles.bodyLarge.fontSize,
              padding: `${spacing[4]} ${spacing[4]} ${spacing[4]} ${spacing[10]}`,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: borderRadius.xl,
              color: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />

          {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={() => handleSearchChange('')}
                className="rounded-full p-1 transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'transparent'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 필터 컨트롤 헤더 */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              총 <span className="font-semibold" style={{ color: colors.primary[500] }}>{totalPosts}</span>개 글
              {searchQuery && (
                <span 
                  className="ml-2 text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: colors.primary[500],
                    color: colors.neutral[0]
                  }}
                >
                  &quot;{searchQuery}&quot; 검색 중
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="whitespace-nowrap"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.9)',
                backgroundColor: 'transparent'
              }}
            >
              {showAdvanced ? '간단히 보기' : '상세 필터'} 
              <span className={`ml-1 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </Button>
            {(selectedCategory !== 'all' || selectedKeywords.length > 0 || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                style={{
                  borderColor: colors.error[500],
                  color: colors.error[500],
                  backgroundColor: 'transparent'
                }}
              >
                전체 초기화
              </Button>
            )}
          </div>
        </div>

        {/* 빠른 카테고리 필터 (항상 표시) */}
        <div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map(category => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.value)}
                className="transition-all duration-200"
                style={{
                  ...(selectedCategory === category.value ? {
                    backgroundColor: colors.primary[500],
                    borderColor: colors.primary[500],
                    color: colors.neutral[0]
                  } : {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'transparent'
                  })
                }}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 고급 필터 */}
        {showAdvanced && (
          <div 
            className="space-y-6 pt-4"
            style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* 모든 카테고리 */}
            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                전체 카테고리
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.slice(6).map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category.value)}
                    className="transition-all duration-200"
                    style={{
                      ...(selectedCategory === category.value ? {
                        backgroundColor: colors.primary[500],
                        borderColor: colors.primary[500],
                        color: colors.neutral[0]
                      } : {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: 'transparent'
                      })
                    }}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 키워드 */}
            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                키워드 
                {selectedKeywords.length > 0 && (
                  <span 
                    className="ml-2 text-xs"
                    style={{ color: colors.primary[500] }}
                  >
                    ({selectedKeywords.length}개 선택됨)
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {popularKeywords.map(keyword => (
                  <Button
                    key={keyword}
                    variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleKeywordToggle(keyword)}
                    className="transition-all duration-200"
                    style={{
                      ...(selectedKeywords.includes(keyword) ? {
                        backgroundColor: colors.secondary[500],
                        borderColor: colors.secondary[500],
                        color: colors.neutral[0]
                      } : {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: 'transparent'
                      })
                    }}
                  >
                    #{keyword}
                  </Button>
                ))}
              </div>
              
              {/* 선택된 키워드 표시 */}
              {selectedKeywords.length > 0 && (
                <div 
                  className="mt-3 p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderColor: 'rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <div 
                    className="text-sm mb-2"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    선택된 키워드:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedKeywords.map(keyword => (
                      <div
                        key={keyword}
                        className="flex items-center space-x-1 text-xs px-2 py-1 rounded-md"
                        style={{
                          backgroundColor: colors.secondary[500],
                          color: colors.neutral[0]
                        }}
                      >
                        <span>#{keyword}</span>
                        <button
                          onClick={() => handleKeywordToggle(keyword)}
                          className="hover:bg-purple-600 rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 정렬 옵션 */}
            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                정렬 방식
              </label>
              <div className="flex gap-2">
                {sortOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange(option.value)}
                    style={{
                      ...(sortBy === option.value ? {
                        backgroundColor: colors.info[500],
                        borderColor: colors.info[500],
                        color: colors.neutral[0]
                      } : {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: 'transparent'
                      })
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 활성 필터 요약 (간단 모드일 때) */}
        {!showAdvanced && (selectedCategory !== 'all' || selectedKeywords.length > 0) && (
          <div 
            className="flex flex-wrap items-center gap-2 pt-2"
            style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <span 
              className="text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              활성 필터:
            </span>
            {selectedCategory !== 'all' && (
              <div 
                className="flex items-center space-x-1 text-xs px-2 py-1 rounded-md"
                style={{
                  backgroundColor: colors.primary[500],
                  color: colors.neutral[0]
                }}
              >
                <span>{selectedCategory}</span>
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="hover:bg-blue-600 rounded-full p-0.5"
                >
                  ✕
                </button>
              </div>
            )}
            {selectedKeywords.slice(0, 3).map(keyword => (
              <div
                key={keyword}
                className="flex items-center space-x-1 text-xs px-2 py-1 rounded-md"
                style={{
                  backgroundColor: colors.secondary[500],
                  color: colors.neutral[0]
                }}
              >
                <span>#{keyword}</span>
                <button
                  onClick={() => handleKeywordToggle(keyword)}
                  className="hover:bg-purple-600 rounded-full p-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
            {selectedKeywords.length > 3 && (
              <span 
                className="text-xs px-2 py-1"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                +{selectedKeywords.length - 3}개 더
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}