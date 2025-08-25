/**
 * 에러 시스템 타입 정의
 * 백엔드 SHARED_ERROR_HANDLING_GUIDE.md와 완전 일치
 */

import React from 'react';

// 백엔드와 동일한 표준 에러 응답 구조
export interface StandardErrorResponse {
  error_code: string;
  message: string;
  details?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommended_action: 'no_action' | 'retry' | 'check_input' | 'contact_support' | 'retry_later';
  retry_after?: number;
  metadata?: Record<string, any>;
  request_id?: string;
  timestamp: string;
}

// 프론트엔드 전용 에러 UI 상태
export interface ErrorUIState {
  isVisible: boolean;
  canDismiss: boolean;
  autoHide?: number; // ms
  position?: 'top' | 'bottom' | 'center';
  variant?: 'toast' | 'modal' | 'inline' | 'page';
}

// SEO 생성 에러 코드 (백엔드와 동일)
export type SEOErrorCode = 
  | 'SEO_GENERATION_FAILED'
  | 'CONTENT_LENGTH_EXCEEDED'
  | 'KEYWORD_VALIDATION_FAILED'
  | 'SEO_TEMPLATE_NOT_FOUND'
  | 'GPT_API_ERROR'
  | 'GPT_API_TIMEOUT'
  | 'GPT_API_QUOTA_EXCEEDED'
  | 'GPT_CONTENT_POLICY_VIOLATION'
  | 'GPT_TOKEN_LIMIT_EXCEEDED';

// Product Research 에러 코드 (백엔드와 동일)
export type ProductResearchErrorCode = 
  | 'VALIDATION_ERROR'
  | 'BATCH_SIZE_EXCEEDED'
  | 'JOB_NOT_FOUND'
  | 'PERPLEXITY_API_ERROR'
  | 'COUPANG_DATA_UNAVAILABLE'
  | 'COUPANG_PARTIAL_DATA';

// 공통 에러 코드 (백엔드와 동일)
export type CommonErrorCode = 
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
  | 'EXTERNAL_API_ERROR';

// 통합 에러 코드 타입
export type APIErrorCode = SEOErrorCode | ProductResearchErrorCode | CommonErrorCode;

// 에러 심각도별 UI 설정
export interface ErrorSeverityConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  priority: number; // 높을수록 우선순위 높음
}

// 권장 액션별 UI 설정
export interface ErrorActionConfig {
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  variant: 'primary' | 'secondary' | 'ghost';
  href?: string;
}

// Empty State 전용 타입
export interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  showGuide?: boolean;
  guideSteps?: string[];
}

// 에러 컨텍스트 타입 (어떤 화면/기능에서 발생한 에러인지)
export type ErrorContext = 
  | 'research-data'
  | 'product-search'
  | 'seo-generation'
  | 'authentication'
  | 'file-upload'
  | 'api-generic';

// 프론트엔드 확장 에러 타입
export interface ExtendedErrorResponse extends StandardErrorResponse {
  // 프론트엔드 전용 필드
  ui_state?: ErrorUIState;
  context?: ErrorContext;
  user_friendly_title?: string;
  help_url?: string;
  screenshot_url?: string; // 버그 리포트용
}

// 에러 처리 옵션
export interface ErrorHandlingOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  fallbackToEmpty?: boolean;
  retryable?: boolean;
  maxRetries?: number;
}

// 에러 통계 추적용
export interface ErrorMetrics {
  error_code: string;
  context: ErrorContext;
  user_id?: string;
  session_id?: string;
  timestamp: number;
  resolved: boolean;
  resolution_time?: number;
}

// React Error Boundary 타입
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  errorResponse?: ExtendedErrorResponse;
}

// 에러 상태 관리용 훅 반환 타입
export interface UseErrorReturn {
  error: ExtendedErrorResponse | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: any, options?: ErrorHandlingOptions) => void;
  retryAction?: () => void;
  metrics: ErrorMetrics | null;
}