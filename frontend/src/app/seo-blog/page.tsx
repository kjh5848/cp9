'use client'

import { useState } from 'react'
import { FadeInSection, StaggeredList, GradientBackground } from '@/shared/components/advanced-ui'
import { Card, Button } from '@/shared/components/custom-ui'
import { BlogCard } from './components/BlogCard'
import { BlogHero } from './components/BlogHero'
import { BlogFilter } from './components/BlogFilter'

// 임시 블로그 데이터
const mockBlogPosts = [
  {
    id: '1',
    title: 'Next.js 15와 함께하는 최신 웹 개발 트렌드',
    excerpt: 'React Server Components와 App Router를 활용한 현대적인 웹 애플리케이션 개발 방법을 알아보세요.',
    content: '',
    author: {
      name: 'CP9 Team',
      avatar: '/avatars/cp9-team.jpg'
    },
    publishedAt: '2024-08-25',
    readingTime: 8,
    tags: ['React', 'Next.js', '웹개발', 'SSR'],
    category: '개발',
    featured: true,
    seoTitle: 'Next.js 15 웹 개발 트렌드 | CP9 블로그',
    seoDescription: 'Next.js 15의 새로운 기능과 React Server Components를 활용한 모던 웹 개발 가이드'
  },
  {
    id: '2',
    title: 'TypeScript 5.0으로 타입 안전성 극대화하기',
    excerpt: '최신 TypeScript 기능을 활용하여 런타임 오류를 방지하고 개발 생산성을 높이는 방법을 소개합니다.',
    content: '',
    author: {
      name: 'TypeScript Expert',
      avatar: '/avatars/ts-expert.jpg'
    },
    publishedAt: '2024-08-24',
    readingTime: 12,
    tags: ['TypeScript', '타입안전성', '개발생산성'],
    category: '개발',
    featured: false,
    seoTitle: 'TypeScript 5.0 완전 가이드 | CP9 블로그',
    seoDescription: 'TypeScript 5.0의 새로운 기능과 타입 안전성을 극대화하는 실전 활용법'
  },
  {
    id: '3',
    title: 'AI 기반 제품 리서치 자동화 시스템 구축기',
    excerpt: 'LangGraph와 OpenAI API를 활용하여 제품 분석부터 SEO 콘텐츠 생성까지 자동화한 경험을 공유합니다.',
    content: '',
    author: {
      name: 'AI Developer',
      avatar: '/avatars/ai-dev.jpg'
    },
    publishedAt: '2024-08-23',
    readingTime: 15,
    tags: ['AI', 'LangGraph', '자동화', 'SEO'],
    category: 'AI/ML',
    featured: true,
    seoTitle: 'AI 제품 리서치 자동화 시스템 | CP9 블로그',
    seoDescription: 'LangGraph와 OpenAI를 활용한 제품 분석 및 SEO 콘텐츠 자동 생성 시스템 구축 사례'
  },
  {
    id: '4',
    title: '반응형 디자인 시스템으로 일관된 UI/UX 구축하기',
    excerpt: '디자인 토큰과 컴포넌트 라이브러리를 활용하여 확장 가능하고 일관된 사용자 인터페이스를 만드는 방법입니다.',
    content: '',
    author: {
      name: 'UX Designer',
      avatar: '/avatars/ux-designer.jpg'
    },
    publishedAt: '2024-08-22',
    readingTime: 10,
    tags: ['디자인시스템', 'UI/UX', '반응형', 'CSS'],
    category: '디자인',
    featured: false,
    seoTitle: '반응형 디자인 시스템 구축 가이드 | CP9 블로그',
    seoDescription: '디자인 토큰 기반의 확장 가능한 반응형 디자인 시스템 구축 방법론'
  },
  {
    id: '5',
    title: 'Supabase를 활용한 실시간 데이터베이스 구축',
    excerpt: 'PostgreSQL과 실시간 구독 기능을 제공하는 Supabase로 현대적인 백엔드를 구축하는 방법을 알아보세요.',
    content: '',
    author: {
      name: 'Backend Engineer',
      avatar: '/avatars/backend-eng.jpg'
    },
    publishedAt: '2024-08-21',
    readingTime: 13,
    tags: ['Supabase', 'PostgreSQL', '실시간', '백엔드'],
    category: '백엔드',
    featured: false,
    seoTitle: 'Supabase 실시간 데이터베이스 구축 가이드 | CP9 블로그',
    seoDescription: 'Supabase PostgreSQL과 실시간 구독을 활용한 모던 백엔드 구축 완전 가이드'
  },
  {
    id: '6',
    title: '웹 성능 최적화: Core Web Vitals 완벽 가이드',
    excerpt: 'Google의 Core Web Vitals 지표를 개선하여 사용자 경험과 SEO 성능을 동시에 향상시키는 실전 기법들을 소개합니다.',
    content: '',
    author: {
      name: 'Performance Engineer',
      avatar: '/avatars/perf-eng.jpg'
    },
    publishedAt: '2024-08-20',
    readingTime: 11,
    tags: ['성능최적화', 'Core Web Vitals', 'SEO', '사용자경험'],
    category: '성능',
    featured: true,
    seoTitle: 'Core Web Vitals 성능 최적화 가이드 | CP9 블로그',
    seoDescription: 'Google Core Web Vitals 지표 개선을 통한 웹 성능 최적화 실전 가이드'
  }
]

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
  }
  publishedAt: string
  readingTime: number
  tags: string[]
  category: string
  featured: boolean
  seoTitle: string
  seoDescription: string
}

export default function SeoBlogPage() {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(mockBlogPosts)
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  const handleFilter = (filters: {
    category: string
    tags: string[]
    sortBy: string
    searchQuery: string
  }) => {
    let filtered = [...mockBlogPosts]

    // 카테고리 필터
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(post => post.category === filters.category)
    }

    // 태그 필터
    if (filters.tags.length > 0) {
      filtered = filtered.filter(post => 
        filters.tags.some(tag => post.tags.includes(tag))
      )
    }

    // 검색 쿼리 필터
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900">
      <GradientBackground />
      
      {/* Hero Section */}
      <div className="relative">
        <BlogHero />
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-12 max-w-7xl">
        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <FadeInSection className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                추천 글
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
                최신 기술 트렌드와 개발 인사이트를 담은 엄선된 아티클들을 만나보세요
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <StaggeredList>
                {featuredPosts.map((post, index) => (
                  <BlogCard 
                    key={post.id} 
                    post={post} 
                    featured={true}
                    delay={index * 100}
                  />
                ))}
              </StaggeredList>
            </div>
          </FadeInSection>
        )}

        {/* Filter Section */}
        <FadeInSection className="mb-12">
          <BlogFilter 
            onFilter={handleFilter}
            totalPosts={filteredPosts.length}
          />
        </FadeInSection>

        {/* Posts Grid */}
        <FadeInSection>
          {currentPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <StaggeredList>
                  {currentPosts.map((post, index) => (
                    <BlogCard 
                      key={post.id} 
                      post={post} 
                      delay={index * 100}
                    />
                  ))}
                </StaggeredList>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    이전
                  </Button>
                  
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        className="w-10 h-10"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    다음
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                다른 키워드나 필터 조건으로 다시 시도해보세요
              </p>
            </div>
          )}
        </FadeInSection>
      </div>
    </div>
  )
}