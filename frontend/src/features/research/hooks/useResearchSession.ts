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
 * 실제 백엔드 API와 통신하여 세션 데이터를 반환
 */
async function getResearchSession(id: string): Promise<ResearchSession | null> {
  try {
    const response = await fetch(`/api/research/sessions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // 세션이 존재하지 않음
      }
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const apiData = await response.json();
    
    if (!apiData.success || !apiData.data) {
      throw new Error(apiData.message || '세션 데이터를 가져올 수 없습니다.');
    }

    return apiData.data;
  } catch (error) {
    console.error('Failed to fetch research session:', error);
    throw error;
  }
}