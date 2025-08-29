'use client'

import { useState } from 'react'
import { FadeInSection } from '@/shared/components/advanced-ui'
import { Button } from '@/shared/components/custom-ui'
import { BlogCard } from './components/BlogCard'
import { BlogHero } from './components/BlogHero'
import { SearchAndFilter } from './components/SearchAndFilter'
import { SeoContentFilterOptions } from './types'
import { mockSeoContentItems } from './data/mockSeoContent'
import { colors, spacing, typography } from '@/shared/design-tokens'


export default function SeoBlogPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredPosts, setFilteredPosts] = useState(mockSeoContentItems)
  const postsPerPage = 6

  const handleFilter = (filters: SeoContentFilterOptions) => {
    let filtered = [...mockSeoContentItems]

    // 카테고리 필터
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(post => post.productInfo.categoryName === filters.category)
    }

    // 키워드 필터
    if (filters.keywords.length > 0) {
      filtered = filtered.filter(post => 
        filters.keywords.some(keyword => post.keywords.includes(keyword))
      )
    }

    // 검색 쿼리 필터
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
        post.productInfo.productName.toLowerCase().includes(query)
      )
    }

    // 정렬
    switch (filters.sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
        break
      case 'seoScore':
        filtered.sort((a, b) => b.seoScore - a.seoScore)
        break
      case 'viewCount':
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        break
      case 'readTime':
        filtered.sort((a, b) => a.readingTime - b.readingTime)
        break
    }

    setFilteredPosts(filtered)
    setCurrentPage(1)
  }

  // 페이지네이션
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  // 추천 글 (featured posts)
  const featuredPosts = filteredPosts.filter(post => post.featured).slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-900">
      
      {/* Hero Section */}
      <div className="relative">
        <BlogHero />
      </div>

      {/* Search and Filter Section */}
      <div 
        className="relative container mx-auto max-w-7xl"
        style={{ 
          padding: `${spacing[8]} ${spacing[4]}`,
          paddingTop: spacing[8]
        }}
      >
        <FadeInSection>
          <SearchAndFilter 
            onFilter={handleFilter}
            totalPosts={filteredPosts.length}
          />
        </FadeInSection>
      </div>

      {/* Main Content */}
      <div 
        className="relative container mx-auto max-w-7xl"
        style={{ 
          padding: `0 ${spacing[4]} ${spacing[12]}`,
        }}
      >
        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <FadeInSection className="mb-16">
            <div 
              className="text-center"
              style={{ marginBottom: spacing[12] }}
            >
              <h2 
                className="font-bold mb-4"
                style={{
                  fontSize: typography.textStyles.displayMedium.fontSize,
                  fontWeight: typography.textStyles.displayMedium.fontWeight,
                  lineHeight: typography.textStyles.displayMedium.lineHeight,
                  color: colors.neutral[900],
                  marginBottom: spacing[4]
                }}
              >
                추천 상품 분석
              </h2>
              <p 
                className="max-w-2xl mx-auto"
                style={{
                  fontSize: typography.textStyles.bodyLarge.fontSize,
                  color: colors.neutral[600]
                }}
              >
                AI 기반 분석과 실제 사용 후기를 바탕으로 한 엄선된 상품 리뷰들을 만나보세요
              </p>
            </div>
            <div 
              style={{
                display: 'grid',
                gap: spacing.component.gridGap.xl
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {featuredPosts.map((post, index) => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  featured={true}
                  delay={index * 100}
                />
              ))}
            </div>
          </FadeInSection>
        )}


        {/* Posts Grid */}
        <FadeInSection>
          {currentPosts.length > 0 ? (
            <>
              <div 
                style={{
                  display: 'grid',
                  gap: spacing.component.gridGap.xl,
                  marginBottom: spacing[12]
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                {currentPosts.map((post, index) => (
                  <BlogCard 
                    key={post.id} 
                    post={post} 
                    delay={index * 100}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div 
                  className="flex justify-center items-center"
                  style={{ gap: spacing[4] }}
                >
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    style={{
                      padding: spacing.component.buttonPadding.md,
                      fontSize: typography.textStyles.labelMedium.fontSize
                    }}
                  >
                    이전
                  </Button>
                  
                  <div 
                    className="flex"
                    style={{ gap: spacing[2] }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        className="w-10 h-10"
                        style={{
                          minWidth: spacing[10],
                          height: spacing[10],
                          fontSize: typography.textStyles.labelSmall.fontSize
                        }}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    style={{
                      padding: spacing.component.buttonPadding.md,
                      fontSize: typography.textStyles.labelMedium.fontSize
                    }}
                  >
                    다음
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div 
              className="text-center"
              style={{ padding: `${spacing[16]} 0` }}
            >
              <div 
                style={{ 
                  fontSize: typography.fontSize['6xl'],
                  color: colors.neutral[400],
                  marginBottom: spacing[4]
                }}
              >
                🔍
              </div>
              <h3 
                className="font-semibold mb-2"
                style={{
                  fontSize: typography.textStyles.headlineSmall.fontSize,
                  fontWeight: typography.textStyles.headlineSmall.fontWeight,
                  color: colors.neutral[900],
                  marginBottom: spacing[2]
                }}
              >
                검색 결과가 없습니다
              </h3>
              <p 
                style={{
                  fontSize: typography.textStyles.bodyMedium.fontSize,
                  color: colors.neutral[600]
                }}
              >
                다른 키워드나 카테고리 조건으로 다시 시도해보세요
              </p>
            </div>
          )}
        </FadeInSection>
      </div>
    </div>
  )
}