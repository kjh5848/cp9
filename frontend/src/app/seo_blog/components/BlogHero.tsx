'use client'

import { FadeInSection, GradientBackground, FloatingElement } from '@/shared/components/advanced-ui'
import { Button } from '@/shared/components/custom-ui'
import { designTokens } from '@/shared/design-tokens'

export function BlogHero() {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
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
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <FadeInSection>
          <div className="mb-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white/90 text-sm font-medium mb-6">
              <span className="mr-2">✨</span>
              CP9 기술 블로그
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight mb-6">
              최신 기술 인사이트
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-8 max-w-3xl mx-auto">
              개발, 디자인, AI부터 성능 최적화까지 <br />
              <span className="font-semibold text-white">실전 경험을 바탕으로 한 깊이 있는 기술 아티클</span>을 만나보세요
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50+</div>
                <div className="text-white/70 text-sm">전문 아티클</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">10+</div>
                <div className="text-white/70 text-sm">기술 분야</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">1000+</div>
                <div className="text-white/70 text-sm">월간 독자</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold"
              >
                🚀 최신 글 둘러보기
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
              >
                📧 뉴스레터 구독
              </Button>
            </div>
          </div>
        </FadeInSection>

        {/* Popular Topics */}
        <FadeInSection delay={200}>
          <div className="mt-12">
            <p className="text-white/60 text-sm mb-4">인기 주제</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                'React', 'Next.js', 'TypeScript', 'AI/ML', 
                '성능최적화', '디자인시스템', 'Supabase', 'TailwindCSS'
              ].map(topic => (
                <div 
                  key={topic}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white/90 text-sm hover:bg-white/20 transition-colors cursor-pointer"
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-gray-900"></div>
    </div>
  )
}