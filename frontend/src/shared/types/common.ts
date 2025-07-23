/**
 * 기본 API 응답 타입
 */
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 페이지네이션 정보 타입
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 페이지네이션이 포함된 응답 타입
 */
export interface PaginatedResponse<T> extends BaseApiResponse<T[]> {
  pagination?: PaginationInfo;
}

/**
 * 정렬 방향 타입
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 정렬 옵션 타입
 */
export interface SortOption<T = string> {
  field: T;
  direction: SortDirection;
}

/**
 * 필터 조건 기본 타입
 */
export interface BaseFilter {
  [key: string]: unknown;
}

/**
 * 검색 조건 타입
 */
export interface SearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sort?: SortOption;
  filters?: BaseFilter;
}

/**
 * 로딩 상태 타입
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 에러 정보 타입
 */
export interface ErrorInfo {
  code?: string;
  message: string;
  details?: unknown;
} 