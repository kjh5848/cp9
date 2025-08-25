/**
 * API 에러 클래스들
 * 모든 API 호출에서 발생할 수 있는 에러를 체계적으로 관리
 */

/**
 * API 응답 타입
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  status: number;
  statusText: string;
  message?: string;
}

/**
 * 기본 API 에러 클래스
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'API_ERROR',
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Error 객체의 프로토타입 체인 유지
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * 에러를 JSON으로 직렬화
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * 사용자 친화적 메시지 반환
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'NETWORK_ERROR':
        return '네트워크 연결을 확인해주세요.';
      case 'TIMEOUT':
        return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
      case 'VALIDATION_ERROR':
        return '입력한 정보를 다시 확인해주세요.';
      case 'SERVER_ERROR':
        return '서버에 일시적인 문제가 발생했습니다.';
      case 'AUTHENTICATION_ERROR':
        return '로그인이 필요합니다.';
      case 'AUTHORIZATION_ERROR':
        return '이 작업을 수행할 권한이 없습니다.';
      case 'RATE_LIMIT_ERROR':
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      default:
        return this.message || '알 수 없는 오류가 발생했습니다.';
    }
  }
}

/**
 * 네트워크 관련 에러
 */
export class NetworkError extends ApiError {
  constructor(
    message: string = '네트워크 연결에 문제가 있습니다.',
    code: string = 'NETWORK_ERROR',
    statusCode: number = 0,
    details?: unknown
  ) {
    super(message, code, statusCode, details);
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * 유효성 검사 에러 (400, 422)
 */
export class ValidationError extends ApiError {
  constructor(
    message: string = '입력 데이터가 올바르지 않습니다.',
    code: string = 'VALIDATION_ERROR',
    statusCode: number = 422,
    details?: unknown
  ) {
    super(message, code, statusCode, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 인증 에러 (401)
 */
export class AuthenticationError extends ApiError {
  constructor(
    message: string = '인증이 필요합니다.',
    code: string = 'AUTHENTICATION_ERROR',
    statusCode: number = 401,
    details?: unknown
  ) {
    super(message, code, statusCode, details);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * 인가 에러 (403)
 */
export class AuthorizationError extends ApiError {
  constructor(
    message: string = '이 작업을 수행할 권한이 없습니다.',
    code: string = 'AUTHORIZATION_ERROR',
    statusCode: number = 403,
    details?: unknown
  ) {
    super(message, code, statusCode, details);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * 리소스를 찾을 수 없음 (404)
 */
export class NotFoundError extends ApiError {
  constructor(
    message: string = '요청한 리소스를 찾을 수 없습니다.',
    code: string = 'NOT_FOUND_ERROR',
    statusCode: number = 404,
    details?: unknown
  ) {
    super(message, code, statusCode, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 요청 제한 에러 (429)
 */
export class RateLimitError extends ApiError {
  constructor(
    message: string = '요청이 너무 많습니다.',
    code: string = 'RATE_LIMIT_ERROR',
    statusCode: number = 429,
    details?: unknown
  ) {
    super(message, code, statusCode, details);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * 서버 에러 (500+)
 */
export class ServerError extends ApiError {
  constructor(
    message: string = '서버 내부 오류가 발생했습니다.',
    code: string = 'SERVER_ERROR',
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message, code, statusCode, details);
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * 타임아웃 에러
 */
export class TimeoutError extends NetworkError {
  constructor(
    message: string = '요청 시간이 초과되었습니다.',
    code: string = 'TIMEOUT',
    statusCode: number = 408,
    details?: unknown
  ) {
    super(message, code, statusCode, details);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * 에러 타입 가드 함수들
 */
export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAuthenticationError = (error: unknown): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isAuthorizationError = (error: unknown): error is AuthorizationError => {
  return error instanceof AuthorizationError;
};

export const isNotFoundError = (error: unknown): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isRateLimitError = (error: unknown): error is RateLimitError => {
  return error instanceof RateLimitError;
};

export const isServerError = (error: unknown): error is ServerError => {
  return error instanceof ServerError;
};

export const isTimeoutError = (error: unknown): error is TimeoutError => {
  return error instanceof TimeoutError;
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

/**
 * 에러 핸들링 유틸리티
 */
export class ErrorHandler {
  /**
   * 에러에 따른 권장 액션 반환
   */
  static getRecommendedAction(error: ApiError): 'retry' | 'retry_later' | 'check_input' | 'contact_support' | 'login' | 'no_action' {
    if (isNetworkError(error) || isTimeoutError(error)) {
      return 'retry';
    }
    
    if (isRateLimitError(error) || isServerError(error)) {
      return 'retry_later';
    }
    
    if (isValidationError(error)) {
      return 'check_input';
    }
    
    if (isAuthenticationError(error)) {
      return 'login';
    }
    
    if (isAuthorizationError(error) || isNotFoundError(error)) {
      return 'no_action';
    }
    
    return 'contact_support';
  }

  /**
   * 재시도 권장 시간 반환 (초)
   */
  static getRetryDelay(error: ApiError): number {
    if (isRateLimitError(error)) {
      return 60; // 1분
    }
    
    if (isServerError(error)) {
      return 30; // 30초
    }
    
    if (isNetworkError(error) || isTimeoutError(error)) {
      return 5; // 5초
    }
    
    return 0;
  }

  /**
   * 심각도 반환
   */
  static getSeverity(error: ApiError): 'low' | 'medium' | 'high' | 'critical' {
    if (isValidationError(error) || isNotFoundError(error)) {
      return 'low';
    }
    
    if (isAuthenticationError(error) || isAuthorizationError(error)) {
      return 'medium';
    }
    
    if (isRateLimitError(error) || isNetworkError(error)) {
      return 'high';
    }
    
    if (isServerError(error)) {
      return 'critical';
    }
    
    return 'medium';
  }
}