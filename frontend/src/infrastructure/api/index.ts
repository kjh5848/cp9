/**
 * API 클라이언트 통합 export
 * 모든 API 클라이언트를 여기서 관리하고 export
 */

// Core
export { BaseApiClient } from './core/BaseApiClient';
export { ApiConfig } from './core/config';
export * from './core/ApiError';

// Types
export type * from './types/product';
export type * from './types/research';
export type * from './types/langgraph';

// Clients
export { ProductApiClient } from './clients/ProductApiClient';
export { ResearchApiClient } from './clients/ResearchApiClient';
export { LangGraphApiClient } from './clients/LangGraphApiClient';

// Import for use in class
import { ProductApiClient } from './clients/ProductApiClient';
import { ResearchApiClient } from './clients/ResearchApiClient';
import { LangGraphApiClient } from './clients/LangGraphApiClient';

/**
 * 통합 API 클라이언트 인스턴스
 * 싱글톤 패턴으로 관리
 */
class ApiClients {
  private static _instance: ApiClients;
  
  private _product: ProductApiClient | null = null;
  private _research: ResearchApiClient | null = null;
  private _langgraph: LangGraphApiClient | null = null;

  private constructor() {}

  static getInstance(): ApiClients {
    if (!ApiClients._instance) {
      ApiClients._instance = new ApiClients();
    }
    return ApiClients._instance;
  }

  get product(): ProductApiClient {
    if (!this._product) {
      this._product = new ProductApiClient();
    }
    return this._product;
  }

  get research(): ResearchApiClient {
    if (!this._research) {
      this._research = new ResearchApiClient();
    }
    return this._research;
  }

  get langgraph(): LangGraphApiClient {
    if (!this._langgraph) {
      this._langgraph = new LangGraphApiClient();
    }
    return this._langgraph;
  }

  /**
   * 모든 클라이언트 인스턴스 재설정
   */
  reset() {
    this._product = null;
    this._research = null;
    this._langgraph = null;
  }
}

/**
 * 전역 API 클라이언트 인스턴스
 * 사용 예시: 
 * import { apiClients } from '@/infrastructure/api';
 * const result = await apiClients.research.createResearchWithCoupangPreview(items);
 */
export const apiClients = ApiClients.getInstance();

/**
 * 개별 API 클라이언트 인스턴스 (호환성을 위한)
 */
export const productApi = apiClients.product;
export const researchApi = apiClients.research;
export const langgraphApi = apiClients.langgraph;