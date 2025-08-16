'use client'

import { useAuth } from '@/features/auth/contexts/AuthContext'
import { AnimatedButton } from '@/shared/components/advanced-ui'
import { ArrowRight, Sparkles, Zap, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

export interface HeroSectionProps {
  title: {
    main: string
    highlight: string
  }
  description: string
  primaryAction: {
    text: string
    href: string
  }
  secondaryAction: {
    text: string
    href?: string
    onClick?: () => void
  }
}

export function HeroSection({
  title,
  description,
  primaryAction,
  secondaryAction,
}: HeroSectionProps) {
  const { user } = useAuth()

  return (
    <section className="relative min-h-[600px] flex items-center justify-center py-20 px-4">
      {/* Animated 3D-like cube background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-96 h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl transform rotate-6 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-orange-500/20 rounded-3xl transform -rotate-6 animate-pulse animation-delay-2000" />
            <div className="absolute inset-0 bg-gradient-to-bl from-green-500/10 to-cyan-500/10 rounded-3xl transform rotate-12 animate-pulse animation-delay-4000" />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Floating badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-gray-700 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300">AI-Powered Automation</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Your shortcut to
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            everything
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
          AI 기술을 활용한 쿠팡 파트너스 자동화 플랫폼. 
          상품 리서치부터 SEO 최적화 콘텐츠 생성까지 한 번에.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          {user ? (
            <>
              <Link href="/product">
                <AnimatedButton variant="gradient" size="lg" className="min-w-[200px]">
                  <span className="flex items-center gap-2">
                    시작하기 <ArrowRight className="w-5 h-5" />
                  </span>
                </AnimatedButton>
              </Link>
              <Link href="/research">
                <AnimatedButton variant="outline" size="lg" className="min-w-[200px]">
                  리서치 관리
                </AnimatedButton>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <AnimatedButton variant="gradient" size="lg" className="min-w-[200px]">
                  <span className="flex items-center gap-2">
                    무료로 시작하기 <ArrowRight className="w-5 h-5" />
                  </span>
                </AnimatedButton>
              </Link>
              <AnimatedButton variant="outline" size="lg" className="min-w-[200px]">
                데모 보기
              </AnimatedButton>
            </>
          )}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 justify-center">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-300">실시간 AI 분석</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-300">안전한 데이터 보호</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-gray-300">SEO 최적화</span>
          </div>
        </div>
      </div>
    </section>
  )
}