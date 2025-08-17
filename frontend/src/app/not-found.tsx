'use client'

import Link from 'next/link'
import { 
  GlassCard, 
  GradientBackground, 
  FloatingElement, 
  FadeInSection, 
  AnimatedButton,
  PulseEffect
} from '@/shared/components/advanced-ui'
import { Home, Search, ArrowLeft } from 'lucide-react'

/**
 * 404 Not Found 페이지
 * 페이지를 찾을 수 없을 때 표시되는 사용자 친화적인 오류 페이지
 * 
 * @returns JSX.Element
 */
export default function NotFound() {
  return (
    <>
      <GradientBackground />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-lg w-full">
          <FloatingElement direction="up" amplitude={12} duration={5}>
            <FadeInSection>
              <GlassCard className="p-8 text-center">
                {/* 로고 */}
                <FadeInSection delay={100}>
                  <div className="flex items-center justify-center mb-6">
                    <PulseEffect intensity="medium" color="blue">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <span className="text-white font-bold text-2xl">C9</span>
                      </div>
                    </PulseEffect>
                  </div>
                </FadeInSection>

                {/* 404 에러 코드 */}
                <FadeInSection delay={200}>
                  <div className="mb-6">
                    <h1 className="text-8xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text mb-2">
                      404
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
                  </div>
                </FadeInSection>

                {/* 메시지 */}
                <FadeInSection delay={300}>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-3">
                      페이지를 찾을 수 없습니다
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                      요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.<br/>
                      주소를 확인하시거나 홈페이지에서 다시 탐색해보세요.
                    </p>
                  </div>
                </FadeInSection>

                {/* 액션 버튼들 */}
                <FadeInSection delay={400}>
                  <div className="space-y-4">
                    {/* 홈으로 돌아가기 버튼 */}
                    <Link href="/">
                      <AnimatedButton
                        variant="glow"
                        size="lg"
                        className="w-full"
                      >
                        <Home className="w-5 h-5 mr-2" />
                        홈으로 돌아가기
                      </AnimatedButton>
                    </Link>

                    {/* 추가 네비게이션 */}
                    <div className="flex gap-3">
                      <Link href="/product" className="flex-1">
                        <AnimatedButton
                          variant="outline"
                          size="md"
                          className="w-full"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          상품 검색
                        </AnimatedButton>
                      </Link>
                      
                      <AnimatedButton
                        variant="outline"
                        size="md"
                        onClick={() => window.history.back()}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        이전 페이지
                      </AnimatedButton>
                    </div>
                  </div>
                </FadeInSection>

                {/* 도움말 텍스트 */}
                <FadeInSection delay={500}>
                  <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <p className="text-sm text-gray-500">
                      문제가 지속될 경우{' '}
                      <a 
                        href="mailto:support@cp9.ai" 
                        className="text-blue-400 hover:text-blue-300 transition-colors underline"
                      >
                        고객 지원팀
                      </a>
                      에 문의해주세요.
                    </p>
                  </div>
                </FadeInSection>
              </GlassCard>
            </FadeInSection>
          </FloatingElement>
        </div>
      </div>
    </>
  )
}