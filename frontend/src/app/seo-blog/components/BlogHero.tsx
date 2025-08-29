'use client'

import { FadeInSection, GradientBackground, FloatingElement } from '@/shared/components/advanced-ui'
import { Button } from '@/shared/components/custom-ui'
import { colors, typography, spacing, boxShadow } from '@/shared/design-tokens'

export function BlogHero() {
  return (
    <div className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-10 pb-20">
      {/* Background Elements */}
      <GradientBackground />
      
      {/* Floating Decorative Elements */}
      <FloatingElement 
        duration={20}
        className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
      >
        <div />
      </FloatingElement>
      <FloatingElement 
        duration={25}
        className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-xl"
      >
        <div />
      </FloatingElement>
      <FloatingElement 
        duration={30}
        className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-500/10 rounded-full blur-lg"
      >
        <div />
      </FloatingElement>

      {/* Main Content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-6">
        <FadeInSection>
          <div className="mb-8">
            {/* Badge */}
            <div 
              className="inline-flex items-center backdrop-blur-md rounded-full border text-sm font-medium mb-6"
              style={{
                padding: spacing.component.buttonPadding.sm,
                backgroundColor: colors.glass.medium,
                borderColor: colors.glass.light,
                color: colors.neutral[0]
              }}
            >
              <span className="mr-2">🛍️</span>
              CP9 쿠팡 상품 분석
            </div>

            {/* Main Title */}
            <h1 
              className="font-bold leading-tight mb-6"
              style={{
                fontSize: typography.textStyles.displayLarge.fontSize,
                fontWeight: typography.textStyles.displayLarge.fontWeight,
                lineHeight: typography.textStyles.displayLarge.lineHeight,
                letterSpacing: typography.textStyles.displayLarge.letterSpacing,
                background: colors.gradients.hero,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(255, 255, 255, 0.5)'
              }}
            >
              쿠팡 상품 SEO 컨텐츠
            </h1>

            {/* Subtitle */}
            <p 
              className="leading-relaxed mb-8 max-w-3xl mx-auto"
              style={{
                fontSize: typography.textStyles.headlineMedium.fontSize,
                color: colors.neutral[200],
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}
            >
              AI 기반 상품 분석부터 SEO 최적화까지 <br />
              <span 
                className="font-semibold" 
                style={{ color: colors.neutral[50] }}
              >
                데이터 중심의 상품 리뷰와 마케팅 인사이트
              </span>를 제공합니다
            </p>

            {/* Stats */}
            <div 
              className="grid grid-cols-1 md:grid-cols-3 mb-10"
              style={{ gap: spacing.component.gridGap.lg }}
            >
              <div className="text-center">
                <div 
                  className="font-bold mb-2"
                  style={{
                    fontSize: typography.textStyles.displaySmall.fontSize,
                    fontWeight: typography.textStyles.displaySmall.fontWeight,
                    color: colors.neutral[0],
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  200+
                </div>
                <div 
                  style={{
                    fontSize: typography.textStyles.bodySmall.fontSize,
                    color: colors.neutral[300]
                  }}
                >
                  분석된 상품
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="font-bold mb-2"
                  style={{
                    fontSize: typography.textStyles.displaySmall.fontSize,
                    fontWeight: typography.textStyles.displaySmall.fontWeight,
                    color: colors.neutral[0],
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  15+
                </div>
                <div 
                  style={{
                    fontSize: typography.textStyles.bodySmall.fontSize,
                    color: colors.neutral[300]
                  }}
                >
                  상품 카테고리
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="font-bold mb-2"
                  style={{
                    fontSize: typography.textStyles.displaySmall.fontSize,
                    fontWeight: typography.textStyles.displaySmall.fontWeight,
                    color: colors.neutral[0],
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  95%
                </div>
                <div 
                  style={{
                    fontSize: typography.textStyles.bodySmall.fontSize,
                    color: colors.neutral[300]
                  }}
                >
                  SEO 최적화 점수
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center"
              style={{ gap: spacing[4] }}
            >
              <Button 
                size="lg"
                className="shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                style={{
                  padding: spacing.component.buttonPadding.xl,
                  backgroundColor: colors.neutral[0],
                  color: colors.neutral[900],
                  fontSize: typography.textStyles.labelLarge.fontSize,
                  boxShadow: boxShadow.xl,
                  border: 'none'
                }}
              >
                🔍 상품 분석 둘러보기
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="backdrop-blur-sm transition-all duration-300"
                style={{
                  padding: spacing.component.buttonPadding.xl,
                  borderColor: colors.glass.light,
                  color: colors.neutral[0],
                  fontSize: typography.textStyles.labelLarge.fontSize,
                  backgroundColor: 'transparent'
                }}
              >
                📊 분석 리포트 받기
              </Button>
            </div>
          </div>
        </FadeInSection>

        {/* Popular Categories */}
        <FadeInSection delay={200}>
          <div style={{ marginTop: spacing[12] }}>
            <p 
              className="mb-4"
              style={{
                color: colors.neutral[200],
                fontSize: typography.textStyles.bodySmall.fontSize
              }}
            >
              인기 카테고리
            </p>
            <div 
              className="flex flex-wrap items-center justify-center"
              style={{ gap: spacing[3] }}
            >
              {[
                '생활용품', '전자제품', '패션의류', '뷰티', 
                '식품', '스포츠', '도서', '반려용품'
              ].map(category => (
                <div 
                  key={category}
                  className="backdrop-blur-sm rounded-full border hover:bg-white/20 transition-colors cursor-pointer"
                  style={{
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: colors.glass.medium,
                    borderColor: colors.glass.light,
                    color: colors.neutral[0],
                    fontSize: typography.textStyles.bodySmall.fontSize
                  }}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-gray-900"></div>
    </div>
  )
}