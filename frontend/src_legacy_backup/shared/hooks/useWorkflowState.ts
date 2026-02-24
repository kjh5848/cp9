'use client';

import { useState, useCallback } from 'react';

/**
 * 워크플로우 상태 관리 전용 훅
 * UI 상태만 관리하고 API 호출은 하지 않음
 */

export interface WorkflowState {
  threadId?: string;
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
  currentNode?: string;
  progress: number; // 0-100
  completedNodes: string[];
  result?: {
    workflow: {
      extractIds: { productIds: string[]; urls: string[]; };
      aiProductResearch: { enrichedData: any[]; researchSummary: any; };
      seoAgent: { title: string; content: string; keywords: string[]; summary: string; };
      wordpressPublisher: { postId: string; postUrl: string; status: string; };
    };
    metadata: {
      createdAt: number;
      updatedAt: number;
      executionTime: number;
    };
  };
  error?: string;
  estimatedTimeLeft?: number;
}

export function useWorkflowState() {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    status: 'idle',
    progress: 0,
    completedNodes: [],
  });

  /**
   * 상태 업데이트
   */
  const updateWorkflowState = useCallback((
    updates: Partial<WorkflowState> | ((prev: WorkflowState) => WorkflowState)
  ) => {
    if (typeof updates === 'function') {
      setWorkflowState(updates);
    } else {
      setWorkflowState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  /**
   * 워크플로우 시작
   */
  const startWorkflow = useCallback((threadId?: string) => {
    updateWorkflowState({
      threadId,
      status: 'pending',
      progress: 0,
      completedNodes: [],
      error: undefined,
      result: undefined,
    });
  }, [updateWorkflowState]);

  /**
   * 워크플로우 실행 중으로 변경
   */
  const setWorkflowRunning = useCallback((threadId: string, currentNode?: string) => {
    updateWorkflowState({
      threadId,
      status: 'running',
      currentNode,
      progress: Math.min(workflowState.progress + 10, 90),
    });
  }, [updateWorkflowState, workflowState.progress]);

  /**
   * 진행률 업데이트
   */
  const updateProgress = useCallback((progress: number, currentNode?: string) => {
    updateWorkflowState({
      progress: Math.max(0, Math.min(100, progress)),
      currentNode,
    });
  }, [updateWorkflowState]);

  /**
   * 노드 완료 처리
   */
  const completeNode = useCallback((nodeName: string, progress?: number) => {
    updateWorkflowState(prev => ({
      ...prev,
      completedNodes: [...prev.completedNodes.filter(n => n !== nodeName), nodeName],
      progress: progress || Math.min(prev.progress + 20, 90),
      currentNode: undefined,
    }));
  }, [updateWorkflowState]);

  /**
   * 워크플로우 성공 완료
   */
  const completeWorkflow = useCallback((result: WorkflowState['result']) => {
    updateWorkflowState({
      status: 'completed',
      progress: 100,
      result,
      error: undefined,
      currentNode: undefined,
    });
  }, [updateWorkflowState]);

  /**
   * 워크플로우 실패
   */
  const failWorkflow = useCallback((error: string) => {
    updateWorkflowState({
      status: 'failed',
      error,
      currentNode: undefined,
    });
  }, [updateWorkflowState]);

  /**
   * 워크플로우 초기화
   */
  const resetWorkflow = useCallback(() => {
    setWorkflowState({
      status: 'idle',
      progress: 0,
      completedNodes: [],
    });
  }, []);

  /**
   * 상태 기반 계산된 값들
   */
  const isLoading = workflowState.status === 'pending' || workflowState.status === 'running';
  const isCompleted = workflowState.status === 'completed';
  const isFailed = workflowState.status === 'failed';
  const hasResult = !!workflowState.result;
  
  return {
    // 상태
    workflowState,
    
    // 계산된 값들
    isLoading,
    isCompleted,
    isFailed,
    hasResult,
    
    // 상태 변경 함수들
    updateWorkflowState,
    startWorkflow,
    setWorkflowRunning,
    updateProgress,
    completeNode,
    completeWorkflow,
    failWorkflow,
    resetWorkflow,
  };
}