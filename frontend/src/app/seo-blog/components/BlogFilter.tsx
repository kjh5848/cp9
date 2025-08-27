'use client'

import { useState } from 'react'
import { GlassCard } from '@/shared/components/advanced-ui'
import { Button, Input } from '@/shared/components/custom-ui'

interface BlogFilterProps {
  onFilter: (filters: {
    category: string
    tags: string[]
    sortBy: string
    searchQuery: string
  }) => void
  totalPosts: number
}

const categories = [
  { value: 'all', label: '전체' },
  { value: '개발', label: '개발' },
  { value: 'AI/ML', label: 'AI/ML' },
  { value: '디자인', label: '디자인' },
  { value: '백엔드', label: '백엔드' },
  { value: '성능', label: '성능' },
]

const popularTags = [
  'React', 'Next.js', 'TypeScript', 'AI', 'LangGraph', 
  '자동화', 'SEO', '디자인시스템', 'UI/UX', 'Supabase',
  '성능최적화', 'Core Web Vitals', '반응형'
]

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'readTime', label: '읽기시간순' },
]

export function BlogFilter({ onFilter, totalPosts }: BlogFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('latest')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onFilter({
      category: selectedCategory,
      tags: selectedTags,
      sortBy,
      searchQuery: value
    })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    onFilter({
      category,
      tags: selectedTags,
      sortBy,
      searchQuery
    })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    onFilter({
      category: selectedCategory,
      tags: newTags,
      sortBy,
      searchQuery
    })
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    onFilter({
      category: selectedCategory,
      tags: selectedTags,
      sortBy: sort,
      searchQuery
    })
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedTags([])
    setSortBy('latest')
    onFilter({
      category: 'all',
      tags: [],
      sortBy: 'latest',
      searchQuery: ''
    })
  }

  return (
    <GlassCard className="p-6 mb-8">
      <div className="space-y-6">
        {/* Search and Basic Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="제목, 내용, 태그로 검색..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              총 <span className="font-semibold text-blue-600 dark:text-blue-400">{totalPosts}</span>개 글
            </div>
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
            {(selectedCategory !== 'all' || selectedTags.length > 0 || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                초기화
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

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                태그 
                {selectedTags.length > 0 && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                    ({selectedTags.length}개 선택됨)
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className="transition-all duration-200"
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    선택된 태그:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <div
                        key={tag}
                        className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-md"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => handleTagToggle(tag)}
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
        {!showAdvanced && (selectedCategory !== 'all' || selectedTags.length > 0) && (
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
            {selectedTags.map(tag => (
              <div
                key={tag}
                className="flex items-center space-x-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-md"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:bg-green-200 dark:hover:bg-green-700 rounded-full p-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}