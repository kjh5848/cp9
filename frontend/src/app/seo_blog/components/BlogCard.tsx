'use client'

import Link from 'next/link'
import { ScaleOnHover, GlassCard } from '@/shared/components/advanced-ui'
import { Button } from '@/shared/components/custom-ui'
import { designTokens } from '@/shared/design-tokens'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
    avatar: string
  }
  publishedAt: string
  readingTime: number
  tags: string[]
  category: string
  featured: boolean
}

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
  delay?: number
}

export function BlogCard({ post, featured = false, delay = 0 }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const cardStyle = {
    animationDelay: `${delay}ms`
  }

  return (
    <div style={cardStyle} className="animate-fade-in-up">
      <ScaleOnHover scale={1.02}>
        <GlassCard className={`
          h-full overflow-hidden transition-all duration-300 hover:shadow-xl
          ${featured ? 'ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20' : ''}
        `}>
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                ⭐ 추천
              </div>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full font-medium shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              {post.category}
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 pt-16">
            {/* Title */}
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {post.author.name.charAt(0)}
                </div>
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>📅 {formatDate(post.publishedAt)}</span>
                <span>⏱️ {post.readingTime}분</span>
              </div>
            </div>

            {/* Read More Button */}
            <Link href={`/seo_blog/${post.id}`}>
              <Button 
                className={`
                  w-full transition-all duration-300 
                  ${featured ? 
                    'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg' : 
                    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                size="sm"
              >
                {featured ? '✨ 추천 글 읽기' : '더 읽어보기'} →
              </Button>
            </Link>
          </div>
        </GlassCard>
      </ScaleOnHover>
    </div>
  )
}

// CSS 애니메이션 추가를 위한 전역 스타일 (tailwind.config.js나 globals.css에 추가 필요)
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
    animation-fill-mode: both;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`