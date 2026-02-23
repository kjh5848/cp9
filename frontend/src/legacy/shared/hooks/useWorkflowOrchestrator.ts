'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useWorkflowState } from './useWorkflowState';
import { useRealtimeStatus } from './useRealtimeStatus';
import { useWorkflowAPI } from './useWorkflowAPI';

/**
 * 워크플로우 전체 조율 훅
 * 여러 전용 훅들을 조합하여 완전한 워크플로우 관리
 */

export interface WorkflowOrchestratorParams {
  urls?: string[];
  productIds?: string[];
  keyword?: string;
  config?: {
    enablePerplexity?: boolean;
    enableWordPress?: boolean;
    maxProducts?: number;
  };
  realtimeEnabled?: boolean;
}

export function useWorkflowOrchestrator() {
  // 전용 훅들 사용
  const workflowState = useWorkflowState();
  const workflowAPI = useWorkflowAPI();
  const realtimeStatus = useRealtimeStatus();

  /**
   * 통합 워크플로우 실행
   */
  const executeWorkflow = useCallback(async (
    params: WorkflowOrchestratorParams
  ): Promise<boolean> => {
    try {
      // 1. 워크플로우 상태 초기화
      workflowState.startWorkflow();
      
      console.log('[WorkflowOrchestrator] 워크플로우 실행 시작:', params);
      
      // 2. API 호출
      const response = await workflowAPI.executeWorkflow({
        urls: params.urls,
        productIds: params.productIds,
        keyword: params.keyword,
        config: params.config,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || '워크플로우 실행 실패');
      }

      const threadId = response.data.threadId;
      
      // 3. 실시간 업데이트 설정
      if (params.realtimeEnabled !== false && realtimeStatus.isEnabled) {
        workflowState.setWorkflowRunning(threadId);
        
        // 실시간 상태 업데이트 시작
        realtimeStatus.startRealtimeUpdates(threadId, (update) => {
          console.log('[WorkflowOrchestrator] 실시간 업데이트:', update);
          
          // 상태 업데이트를 워크플로우 상태에 반영
          if (update.status === 'completed') {
            workflowState.completeWorkflow(response.data);
            toast.success('워크플로우가 성공적으로 완료되었습니다!');
          } else if (update.status === 'failed') {
            workflowState.failWorkflow(update.error || '알 수 없는 오류');
            toast.error(`워크플로우 실패: ${update.error || '알 수 없는 오류'}`);
          } else if (update.status === 'running') {
            workflowState.updateProgress(update.progress || 50, update.currentNode);
            if (update.completedNodes) {
              update.completedNodes.forEach(node => {
                workflowState.completeNode(node);
              });
            }
          }
        });
      } else {
        // 실시간 업데이트 없이 즉시 완료 처리
        workflowState.completeWorkflow(response.data);
        toast.success('워크플로우가 성공적으로 완료되었습니다!');
      }

      return true;

    } catch (error) {
      console.error('[WorkflowOrchestrator] 워크플로우 실행 오류:', error);
      
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      workflowState.failWorkflow(errorMessage);
      toast.error(`워크플로우 실행 실패: ${errorMessage}`);
      
      return false;
    }
  }, [workflowState, workflowAPI, realtimeStatus]);

  /**
   * SEO 글 생성 (간편 모드)
   */
  const generateSEOContent = useCallback(async (
    keyword: string,
    productUrls: string[]
  ) => {
    const success = await executeWorkflow({
      urls: productUrls,
      keyword,
      config: {
        enablePerplexity: true,
        enableWordPress: false, // SEO 글만 생성
        maxProducts: productUrls.length,
      },
      realtimeEnabled: true,
    });

    if (success && workflowState.workflowState.result?.workflow.seoAgent) {
      return workflowState.workflowState.result.workflow.seoAgent;
    }

    return null;
  }, [executeWorkflow, workflowState.workflowState.result]);

  /**
   * 워크플로우 테스트
   */
  const testWorkflow = useCallback(async (keyword: string = '무선 이어폰') => {
    try {
      workflowState.startWorkflow();
      
      const response = await workflowAPI.testWorkflow({ keyword });
      
      if (response.success) {
        workflowState.completeWorkflow(response.data);
        toast.success('테스트 워크플로우 완료!');
        return response;
      } else {
        throw new Error(response.error || '테스트 실패');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      workflowState.failWorkflow(errorMessage);
      toast.error(`테스트 실패: ${errorMessage}`);
      return null;
    }
  }, [workflowState, workflowAPI]);

  /**
   * 워크플로우 중단
   */
  const cancelWorkflow = useCallback(() => {
    console.log('[WorkflowOrchestrator] 워크플로우 중단');
    realtimeStatus.stopRealtimeUpdates();
    workflowState.failWorkflow('사용자에 의해 중단됨');
    toast.success('워크플로우가 중단되었습니다');
  }, [realtimeStatus, workflowState]);

  /**
   * 워크플로우 재시작
   */
  const restartWorkflow = useCallback(() => {
    console.log('[WorkflowOrchestrator] 워크플로우 재시작');
    realtimeStatus.stopRealtimeUpdates();
    workflowState.resetWorkflow();
    toast.success('워크플로우가 초기화되었습니다');
  }, [realtimeStatus, workflowState]);

  return {
    // 상태 (통합)
    workflowStatus: workflowState.workflowState,
    
    // 실시간 연결 상태
    isRealtimeConnected: realtimeStatus.isConnected,
    realtimeError: realtimeStatus.connectionError,
    
    // 주요 메서드
    executeWorkflow,
    generateSEOContent,
    testWorkflow,
    cancelWorkflow,
    restartWorkflow,
    
    // 하위 훅의 모든 메서드 노출
    ...workflowState,
    realtimeStatus,
  };
}