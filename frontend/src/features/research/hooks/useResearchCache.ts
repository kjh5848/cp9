'use client';

import { useCallback } from 'react';
import { researchCache, CacheKeys } from '@/shared/utils/cache';

/**
 * 리서치 관련 캐시를 관리하는 훅
 * 캐시 무효화, 통계 조회, 수동 캐시 설정 기능 제공
 */
export function useResearchCache() {
  /**
   * 특정 세션의 모든 캐시 무효화
   */
  const invalidateSession = useCallback((sessionId: string) => {
    const pattern = `research_session_${sessionId}`;
    researchCache.deleteByPattern(pattern);
    console.log(`Cache invalidated for session: ${sessionId}`);
  }, []);

  /**
   * 특정 결과의 캐시 무효화
   */
  const invalidateResults = useCallback((sessionId: string, selectedIds?: string[]) => {
    const cacheKey = CacheKeys.researchResults(sessionId, selectedIds || []);
    researchCache.delete(cacheKey);
    console.log(`Cache invalidated for results: ${sessionId}`, selectedIds);
  }, []);

  /**
   * 모든 리서치 관련 캐시 무효화
   */
  const invalidateAll = useCallback(() => {
    researchCache.clear();
    console.log('All research cache cleared');
  }, []);

  /**
   * 캐시 통계 조회
   */
  const getCacheStats = useCallback(() => {
    return researchCache.getStats();
  }, []);

  /**
   * 만료된 캐시 정리
   */
  const cleanup = useCallback(() => {
    researchCache.cleanup();
    console.log('Cache cleanup completed');
  }, []);

  /**
   * 캐시에 데이터 수동 설정
   */
  const setCache = useCallback((key: string, data: unknown, ttl?: number) => {
    researchCache.set(key, data, ttl);
  }, []);

  /**
   * 캐시에서 데이터 조회
   */
  const getCache = useCallback((key: string) => {
    return researchCache.get(key);
  }, []);

  /**
   * 캐시 존재 여부 확인
   */
  const hasCache = useCallback((key: string) => {
    return researchCache.has(key);
  }, []);

  return {
    // 캐시 무효화 함수들
    invalidateSession,
    invalidateResults,
    invalidateAll,
    
    // 캐시 관리 함수들
    getCacheStats,
    cleanup,
    setCache,
    getCache,
    hasCache,
    
    // 캐시 인스턴스 직접 접근 (고급 사용)
    cache: researchCache
  };
}