'use client'

import { useState } from 'react'
import { GlassCard } from '@/shared/components/advanced-ui'
import { Button } from '@/shared/components/custom-ui'
import { SeoContentFilterOptions } from '../types'

interface SeoFilterProps {
  onFilter: (filters: Omit<SeoContentFilterOptions, 'searchQuery'>) => void
  totalPosts: number
  searchQuery: string
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

export function BlogFilter({ onFilter, totalPosts, searchQuery }: SeoFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SeoContentFilterOptions['sortBy']>('latest')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    onFilter({
      category,
      keywords: selectedKeywords,
      sortBy
    })
  }

  const handleKeywordToggle = (keyword: string) => {
    const newKeywords = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword]
    
    setSelectedKeywords(newKeywords)
    onFilter({
      category: selectedCategory,
      keywords: newKeywords,
      sortBy
    })
  }

  const handleSortChange = (sort: string) => {
    const validSort = sort as SeoContentFilterOptions['sortBy']
    setSortBy(validSort)
    onFilter({
      category: selectedCategory,
      keywords: selectedKeywords,
      sortBy: validSort
    })
  }

  const handleReset = () => {
    setSelectedCategory('all')
    setSelectedKeywords([])
    setSortBy('latest')
    onFilter({
      category: 'all',
      keywords: [],
      sortBy: 'latest'
    })
  }

  return (
    <div 
      className="p-6 mb-8 backdrop-blur-xl rounded-2xl shadow-2xl border"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              총 <span className="font-semibold" style={{ color: 'rgba(59, 130, 246, 1)' }}>{totalPosts}</span>개 글
              {searchQuery && (
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
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
            >
              {showAdvanced ? '간단히 보기' : '상세 필터'} 
              <span className={`ml-1 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </Button>
            {(selectedCategory !== 'all' || selectedKeywords.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                필터 초기화
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                카테고리
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category.value)}
                    className="transition-all duration-200"
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                키워드 
                {selectedKeywords.length > 0 && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
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
                  >
                    #{keyword}
                  </Button>
                ))}
              </div>
              {selectedKeywords.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    선택된 키워드:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedKeywords.map(keyword => (
                      <div
                        key={keyword}
                        className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-md"
                      >
                        <span>#{keyword}</span>
                        <button
                          onClick={() => handleKeywordToggle(keyword)}
                          className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                정렬 방식
              </label>
              <div className="flex gap-2">
                {sortOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary (when not showing advanced) */}
        {!showAdvanced && (selectedCategory !== 'all' || selectedKeywords.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">활성 필터:</span>
            {selectedCategory !== 'all' && (
              <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-md">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                >
                  ✕
                </button>
              </div>
            )}
            {selectedKeywords.map(keyword => (
              <div
                key={keyword}
                className="flex items-center space-x-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-md"
              >
                <span>#{keyword}</span>
                <button
                  onClick={() => handleKeywordToggle(keyword)}
                  className="hover:bg-green-200 dark:hover:bg-green-700 rounded-full p-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}