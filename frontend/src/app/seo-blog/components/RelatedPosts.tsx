'use client'

import Link from 'next/link'
import { GlassCard, ScaleOnHover, FadeInSection } from '@/shared/components/advanced-ui'
import { Button } from '@/shared/components/custom-ui'

interface RelatedPost {
  id: string
  title: string
  excerpt: string
  publishedAt: string
  readingTime: number
  category: string
}

interface RelatedPostsProps {
  posts: RelatedPost[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      '개발': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'AI/ML': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      '디자인': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
      '백엔드': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      '성능': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
  }

  if (!posts || posts.length === 0) {
    return (
      <FadeInSection>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            관련 글
          </h3>
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">📝</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              관련된 글이 아직 없습니다
            </p>
          </div>
        </GlassCard>
      </FadeInSection>
    )
  }

  return (
    <FadeInSection>
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            🔗 관련 글
          </h3>
          <Link href="/seo_blog">
            <Button variant="outline" size="sm" className="text-xs">
              더 많은 글 →
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {posts.map((post, index) => (
            <ScaleOnHover key={post.id} scale={1.01}>
              <Link href={`/seo_blog/${post.id}`}>
                <div className="group p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>·</span>
                      <span>{post.readingTime}분</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h4>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                    {post.excerpt}
                  </p>

                  {/* Read More */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-medium transition-colors">
                      더 읽어보기 →
                    </div>
                    
                    {/* Reading Progress Indicator */}
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(3, Math.ceil(post.readingTime / 5)))].map((_, i) => (
                        <div key={i} className="w-1 h-3 bg-blue-300 dark:bg-blue-700 rounded-full group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </ScaleOnHover>
          ))}
        </div>

        {/* More Related Content */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              더 많은 관련 콘텐츠를 찾고 계신가요?
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/seo_blog">
                <Button variant="outline" size="sm" className="w-full text-sm">
                  📚 전체 블로그 보기
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/seo_blog?category=개발">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    개발
                  </Button>
                </Link>
                <Link href="/seo_blog?category=AI/ML">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    AI/ML
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tags from Related Posts */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            관련 태그:
          </p>
          <div className="flex flex-wrap gap-1">
            {['React', 'Next.js', 'TypeScript', 'AI'].map(tag => (
              <Link
                key={tag}
                href={`/seo_blog?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </GlassCard>
    </FadeInSection>
  )
}

// CSS 스타일 (line-clamp 지원)
const styles = `
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`