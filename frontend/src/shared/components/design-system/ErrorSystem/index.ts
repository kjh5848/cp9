/**
 * ErrorSystem - 통합 에러 처리 시스템
 * 
 * 백엔드 표준을 준수하는 체계적인 에러 처리와 사용자 경험 제공
 * - StandardErrorResponse 타입 준수
 * - 심각도별 UI 차별화
 * - 권장 액션 버튼 제공
 * - 빈 상태와 에러 상태 명확한 구분
 * - React Error Boundary 통합
 */

// Core Components
export { ErrorDisplay } from './ErrorDisplay'
export { EmptyState, emptyStatePresets } from './EmptyState'
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary'

// Types
export type {
  StandardErrorResponse,
  ErrorUIState,
  ExtendedErrorResponse,
  ErrorHandlingOptions,
  ErrorMetrics,
  ErrorBoundaryState,
  UseErrorReturn,
  EmptyStateConfig,
  ErrorSeverityConfig,
  ErrorActionConfig,
  ErrorContext,
  SEOErrorCode,
  ProductResearchErrorCode,
  CommonErrorCode,
  APIErrorCode
} from './types'

// Re-export common patterns
import { ErrorDisplay } from './ErrorDisplay';
import { EmptyState } from './EmptyState';
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

export const ErrorSystemComponents = {
  ErrorDisplay,
  EmptyState,
  ErrorBoundary,
  withErrorBoundary
} as const

// Utility functions for error handling
export const ErrorUtils = {
  /**
   * API 에러를 표준 에러 응답으로 변환
   */
  createErrorResponse: (
    error: any,
    context?: import('./types').ErrorContext
  ): import('./types').ExtendedErrorResponse => {
    return {
      error_code: error.error_code || 'INTERNAL_SERVER_ERROR',
      message: error.message || '알 수 없는 오류가 발생했습니다',
      details: error.details,
      severity: error.severity || 'medium',
      recommended_action: error.recommended_action || 'retry',
      retry_after: error.retry_after,
      metadata: error.metadata,
      request_id: error.request_id,
      timestamp: error.timestamp || new Date().toISOString(),
      ui_state: {
        isVisible: true,
        canDismiss: true,
        variant: 'toast',
        ...error.ui_state
      },
      context: context || 'api-generic',
      user_friendly_title: error.user_friendly_title
    }
  },

  /**
   * 에러가 실제 에러인지 빈 상태인지 구분
   */
  isEmptyState: (error: any): boolean => {
    if (!error) return false
    
    const emptyStateIndicators = [
      'NO_DATA_FOUND',
      'EMPTY_RESULT',
      'NO_RESEARCH_DATA'
    ]
    
    return emptyStateIndicators.includes(error.error_code)
  },

  /**
   * 에러 심각도에 따른 우선순위 반환
   */
  getErrorPriority: (severity: import('./types').ExtendedErrorResponse['severity']): number => {
    const priorities: Record<import('./types').ExtendedErrorResponse['severity'], number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    }
    return priorities[severity] || 2
  }
} as const