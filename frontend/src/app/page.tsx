'use client'

import { useAuth } from '@/features/auth/contexts/AuthContext'
import { HeroSection } from '@/components/home/HeroSection'
import { FeatureGrid, FeatureStats } from '@/components/home/FeatureGrid'
import { GradientBackground } from '@/components/ui/gradient-background'
import { Loader2 } from 'lucide-react'

export default function Home() {
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
    <div className="min-h-screen bg-gray-950">
      <GradientBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        
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
          
          <FeatureGrid />
          <FeatureStats />
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
    </div>
  )
}
