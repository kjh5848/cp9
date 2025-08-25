'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Plus, HelpCircle } from 'lucide-react'
import { ResponsiveGrid, PlaceholderCard } from '@/shared/components/design-system'

interface GalleryErrorStateProps {
  error: string
  errorCode?: string
  onRetry?: () => void
  onStartNew?: () => void
  onRefreshList?: () => void
}

/**
 * 갤러리 에러 상태 컴포넌트  
 * 전체 페이지 대신 갤러리 영역에서만 에러 상태를 표시
 */
export function GalleryErrorState({ 
  error, 
  errorCode,
  onRetry = () => window.location.reload(),
  onStartNew = () => window.location.href = '/products',
  onRefreshList = () => window.location.reload()
}: GalleryErrorStateProps) {
  // 백엔드 표준 에러 코드 기반 메시지 및 UI 설정
  const getErrorInfo = (errorMessage: string, errorCode?: string) => {
    const lowerError = errorMessage.toLowerCase()
    
    // 백엔드 표준 에러 코드 우선 처리
    if (errorCode === 'JOB_NOT_FOUND') {
      return {
        icon: <AlertTriangle className="w-8 h-8 text-blue-400" />,
        title: '작업을 찾을 수 없습니다',
        description: '요청하신 리서치 작업을 찾을 수 없습니다.',
        suggestion: '작업 ID를 다시 확인하거나 작업 목록으로 돌아가세요.',
        severity: 'medium',
        primaryAction: '작업 목록으로 돌아가기',
        onPrimaryAction: onRefreshList
      }
    }
    
    // WebSocket 연결 실패 처리
    if (lowerError.includes('websocket') || lowerError.includes('connection') || 
        errorMessage.includes('연결하려는 작업') || errorMessage.includes('job not found')) {
      return {
        icon: <AlertTriangle className="w-8 h-8 text-yellow-400" />,
        title: 'WebSocket 연결 실패',
        description: '연결하려는 작업을 찾을 수 없습니다.',
        suggestion: '작업 목록을 새로고침하거나 새로운 작업을 시작해보세요.',
        severity: 'medium',
        primaryAction: '작업 목록 새로고침',
        onPrimaryAction: onRefreshList
      }
    }
    
    // 작업 취소 실패 처리
    if (lowerError.includes('cancel') || errorMessage.includes('취소할 수 없습니다')) {
      return {
        icon: <AlertTriangle className="w-8 h-8 text-orange-400" />,
        title: '작업 취소 불가',
        description: '작업을 취소할 수 없습니다.',
        suggestion: '이미 완료되었거나 진행 중일 수 있습니다. 작업 목록을 확인해주세요.',
        severity: 'medium',
        primaryAction: '작업 목록 확인',
        onPrimaryAction: onRefreshList
      }
    }
    
    // 서버 에러
    if (lowerError.includes('500') || lowerError.includes('internal server')) {
      return {
        icon: <AlertTriangle className="w-8 h-8 text-orange-400" />,
        title: '서버 일시 오류',
        description: '서버에 일시적인 문제가 발생했습니다.',
        suggestion: '잠시 후 다시 시도하거나 새로운 리서치를 시작해보세요.',
        severity: 'high',
        primaryAction: '다시 시도',
        onPrimaryAction: onRetry
      }
    }
    
    // 네트워크 에러
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return {
        icon: <AlertTriangle className="w-8 h-8 text-yellow-400" />,
        title: '네트워크 연결 오류',
        description: '인터넷 연결을 확인해주세요.',
        suggestion: '연결 상태를 확인하고 다시 시도해보세요.',
        severity: 'medium',
        primaryAction: '다시 시도',
        onPrimaryAction: onRetry
      }
    }
    
    // 기본 에러
    return {
      icon: <AlertTriangle className="w-8 h-8 text-red-400" />,
      title: '데이터 로딩 실패',
      description: '리서치 데이터를 불러올 수 없습니다.',
      suggestion: '다시 시도하거나 새로운 리서치를 시작해보세요.',
      severity: 'high',
      primaryAction: '다시 시도',
      onPrimaryAction: onRetry
    }
  }

  const errorInfo = getErrorInfo(error, errorCode)

  return (
    <div className="space-y-8">
      {/* 흐린 플레이스홀더 배경 */}
      <div className="relative">
        <div className="opacity-20">
          <ResponsiveGrid
            columns={{ sm: 1, md: 2, lg: 3, xl: 3 }}
            gap="lg"
            staggerAnimation={false}
          >
            {Array.from({ length: 6 }, (_, index) => (
              <PlaceholderCard
                key={index}
                variant="research"
                animated={false}
              />
            ))}
          </ResponsiveGrid>
        </div>
        
        {/* 중앙 오버레이 에러 메시지 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-xl p-8 max-w-md mx-4 text-center">
            {/* 에러 아이콘 */}
            <div className="flex justify-center mb-4">
              {errorInfo.icon}
            </div>
            
            {/* 에러 제목 */}
            <h3 className="text-xl font-semibold text-white mb-3">
              {errorInfo.title}
            </h3>
            
            {/* 에러 설명 */}
            <p className="text-gray-300 mb-2">
              {errorInfo.description}
            </p>
            
            <p className="text-gray-400 text-sm mb-6">
              {errorInfo.suggestion}
            </p>
            
            {/* 에러별 맞춤 액션 버튼들 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={errorInfo.onPrimaryAction || onRetry}
                className="
                  inline-flex items-center justify-center gap-2 px-6 py-3 
                  bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
                  transition-all duration-200 hover:scale-105
                "
              >
                <RefreshCw size={16} />
                {errorInfo.primaryAction || '다시 시도'}
              </button>
              
              {/* 보조 액션: 새 리서치 시작 */}
              <button
                onClick={onStartNew}
                className="
                  inline-flex items-center justify-center gap-2 px-6 py-2
                  text-gray-400 hover:text-white transition-colors duration-200
                "
              >
                <Plus size={16} />
                새 리서치 시작하기
              </button>
              
              {/* 작업 목록 관련 에러일 경우 목록 새로고침 추가 버튼 */}
              {(errorCode === 'JOB_NOT_FOUND' || error.toLowerCase().includes('websocket') || 
                error.toLowerCase().includes('connection')) && (
                <button
                  onClick={onRefreshList}
                  className="
                    inline-flex items-center justify-center gap-2 px-6 py-2
                    text-blue-400 hover:text-blue-300 transition-colors duration-200
                  "
                >
                  <RefreshCw size={14} />
                  작업 목록 새로고침
                </button>
              )}
              
              {/* 도움말 및 가이드 링크 */}
              <button
                onClick={() => window.open('/guide/troubleshooting', '_blank')}
                className="
                  inline-flex items-center justify-center gap-2 px-6 py-2
                  text-gray-500 hover:text-gray-300 transition-colors duration-200
                  text-xs
                "
              >
                <HelpCircle size={14} />
                도움말
              </button>
            </div>
            
            {/* 기술적 세부사항 (개발환경) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                  기술적 세부사항 (개발용)
                </summary>
                <div className="mt-2 p-3 bg-gray-900 rounded text-xs text-gray-400 overflow-auto">
                  <code>{error}</code>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
      
      {/* 하단 추가 지원 정보 */}
      <div className="text-center text-gray-500 text-sm space-y-2">
        <p>문제가 지속되면 새로운 리서치를 시작해보세요</p>
        <div className="flex flex-wrap justify-center gap-4 text-xs mt-3 opacity-70">
          <button 
            onClick={() => window.open('/guide/research', '_blank')}
            className="hover:text-blue-400 transition-colors"
          >
            리서치 가이드
          </button>
          <button 
            onClick={() => window.open('/guide/troubleshooting', '_blank')}
            className="hover:text-blue-400 transition-colors"
          >
            문제해결 FAQ
          </button>
          <button 
            onClick={() => window.open('/contact', '_blank')}
            className="hover:text-blue-400 transition-colors"
          >
            지원 요청
          </button>
        </div>
        <p className="text-xs mt-2 opacity-50">다른 페이지는 정상적으로 이용하실 수 있습니다</p>
      </div>
    </div>
  )
}

export default GalleryErrorState