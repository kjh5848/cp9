/**
 * 구조화된 로깅 시스템 모듈
 * @module Logger
 */

/**
 * 구조화된 로깅 함수 (강화됨)
 */
export function log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    service: 'ai-workflow',
    message,
    context: context || {},
    requestId: context?.threadId || 'unknown'
  };
  
  // 레벨에 따른 콘솔 출력 분리
  if (level === 'error') {
    console.error(`[🔴 ERROR] ${message}`, JSON.stringify(logEntry, null, 2));
  } else if (level === 'warn') {
    console.warn(`[🟡 WARN] ${message}`, JSON.stringify(logEntry, null, 2));
  } else {
    console.log(`[🔵 INFO] ${message}`, JSON.stringify(logEntry, null, 2));
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