'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { FadeInSection, GlassCard, FloatingElement } from '@/shared/components/advanced-ui'
import { Button } from '@/shared/components/custom-ui'
import { BlogContent } from '../components/BlogContent'
import { BlogTOC } from '../components/BlogTOC'
import { BlogMeta } from '../components/BlogMeta'
import { RelatedPosts } from '../components/RelatedPosts'

// 임시 블로그 데이터 (실제로는 API에서 가져옴)
const mockBlogData = {
  '1': {
    id: '1',
    title: 'Next.js 15와 함께하는 최신 웹 개발 트렌드',
    excerpt: 'React Server Components와 App Router를 활용한 현대적인 웹 애플리케이션 개발 방법을 알아보세요.',
    content: `
# Next.js 15와 함께하는 최신 웹 개발 트렌드

Next.js 15가 출시되면서 웹 개발 패러다임이 크게 변화하고 있습니다. 이 글에서는 새로운 기능들과 개발 트렌드를 자세히 살펴보겠습니다.

## React Server Components의 혁신

React Server Components는 서버에서 실행되는 컴포넌트로, 다음과 같은 장점을 제공합니다:

- **제로 번들 사이즈**: 클라이언트 번들에 포함되지 않음
- **직접적인 서버 리소스 접근**: 데이터베이스, 파일 시스템 등
- **자동 코드 스플리팅**: 필요한 코드만 로드

\`\`\`tsx
// Server Component 예제
async function BlogPost({ id }: { id: string }) {
  const post = await fetch(\`/api/posts/\${id}\`)
  const data = await post.json()
  
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  )
}
\`\`\`

## App Router의 새로운 기능

App Router는 더욱 직관적이고 강력한 라우팅 시스템을 제공합니다:

### 1. 레이아웃 시스템
- 중첩된 레이아웃 지원
- 부분 렌더링으로 성능 향상
- 상태 보존 기능

### 2. 로딩 UI
자동 로딩 상태 관리로 사용자 경험을 개선할 수 있습니다.

### 3. 에러 핸들링
더 나은 에러 경계를 통해 안정성을 확보합니다.

## 성능 최적화 전략

### 1. 이미지 최적화
Next.js Image 컴포넌트의 새로운 기능들:

- **자동 WebP/AVIF 변환**
- **레이지 로딩 기본 적용**
- **반응형 이미지 자동 생성**

### 2. 메타데이터 API
SEO를 위한 새로운 메타데이터 API를 활용할 수 있습니다.

## 실전 적용 사례

CP9 프로젝트에서 Next.js 15를 어떻게 활용했는지 살펴보겠습니다:

### 1. 제품 리서치 시스템
- **Server Components**로 데이터 페칭 최적화
- **App Router**를 통한 중첩 라우팅 구현
- **Streaming**으로 점진적 로딩 구현

### 2. SEO 블로그 시스템
- **MDX** 지원으로 풍부한 콘텐츠 작성
- **자동 사이트맵** 생성
- **구조화된 데이터** 자동 삽입

## 결론

Next.js 15는 웹 개발의 새로운 표준을 제시하고 있습니다. React Server Components와 App Router의 조합으로 더욱 빠르고 효율적인 웹 애플리케이션을 구축할 수 있습니다.

앞으로도 계속해서 발전하는 Next.js 생태계를 주시하며, 최신 기술을 적극적으로 도입해 나가는 것이 중요합니다.
    `,
    author: {
      name: 'CP9 Team',
      avatar: '/avatars/cp9-team.jpg',
      bio: '최신 웹 기술에 대한 깊이 있는 인사이트를 제공하는 개발팀'
    },
    publishedAt: '2024-08-25',
    updatedAt: '2024-08-25',
    readingTime: 8,
    tags: ['React', 'Next.js', '웹개발', 'SSR'],
    category: '개발',
    featured: true,
    seoTitle: 'Next.js 15 웹 개발 트렌드 | CP9 블로그',
    seoDescription: 'Next.js 15의 새로운 기능과 React Server Components를 활용한 모던 웹 개발 가이드',
    tableOfContents: [
      { id: 'react-server-components', title: 'React Server Components의 혁신', level: 2 },
      { id: 'app-router', title: 'App Router의 새로운 기능', level: 2 },
      { id: 'layout-system', title: '레이아웃 시스템', level: 3 },
      { id: 'loading-ui', title: '로딩 UI', level: 3 },
      { id: 'error-handling', title: '에러 핸들링', level: 3 },
      { id: 'performance', title: '성능 최적화 전략', level: 2 },
      { id: 'image-optimization', title: '이미지 최적화', level: 3 },
      { id: 'metadata-api', title: '메타데이터 API', level: 3 },
      { id: 'real-world', title: '실전 적용 사례', level: 2 },
      { id: 'conclusion', title: '결론', level: 2 },
    ],
    relatedPosts: [
      {
        id: '2',
        title: 'TypeScript 5.0으로 타입 안전성 극대화하기',
        excerpt: '최신 TypeScript 기능을 활용하여 런타임 오류를 방지하고 개발 생산성을 높이는 방법을 소개합니다.',
        publishedAt: '2024-08-24',
        readingTime: 12,
        category: '개발'
      },
      {
        id: '3',
        title: 'AI 기반 제품 리서치 자동화 시스템 구축기',
        excerpt: 'LangGraph와 OpenAI API를 활용하여 제품 분석부터 SEO 콘텐츠 생성까지 자동화한 경험을 공유합니다.',
        publishedAt: '2024-08-23',
        readingTime: 15,
        category: 'AI/ML'
      }
    ]
  }
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
    bio: string
  }
  publishedAt: string
  updatedAt: string
  readingTime: number
  tags: string[]
  category: string
  featured: boolean
  seoTitle: string
  seoDescription: string
  tableOfContents: Array<{
    id: string
    title: string
    level: number
  }>
  relatedPosts: Array<{
    id: string
    title: string
    excerpt: string
    publishedAt: string
    readingTime: number
    category: string
  }>
}

export default function BlogDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [activeSection, setActiveSection] = useState<string>('')

  // 실제로는 API에서 데이터를 가져옴
  const post = mockBlogData[id as keyof typeof mockBlogData] as BlogPost
  
  if (!post) {
    notFound()
  }

  useEffect(() => {
    // 스크롤 시 현재 섹션 감지
    const handleScroll = () => {
      const sections = post.tableOfContents.map(item => item.id)
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [post.tableOfContents])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900">
      {/* Floating Background Elements */}
      <FloatingElement duration={20} className="fixed top-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-xl">
        <div />
      </FloatingElement>
      <FloatingElement duration={25} className="fixed bottom-20 right-10 w-48 h-48 bg-purple-500/5 rounded-full blur-xl">
        <div />
      </FloatingElement>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <FadeInSection>
          <nav className="mb-8 text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                홈
              </Link>
              <span>/</span>
              <Link href="/seo_blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                블로그
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {post.title}
              </span>
            </div>
          </nav>
        </FadeInSection>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table of Contents - Desktop */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8">
              <BlogTOC 
                items={post.tableOfContents} 
                activeSection={activeSection}
              />
            </div>
          </div>

          {/* Main Content */}
          <main className="lg:col-span-6">
            {/* Article Header */}
            <FadeInSection>
              <GlassCard className="p-8 mb-8">
                {/* Category & Featured Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full">
                        ⭐ 추천
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Excerpt */}
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Meta Information */}
                <BlogMeta post={post} />

                {/* Social Share Buttons */}
                <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">공유하기:</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-blue-600">
                      트위터
                    </Button>
                    <Button size="sm" variant="outline" className="text-blue-800">
                      페이스북
                    </Button>
                    <Button size="sm" variant="outline" className="text-blue-700">
                      링크드인
                    </Button>
                    <Button size="sm" variant="outline">
                      링크 복사
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </FadeInSection>

            {/* Table of Contents - Mobile */}
            <div className="lg:hidden mb-8">
              <BlogTOC 
                items={post.tableOfContents} 
                activeSection={activeSection}
                mobile={true}
              />
            </div>

            {/* Article Content */}
            <FadeInSection delay={200}>
              <BlogContent content={post.content} />
            </FadeInSection>

            {/* Tags */}
            <FadeInSection delay={300}>
              <GlassCard className="p-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">태그</h3>
                <div className="flex flex-wrap gap-3">
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/seo_blog?tag=${encodeURIComponent(tag)}`}
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-300"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </FadeInSection>

            {/* Navigation */}
            <FadeInSection delay={400}>
              <div className="flex justify-between items-center mt-8">
                <Link href="/seo_blog">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <span>←</span>
                    <span>블로그 목록으로</span>
                  </Button>
                </Link>
                <Button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  variant="outline" 
                  className="flex items-center space-x-2"
                >
                  <span>↑</span>
                  <span>맨 위로</span>
                </Button>
              </div>
            </FadeInSection>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-8 space-y-8">
              {/* Related Posts */}
              <RelatedPosts posts={post.relatedPosts} />

              {/* Newsletter Signup */}
              <FadeInSection delay={500}>
                <GlassCard className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    뉴스레터 구독
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    최신 기술 인사이트를 이메일로 받아보세요
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="이메일 주소"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      구독하기
                    </Button>
                  </div>
                </GlassCard>
              </FadeInSection>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}