/**
 * Research API 클라이언트
 * 리서치 시스템의 모든 API 호출을 담당
 */

import { BaseApiClient } from '../core/BaseApiClient';
import { ApiConfig } from '../core/config';
import type {
  ProductItemRequest,
  ResearchCreateRequest,
  ResearchCreateResponse,
  ResearchStatusResponse,
  ResearchResultsResponse,
  SessionListParams,
  SessionListResponse,
  SessionDetailResponse,
  ResearchCancelResponse,
} from '../types/research';

export class ResearchApiClient extends BaseApiClient {
  constructor() {
    // 백엔드 Python API 직접 연동
    super('backend');
  }

  /**
   * 쿠팡 즉시 리턴 리서치 생성
   * 백엔드 API 직접 호출
   */
  async createResearchWithCoupangPreview(
    items: ProductItemRequest[]
  ): Promise<ResearchCreateResponse> {
    const request: ResearchCreateRequest = {
      items,
      return_coupang_preview: true,
      priority: 5,
    };

    console.log('[ResearchApiClient] 쿠팡 즉시 리턴 리서치 생성:', {
      itemsCount: items.length,
      return_coupang_preview: true,
      endpoint: ApiConfig.ENDPOINTS.BACKEND.RESEARCH_PRODUCTS
    });

    // return_coupang_preview=true 쿼리 파라미터와 함께 백엔드 API 호출
    const url = `${ApiConfig.ENDPOINTS.BACKEND.RESEARCH_PRODUCTS}?return_coupang_preview=true`;
    const response = await this.post<ResearchCreateResponse>(url, request);
    return response.data;
  }

  /**
   * 일반 리서치 생성
   */
  async createResearch(
    items: ProductItemRequest[],
    options?: {
      title?: string;
      description?: string;
      analysis_type?: 'research_only' | 'full_analysis';
    }
  ): Promise<ResearchCreateResponse> {
    const request: ResearchCreateRequest = {
      items,
      return_coupang_preview: false,
      priority: options?.analysis_type === 'full_analysis' ? 5 : 3,
    };

    console.log('[ResearchApiClient] 일반 리서치 생성:', {
      itemsCount: items.length,
      priority: request.priority,
      endpoint: ApiConfig.ENDPOINTS.BACKEND.RESEARCH_PRODUCTS
    });

    // 백엔드 API 직접 호출
    const response = await this.post<ResearchCreateResponse>(
      ApiConfig.ENDPOINTS.BACKEND.RESEARCH_PRODUCTS,
      request
    );

    return response.data;
  }

  /**
   * 리서치 상태 조회
   */
  async getResearchStatus(jobId: string): Promise<ResearchStatusResponse> {
    console.log('[ResearchApiClient] 리서치 상태 조회:', {
      jobId,
      endpoint: ApiConfig.ENDPOINTS.BACKEND.RESEARCH_STATUS(jobId)
    });

    const response = await this.get<ResearchStatusResponse>(
      ApiConfig.ENDPOINTS.BACKEND.RESEARCH_STATUS(jobId)
    );

    return response.data;
  }

  /**
   * 리서치 결과 조회
   */
  async getResearchResults(jobId: string): Promise<ResearchResultsResponse> {
    console.log('[ResearchApiClient] 리서치 결과 조회:', {
      jobId,
      endpoint: ApiConfig.ENDPOINTS.BACKEND.RESEARCH_RESULTS(jobId)
    });

    const response = await this.get<ResearchResultsResponse>(
      ApiConfig.ENDPOINTS.BACKEND.RESEARCH_RESULTS(jobId)
    );

    return response.data;
  }

  /**
   * 리서치 취소
   */
  async cancelResearch(jobId: string): Promise<ResearchCancelResponse> {
    console.log('[ResearchApiClient] 리서치 취소:', {
      jobId,
      endpoint: ApiConfig.ENDPOINTS.BACKEND.RESEARCH_CANCEL(jobId)
    });

    const response = await this.delete<ResearchCancelResponse>(
      ApiConfig.ENDPOINTS.BACKEND.RESEARCH_CANCEL(jobId)
    );

    return response.data;
  }

  /**
   * 리서치 세션 목록 조회
   */
  async getResearchSessions(
    params: SessionListParams = {}
  ): Promise<SessionListResponse> {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 20,
      sort: params.sort || 'created_at',
      order: params.order || 'desc',
      ...(params.status_filter && { status: params.status_filter }),
      ...(params.search && { search: params.search }),
    };

    console.log('[ResearchApiClient] 리서치 세션 목록 조회:', queryParams);

    const response = await this.get<SessionListResponse>(
      ApiConfig.ENDPOINTS.RESEARCH.SESSIONS,
      queryParams
    );

    return response.data;
  }

  /**
   * 특정 리서치 세션 조회
   */
  async getResearchSession(sessionId: string): Promise<SessionDetailResponse> {
    console.log('[ResearchApiClient] 리서치 세션 상세 조회:', { sessionId });

    const response = await this.get<SessionDetailResponse>(
      ApiConfig.ENDPOINTS.RESEARCH.SESSION_BY_ID(sessionId)
    );

    return response.data;
  }

  /**
   * 새로운 리서치 세션 생성
   */
  async createResearchSession(sessionData: {
    title?: string;
    description?: string;
    analysis_type?: 'research_only' | 'full_analysis';
  }): Promise<any> {
    console.log('[ResearchApiClient] 새 리서치 세션 생성:', sessionData);

    const response = await this.post<any>(
      ApiConfig.ENDPOINTS.RESEARCH.SESSIONS,
      sessionData
    );

    return response.data;
  }

  /**
   * 리서치 결과 조회 (일반적인 결과 조회)
   */
  async getResearchResultsGeneral(params: {
    sessionId?: string;
    jobId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    console.log('[ResearchApiClient] 일반 리서치 결과 조회:', params);

    const response = await this.post<any>(
      ApiConfig.ENDPOINTS.RESEARCH.RESULTS,
      params
    );

    return response.data;
  }

  /**
   * WebSocket 연결을 위한 URL 생성
   */
  getWebSocketUrl(jobId: string): string {
    const backendUrl = ApiConfig.getBaseUrl('backend');
    const wsUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    return `${wsUrl}${ApiConfig.ENDPOINTS.BACKEND.WEBSOCKET_RESEARCH(jobId)}`;
  }

}