'use client'

import { GlassCard } from '@/shared/components/advanced-ui'
import { AnimatedButton } from '@/shared/components/advanced-ui'
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
import Link from 'next/link'

const features = [
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
    href: '#'
  },
  {
    icon: TrendingUp,
    title: '실시간 분석',
    description: '상품 가격, 리뷰, 판매량 등을 실시간으로 모니터링하고 인사이트를 제공합니다.',
    gradient: 'from-orange-500 to-red-500',
    href: '#'
  },
  {
    icon: Layers,
    title: '워크플로우 자동화',
    description: 'LangGraph 기반 AI 워크플로우로 반복 작업을 완전 자동화합니다.',
    gradient: 'from-indigo-500 to-purple-500',
    href: '#'
  },
  {
    icon: Rocket,
    title: '원클릭 퍼블리싱',
    description: 'WordPress와 연동하여 생성된 콘텐츠를 즉시 블로그에 발행할 수 있습니다.',
    gradient: 'from-pink-500 to-rose-500',
    href: '#'
  }
]

export function FeatureGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <GlassCard key={index} className="group hover:scale-105 transition-transform duration-300">
          <div className="p-6">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {feature.title}
            </h3>
            
            <p className="text-gray-400 mb-4">
              {feature.description}
            </p>
            
            {feature.href !== '#' ? (
              <Link href={feature.href}>
                <AnimatedButton variant="outline" size="sm" className="w-full">
                  자세히 보기
                </AnimatedButton>
              </Link>
            ) : (
              <AnimatedButton variant="outline" size="sm" className="w-full" disabled>
                곧 출시 예정
              </AnimatedButton>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  )
}

export function FeatureStats() {
  const stats = [
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
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
          <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
          <div className="text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}