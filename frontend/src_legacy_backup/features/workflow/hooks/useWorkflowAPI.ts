/**
 * Workflow Feature - API 호출 전용 훅
 * @module WorkflowAPI
 */

'use client';

import { useCallback } from 'react';
import { log } from '@/shared/lib/logger';

export interface WorkflowAPIParams {
  urls?: string[];
  productIds?: string[];
  keyword?: string;
  config?: {
    enablePerplexity?: boolean;
    enableWordPress?: boolean;
    maxProducts?: number;
    realtimeEnabled?: boolean;
  };
}

export interface WorkflowAPIResponse {
  success: boolean;
  data?: {
    threadId: string;
    workflow: any;
    metadata: {
      createdAt: number;
      updatedAt: number;
      currentNode: string;
      completedNodes: string[];
      executionTime: number;
    };
  };
  error?: string;
  message: string;
}

/**
 * Workflow API 호출 전용 훅
 */
export function useWorkflowAPI() {
  const executeWorkflow = useCallback(async (params: WorkflowAPIParams): Promise<WorkflowAPIResponse> => {
    try {
      log('info', '[Workflow API] 워크플로우 실행 시작', params);

      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute',
          urls: params.urls,
          productIds: params.productIds,
          keyword: params.keyword,
          config: params.config,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`워크플로우 API 오류: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      log('info', '[Workflow API] 워크플로우 실행 완료', { success: result.success });
      
      // 백엔드에서 실패한 경우 구체적인 오류 메시지 전달
      if (!result.success) {
        const errorMessage = result.error || result.message || '워크플로우 실행 실패';
        throw new Error(errorMessage);
      }
      
      return result;
    } catch (error) {
      log('error', '[Workflow API] 워크플로우 실행 실패', { error: String(error) });
      throw error;
    }
  }, []);

  const getWorkflowStatus = useCallback(async (threadId: string): Promise<any> => {
    try {
      const response = await fetch(`/api/workflow/status/${threadId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`워크플로우 상태 조회 오류: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log('error', '[Workflow API] 워크플로우 상태 조회 실패', { error: String(error) });
      throw error;
    }
  }, []);

  const generateSEOContent = useCallback(async (query: string, urls: string[]): Promise<any> => {
    try {
      log('info', '[Workflow API] SEO 콘텐츠 생성 시작', { query, urlCount: urls.length });

      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute',
          urls,
          keyword: query,
          config: {
            enablePerplexity: true,
            enableWordPress: false,
            maxProducts: 5,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SEO 생성 API 오류: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.workflow?.seoAgent) {
        return result.data.workflow.seoAgent;
      }

      // 백엔드에서 온 구체적인 오류 메시지 사용
      const errorMessage = result.error || result.message || 'SEO 콘텐츠 생성 실패';
      throw new Error(errorMessage);
    } catch (error) {
      log('error', '[Workflow API] SEO 콘텐츠 생성 실패', { error: String(error) });
      throw error;
    }
  }, []);

  return {
    executeWorkflow,
    getWorkflowStatus,
    generateSEOContent,
  };
}