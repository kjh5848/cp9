'use client'

import { HeroSection, FeatureGrid, FeatureStats } from '@/features/components'
import { GlassCard } from '@/features/components/ui/glass-card'
import { AnimatedButton } from '@/features/components/ui/animated-button'
import { Button } from '@/features/components/ui/button'
import { Card } from '@/features/components/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
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
import { useState } from 'react'

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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-gray-700 rounded-full mb-4">
            <Palette className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Component Gallery</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              컴포넌트
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              스타일가이드
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            재사용 가능한 컴포넌트 라이브러리의 모든 스타일과 기능을 확인해보세요.
          </p>
        </div>

        {/* HeroSection Examples */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Code className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">HeroSection 컴포넌트</h2>
          </div>
          
          <div className="space-y-12">
            {/* Default Hero */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">기본 히어로 섹션</h3>
              <GlassCard>
                <HeroSection
                  title={{
                    main: "당신의 성공을 위한",
                    highlight: "완벽한 솔루션"
                  }}
                  description="혁신적인 기술로 비즈니스의 새로운 가능성을 열어보세요. 간단하고 효과적인 도구로 목표를 달성하세요."
                  primaryAction={{
                    text: "시작하기",
                    href: "#"
                  }}
                  secondaryAction={{
                    text: "더 알아보기",
                    href: "#"
                  }}
                />
              </GlassCard>
            </div>

            {/* Customized Hero */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">커스텀 히어로 섹션</h3>
              <GlassCard>
                <HeroSection
                  badge={{
                    icon: Star,
                    text: "New Release"
                  }}
                  title={{
                    main: "Experience the",
                    highlight: "future"
                  }}
                  description="Advanced technology meets intuitive design. Transform your workflow with our cutting-edge platform."
                  primaryAction={{
                    text: "Get Started Free",
                    href: "#"
                  }}
                  secondaryAction={{
                    text: "Watch Demo",
                    onClick: () => alert('Demo clicked!')
                  }}
                  features={[
                    { icon: Sparkles, text: 'AI-Powered', color: 'blue' },
                    { icon: Shield, text: 'Secure', color: 'purple' },
                    { icon: Rocket, text: 'Fast', color: 'pink' }
                  ]}
                />
              </GlassCard>
            </div>
          </div>
        </section>

        {/* FeatureGrid Examples */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Code className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">FeatureGrid 컴포넌트</h2>
          </div>
          
          <div className="space-y-12">
            {/* 3 Column Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">3열 그리드 (기본)</h3>
              <FeatureGrid features={sampleFeatures} />
            </div>

            {/* 2 Column Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">2열 그리드</h3>
              <FeatureGrid features={sampleFeatures.slice(0, 2)} columns={2} />
            </div>
          </div>
        </section>

        {/* FeatureStats Examples */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Code className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold">FeatureStats 컴포넌트</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">기본 통계 (3열)</h3>
              <FeatureStats stats={sampleStats} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">2열 통계</h3>
              <FeatureStats 
                stats={sampleStats.slice(0, 2)} 
                columns={2}
                className="mt-8"
              />
            </div>
          </div>
        </section>

        {/* Basic UI Components */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Code className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold">기본 UI 컴포넌트</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Buttons */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">버튼</h3>
                <div className="space-y-3">
                  <Button className="w-full">기본 버튼</Button>
                  <Button variant="outline" className="w-full">아웃라인 버튼</Button>
                  <Button variant="ghost" className="w-full">고스트 버튼</Button>
                  <AnimatedButton variant="gradient" className="w-full">
                    애니메이션 버튼
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>

            {/* Form Elements */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">폼 요소</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Cards */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">카드</h3>
                <div className="space-y-3">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">일반 카드</h4>
                    <p className="text-sm text-gray-400">기본 카드 스타일입니다.</p>
                  </Card>
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">글래스 카드</h4>
                    <p className="text-sm text-gray-400">글래스모피즘 스타일 카드입니다.</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Palette className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold">컬러 팔레트</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Blue', class: 'bg-blue-500', text: 'text-blue-400' },
              { name: 'Purple', class: 'bg-purple-500', text: 'text-purple-400' },
              { name: 'Pink', class: 'bg-pink-500', text: 'text-pink-400' },
              { name: 'Green', class: 'bg-green-500', text: 'text-green-400' },
              { name: 'Orange', class: 'bg-orange-500', text: 'text-orange-400' },
              { name: 'Gray', class: 'bg-gray-500', text: 'text-gray-400' }
            ].map((color) => (
              <div key={color.name} className="text-center">
                <div className={`w-full h-16 rounded-lg ${color.class} mb-2`} />
                <span className={`text-sm font-medium ${color.text}`}>{color.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Usage Guidelines */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Code className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold">사용 가이드</h2>
          </div>
          
          <GlassCard>
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-4">컴포넌트 사용법</h3>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">1. HeroSection</h4>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import { HeroSection } from '@/features/components'

<HeroSection
  title={{ main: "메인 제목", highlight: "강조 텍스트" }}
  description="설명 텍스트"
  primaryAction={{ text: "주요 버튼", href: "/path" }}
  secondaryAction={{ text: "보조 버튼", href: "/path" }}
/>`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">2. FeatureGrid</h4>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import { FeatureGrid } from '@/features/components'

<FeatureGrid
  features={[
    {
      icon: Search,
      title: "제목",
      description: "설명",
      gradient: "from-blue-500 to-cyan-500",
      href: "/path"
    }
  ]}
  columns={3}
/>`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">3. 기본 UI 컴포넌트</h4>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import { Button, Input, Card } from '@/shared/ui'

<Button variant="gradient">버튼</Button>
<Input placeholder="입력 필드" />
<Card>카드 내용</Card>`}
                  </pre>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    </div>
  )
}