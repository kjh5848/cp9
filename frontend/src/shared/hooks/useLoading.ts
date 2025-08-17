'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * 로딩 상태 관리 전용 훅
 * 여러 작업의 로딩 상태를 개별적으로 관리
 */

export interface LoadingState {
  [key: string]: {
    isLoading: boolean;
    startTime: number | null;
    message?: string;
    progress?: number; // 0-100
  };
}

export function useLoading() {
  const [loadingState, setLoadingState] = useState<LoadingState>({});
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  /**
   * 로딩 시작
   */
  const startLoading = useCallback((
    key: string = 'default', 
    message?: string,
    timeout?: number // ms, 자동 종료 타임아웃
  ) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        startTime: Date.now(),
        message,
        progress: 0,
      }
    }));

    // 기존 타임아웃 제거
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
    }

    // 자동 종료 타임아웃 설정
    if (timeout) {
      timeoutRefs.current[key] = setTimeout(() => {
        stopLoading(key);
      }, timeout);
    }
  }, []);

  /**
   * 로딩 종료
   */
  const stopLoading = useCallback((key: string = 'default') => {
    setLoadingState(prev => {
      const newState = { ...prev };
      if (newState[key]) {
        newState[key] = {
          ...newState[key],
          isLoading: false,
        };
      }
      return newState;
    });

    // 타임아웃 정리
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
  }, []);

  /**
   * 로딩 상태 토글
   */
  const toggleLoading = useCallback((
    key: string = 'default', 
    message?: string
  ) => {
    const current = loadingState[key]?.isLoading;
    if (current) {
      stopLoading(key);
    } else {
      startLoading(key, message);
    }
  }, [loadingState, startLoading, stopLoading]);

  /**
   * 진행률 업데이트
   */
  const updateProgress = useCallback((
    key: string = 'default', 
    progress: number,
    message?: string
  ) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: prev[key] ? {
        ...prev[key],
        progress: Math.max(0, Math.min(100, progress)),
        message: message || prev[key].message,
      } : {
        isLoading: true,
        startTime: Date.now(),
        progress: Math.max(0, Math.min(100, progress)),
        message,
      }
    }));
  }, []);

  /**
   * 로딩 메시지 업데이트
   */
  const updateMessage = useCallback((
    key: string = 'default', 
    message: string
  ) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: prev[key] ? {
        ...prev[key],
        message,
      } : {
        isLoading: false,
        startTime: null,
        message,
      }
    }));
  }, []);

  /**
   * 모든 로딩 상태 초기화
   */
  const clearAllLoading = useCallback(() => {
    // 모든 타임아웃 정리
    Object.values(timeoutRefs.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    timeoutRefs.current = {};
    
    setLoadingState({});
  }, []);

  /**
   * 특정 키의 로딩 상태 조회
   */
  const getLoadingState = useCallback((key: string = 'default') => {
    const state = loadingState[key];
    if (!state) {
      return {
        isLoading: false,
        startTime: null,
        message: undefined,
        progress: 0,
        duration: 0,
      };
    }

    return {
      ...state,
      duration: state.startTime ? Date.now() - state.startTime : 0,
    };
  }, [loadingState]);

  /**
   * 전체 로딩 상태 확인
   */
  const hasAnyLoading = Object.values(loadingState).some(state => state.isLoading);
  const loadingCount = Object.values(loadingState).filter(state => state.isLoading).length;
  const loadingKeys = Object.keys(loadingState).filter(key => loadingState[key].isLoading);

  /**
   * 특정 키의 로딩 상태 확인
   */
  const isLoading = useCallback((key: string = 'default') => {
    return loadingState[key]?.isLoading || false;
  }, [loadingState]);

  /**
   * 특정 키의 로딩 메시지 조회
   */
  const getLoadingMessage = useCallback((key: string = 'default') => {
    return loadingState[key]?.message;
  }, [loadingState]);

  return {
    // 상태
    loadingState,
    hasAnyLoading,
    loadingCount,
    loadingKeys,
    
    // 메서드
    startLoading,
    stopLoading,
    toggleLoading,
    updateProgress,
    updateMessage,
    clearAllLoading,
    getLoadingState,
    isLoading,
    getLoadingMessage,
  };
}