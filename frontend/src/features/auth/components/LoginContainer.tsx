'use client'

import { LoginForm } from './LoginForm'
import { GlassCard, GradientBackground, FloatingElement, FadeInSection } from '@/shared/components/advanced-ui'

/**
 * 로그인 컨테이너 컴포넌트
 * 로그인 폼을 감싸는 글래스모피즘 레이아웃 제공
 * 
 * @returns JSX.Element
 */
export function LoginContainer() {
  return (
    <>
      <GradientBackground />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full">
          <FloatingElement direction="up" amplitude={8} duration={4}>
            <FadeInSection>
              <GlassCard className="p-8">
                {/* 헤더 */}
                <div className="text-center mb-8">
                  <FadeInSection delay={200}>
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <span className="text-white font-bold text-xl">C9</span>
                      </div>
                    </div>
                  </FadeInSection>
                  
                  <FadeInSection delay={300}>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      로그인
                    </h1>
                    <p className="text-gray-400">
                      CP9 AI 상품 연구 플랫폼에 오신 것을 환영합니다
                    </p>
                  </FadeInSection>
                </div>

                {/* 로그인 폼 */}
                <LoginForm />
              </GlassCard>
            </FadeInSection>
          </FloatingElement>
        </div>
      </div>
    </>
  )
}