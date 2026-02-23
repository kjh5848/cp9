/**
 * Search Feature - 검색 히스토리 관리 훅
 * @module SearchHistory
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { log } from '@/shared/lib/logger';

export interface SearchHistoryItem {
  id: string;
  type: 'keyword' | 'category' | 'url';
  query: string;
  timestamp: number;
  resultCount: number;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = 'cp9-search-history';
const MAX_HISTORY_ITEMS = 50;

/**
 * 검색 히스토리 관리 훅
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 로컬 스토리지에서 히스토리 로드
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory: SearchHistoryItem[] = JSON.parse(storedHistory);
        setHistory(parsedHistory);
        log('info', '[Search History] 히스토리 로드 완료', { count: parsedHistory.length });
      }
    } catch (error) {
      log('error', '[Search History] 히스토리 로드 실패', { error: String(error) });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 히스토리를 로컬 스토리지에 저장
  const saveToStorage = useCallback((newHistory: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      log('error', '[Search History] 히스토리 저장 실패', { error: String(error) });
    }
  }, []);

  // 새 검색 항목 추가
  const addSearchItem = useCallback((item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: SearchHistoryItem = {
      ...item,
      id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // 중복 제거 (동일한 타입과 쿼리)
      const filtered = prev.filter(
        h => !(h.type === newItem.type && h.query === newItem.query)
      );

      // 최신 항목을 맨 앞에 추가
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      saveToStorage(updated);
      log('info', '[Search History] 새 항목 추가', { 
        type: newItem.type, 
        query: newItem.query,
        totalCount: updated.length 
      });
      
      return updated;
    });
  }, [saveToStorage]);

  // 히스토리 항목 삭제
  const removeSearchItem = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(updated);
      log('info', '[Search History] 항목 삭제', { id, remainingCount: updated.length });
      return updated;
    });
  }, [saveToStorage]);

  // 전체 히스토리 삭제
  const clearHistory = useCallback(() => {
    setHistory([]);
    saveToStorage([]);
    log('info', '[Search History] 전체 히스토리 삭제');
  }, [saveToStorage]);

  // 타입별 히스토리 필터링
  const getHistoryByType = useCallback((type: SearchHistoryItem['type']) => {
    return history.filter(item => item.type === type);
  }, [history]);

  // 최근 검색어 가져오기
  const getRecentQueries = useCallback((limit: number = 10) => {
    return history
      .slice(0, limit)
      .map(item => item.query);
  }, [history]);

  // 인기 검색어 가져오기 (검색 횟수 기준)
  const getPopularQueries = useCallback((limit: number = 10) => {
    const queryCount: Record<string, number> = {};
    
    history.forEach(item => {
      queryCount[item.query] = (queryCount[item.query] || 0) + 1;
    });

    return Object.entries(queryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query);
  }, [history]);

  // 검색 통계
  const getSearchStats = useCallback(() => {
    const stats = {
      total: history.length,
      byType: {
        keyword: history.filter(h => h.type === 'keyword').length,
        category: history.filter(h => h.type === 'category').length,
        url: history.filter(h => h.type === 'url').length,
      },
      totalResults: history.reduce((sum, h) => sum + h.resultCount, 0),
      avgResults: history.length > 0 
        ? history.reduce((sum, h) => sum + h.resultCount, 0) / history.length 
        : 0,
      lastSearchTime: history.length > 0 ? history[0].timestamp : null,
    };

    return stats;
  }, [history]);

  return {
    // 상태
    history,
    isLoading,
    
    // 메서드
    addSearchItem,
    removeSearchItem,
    clearHistory,
    
    // 유틸리티
    getHistoryByType,
    getRecentQueries,
    getPopularQueries,
    getSearchStats,
    
    // 편의 속성
    isEmpty: history.length === 0,
    count: history.length,
  };
}