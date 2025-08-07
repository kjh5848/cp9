/**
 * Workflow Feature - 실시간 상태 업데이트 훅
 * @module RealtimeStatus
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { log } from '@/shared/lib/logger';

export interface RealtimeStatusUpdate {
  threadId: string;
  status: 'running' | 'completed' | 'failed';
  currentNode: string | null;
  completedNodes: string[];
  progress: number;
  result?: any;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface RealtimeConfig {
  enabled: boolean;
  pollingInterval: number; // milliseconds
  maxRetries: number;
}

const defaultConfig: RealtimeConfig = {
  enabled: false,
  pollingInterval: 2000,
  maxRetries: 3,
};

/**
 * 실시간 워크플로우 상태 업데이트 훅
 */
export function useRealtimeStatus(
  threadId: string | null,
  config: Partial<RealtimeConfig> = {},
  onUpdate?: (update: RealtimeStatusUpdate) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const configRef = useRef<RealtimeConfig>({ ...defaultConfig, ...config });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const onUpdateRef = useRef(onUpdate);

  // Ref 업데이트
  useEffect(() => {
    configRef.current = { ...defaultConfig, ...config };
  }, [config]);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const pollStatus = useCallback(async () => {
    if (!threadId || !configRef.current.enabled) {
      return;
    }

    try {
      const response = await fetch(`/api/workflow/stream?threadId=${threadId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`실시간 상태 조회 오류: ${response.status} ${response.statusText}`);
      }

      const update: RealtimeStatusUpdate = await response.json();
      
      // 연결 성공
      setIsConnected(true);
      setConnectionError(null);
      retryCountRef.current = 0;
      
      // 업데이트 콜백 호출
      if (onUpdateRef.current) {
        onUpdateRef.current(update);
      }

      log('debug', '[Realtime] 상태 업데이트 수신', {
        threadId: update.threadId,
        status: update.status,
        progress: update.progress,
        currentNode: update.currentNode,
      });

      // 완료 또는 실패 시 폴링 중지
      if (update.status === 'completed' || update.status === 'failed') {
        stopPolling();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setConnectionError(errorMessage);
      
      retryCountRef.current++;
      
      if (retryCountRef.current >= configRef.current.maxRetries) {
        log('error', '[Realtime] 최대 재시도 횟수 초과, 폴링 중지', {
          threadId,
          retryCount: retryCountRef.current,
          error: errorMessage,
        });
        stopPolling();
        setIsConnected(false);
      } else {
        log('warn', '[Realtime] 폴링 오류, 재시도', {
          threadId,
          retryCount: retryCountRef.current,
          error: errorMessage,
        });
      }
    }
  }, [threadId]);

  const startPolling = useCallback(() => {
    if (!threadId || !configRef.current.enabled) {
      log('warn', '[Realtime] 폴링 시작 조건 미충족', {
        hasThreadId: !!threadId,
        enabled: configRef.current.enabled,
      });
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    log('info', '[Realtime] 폴링 시작', {
      threadId,
      interval: configRef.current.pollingInterval,
    });

    // 즉시 한 번 실행
    pollStatus();

    // 주기적 폴링 설정
    intervalRef.current = setInterval(pollStatus, configRef.current.pollingInterval);
    setIsConnected(true);
    retryCountRef.current = 0;
  }, [threadId, pollStatus]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionError(null);
    retryCountRef.current = 0;
    
    log('info', '[Realtime] 폴링 중지', { threadId });
  }, [threadId]);

  const togglePolling = useCallback((enabled: boolean) => {
    configRef.current.enabled = enabled;
    
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }
    
    log('info', '[Realtime] 폴링 토글', { enabled, threadId });
  }, [startPolling, stopPolling, threadId]);

  // threadId 또는 설정 변경 시 폴링 재시작
  useEffect(() => {
    if (configRef.current.enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [threadId, startPolling, stopPolling]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    connectionError,
    startPolling,
    stopPolling,
    togglePolling,
    retryCount: retryCountRef.current,
  };
}