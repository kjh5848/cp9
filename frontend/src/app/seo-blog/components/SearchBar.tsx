'use client'

import { useState } from 'react'
import { Input } from '@/shared/components/custom-ui'
import { colors, spacing, typography, borderRadius } from '@/shared/design-tokens'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
}

export function SearchBar({ 
  onSearch, 
  placeholder = "제품명, 키워드로 검색...",
  initialValue = ""
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  return (
    <div 
      className="w-full max-w-2xl mx-auto mb-8"
      style={{ marginBottom: spacing[8] }}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="w-5 h-5"
            style={{ color: colors.neutral[400] }}
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
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4 py-3 w-full text-lg backdrop-blur-sm border-2 focus:ring-2 transition-all duration-300"
          style={{
            fontSize: typography.textStyles.bodyLarge.fontSize,
            padding: `${spacing[3]} ${spacing[4]} ${spacing[3]} ${spacing[10]}`,
            backgroundColor: `${colors.neutral[0]}/90`,
            borderColor: `${colors.neutral[200]}/50`,
            borderRadius: borderRadius.xl,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        />

        {searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={() => handleSearchChange('')}
              className="rounded-full p-1 hover:bg-gray-200 transition-colors"
              style={{
                color: colors.neutral[400],
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
      
      {/* Search suggestions or recent searches could go here */}
      <div 
        className="text-center mt-2"
        style={{ 
          marginTop: spacing[2],
          fontSize: typography.textStyles.bodySmall.fontSize,
          color: colors.neutral[500]
        }}
      >
        💡 인기 검색: 무선이어폰, 스마트워치, 홈트레이닝, 뷰티템, 가전제품
      </div>
    </div>
  )
}