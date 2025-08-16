'use client'

import { useAuth } from '@/features/auth/contexts/AuthContext'
import { HeroSection } from './HeroSection'
import { FeatureGrid, FeatureStats } from './FeatureGrid'
import { 
  Search, 
  Brain, 
  PenTool, 
  TrendingUp, 
  Layers, 
  Rocket,
  BarChart3,
  Globe,
  Shield
} from 'lucide-react'
import { FadeInSection, AnimatedButton } from '@/shared/components/advanced-ui'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export function HomePageClient() {
  const { loading } = useAuth()
  
  console.log('HomePageClient loaded, loading:', loading)
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <HeroSection 
        title={{
          main: "AI로 쿠팡 파트너스",
          highlight: "SEO 콘텐츠 자동 생성"
        }}
        description="AI 기술을 활용한 쿠팡 파트너스 자동화 플랫폼. 상품 리서치부터 SEO 최적화 콘텐츠 생성까지 한 번에."
        primaryAction={{
          text: "무료로 시작하기",
          href: "/product"
        }}
        secondaryAction={{
          text: "데모 보기",
          href: "/components"
        }}
      />
      
      {/* Features Section */}
      <FadeInSection className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            강력한 기능들
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI 기술과 자동화 워크플로우로 쿠팡 파트너스 비즈니스를 한 단계 업그레이드하세요
          </p>
        </div>
        
        <FeatureGrid features={[
            {
              icon: Search,
              title: '스마트 상품 검색',
              description: '키워드, 카테고리, URL 기반으로 쿠팡 상품을 실시간으로 검색하고 분석합니다.',
              gradient: 'from-blue-500 to-cyan-500',
              href: '/product'
            },
            {
              icon: Brain,
              title: 'AI 리서치 엔진',
              description: 'Perplexity AI를 활용하여 상품의 최신 시장 정보와 트렌드를 자동으로 수집합니다.',
              gradient: 'from-purple-500 to-pink-500',
              href: '/research'
            },
            {
              icon: PenTool,
              title: 'SEO 콘텐츠 생성',
              description: 'GPT-4 기반으로 검색 엔진 최적화된 고품질 블로그 콘텐츠를 자동 생성합니다.',
              gradient: 'from-green-500 to-emerald-500',
              href: '#',
              disabled: true
            },
            {
              icon: TrendingUp,
              title: '실시간 분석',
              description: '상품 가격, 리뷰, 판매량 등을 실시간으로 모니터링하고 인사이트를 제공합니다.',
              gradient: 'from-orange-500 to-red-500',
              href: '#',
              disabled: true
            },
            {
              icon: Layers,
              title: '워크플로우 자동화',
              description: 'LangGraph 기반 AI 워크플로우로 반복 작업을 완전 자동화합니다.',
              gradient: 'from-indigo-500 to-purple-500',
              href: '#',
              disabled: true
            },
            {
              icon: Rocket,
              title: '원클릭 퍼블리싱',
              description: 'WordPress와 연동하여 생성된 콘텐츠를 즉시 블로그에 발행할 수 있습니다.',
              gradient: 'from-pink-500 to-rose-500',
              href: '#',
              disabled: true
            }
        ]} />
        
        <FeatureStats stats={[
            {
              icon: BarChart3,
              value: '10K+',
              label: '분석된 상품',
              color: 'text-blue-400'
            },
            {
              icon: Globe,
              value: '95%',
              label: 'SEO 점수',
              color: 'text-purple-400'
            },
            {
              icon: Shield,
              value: '24/7',
              label: '자동 모니터링',
              color: 'text-green-400'
            }
        ]} />
      </FadeInSection>
      
      {/* CTA Section */}
      <FadeInSection delay={400} className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            무료로 시작하고 언제든지 업그레이드할 수 있습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/product">
              <AnimatedButton variant="gradient" size="lg" className="min-w-[200px]">
                무료로 시작하기
              </AnimatedButton>
            </Link>
            <Link href="/login">
              <AnimatedButton variant="outline" size="lg" className="min-w-[200px]">
                로그인
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </FadeInSection>
    </div>
  )
}