'use client'

import { useAuth } from '@/features/auth/contexts/AuthContext'
import { HeroSection } from './HeroSection'
import { FeatureGrid, FeatureStats } from './FeatureGrid'
import { Button, Card } from '@/shared/ui'
import { 
  GradientBackground, 
  Carousel, 
  SlidePanel, 
  AnimatedAccordion,
  FadeInSection, 
  FloatingElement, 
  ScaleOnHover, 
  StaggeredList,
  CodePreview,
  ComponentSection
} from '@/shared/components/advanced-ui'
import { Loader2, Play, Palette, Zap, Layers, Settings, ArrowRight, Sparkles } from 'lucide-react'

export function ComponentsPageClient() {
  const { loading } = useAuth()

  const carouselItems = [
    <Card key="1" className="bg-gradient-to-br from-blue-600 to-purple-700 border-none text-white p-8 h-64">
      <div className="flex items-center justify-between h-full">
        <div>
          <h3 className="text-2xl font-bold mb-3">AI 기반 상품 분석</h3>
          <p className="text-blue-100 mb-4">스마트한 데이터 분석으로 최적의 상품을 찾아드립니다</p>
          <Button variant="secondary" size="sm">자세히 보기</Button>
        </div>
        <Zap className="w-20 h-20 text-blue-200" />
      </div>
    </Card>,
    <Card key="2" className="bg-gradient-to-br from-green-600 to-teal-700 border-none text-white p-8 h-64">
      <div className="flex items-center justify-between h-full">
        <div>
          <h3 className="text-2xl font-bold mb-3">자동화 워크플로우</h3>
          <p className="text-green-100 mb-4">반복 작업을 자동화하여 효율성을 극대화하세요</p>
          <Button variant="secondary" size="sm">시작하기</Button>
        </div>
        <Settings className="w-20 h-20 text-green-200" />
      </div>
    </Card>,
    <Card key="3" className="bg-gradient-to-br from-purple-600 to-pink-700 border-none text-white p-8 h-64">
      <div className="flex items-center justify-between h-full">
        <div>
          <h3 className="text-2xl font-bold mb-3">실시간 대시보드</h3>
          <p className="text-purple-100 mb-4">실시간으로 성과를 모니터링하고 최적화하세요</p>
          <Button variant="secondary" size="sm">대시보드</Button>
        </div>
        <Layers className="w-20 h-20 text-purple-200" />
      </div>
    </Card>
  ]

  const accordionItems = [
    {
      title: "애니메이션 컴포넌트",
      content: (
        <div className="space-y-3">
          <p className="text-gray-400">부드럽고 자연스러운 애니메이션 효과</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">FadeIn</span>
            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">Floating</span>
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">ScaleOnHover</span>
          </div>
        </div>
      )
    },
    {
      title: "인터랙티브 UI",
      content: (
        <div className="space-y-3">
          <p className="text-gray-400">사용자 경험을 향상시키는 상호작용 요소</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded">Carousel</span>
            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">SlidePanel</span>
            <span className="px-2 py-1 bg-teal-600 text-white text-xs rounded">Accordion</span>
          </div>
        </div>
      )
    },
    {
      title: "반응형 디자인",
      content: (
        <div className="space-y-3">
          <p className="text-gray-400">모든 디바이스에서 완벽한 표시</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded">Mobile</span>
            <span className="px-2 py-1 bg-pink-600 text-white text-xs rounded">Tablet</span>
            <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded">Desktop</span>
          </div>
        </div>
      )
    }
  ]
  
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
        <FadeInSection>
          <HeroSection 
            title={{ main: 'CP9', highlight: 'Components' }}
            description="모던하고 아름다운 애니메이션 컴포넌트로 더 나은 사용자 경험을 만들어보세요"
            primaryAction={{ text: '시작하기', href: '/components' }}
            secondaryAction={{ text: '더 알아보기', href: '/components' }}
          />
        </FadeInSection>
        
        {/* Interactive Carousel Section */}
        <FadeInSection delay={200} className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              인터랙티브 컴포넌트
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              부드러운 애니메이션과 직관적인 인터페이스
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Carousel 
              items={carouselItems}
              autoPlay={true}
              interval={4000}
              className="shadow-2xl"
            />
          </div>
        </FadeInSection>

        {/* Animated Components Grid */}
        <FadeInSection delay={400} className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              애니메이션 갤러리
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              다양한 애니메이션 효과를 체험해보세요
            </p>
          </div>

          <StaggeredList 
            staggerDelay={150}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            <ScaleOnHover scale={1.05}>
              <Card className="bg-gray-900/70 border-gray-800 p-6 text-center h-48 flex flex-col justify-center">
                <FloatingElement amplitude={8} duration={2}>
                  <Palette className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                </FloatingElement>
                <h3 className="text-lg font-semibold text-white mb-2">색상 시스템</h3>
                <p className="text-gray-400 text-sm">일관된 브랜드 색상</p>
              </Card>
            </ScaleOnHover>

            <ScaleOnHover scale={1.05}>
              <Card className="bg-gray-900/70 border-gray-800 p-6 text-center h-48 flex flex-col justify-center">
                <FloatingElement amplitude={12} duration={2.5}>
                  <Play className="w-12 h-12 text-green-400 mx-auto mb-4" />
                </FloatingElement>
                <h3 className="text-lg font-semibold text-white mb-2">동작 효과</h3>
                <p className="text-gray-400 text-sm">부드러운 트랜지션</p>
              </Card>
            </ScaleOnHover>

            <ScaleOnHover scale={1.05}>
              <Card className="bg-gray-900/70 border-gray-800 p-6 text-center h-48 flex flex-col justify-center">
                <FloatingElement amplitude={10} duration={3}>
                  <Layers className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                </FloatingElement>
                <h3 className="text-lg font-semibold text-white mb-2">레이어 관리</h3>
                <p className="text-gray-400 text-sm">계층형 구조</p>
              </Card>
            </ScaleOnHover>
          </StaggeredList>
        </FadeInSection>

        {/* Interactive Features Section */}
        <FadeInSection delay={600} className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Slide Panel Demo */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">슬라이드 패널</h3>
              <SlidePanel
                title="설정 패널"
                position="right"
                trigger={
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    패널 열기
                  </Button>
                }
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">알림 설정</h4>
                    <p className="text-gray-400 text-sm">실시간 알림을 받으시겠습니까?</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">테마</h4>
                    <p className="text-gray-400 text-sm">다크 모드 / 라이트 모드</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">언어</h4>
                    <p className="text-gray-400 text-sm">한국어, English</p>
                  </div>
                </div>
              </SlidePanel>
            </div>

            {/* Accordion Demo */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">아코디언 메뉴</h3>
              <AnimatedAccordion items={accordionItems} />
            </div>
          </div>
        </FadeInSection>
        
        {/* Components Library */}
        <FadeInSection delay={600} className="container mx-auto px-4 py-16">
          <ComponentSection
            title="컴포넌트 라이브러리"
            description="사용 가능한 모든 컴포넌트를 확인하고 코드를 복사해서 사용하세요"
          >
            {/* Button Component */}
            <CodePreview
              title="Button"
              description="다양한 스타일의 버튼 컴포넌트"
              category="기본 UI"
              code={`import { Button } from '@/shared/ui'

<Button variant="default">기본 버튼</Button>
<Button variant="outline">아웃라인 버튼</Button>
<Button variant="ghost">고스트 버튼</Button>
<Button size="sm">작은 버튼</Button>
<Button size="lg">큰 버튼</Button>`}
              preview={
                <div className="flex flex-wrap gap-3">
                  <Button variant="default">기본 버튼</Button>
                  <Button variant="outline">아웃라인</Button>
                  <Button variant="ghost">고스트</Button>
                  <Button size="sm">작은</Button>
                  <Button size="lg">큰 버튼</Button>
                </div>
              }
            />

            {/* Card Component */}
            <CodePreview
              title="Card"
              description="콘텐츠를 담는 카드 컴포넌트"
              category="기본 UI"
              code={`import { Card } from '@/shared/ui'

<Card className="p-6">
  <h3 className="text-lg font-semibold mb-2">카드 제목</h3>
  <p className="text-gray-400">카드 내용</p>
</Card>`}
              preview={
                <Card className="p-6 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-2">카드 제목</h3>
                  <p className="text-gray-400">카드 내용입니다</p>
                </Card>
              }
            />

            {/* Carousel Component */}
            <CodePreview
              title="Carousel"
              description="자동 슬라이드와 네비게이션이 있는 캐러셀"
              category="인터랙티브"
              code={`import { Carousel } from '@/shared/components/advanced-ui'

const items = [
  <div key="1">슬라이드 1</div>,
  <div key="2">슬라이드 2</div>,
  <div key="3">슬라이드 3</div>
]

<Carousel 
  items={items}
  autoPlay={true}
  interval={3000}
/>`}
              preview={
                <div className="w-full max-w-sm">
                  <Carousel 
                    items={[
                      <div key="1" className="bg-blue-600 p-8 text-white text-center rounded">슬라이드 1</div>,
                      <div key="2" className="bg-green-600 p-8 text-white text-center rounded">슬라이드 2</div>,
                      <div key="3" className="bg-purple-600 p-8 text-white text-center rounded">슬라이드 3</div>
                    ]}
                    autoPlay={true}
                    interval={3000}
                  />
                </div>
              }
            />

            {/* SlidePanel Component */}
            <CodePreview
              title="SlidePanel"
              description="좌우로 슬라이드되는 패널 컴포넌트"
              category="인터랙티브"
              code={`import { SlidePanel } from '@/shared/components/advanced-ui'

<SlidePanel
  title="설정 패널"
  position="right"
  trigger={<Button>패널 열기</Button>}
>
  <div>패널 내용</div>
</SlidePanel>`}
              preview={
                <SlidePanel
                  title="예제 패널"
                  position="right"
                  trigger={<Button>패널 열기</Button>}
                >
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">설정 옵션</h4>
                    <p className="text-gray-400">여기에 설정 내용이 들어갑니다.</p>
                  </div>
                </SlidePanel>
              }
            />

            {/* AnimatedAccordion Component */}
            <CodePreview
              title="AnimatedAccordion"
              description="부드러운 애니메이션이 있는 아코디언 메뉴"
              category="인터랙티브"
              code={`import { AnimatedAccordion } from '@/shared/components/advanced-ui'

const items = [
  {
    title: "첫 번째 항목",
    content: <div>첫 번째 내용</div>
  },
  {
    title: "두 번째 항목", 
    content: <div>두 번째 내용</div>
  }
]

<AnimatedAccordion items={items} />`}
              preview={
                <div className="w-full">
                  <AnimatedAccordion items={[
                    { title: "첫 번째 항목", content: <div className="text-gray-400">첫 번째 아코디언 내용</div> },
                    { title: "두 번째 항목", content: <div className="text-gray-400">두 번째 아코디언 내용</div> }
                  ]} />
                </div>
              }
            />

            {/* FadeInSection Component */}
            <CodePreview
              title="FadeInSection"
              description="스크롤 시 페이드인 애니메이션"
              category="애니메이션"
              code={`import { FadeInSection } from '@/shared/components/advanced-ui'

<FadeInSection delay={200}>
  <div>페이드인 될 내용</div>
</FadeInSection>`}
              preview={
                <FadeInSection>
                  <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
                    <Sparkles className="w-8 h-8 mb-2" />
                    <h3 className="font-semibold">페이드인 효과</h3>
                    <p className="text-blue-100 text-sm">스크롤하면 부드럽게 나타납니다</p>
                  </Card>
                </FadeInSection>
              }
            />

            {/* FloatingElement Component */}
            <CodePreview
              title="FloatingElement"
              description="부유하는 애니메이션 효과"
              category="애니메이션"
              code={`import { FloatingElement } from '@/shared/components/advanced-ui'

<FloatingElement amplitude={10} duration={3}>
  <div>부유하는 요소</div>
</FloatingElement>`}
              preview={
                <FloatingElement amplitude={8} duration={2}>
                  <div className="bg-green-600 text-white p-4 rounded-lg text-center">
                    <Play className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">부유 효과</p>
                  </div>
                </FloatingElement>
              }
            />

            {/* ScaleOnHover Component */}
            <CodePreview
              title="ScaleOnHover"
              description="호버 시 크기가 변하는 효과"
              category="애니메이션"
              code={`import { ScaleOnHover } from '@/shared/components/advanced-ui'

<ScaleOnHover scale={1.05}>
  <div>호버하면 커지는 요소</div>
</ScaleOnHover>`}
              preview={
                <ScaleOnHover scale={1.1}>
                  <Card className="p-6 bg-purple-600 text-white border-none cursor-pointer">
                    <ArrowRight className="w-8 h-8 mb-2" />
                    <h3 className="font-semibold">호버 효과</h3>
                    <p className="text-purple-100 text-sm">마우스를 올려보세요</p>
                  </Card>
                </ScaleOnHover>
              }
            />
          </ComponentSection>
        </FadeInSection>

        {/* CTA Section */}
        <FadeInSection delay={800} className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              모던한 UI 컴포넌트로 더 나은 사용자 경험을 만들어보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                무료로 시작하기
              </Button>
              <Button variant="outline" size="lg" className="border-gray-700 text-gray-300">
                문서 보기
              </Button>
            </div>
          </div>
        </FadeInSection>
      </div>
    </>
  )
}