'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * 워크플로우 상태 인터페이스
 */
export interface WorkflowStatus {
  threadId?: string;
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
  currentNode?: string;
  progress: number;      // 0-100
  completedNodes: string[];
  result?: {
    workflow: {
      extractIds: {
        productIds: string[];
        urls: string[];
      };
      aiProductResearch: {
        enrichedData: any[];
        researchSummary: any;
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
    };
  };
  error?: string;
  estimatedTimeLeft?: number;
}

/**
 * 워크플로우 실행 파라미터
 */
export interface WorkflowParams {
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
 * 통합 워크플로우 실행 훅
 * 백엔드 Edge Function과 통신하여 전체 워크플로우 관리
 * 실시간 상태 업데이트 지원
 */
export function useWorkflow() {
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    status: 'idle',
    progress: 0,
    completedNodes: [],
  });

  // SSE 연결 참조
  const eventSourceRef = useRef<EventSource | null>(null);
  const isRealtimeEnabled = useRef<boolean>(true);

  // 컴포넌트 언마운트 시 SSE 연결 정리
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  /**
   * 실시간 상태 업데이트를 위한 SSE 연결 시작
   */
  const startRealtimeUpdates = useCallback((threadId: string) => {
    if (!isRealtimeEnabled.current) return;

    // 기존 연결이 있다면 정리
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // 새로운 SSE 연결 생성
    const eventSource = new EventSource(`/api/workflow/stream?threadId=${threadId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const statusUpdate = JSON.parse(event.data);
        
        // 종료 신호 처리
        if (statusUpdate.type === 'close') {
          eventSource.close();
          eventSourceRef.current = null;
          return;
        }

        // 상태 업데이트
        setWorkflowStatus(prev => ({
          ...prev,
          threadId: statusUpdate.threadId,
          status: statusUpdate.status,
          currentNode: statusUpdate.currentNode,
          progress: statusUpdate.progress || prev.progress,
          completedNodes: statusUpdate.completedNodes || prev.completedNodes,
          result: statusUpdate.result || prev.result,
          error: statusUpdate.error,
          estimatedTimeLeft: statusUpdate.estimatedTimeLeft
        }));

        // 완료 시 성공 토스트
        if (statusUpdate.status === 'completed') {
          toast.success('워크플로우가 성공적으로 완료되었습니다!');
          eventSource.close();
          eventSourceRef.current = null;
        }
        
        // 실패 시 에러 토스트
        if (statusUpdate.status === 'failed') {
          toast.error(`워크플로우 실행 실패: ${statusUpdate.error || '알 수 없는 오류'}`);
          eventSource.close();
          eventSourceRef.current = null;
        }

      } catch (error) {
        console.error('[useWorkflow] SSE 메시지 파싱 오류:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[useWorkflow] SSE 연결 오류:', error);
      eventSource.close();
      eventSourceRef.current = null;
    };

  }, []);

  /**
   * 워크플로우 실행
   */
  const executeWorkflow = useCallback(async (params: WorkflowParams): Promise<boolean> => {
    try {
      setWorkflowStatus(prev => ({
        ...prev,
        status: 'pending',
        progress: 0,
        completedNodes: [],
        error: undefined
      }));

      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          ...params
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || '워크플로우 실행 실패');
      }

      const threadId = data.data?.threadId;
      
      if (threadId && isRealtimeEnabled.current) {
        // 실시간 업데이트 시작
        setWorkflowStatus(prev => ({
          ...prev,
          status: 'running',
          threadId: threadId,
          progress: 10
        }));
        
        startRealtimeUpdates(threadId);
        return true;
      } else {
        // 실시간 업데이트 비활성화된 경우 즉시 완료 처리
        setWorkflowStatus(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          threadId: threadId,
          completedNodes: data.data?.metadata?.completedNodes || [],
          result: data.data,
        }));

        toast.success('워크플로우가 성공적으로 완료되었습니다!');
        return true;
      }

    } catch (error) {
      console.error('[useWorkflow] 실행 오류:', error);
      
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      setWorkflowStatus(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage
      }));

      // 에러 토스트
      toast.error(`워크플로우 실행 실패: ${errorMessage}`);
      
      return false;
    }
  }, [startRealtimeUpdates]);

  /**
   * 워크플로우 상태 조회
   */
  const getWorkflowStatus = useCallback(async (threadId: string): Promise<WorkflowStatus | null> => {
    try {
      const response = await fetch(`/api/workflow?threadId=${threadId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '상태 조회 실패');
      }

      return data.data as WorkflowStatus;

    } catch (error) {
      console.error('[useWorkflow] 상태 조회 오류:', error);
      toast.error('워크플로우 상태 조회에 실패했습니다.');
      return null;
    }
  }, []);

  /**
   * 워크플로우 재설정
   */
  const resetWorkflow = useCallback(() => {
    // SSE 연결 정리
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setWorkflowStatus({
      status: 'idle',
      progress: 0,
      completedNodes: [],
    });
  }, []);

  /**
   * 실시간 업데이트 토글
   */
  const toggleRealtimeUpdates = useCallback((enabled: boolean) => {
    isRealtimeEnabled.current = enabled;
    
    if (!enabled && eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  /**
   * SEO 글 생성 (기존 API와 호환성 유지)
   */
  const generateSeoContent = useCallback(async (
    query: string, 
    products: any[], 
    seoType: 'product_review' | 'comparison' | 'guide' = 'product_review'
  ): Promise<any> => {
    try {
      setWorkflowStatus(prev => ({
        ...prev,
        status: 'running',
        progress: 25,
        currentNode: 'seoAgent'
      }));

      // 상품 URL에서 ID 추출하여 워크플로우 실행
      const urls = products.map(p => p.productUrl || p.url).filter(Boolean);
      const productIds = products.map(p => p.productId).filter(Boolean);

      const success = await executeWorkflow({
        urls,
        productIds,
        keyword: query,
        config: {
          enablePerplexity: true,
          enableWordPress: false, // SEO 글만 생성
          maxProducts: products.length
        }
      });

      if (success && workflowStatus.result?.workflow.seoAgent) {
        return {
          content: workflowStatus.result.workflow.seoAgent.content,
          metadata: {
            type: seoType,
            products: products,
            generatedAt: new Date().toISOString(),
            wordCount: workflowStatus.result.workflow.seoAgent.content.length,
            keywords: workflowStatus.result.workflow.seoAgent.keywords
          }
        };
      }

      throw new Error('SEO 콘텐츠 생성 실패');

    } catch (error) {
      console.error('[useWorkflow] SEO 생성 오류:', error);
      throw error;
    }
  }, [executeWorkflow, workflowStatus.result]);

  return {
    workflowStatus,
    executeWorkflow,
    getWorkflowStatus,
    resetWorkflow,
    generateSeoContent,
    startRealtimeUpdates,
    toggleRealtimeUpdates,
    
    // 편의 속성들
    isLoading: workflowStatus.status === 'pending' || workflowStatus.status === 'running',
    isCompleted: workflowStatus.status === 'completed',
    isFailed: workflowStatus.status === 'failed',
    hasResult: !!workflowStatus.result,
    progress: workflowStatus.progress,
    isRealtimeEnabled: isRealtimeEnabled.current,
    currentNode: workflowStatus.currentNode,
    estimatedTimeLeft: workflowStatus.estimatedTimeLeft,
  };
}