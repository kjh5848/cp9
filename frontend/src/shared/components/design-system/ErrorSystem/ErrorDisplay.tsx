'use client'

import React from 'react'
import { AlertTriangle, AlertCircle, Info, XCircle, RefreshCw, ExternalLink, Mail } from 'lucide-react'
import { ExtendedErrorResponse, ErrorSeverityConfig, ErrorActionConfig } from './types'
import { colors } from '@/shared/design-tokens/colors'
import { animations } from '@/shared/design-tokens/animations'

interface ErrorDisplayProps {
  error: ExtendedErrorResponse
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

/**
 * 표준화된 에러 표시 컴포넌트
 * 백엔드 에러 응답 표준을 준수하고 심각도별 UI를 제공
 */
export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '' 
}: ErrorDisplayProps) {
  const severityConfig = getSeverityConfig(error.severity)
  const actionConfig = getActionConfig(error.recommended_action, onRetry)

  return (
    <div 
      className={`
        rounded-lg border p-4 space-y-3 animate-fadeInUp
        ${severityConfig.bgColor} ${severityConfig.borderColor} ${className}
      `}
      style={{
        animation: `${animations.keyframes.fadeInUp} ${animations.duration.normal} ${animations.easing.easeOut}`
      }}
      role="alert"
      aria-live={error.severity === 'critical' ? 'assertive' : 'polite'}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${severityConfig.color}`}>
            {getSeverityIcon(error.severity)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium ${severityConfig.color}`}>
              {error.user_friendly_title || getDefaultTitle(error.severity)}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {error.message}
            </p>
            
            {error.details && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  기술적 세부사항
                </summary>
                <p className="text-xs text-gray-500 mt-1 pl-4 font-mono">
                  {error.details}
                </p>
              </details>
            )}
          </div>
        </div>
        
        {error.ui_state?.canDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="에러 메시지 닫기"
          >
            <XCircle size={18} />
          </button>
        )}
      </div>

      {/* Actions */}
      {actionConfig && (
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={actionConfig.action}
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200 hover:scale-105
              ${getActionButtonStyle(actionConfig.variant, error.severity)}
            `}
          >
            {actionConfig.icon}
            {actionConfig.label}
          </button>

          {error.help_url && (
            <a
              href={error.help_url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400
                transition-all duration-200 hover:scale-105
              "
            >
              <ExternalLink size={14} />
              도움말
            </a>
          )}
        </div>
      )}

      {/* Retry Timer */}
      {error.retry_after && (
        <div className="text-xs text-gray-500">
          {error.retry_after}초 후 다시 시도할 수 있습니다
        </div>
      )}

      {/* Request ID */}
      {error.request_id && (
        <div className="text-xs text-gray-400 font-mono pt-2 border-t border-gray-200">
          요청 ID: {error.request_id}
        </div>
      )}
    </div>
  )
}

/**
 * 심각도별 설정 반환
 */
function getSeverityConfig(severity: ExtendedErrorResponse['severity']): ErrorSeverityConfig {
  const configs: Record<ExtendedErrorResponse['severity'], ErrorSeverityConfig> = {
    low: {
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: 'info',
      priority: 1
    },
    medium: {
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20', 
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      icon: 'warning',
      priority: 2
    },
    high: {
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800', 
      icon: 'alert',
      priority: 3
    },
    critical: {
      color: 'text-red-700',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: 'error',
      priority: 4
    }
  }

  return configs[severity]
}

/**
 * 심각도별 아이콘 반환
 */
function getSeverityIcon(severity: ExtendedErrorResponse['severity']) {
  const iconProps = { size: 20, className: 'flex-shrink-0' }
  
  switch (severity) {
    case 'low':
      return <Info {...iconProps} />
    case 'medium':
      return <AlertCircle {...iconProps} />
    case 'high':
      return <AlertTriangle {...iconProps} />
    case 'critical':
      return <XCircle {...iconProps} />
    default:
      return <AlertCircle {...iconProps} />
  }
}

/**
 * 권장 액션별 설정 반환
 */
function getActionConfig(
  action: ExtendedErrorResponse['recommended_action'], 
  onRetry?: () => void
): ErrorActionConfig | null {
  switch (action) {
    case 'retry':
      return {
        label: '다시 시도',
        icon: <RefreshCw size={14} />,
        action: onRetry,
        variant: 'primary'
      }
    case 'check_input':
      return {
        label: '입력값 확인',
        icon: <AlertCircle size={14} />,
        variant: 'secondary'
      }
    case 'contact_support':
      return {
        label: '지원팀 문의',
        icon: <Mail size={14} />,
        action: () => window.open('mailto:support@cp9.co.kr', '_blank'),
        variant: 'secondary'
      }
    case 'retry_later':
      return {
        label: '나중에 다시 시도',
        icon: <RefreshCw size={14} />,
        variant: 'ghost'
      }
    case 'no_action':
    default:
      return null
  }
}

/**
 * 기본 제목 반환
 */
function getDefaultTitle(severity: ExtendedErrorResponse['severity']): string {
  const titles = {
    low: '알림',
    medium: '주의',
    high: '경고', 
    critical: '심각한 오류'
  }
  
  return titles[severity]
}

/**
 * 액션 버튼 스타일 반환
 */
function getActionButtonStyle(
  variant: ErrorActionConfig['variant'], 
  severity: ExtendedErrorResponse['severity']
): string {
  const severityColors = {
    low: 'blue',
    medium: 'yellow',
    high: 'orange', 
    critical: 'red'
  }
  
  const color = severityColors[severity]
  
  switch (variant) {
    case 'primary':
      return `bg-${color}-600 text-white hover:bg-${color}-700 shadow-sm`
    case 'secondary':
      return `bg-${color}-100 text-${color}-700 hover:bg-${color}-200 border border-${color}-300`
    case 'ghost':
      return `text-${color}-600 hover:bg-${color}-50 border border-transparent hover:border-${color}-300`
    default:
      return `bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300`
  }
}

export default ErrorDisplay