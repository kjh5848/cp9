'use client'

import { HeroSection, FeatureGrid, FeatureStats, ComponentsPageClient } from '@/features/components'
import { GlassCard } from '@/features/components/ui/glass-card'
import { AnimatedButton } from '@/features/components/ui/animated-button'
import { Button } from '@/features/components/ui/button'
import { Card } from '@/features/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { 
  Search, 
  Brain, 
  PenTool,
  BarChart3,
  Globe,
  Shield,
  Sparkles,
  Star,
  Code,
  Palette,
  Rocket
} from 'lucide-react'
import { Suspense, useState } from 'react'

const sampleFeatures = [
  {
    icon: Search,
    title: '스마트 검색',
    description: '고급 검색 알고리즘으로 원하는 결과를 빠르게 찾아보세요.',
    gradient: 'from-blue-500 to-cyan-500',
    href: '#'
  },
  {
    icon: Brain,
    title: 'AI 분석',
    description: '머신러닝 기반 데이터 분석으로 인사이트를 얻어보세요.',
    gradient: 'from-purple-500 to-pink-500',
    href: '#'
  },
  {
    icon: PenTool,
    title: '콘텐츠 생성',
    description: '자동화된 콘텐츠 생성 도구로 효율성을 높이세요.',
    gradient: 'from-green-500 to-emerald-500',
    href: '#'
  }
]

const sampleStats = [
  {
    icon: BarChart3,
    value: '1K+',
    label: '활성 사용자',
    color: 'text-blue-400'
  },
  {
    icon: Globe,
    value: '99%',
    label: '만족도',
    color: 'text-purple-400'
  },
  {
    icon: Shield,
    value: '24/7',
    label: '지원',
    color: 'text-green-400'
  }
]

export default function ComponentsPage() {
  const [inputValue, setInputValue] = useState('')

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComponentsPageClient />
    </Suspense>
  )
}