'use client'

import { GlassCard, FadeInSection } from './'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  showCard?: boolean
}

/**
 * 공통 로딩 스피너 컴포넌트
 * 다양한 크기와 메시지를 지원하는 재사용 가능한 로딩 인디케이터
 * 
 * @param message - 표시할 로딩 메시지
 * @param size - 스피너 크기 (sm, md, lg)
 * @param showCard - 글래스 카드로 감쌀지 여부
 * @returns JSX.Element
 */
export function LoadingSpinner({ 
  message = '로딩 중...', 
  size = 'md',
  showCard = true 
}: LoadingSpinnerProps) {
  const sizeConfig = {
    sm: {
      spinner: 'h-6 w-6',
      container: 'p-4',
      title: 'text-sm',
      subtitle: 'text-xs'
    },
    md: {
      spinner: 'h-8 w-8',
      container: 'p-6',
      title: 'text-base',
      subtitle: 'text-sm'
    },
    lg: {
      spinner: 'h-12 w-12',
      container: 'p-8',
      title: 'text-lg',
      subtitle: 'text-base'
    }
  }

  const config = sizeConfig[size]

  const SpinnerContent = (
    <FadeInSection>
      <div className="text-center">
        <div 
          className={`animate-spin rounded-full border-2 border-gray-600 border-t-blue-500 mx-auto mb-4 ${config.spinner}`}
        ></div>
        <h3 className={`font-medium text-white mb-1 ${config.title}`}>
          {message}
        </h3>
        <p className={`text-gray-400 ${config.subtitle}`}>
          잠시만 기다려 주세요.
        </p>
      </div>
    </FadeInSection>
  )

  if (showCard) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <GlassCard className={config.container}>
            {SpinnerContent}
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${config.container}`}>
      {SpinnerContent}
    </div>
  )
}

/**
 * 간단한 인라인 로딩 스피너
 * Suspense fallback에 최적화된 버전
 */
export function SimpleLoadingSpinner({ message = '로딩 중...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-blue-500 mx-auto mb-3"></div>
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  )
}

export type { LoadingSpinnerProps }