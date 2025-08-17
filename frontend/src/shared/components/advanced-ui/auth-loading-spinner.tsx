'use client'

import { GlassCard, FadeInSection, PulseEffect } from './'

interface AuthLoadingSpinnerProps {
  message?: string
  subtitle?: string
  type?: 'login' | 'callback' | 'auth'
}

/**
 * 인증 전용 로딩 스피너 컴포넌트
 * 로그인, 콜백, 인증 과정에서 사용되는 특화된 로딩 인디케이터
 * 
 * @param message - 주요 메시지
 * @param subtitle - 부제목
 * @param type - 인증 타입에 따른 스타일 구분
 * @returns JSX.Element
 */
export function AuthLoadingSpinner({ 
  message = '인증 처리 중...', 
  subtitle = '잠시만 기다려 주세요.',
  type = 'auth'
}: AuthLoadingSpinnerProps) {
  const typeConfig = {
    login: {
      message: '로그인 페이지를 준비하고 있습니다...',
      subtitle: '잠시만 기다려 주세요.',
      spinnerColor: 'border-t-blue-500'
    },
    callback: {
      message: '인증 처리 중...',
      subtitle: '구글 로그인을 완료하고 있습니다.',
      spinnerColor: 'border-t-green-500'
    },
    auth: {
      message: '인증 확인 중...',
      subtitle: '사용자 정보를 확인하고 있습니다.',
      spinnerColor: 'border-t-purple-500'
    }
  }

  const config = typeConfig[type]
  const displayMessage = message || config.message
  const displaySubtitle = subtitle || config.subtitle

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-950">
      <div className="max-w-md w-full">
        <GlassCard className="p-8">
          <FadeInSection>
            <div className="text-center">
              {/* CP9 로고 */}
              <div className="flex items-center justify-center mb-6">
                <PulseEffect intensity="medium" color="blue">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <span className="text-white font-bold text-xl">C9</span>
                  </div>
                </PulseEffect>
              </div>

              {/* 로딩 스피너 */}
              <div className={`animate-spin rounded-full h-10 w-10 border-2 border-gray-600 ${config.spinnerColor} mx-auto mb-4`}></div>
              
              {/* 메시지 */}
              <h2 className="text-xl font-semibold text-white mb-2">
                {displayMessage}
              </h2>
              <p className="text-gray-400">
                {displaySubtitle}
              </p>

              {/* 진행 표시 */}
              <div className="mt-6">
                <div className="flex space-x-1 justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </GlassCard>
      </div>
    </div>
  )
}

/**
 * 간단한 인증 로딩 스피너 (Suspense fallback용)
 */
export function SimpleAuthLoadingSpinner({ message = '인증 처리 중...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-blue-500 mx-auto mb-3"></div>
        <p className="text-white text-sm font-medium mb-1">{message}</p>
        <p className="text-gray-400 text-xs">잠시만 기다려 주세요.</p>
      </div>
    </div>
  )
}

export type { AuthLoadingSpinnerProps }