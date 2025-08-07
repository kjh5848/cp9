/**
 * Workflow Feature - 상태 관리 전용 훅
 * @module WorkflowState
 */

'use client';

import { useState, useCallback } from 'react';
import { log } from '@/shared/lib/logger';

export interface WorkflowState {
  threadId: string | null;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentNode: string | null;
  completedNodes: string[];
  progress: number;
  result: any | null;
  error: string | null;
  message: string | null;
  metadata: {
    createdAt: number;
    updatedAt: number;
    executionTime: number;
  } | null;
}

const initialState: WorkflowState = {
  threadId: null,
  status: 'idle',
  currentNode: null,
  completedNodes: [],
  progress: 0,
  result: null,
  error: null,
  message: null,
  metadata: null,
};

/**
 * Workflow 상태 관리 전용 훅
 */
export function useWorkflowState() {
  const [state, setState] = useState<WorkflowState>(initialState);

  const updateState = useCallback((updates: Partial<WorkflowState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      metadata: updates.metadata ? {
        ...prev.metadata,
        ...updates.metadata,
        updatedAt: Date.now(),
      } : prev.metadata,
    }));
    
    log('debug', '[Workflow State] 상태 업데이트', updates);
  }, []);

  const setRunning = useCallback((threadId: string, currentNode?: string) => {
    updateState({
      threadId,
      status: 'running',
      currentNode: currentNode || null,
      error: null,
      message: '워크플로우를 실행하고 있습니다...',
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        executionTime: 0,
      },
    });
  }, [updateState]);

  const setProgress = useCallback((progress: number, currentNode?: string, completedNodes?: string[]) => {
    updateState({
      progress: Math.max(0, Math.min(100, progress)),
      currentNode: currentNode || state.currentNode,
      completedNodes: completedNodes || state.completedNodes,
    });
  }, [updateState, state.currentNode, state.completedNodes]);

  const setCompleted = useCallback((result: any, message?: string) => {
    updateState({
      status: 'completed',
      progress: 100,
      result,
      message: message || '워크플로우가 성공적으로 완료되었습니다.',
      metadata: state.metadata ? {
        ...state.metadata,
        executionTime: Date.now() - state.metadata.createdAt,
      } : null,
    });
  }, [updateState, state.metadata]);

  const setFailed = useCallback((error: string, message?: string) => {
    updateState({
      status: 'failed',
      error,
      message: message || '워크플로우 실행 중 오류가 발생했습니다.',
      metadata: state.metadata ? {
        ...state.metadata,
        executionTime: Date.now() - state.metadata.createdAt,
      } : null,
    });
  }, [updateState, state.metadata]);

  const reset = useCallback(() => {
    setState(initialState);
    log('info', '[Workflow State] 상태 초기화');
  }, []);

  // 편의 속성들
  const isLoading = state.status === 'running';
  const isCompleted = state.status === 'completed';
  const isFailed = state.status === 'failed';
  const hasResult = state.result !== null;

  return {
    // 상태
    workflowState: state,
    
    // 상태 업데이트 메서드
    updateState,
    setRunning,
    setProgress,
    setCompleted,
    setFailed,
    reset,
    
    // 편의 속성
    isLoading,
    isCompleted,
    isFailed,
    hasResult,
  };
}