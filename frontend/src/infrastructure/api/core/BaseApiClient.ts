/**
 * 기본 API 클라이언트 클래스
 * 모든 도메인별 API 클라이언트의 베이스 클래스
 */

import { ApiResponse, ApiError, NetworkError, ServerError, ValidationError } from './ApiError';
import { ApiConfig } from './config';

export abstract class BaseApiClient {
  protected baseUrl: string;
  protected defaultHeaders: Headers;
  protected timeout: number;

  constructor(
    service: 'internal' | 'backend' | 'supabase' | 'external',
    customBaseUrl?: string
  ) {
    this.baseUrl = customBaseUrl || ApiConfig.getBaseUrl(service);
    this.defaultHeaders = ApiConfig.getHeaders(service);
    this.timeout = ApiConfig.getTimeout(service);
  }

  /**
   * GET 요청
   */
  public async get<T>(
    endpoint: string, 
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>('GET', url);
  }

  /**
   * POST 요청
   */
  public async post<T>(
    endpoint: string, 
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('POST', url, data, customHeaders);
  }

  /**
   * PUT 요청
   */
  public async put<T>(
    endpoint: string, 
    data?: unknown
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PUT', url, data);
  }

  /**
   * DELETE 요청
   */
  public async delete<T>(
    endpoint: string
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('DELETE', url);
  }

  /**
   * 실제 HTTP 요청 수행
   */
  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // 헤더 구성
      const headers = new Headers(this.defaultHeaders);
      if (customHeaders) {
        Object.entries(customHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
      }

      // 요청 옵션 구성
      const options: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      // POST/PUT의 경우 body 추가
      if ((method === 'POST' || method === 'PUT') && data) {
        if (data instanceof FormData) {
          options.body = data;
          // FormData의 경우 Content-Type을 브라우저가 자동 설정하도록 함
          headers.delete('Content-Type');
        } else {
          options.body = JSON.stringify(data);
          headers.set('Content-Type', 'application/json');
        }
      }

      // 요청 로깅 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${method}] ${url}`, data);
      }

      // 실제 요청 수행
      const response = await fetch(url, options);
      
      clearTimeout(timeoutId);

      // 응답 검증 및 변환
      return await this.validateResponse<T>(response);

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new NetworkError('요청 시간이 초과되었습니다.', 'TIMEOUT', 408);
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * URL 빌드
   */
  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * 응답 검증 및 변환
   */
  protected async validateResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('Content-Type') || '';
    
    // 응답 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${response.status}] ${response.url}`);
    }

    // 성공 응답 처리
    if (response.ok) {
      if (response.status === 204) {
        // No Content
        return {
          success: true,
          data: null as T,
          status: response.status,
          statusText: response.statusText
        };
      }

      if (contentType.includes('application/json')) {
        const data = await response.json();
        return {
          success: true,
          data,
          status: response.status,
          statusText: response.statusText
        };
      } else {
        const text = await response.text();
        return {
          success: true,
          data: text as T,
          status: response.status,
          statusText: response.statusText
        };
      }
    }

    // 에러 응답 처리
    let errorData: { message?: string; error_code?: string; details?: unknown } = {};
    try {
      if (contentType.includes('application/json')) {
        const jsonData = await response.json();
        errorData = typeof jsonData === 'object' && jsonData !== null ? jsonData as typeof errorData : { message: String(jsonData) };
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: response.statusText };
    }

    // 상태 코드별 에러 생성
    if (response.status >= 400 && response.status < 500) {
      if (response.status === 422) {
        throw new ValidationError(
          errorData.message || '입력 데이터가 올바르지 않습니다.',
          errorData.error_code || 'VALIDATION_ERROR',
          response.status,
          errorData.details
        );
      } else {
        throw new ApiError(
          errorData.message || '클라이언트 요청 오류입니다.',
          errorData.error_code || 'CLIENT_ERROR',
          response.status,
          errorData.details
        );
      }
    } else if (response.status >= 500) {
      throw new ServerError(
        errorData.message || '서버 내부 오류가 발생했습니다.',
        errorData.error_code || 'SERVER_ERROR',
        response.status,
        errorData.details
      );
    }

    // 기타 에러
    throw new ApiError(
      errorData.message || '알 수 없는 오류가 발생했습니다.',
      errorData.error_code || 'UNKNOWN_ERROR',
      response.status,
      errorData.details
    );
  }

  /**
   * 에러 처리
   */
  protected handleError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new NetworkError(
        '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
        'NETWORK_ERROR',
        0
      );
    }

    return new ApiError(
      error instanceof Error ? error.message : '예상치 못한 오류가 발생했습니다.',
      'UNKNOWN_ERROR',
      500
    );
  }

  /**
   * 스트리밍 응답 처리
   */
  protected async handleStreamResponse(response: Response): Promise<ReadableStream> {
    if (!response.ok) {
      throw await this.validateResponse(response);
    }

    if (!response.body) {
      throw new ServerError('스트리밍 응답에 body가 없습니다.', 'NO_STREAM_BODY', 500);
    }

    return response.body;
  }
}