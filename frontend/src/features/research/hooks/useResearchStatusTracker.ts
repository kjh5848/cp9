'use client';

import { useCallback } from 'react';
import { useJobStatusTracker } from '@/shared/hooks/useJobStatusTracker';
import { useResearchCache } from './useResearchCache';
import { WebSocketMessage } from '@/shared/types/websocket';

/**
 * 리서치 작업 상태를 추적하고 완료 시 캐시를 무효화하는 통합 훅
 */
export function useResearchStatusTracker(jobId: string | null, sessionId: string | null) {
  const { invalidateSession, invalidateResults } = useResearchCache();

  const handleUpdate = useCallback((message: WebSocketMessage) => {
    console.log('[useResearchStatusTracker] 상태 업데이트:', message);

    // 작업 완료 시 캐시 무효화
    if (message.type === 'job_complete' && sessionId) {
      console.log('[useResearchStatusTracker] 작업 완료 - 캐시 무효화 시작');
      
      // 세션 관련 모든 캐시 무효화
      invalidateSession(sessionId);
      
      // 결과 캐시도 무효화 (새로운 데이터가 추가되었을 수 있음)
      invalidateResults(sessionId);
      
      console.log('[useResearchStatusTracker] 캐시 무효화 완료');
    }

    // 에러 발생 시에도 캐시 상태 확인을 위해 부분적 무효화
    if (message.type === 'job_error' && sessionId) {
      console.log('[useResearchStatusTracker] 작업 에러 - 결과 캐시만 무효화');
      invalidateResults(sessionId);
    }

    // 진행률 업데이트 등의 중간 상태는 캐시에 영향 없음
    // 외부에서 전달받은 onUpdate 콜백이 있다면 호출
    // (이 훅은 캐시 관리에만 집중)
  }, [sessionId, invalidateSession, invalidateResults]);

  const tracker = useJobStatusTracker(jobId, handleUpdate);

  return {
    ...tracker,
    // 캐시 관리 상태를 포함한 확장된 인터페이스
    sessionId,
    jobId
  };
}