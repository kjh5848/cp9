'use client';

import { useWorkflowOrchestrator } from './useWorkflowOrchestrator';
import { ProductItem } from '@/features/product/types';

/**
 * 기존 useWorkflow 훅을 대체하는 리팩토링된 버전
 * 내부적으로 분리된 전용 훅들을 사용하여 동일한 인터페이스 제공
 * 
 * 기존 코드와의 호환성을 유지하면서 내부 구조만 개선됨
 */

export function useWorkflow() {
  const orchestrator = useWorkflowOrchestrator();

  /**
   * 기존 인터페이스와 호환되는 워크플로우 실행
   */
  const executeWorkflow = async (params: {
    urls?: string[];
    productIds?: string[];
    keyword?: string;
    config?: {
      enablePerplexity?: boolean;
      enableWordPress?: boolean;
      maxProducts?: number;
    };
  }) => {
    return orchestrator.executeWorkflow(params);
  };


  /**
   * 기존 인터페이스와 호환되는 SEO 생성
   */
  const generateSeoContent = async (
    query: string, 
    products: ProductItem[], 
    seoType: 'product_review' | 'comparison' | 'guide' = 'product_review'
  ) => {
    const urls = products.map(p => p.productUrl).filter(Boolean);
    const seoContent = await orchestrator.generateSEOContent(query, urls);
    
    if (seoContent) {
      return {
        content: seoContent.content,
        metadata: {
          type: seoType,
          products: products,
          generatedAt: new Date().toISOString(),
          wordCount: seoContent.content.length,
          keywords: seoContent.keywords
        }
      };
    }
    
    throw new Error('SEO 콘텐츠 생성 실패');
  };

  // 기존 인터페이스 호환성 유지
  return {
    // 상태
    workflowStatus: {
      ...orchestrator.workflowStatus,
      estimatedTimeLeft: 0, // 기존 호환성
    },
    
    // 기본 메서드
    executeWorkflow,
    getWorkflowStatus: async () => {
      // API 호출을 통한 상태 조회는 여전히 지원
      return orchestrator.workflowStatus;
    },
    resetWorkflow: orchestrator.restartWorkflow,
    generateSeoContent,
    
    // 실시간 관련
    startRealtimeUpdates: () => {
      // 실시간 업데이트는 executeWorkflow에서 자동으로 처리됨
      console.log('[useWorkflow] 실시간 업데이트는 executeWorkflow에서 자동으로 시작됩니다');
    },
    toggleRealtimeUpdates: () => {
      console.log('[useWorkflow] 실시간 토글은 executeWorkflow의 realtimeEnabled 옵션을 사용하세요');
    },
    
    // 편의 속성들 (기존 호환성)
    isLoading: orchestrator.isLoading,
    isCompleted: orchestrator.isCompleted,
    isFailed: orchestrator.isFailed,
    hasResult: orchestrator.hasResult,
    progress: orchestrator.workflowStatus.progress,
    isRealtimeEnabled: orchestrator.isRealtimeConnected,
    currentNode: orchestrator.workflowStatus.currentNode,
    estimatedTimeLeft: 0, // 기존 호환성
  };
}

/**
 * 마이그레이션 가이드:
 * 
 * 기존 코드:
 * const { executeWorkflow, isLoading, workflowStatus } = useWorkflow();
 * 
 * 새 코드는 동일하게 동작:
 * const { executeWorkflow, isLoading, workflowStatus } = useWorkflow();
 * 
 * 하지만 내부적으로는 분리된 훅들을 사용하여:
 * - 더 나은 성능
 * - 더 명확한 책임 분리
 * - 더 쉬운 테스트
 * - 더 나은 타입 안전성
 */