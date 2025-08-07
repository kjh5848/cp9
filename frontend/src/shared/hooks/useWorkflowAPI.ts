'use client';

import { useCallback } from 'react';

/**
 * 워크플로우 API 호출 전용 훅
 * 순수한 API 호출만 담당하고 상태 관리는 하지 않음
 */

export interface WorkflowAPIParams {
  urls?: string[];
  productIds?: string[];
  keyword?: string;
  config?: {
    enablePerplexity?: boolean;
    enableWordPress?: boolean;
    maxProducts?: number;
  };
}

/**
 * 상품 정보 인터페이스
 */
export interface ProductInfo {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryName: string;
  rating: number;
  reviewCount: number;
  description: string;
  specifications: Record<string, string>;
  enrichedFeatures: string[];
  enrichedBenefits: string[];
  enrichedTargetAudience: string;
  enrichedComparison: string;
  enrichedRecommendations: string[];
}

/**
 * AI 조사 결과 요약 인터페이스
 */
export interface ResearchSummary {
  totalProducts: number;
  keyword: string;
  avgPrice: number;
  avgRating: number;
  rocketDeliveryRate: number;
  researchMethod: string;
}

export interface WorkflowAPIResponse {
  success: boolean;
  data?: {
    threadId: string;
    workflow: {
      extractIds: {
        productIds: string[];
        urls: string[];
      };
      aiProductResearch: {
        enrichedData: ProductInfo[];
        researchSummary: ResearchSummary;
      };
      seoAgent: {
        title: string;
        content: string;
        keywords: string[];
        summary: string;
      };
      wordpressPublisher: {
        postId: string;
        postUrl: string;
        status: string;
      };
    };
    metadata: {
      createdAt: number;
      updatedAt: number;
      executionTime: number;
      currentNode: string;
      completedNodes: string[];
    };
  };
  error?: string;
  message: string;
}

export function useWorkflowAPI() {
  /**
   * 워크플로우 실행 API 호출
   */
  const executeWorkflow = useCallback(async (
    params: WorkflowAPIParams
  ): Promise<WorkflowAPIResponse> => {
    const response = await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'execute',
        ...params
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data;
  }, []);

  /**
   * 워크플로우 상태 조회 API 호출
   */
  const getWorkflowStatus = useCallback(async (
    threadId: string
  ): Promise<WorkflowAPIResponse> => {
    const response = await fetch(`/api/workflow?threadId=${threadId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data;
  }, []);

  /**
   * 워크플로우 테스트 API 호출
   */
  const testWorkflow = useCallback(async (
    params: Partial<WorkflowAPIParams> = {}
  ): Promise<WorkflowAPIResponse> => {
    const response = await fetch('/api/test-perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testMode: 'full_workflow',
        keyword: params.keyword || '무선 이어폰',
        ...params
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data;
  }, []);

  return {
    executeWorkflow,
    getWorkflowStatus,
    testWorkflow,
  };
}