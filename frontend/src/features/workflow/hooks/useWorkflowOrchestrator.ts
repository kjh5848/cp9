/**
 * Workflow Feature - 워크플로우 통합 관리 훅
 * @module WorkflowOrchestrator
 */

'use client';

import { useCallback } from 'react';
import { log } from '@/shared/lib/logger';
import { useWorkflowAPI } from './useWorkflowAPI';
import { useWorkflowState } from './useWorkflowState';
import { useRealtimeStatus } from './useRealtimeStatus';

export interface WorkflowOrchestratorParams {
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

/**
 * Workflow 통합 관리 훅 (오케스트레이터)
 */
export function useWorkflowOrchestrator() {
  const workflowAPI = useWorkflowAPI();
  const {
    workflowState,
    updateState,
    setRunning,
    setProgress,
    setCompleted,
    setFailed,
    reset,
    isLoading,
    isCompleted,
    isFailed,
    hasResult,
  } = useWorkflowState();

  // 실시간 상태 업데이트 핸들러
  const handleRealtimeUpdate = useCallback((update: any) => {
    log('debug', '[Workflow Orchestrator] 실시간 업데이트 수신', update);
    
    setProgress(
      update.progress || 0,
      update.currentNode,
      update.completedNodes || []
    );

    if (update.status === 'completed' && update.result) {
      setCompleted(update.result, update.message);
    } else if (update.status === 'failed' && update.error) {
      setFailed(update.error, update.message);
    }
  }, [setProgress, setCompleted, setFailed]);

  const realtimeStatus = useRealtimeStatus(
    workflowState.threadId,
    {
      enabled: isLoading,
      pollingInterval: 2000,
      maxRetries: 3,
    },
    handleRealtimeUpdate
  );

  const executeWorkflow = useCallback(async (params: WorkflowOrchestratorParams) => {
    try {
      log('info', '[Workflow Orchestrator] 워크플로우 실행 시작', params);
      
      // 상태 초기화
      reset();
      
      // API 호출
      const response = await workflowAPI.executeWorkflow(params);
      
      if (response.success && response.data) {
        const { threadId, metadata } = response.data;
        
        // 실행 중 상태로 설정
        setRunning(threadId, metadata.currentNode);
        
        // 실시간 업데이트가 활성화된 경우 폴링 시작
        if (params.config?.realtimeEnabled) {
          log('info', '[Workflow Orchestrator] 실시간 업데이트 시작', { threadId });
        } else {
          // 실시간이 비활성화된 경우 완료 처리
          setCompleted(response.data, response.message);
        }
        
        return response;
      } else {
        throw new Error(response.error || '워크플로우 실행 실패');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log('error', '[Workflow Orchestrator] 워크플로우 실행 실패', { error: errorMessage });
      setFailed(errorMessage);
      throw error;
    }
  }, [workflowAPI, reset, setRunning, setCompleted, setFailed]);

  const generateSEOContent = useCallback(async (query: string, urls: string[]) => {
    try {
      log('info', '[Workflow Orchestrator] SEO 콘텐츠 생성 시작', { query, urlCount: urls.length });
      
      const seoContent = await workflowAPI.generateSEOContent(query, urls);
      
      log('info', '[Workflow Orchestrator] SEO 콘텐츠 생성 완료', {
        title: seoContent.title,
        contentLength: seoContent.content?.length || 0,
      });
      
      return seoContent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log('error', '[Workflow Orchestrator] SEO 콘텐츠 생성 실패', { error: errorMessage });
      throw error;
    }
  }, [workflowAPI]);

  const getWorkflowStatus = useCallback(async (threadId: string) => {
    try {
      const status = await workflowAPI.getWorkflowStatus(threadId);
      
      // 상태 업데이트
      updateState({
        status: status.status,
        currentNode: status.currentNode,
        completedNodes: status.completedNodes || [],
        progress: status.progress || 0,
        result: status.result,
        error: status.error,
        message: status.message,
      });
      
      return status;
    } catch (error) {
      log('error', '[Workflow Orchestrator] 상태 조회 실패', { error: String(error) });
      throw error;
    }
  }, [workflowAPI, updateState]);

  const restartWorkflow = useCallback(() => {
    log('info', '[Workflow Orchestrator] 워크플로우 재시작');
    reset();
    realtimeStatus.stopPolling();
  }, [reset, realtimeStatus]);

  const toggleRealtimeUpdates = useCallback((enabled: boolean) => {
    log('info', '[Workflow Orchestrator] 실시간 업데이트 토글', { enabled });
    realtimeStatus.togglePolling(enabled);
  }, [realtimeStatus]);

  return {
    // 상태
    workflowStatus: workflowState,
    
    // 편의 속성
    isLoading,
    isCompleted,
    isFailed,
    hasResult,
    
    // 실시간 관련
    isRealtimeConnected: realtimeStatus.isConnected,
    realtimeError: realtimeStatus.connectionError,
    
    // 메서드
    executeWorkflow,
    generateSEOContent,
    getWorkflowStatus,
    restartWorkflow,
    toggleRealtimeUpdates,
    
    // 내부 훅들 (고급 사용자용)
    _internal: {
      workflowAPI,
      workflowState,
      realtimeStatus,
    },
  };
}