'use client'

import { useAuth } from '@/features/auth/contexts/AuthContext'
import { HeroSection } from '@/features/components/HeroSection'
import { FeatureGrid, FeatureStats } from '@/features/components/FeatureGrid'
import { GradientBackground } from '@/features/components/ui/gradient-background'
import { Loader2 } from 'lucide-react'

export function ComponentsPageClient() {
  const { loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <GradientBackground />
        <div className="text-center relative z-10">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <GradientBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection 
          title={{ main: 'CP9', highlight: 'Components' }}
          description="AI 기술과 자동화 워크플로우로 쿠팡 파트너스 비즈니스를 한 단계 업그레이드하세요"
          primaryAction={{ text: '시작하기', href: '/components' }}
          secondaryAction={{ text: '더 알아보기', href: '/components' }}
        />
        
        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              강력한 기능들
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              AI 기술과 자동화 워크플로우로 쿠팡 파트너스 비즈니스를 한 단계 업그레이드하세요
            </p>
          </div>
          
          <FeatureGrid features={[]} />
          <FeatureStats stats={[]} />
        </section>
        
        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              무료로 시작하고 언제든지 업그레이드할 수 있습니다
            </p>
          </div>
        </section>
      </div>
    </>
  )
}