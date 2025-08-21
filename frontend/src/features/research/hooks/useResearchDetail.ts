'use client';

import { useState, useEffect } from 'react';
import { ResearchSession } from '../types';
import { getResearchSessionById } from '../data/mockSessions';

/**
 * 특정 리서치 세션의 상세 정보를 가져오는 훅
 */
export function useResearchDetail(sessionId: string) {
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionDetail = async () => {
      if (!sessionId) {
        setError('세션 ID가 필요합니다');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 실제로는 API 호출
        // const response = await fetch(`/api/research/sessions/${sessionId}`);
        // if (!response.ok) {
        //   throw new Error('세션을 찾을 수 없습니다');
        // }
        // const data = await response.json();

        // 시뮬레이션된 지연
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 더미 데이터 사용
        const mockSession = getResearchSessionById(sessionId);
        
        if (!mockSession) {
          throw new Error('세션을 찾을 수 없습니다');
        }

        setSession(mockSession);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '리서치 세션을 불러오는데 실패했습니다';
        setError(errorMessage);
        console.error('Failed to fetch research session:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetail();
  }, [sessionId]);

  const refreshSession = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const mockSession = getResearchSessionById(sessionId);
      
      if (!mockSession) {
        throw new Error('세션을 찾을 수 없습니다');
      }

      setSession(mockSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '리서치 세션을 새로고침하는데 실패했습니다';
      setError(errorMessage);
      console.error('Failed to refresh research session:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    loading,
    error,
    refreshSession,
    // 편의 속성들
    products: session?.products || [],
    totalProducts: session?.total_products || 0,
    title: session?.title || '',
    description: session?.description || ''
  };
}