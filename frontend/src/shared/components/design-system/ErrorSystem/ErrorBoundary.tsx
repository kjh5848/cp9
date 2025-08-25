'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { ErrorBoundaryState, ExtendedErrorResponse } from './types'
import { ErrorDisplay } from './ErrorDisplay'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

/**
 * React Error Boundary 컴포넌트
 * 예상치 못한 JavaScript 에러를 포착하고 우아한 에러 UI 제공
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorResponse: undefined
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // JavaScript 에러를 표준 에러 응답 형식으로 변환
    const errorResponse: ExtendedErrorResponse = {
      error_code: 'REACT_ERROR',
      message: error.message || '예상치 못한 오류가 발생했습니다',
      details: error.stack,
      severity: 'high',
      recommended_action: 'retry',
      timestamp: new Date().toISOString(),
      ui_state: {
        isVisible: true,
        canDismiss: false,
        variant: 'page'
      },
      context: 'api-generic',
      user_friendly_title: '앱 오류'
    }

    return {
      hasError: true,
      error,
      errorResponse
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 정보 저장
    this.setState({
      errorInfo
    })

    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 사용자 정의 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 에러 리포팅 서비스로 전송 (개발 환경에서는 제외)
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // props 변경 시 에러 상태 리셋
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
      return
    }

    // resetKeys 변경 시 에러 상태 리셋
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || []
      const hasResetKeyChanged = resetKeys.some(
        (key, idx) => key !== prevResetKeys[idx]
      )
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
    }
  }

  /**
   * 에러 상태 리셋
   */
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorResponse: undefined
    })
  }

  /**
   * 페이지 새로고침
   */
  refreshPage = () => {
    window.location.reload()
  }

  /**
   * 홈으로 이동
   */
  goHome = () => {
    window.location.href = '/'
  }

  /**
   * 에러 리포트 생성
   */
  generateErrorReport = () => {
    const { error, errorInfo } = this.state
    
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      },
      errorInfo: {
        componentStack: errorInfo?.componentStack
      },
      user: {
        // 사용자 정보가 있다면 추가
        userId: localStorage.getItem('userId') || 'anonymous'
      }
    }

    const reportText = `
# 에러 리포트

**발생 시간:** ${report.timestamp}
**URL:** ${report.url}
**사용자 ID:** ${report.user.userId}

## 에러 정보
- **메시지:** ${report.error.message}
- **타입:** ${report.error.name}

## 스택 트레이스
\`\`\`
${report.error.stack}
\`\`\`

## 컴포넌트 스택
\`\`\`
${report.errorInfo.componentStack}
\`\`\`

## 환경 정보
- **브라우저:** ${report.userAgent}
    `.trim()

    // 에러 리포트를 클립보드에 복사
    navigator.clipboard.writeText(reportText).then(() => {
      alert('에러 리포트가 클립보드에 복사되었습니다.')
    })
  }

  /**
   * 에러 리포팅 서비스로 전송
   */
  private reportErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // 실제 에러 리포팅 서비스 API 호출
      fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(reportError => {
        console.warn('Failed to report error:', reportError)
      })
    } catch (reportError) {
      console.warn('Error reporting failed:', reportError)
    }
  }

  render() {
    const { hasError, errorResponse } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // 사용자 정의 fallback이 있으면 사용
      if (fallback) {
        return fallback
      }

      // 표준 에러 응답이 있으면 ErrorDisplay 사용
      if (errorResponse) {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6">
              <ErrorDisplay
                error={errorResponse}
                onRetry={this.resetErrorBoundary}
                className="mb-6"
              />

              {/* 추가 액션 버튼들 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.refreshPage}
                  className="
                    flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                    bg-blue-600 hover:bg-blue-700 text-white font-medium
                    transition-all duration-200 hover:scale-105
                  "
                >
                  <RefreshCw size={16} />
                  페이지 새로고침
                </button>

                <button
                  onClick={this.goHome}
                  className="
                    flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                    text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400
                    bg-white hover:bg-gray-50 transition-all duration-200
                  "
                >
                  <Home size={16} />
                  홈으로 이동
                </button>

                <button
                  onClick={this.generateErrorReport}
                  className="
                    flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                    text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300
                    bg-white hover:bg-gray-50 transition-all duration-200
                  "
                  title="에러 리포트 복사"
                >
                  <Bug size={16} />
                  리포트 복사
                </button>
              </div>

              {/* 개발 환경에서만 상세 정보 표시 */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <summary className="cursor-pointer text-red-800 font-medium">
                    개발자 정보 (프로덕션에서는 숨김)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="font-medium text-red-700">에러 메시지:</h4>
                      <pre className="text-sm text-red-600 bg-red-100 p-2 rounded mt-1 overflow-auto">
                        {this.state.error?.message}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700">스택 트레이스:</h4>
                      <pre className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1 overflow-auto max-h-40">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium text-red-700">컴포넌트 스택:</h4>
                        <pre className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1 overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        )
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <AlertTriangle size={48} className="text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              예상치 못한 오류가 발생했습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={this.resetErrorBoundary}
              className="
                px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                transition-colors duration-200
              "
            >
              다시 시도
            </button>
          </div>
        </div>
      )
    }

    return children
  }
}

/**
 * Hook 버전의 Error Boundary (functional component에서 사용)
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary