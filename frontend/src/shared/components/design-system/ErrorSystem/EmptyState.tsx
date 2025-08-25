'use client'

import React from 'react'
import { 
  Search, 
  FileX, 
  Database, 
  Plus, 
  Upload, 
  RefreshCw,
  BookOpen,
  Lightbulb
} from 'lucide-react'
import { EmptyStateConfig } from './types'
import { animations } from '@/shared/design-tokens/animations'

interface EmptyStateProps {
  config: EmptyStateConfig
  className?: string
}

/**
 * 빈 상태 표시 컴포넌트
 * 사용자에게 명확한 가이드와 액션을 제공
 */
export function EmptyState({ config, className = '' }: EmptyStateProps) {
  const IconComponent = getIconComponent(config.icon)

  return (
    <div 
      className={`
        flex flex-col items-center justify-center text-center py-12 px-6
        ${className}
      `}
      style={{
        animation: `${animations.keyframes.fadeInUp} ${animations.duration.slow} ${animations.easing.easeOut}`
      }}
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className="
          w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100
          dark:from-blue-950/30 dark:to-indigo-950/30
          flex items-center justify-center
          shadow-lg
        ">
          {React.createElement(IconComponent, {
            size: 32,
            className: "text-blue-600 dark:text-blue-400"
          })}
        </div>
        
        {/* Decorative ring */}
        <div className="
          absolute inset-0 w-20 h-20 rounded-full border-2 border-blue-200 dark:border-blue-800
          animate-pulse opacity-60
        " />
      </div>

      {/* Content */}
      <div className="max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {config.title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {config.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          {config.primaryAction && (
            <button
              onClick={config.primaryAction.onClick}
              className="
                inline-flex items-center gap-2 px-6 py-3 rounded-lg
                bg-blue-600 hover:bg-blue-700 text-white font-medium
                transition-all duration-200 hover:scale-105 hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              "
            >
              {config.primaryAction.icon && React.createElement(getIconComponent(config.primaryAction.icon), { size: 18 })}
              {config.primaryAction.label}
            </button>
          )}

          {config.secondaryAction && (
            <button
              onClick={config.secondaryAction.onClick}
              className="
                inline-flex items-center gap-2 px-6 py-3 rounded-lg
                text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400
                bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700
                dark:text-gray-300 dark:hover:text-gray-100 dark:border-gray-600
                transition-all duration-200 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              "
            >
              {config.secondaryAction.icon && React.createElement(getIconComponent(config.secondaryAction.icon), { size: 18 })}
              {config.secondaryAction.label}
            </button>
          )}
        </div>

        {/* Guide Steps */}
        {config.showGuide && config.guideSteps && config.guideSteps.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                시작하는 방법
              </h3>
            </div>
            
            <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              {config.guideSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="
                    flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500
                    text-white text-xs flex items-center justify-center font-medium
                  ">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 아이콘 문자열을 컴포넌트로 변환
 */
function getIconComponent(iconName: string, size: number = 24): React.ComponentType<{size: number; className?: string}> {
  const iconMap = {
    search: Search,
    'file-x': FileX,
    database: Database,
    plus: Plus,
    upload: Upload,
    refresh: RefreshCw,
    'book-open': BookOpen,
    lightbulb: Lightbulb,
  } as const

  return iconMap[iconName as keyof typeof iconMap] || FileX
}

/**
 * 미리 정의된 빈 상태 설정들
 */
export const emptyStatePresets = {
  // Research 페이지용 - 백엔드 표준 메시지 반영
  noResearch: {
    icon: 'search',
    title: '아직 생성된 리서치 작업이 없습니다',
    description: '새로운 작업을 시작해 보세요. AI가 상품을 분석하여 유용한 인사이트를 제공해드립니다.',
    primaryAction: {
      label: '새 리서치 시작하기',
      onClick: () => window.location.href = '/products',
      icon: 'plus'
    },
    secondaryAction: {
      label: '사용 가이드',
      onClick: () => window.open('/guide/research', '_blank'),
      icon: 'book-open'
    },
    showGuide: true,
    guideSteps: [
      '상품 검색 페이지에서 키워드나 쿠팡 링크를 입력하세요',
      '분석하고 싶은 상품들을 선택하고 리서치를 실행하세요',
      'AI가 생성한 상세 분석 보고서를 확인하고 활용하세요'
    ]
  } as EmptyStateConfig,

  // 상품 검색 결과 없음
  noProducts: {
    icon: 'search',
    title: '검색 결과가 없습니다',
    description: '입력하신 키워드로 상품을 찾을 수 없었어요. 다른 키워드로 시도해보세요.',
    primaryAction: {
      label: '다시 검색',
      onClick: () => {},
      icon: 'refresh'
    },
    showGuide: true,
    guideSteps: [
      '더 일반적인 키워드를 사용해보세요',
      '띄어쓰기나 특수문자를 확인해보세요',
      '브랜드명이나 카테고리로 검색해보세요'
    ]
  } as EmptyStateConfig,

  // 파일 업로드
  noFiles: {
    icon: 'upload',
    title: '업로드된 파일이 없습니다',
    description: '파일을 드래그 앤 드롭하거나 버튼을 클릭해서 업로드해보세요.',
    primaryAction: {
      label: '파일 선택',
      onClick: () => {},
      icon: 'upload'
    }
  } as EmptyStateConfig,

  // 데이터베이스 빈 상태
  noData: {
    icon: 'database',
    title: '데이터가 없습니다',
    description: '아직 저장된 데이터가 없어요. 새로운 데이터를 추가해보세요.',
    primaryAction: {
      label: '데이터 추가',
      onClick: () => {},
      icon: 'plus'
    }
  } as EmptyStateConfig
} as const

export default EmptyState