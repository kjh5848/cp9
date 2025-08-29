'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ScaleOnHover } from '@/shared/components/advanced-ui'
import { Button } from '@/shared/components/custom-ui'
import { colors, spacing, typography, boxShadow, borderRadius } from '@/shared/design-tokens'
import { SeoContentItem, SeoGrade } from '../types'

interface SeoCardProps {
  post: SeoContentItem
  featured?: boolean
  delay?: number
}

export function BlogCard({ post, featured = false, delay = 0 }: SeoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원'
  }

  const getSeoGrade = (score: number): SeoGrade => {
    if (score >= 95) return 'A+'
    if (score >= 90) return 'A'
    if (score >= 85) return 'B+'
    if (score >= 80) return 'B'
    if (score >= 75) return 'C+'
    if (score >= 70) return 'C'
    return 'D'
  }

  const getSeoGradeColor = (grade: SeoGrade) => {
    const gradeColors = {
      'A+': { bg: colors.success[500], color: colors.neutral[0] },
      'A': { bg: colors.success[700], color: colors.neutral[0] },
      'B+': { bg: colors.primary[500], color: colors.neutral[0] },
      'B': { bg: colors.info[500], color: colors.neutral[0] },
      'C+': { bg: colors.warning[500], color: colors.neutral[0] },
      'C': { bg: colors.warning[700], color: colors.neutral[0] },
      'D': { bg: colors.error[500], color: colors.neutral[0] }
    }
    return gradeColors[grade]
  }

  const cardStyle = {
    animationDelay: `${delay}ms`
  }

  const seoGrade = getSeoGrade(post.seoScore)

  return (
    <div style={cardStyle} className="animate-fade-in-up">
      <ScaleOnHover scale={1.02}>
        <div 
          className="h-full overflow-hidden transition-all duration-300 relative backdrop-blur-xl rounded-2xl shadow-2xl"
          style={{
            boxShadow: featured ? boxShadow.primary : boxShadow.glass,
            background: featured ? 
              `linear-gradient(135deg, ${colors.primary[50]}/50, ${colors.secondary[50]}/50)` : 
              colors.glass.light,
            border: featured ? 
              `2px solid ${colors.primary[500]}/20` : 
              `1px solid ${colors.glass.medium}`,
            borderRadius: borderRadius.lg
          }}
        >
          {/* Product Image */}
          <div 
            className="relative"
            style={{
              height: '192px', // h-48
              backgroundColor: colors.neutral[100]
            }}
          >
            <Image
              src={post.productInfo.productImage}
              alt={post.productInfo.productName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Badges Overlay */}
            <div 
              className="absolute top-3 left-3 right-3 flex justify-between items-start z-10"
              style={{ gap: spacing[2] }}
            >
              {/* Category Badge */}
              <div 
                className="backdrop-blur-sm font-medium shadow-sm border"
                style={{
                  backgroundColor: `${colors.neutral[0]}/90`,
                  color: colors.neutral[700],
                  fontSize: typography.textStyles.labelSmall.fontSize,
                  padding: `${spacing[1]} ${spacing[3]}`,
                  borderRadius: borderRadius.full,
                  borderColor: `${colors.neutral[200]}/50`
                }}
              >
                {post.productInfo.categoryName}
              </div>
              
              {/* Featured Badge */}
              {featured && (
                <div 
                  className="font-medium shadow-lg"
                  style={{
                    background: colors.gradients.primary,
                    color: colors.neutral[0],
                    fontSize: typography.textStyles.labelSmall.fontSize,
                    padding: `${spacing[1]} ${spacing[3]}`,
                    borderRadius: borderRadius.full
                  }}
                >
                  ⭐ 추천
                </div>
              )}
            </div>

            {/* Price & Discount Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
              <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
                <div className="text-lg font-bold">{formatPrice(post.productInfo.productPrice)}</div>
                {post.productInfo.discountRate && post.productInfo.originalPrice && (
                  <div className="text-xs text-red-300 flex items-center space-x-1">
                    <span className="line-through">{formatPrice(post.productInfo.originalPrice)}</span>
                    <span className="bg-red-500 text-white px-1 rounded text-[10px]">-{post.productInfo.discountRate}%</span>
                  </div>
                )}
              </div>
              
              {/* SEO Score Badge */}
              <div 
                className="font-bold"
                style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.textStyles.labelSmall.fontSize,
                  backgroundColor: getSeoGradeColor(seoGrade).bg,
                  color: getSeoGradeColor(seoGrade).color
                }}
              >
                SEO {seoGrade}
              </div>
            </div>

            {/* Rocket Badge */}
            {post.productInfo.isRocket && (
              <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                🚀 로켓배송
              </div>
            )}
          </div>

          {/* Card Content */}
          <div style={{ padding: spacing.component.cardPadding.md }}>
            {/* Product Name */}
            <h4 
              className="line-clamp-1"
              style={{
                fontSize: typography.textStyles.bodySmall.fontSize,
                color: colors.neutral[600],
                marginBottom: spacing[1]
              }}
            >
              {post.productInfo.productName}
            </h4>
            
            {/* SEO Title */}
            <h3 
              className="font-bold line-clamp-2 leading-tight"
              style={{
                fontSize: typography.textStyles.titleLarge.fontSize,
                fontWeight: typography.textStyles.titleLarge.fontWeight,
                color: colors.neutral[900],
                marginBottom: spacing[3]
              }}
            >
              {post.title}
            </h3>

            {/* Excerpt */}
            <p 
              className="leading-relaxed line-clamp-2"
              style={{
                fontSize: typography.textStyles.bodySmall.fontSize,
                color: colors.neutral[600],
                marginBottom: spacing[3]
              }}
            >
              {post.excerpt}
            </p>

            {/* Keywords */}
            <div 
              className="flex flex-wrap"
              style={{ 
                gap: spacing[1],
                marginBottom: spacing[3]
              }}
            >
              {post.keywords.slice(0, 4).map(keyword => (
                <span 
                  key={keyword}
                  style={{
                    fontSize: typography.textStyles.labelSmall.fontSize,
                    padding: `${spacing[1]} ${spacing[2]}`,
                    backgroundColor: colors.primary[100],
                    color: colors.primary[700],
                    borderRadius: borderRadius.md
                  }}
                >
                  #{keyword}
                </span>
              ))}
              {post.keywords.length > 4 && (
                <span 
                  style={{
                    fontSize: typography.textStyles.labelSmall.fontSize,
                    padding: `${spacing[1]} ${spacing[2]}`,
                    color: colors.neutral[500]
                  }}
                >
                  +{post.keywords.length - 4}
                </span>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                  {post.author.name.charAt(0)}
                </div>
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📅 {formatDate(post.publishedAt)}</span>
                <span>⏱️ {post.readingTime}분</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-3">
                <span>💯 {post.seoScore}점</span>
                {post.viewCount && <span>👀 {post.viewCount.toLocaleString()}</span>}
                {post.likeCount && <span>❤️ {post.likeCount}</span>}
              </div>
            </div>

            {/* Read More Button */}
            <Link href={`/seo-blog/${post.id}`}>
              <Button 
                className="w-full transition-all duration-300"
                size="sm"
                style={{
                  fontSize: typography.textStyles.labelMedium.fontSize,
                  padding: spacing.component.buttonPadding.sm,
                  background: featured ? colors.gradients.primary : colors.neutral[0],
                  color: featured ? colors.neutral[0] : colors.neutral[900],
                  border: featured ? 'none' : `1px solid ${colors.neutral[200]}`,
                  boxShadow: featured ? boxShadow.md : boxShadow.sm,
                  borderRadius: borderRadius.md
                }}
              >
                {featured ? '✨ 추천 분석 보기' : '분석 보기'} →
              </Button>
            </Link>
          </div>
        </div>
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