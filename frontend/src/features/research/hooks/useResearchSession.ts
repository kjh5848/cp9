'use client';

import { useState, useEffect } from 'react';
import { ResearchSession } from '../types';

/**
 * 개별 리서치 세션 상세 정보를 관리하는 훅
 * 영화 예시 패턴을 따라 API 요청 방식으로 구현
 */
export function useResearchSession(sessionId: string) {
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 세션 데이터를 가져오는 함수
   * 현재는 mock 데이터를 사용하지만 나중에 실제 API로 교체 가능
   */
  const fetchSession = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // API 요청 시뮬레이션 (실제로는 /api/research/[id] 호출)
      const response = await getResearchSession(id);
      
      if (!response) {
        throw new Error('세션을 찾을 수 없습니다.');
      }

      setSession(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '세션을 불러오는 중 오류가 발생했습니다.');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 세션 새로고침
   */
  const refreshSession = () => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  };

  // sessionId가 변경될 때마다 데이터 로드
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId]);

  return {
    session,
    loading,
    error,
    refreshSession
  };
}

/**
 * 리서치 세션 데이터를 가져오는 API 함수
 * 현재는 mock 데이터를 사용하지만 실제 API 엔드포인트로 교체 예정
 */
async function getResearchSession(id: string): Promise<ResearchSession | null> {
  // 실제 환경에서는 이런 형태로 API 호출
  // const response = await fetch(`/api/research/${id}`);
  // const data = await response.json();
  // return data;

  // 현재는 동적 import로 mock 데이터 사용
  const { getResearchSessionById } = await import('../data/mockSessions');
  
  // API 호출 지연 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return getResearchSessionById(id) || null;
}