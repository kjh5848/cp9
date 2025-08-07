/**
 * 공유 로깅 유틸리티
 * @module Logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  service: string;
}

/**
 * 구조화된 로깅 함수
 */
export function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  // 개발 환경에서만 로깅
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const timestamp = new Date().toISOString();
  const logEntry: LogEntry = {
    timestamp,
    level: level.toUpperCase() as LogLevel,
    service: 'cp9-frontend',
    message,
    context: context || {},
  };
  
  // 레벨에 따른 콘솔 출력
  const formattedMessage = `[${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'error':
      console.error(formattedMessage, context || '');
      break;
    case 'warn':
      console.warn(formattedMessage, context || '');
      break;
    case 'info':
      console.info(formattedMessage, context || '');
      break;
    case 'debug':
      console.debug(formattedMessage, context || '');
      break;
    default:
      console.log(formattedMessage, context || '');
  }
}

/**
 * 에러 처리 래퍼 함수
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  fallback?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    log('error', `${operationName} 실패`, {
      error: error instanceof Error ? error.message : String(error),
      operation: operationName,
    });
    
    if (fallback !== undefined) {
      log('warn', `${operationName} 실패, 기본값 사용`, { operation: operationName });
      return fallback;
    }
    
    throw error;
  }
}