'use client';

import { useState, useEffect } from 'react';
import { ResearchSession } from '../types';
import { getAllResearchSessions } from '../data/mockSessions';

/**
 * 모든 리서치 세션을 가져오는 훅
 */
export function useResearchSessions() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        // 실제로는 API 호출
        // const response = await fetch('/api/research/sessions');
        // const data = await response.json();

        // 시뮬레이션된 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 더미 데이터 사용
        const mockData = getAllResearchSessions();
        setSessions(mockData);
        
      } catch (err) {
        setError('리서치 세션을 불러오는데 실패했습니다');
        console.error('Failed to fetch research sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const refreshSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mockData = getAllResearchSessions();
      setSessions(mockData);
    } catch (err) {
      setError('리서치 세션을 새로고침하는데 실패했습니다');
      console.error('Failed to refresh research sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    sessions,
    loading,
    error,
    refreshSessions
  };
}