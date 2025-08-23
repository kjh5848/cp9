'use client';

import { useState, useEffect } from 'react';
import { ResearchSession } from '../types';
// Mock data import removed - now using real API calls

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

        // 실제 API 호출
        const response = await fetch('/api/research/sessions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const apiData = await response.json();
        
        if (!apiData.success || !apiData.data) {
          throw new Error(apiData.message || '세션 목록을 가져올 수 없습니다.');
        }

        setSessions(apiData.data);
        
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
      
      const response = await fetch('/api/research/sessions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const apiData = await response.json();
      
      if (!apiData.success || !apiData.data) {
        throw new Error(apiData.message || '세션 목록을 가져올 수 없습니다.');
      }

      setSessions(apiData.data);
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