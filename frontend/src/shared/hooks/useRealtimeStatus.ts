'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 실시간 상태 업데이트 관리 전용 훅 (SSE)
 */

export interface RealtimeStatusUpdate {
  threadId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentNode?: string;
  progress?: number;
  completedNodes?: string[];
  result?: unknown;
  error?: string;
  estimatedTimeLeft?: number;
  type?: 'update' | 'close';
}

export interface RealtimeConfig {
  enabled: boolean;
  reconnectInterval?: number; // ms
  maxReconnectAttempts?: number;
}

export function useRealtimeStatus(config: RealtimeConfig = { enabled: true }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<RealtimeStatusUpdate | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const onUpdateRef = useRef<((update: RealtimeStatusUpdate) => void) | null>(null);

  const { 
    enabled, 
    reconnectInterval = 5000, 
    maxReconnectAttempts = 3 
  } = config;

  /**
   * SSE 연결 정리
   */
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  /**
   * 실시간 상태 업데이트 시작
   */
  const startRealtimeUpdates = useCallback((
    threadId: string, 
    onUpdate?: (update: RealtimeStatusUpdate) => void
  ) => {
    if (!enabled) {
      console.log('[useRealtimeStatus] 실시간 업데이트가 비활성화됨');
      return;
    }

    // 기존 연결 정리
    cleanup();

    // 콜백 함수 저장
    onUpdateRef.current = onUpdate || null;

    console.log(`[useRealtimeStatus] SSE 연결 시작: ${threadId}`);

    try {
      const eventSource = new EventSource(`/api/workflow/stream?threadId=${threadId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[useRealtimeStatus] SSE 연결 성공');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const update: RealtimeStatusUpdate = JSON.parse(event.data);
          
          console.log('[useRealtimeStatus] 상태 업데이트 수신:', update);
          
          setLastUpdate(update);
          
          // 외부 콜백 호출
          if (onUpdateRef.current) {
            onUpdateRef.current(update);
          }

          // 종료 신호 처리
          if (update.type === 'close' || update.status === 'completed' || update.status === 'failed') {
            console.log('[useRealtimeStatus] 워크플로우 완료, 연결 종료');
            cleanup();
          }

        } catch (error) {
          console.error('[useRealtimeStatus] 메시지 파싱 오류:', error);
          setConnectionError('메시지 파싱 실패');
        }
      };

      eventSource.onerror = (error) => {
        console.error('[useRealtimeStatus] SSE 연결 오류:', error);
        setIsConnected(false);
        
        // 재연결 시도
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setConnectionError(`연결 실패 (재시도 ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[useRealtimeStatus] 재연결 시도 ${reconnectAttemptsRef.current}`);
            startRealtimeUpdates(threadId, onUpdateRef.current || undefined);
          }, reconnectInterval);
        } else {
          setConnectionError('최대 재연결 시도 횟수 초과');
          cleanup();
        }
      };

    } catch (error) {
      console.error('[useRealtimeStatus] SSE 생성 오류:', error);
      setConnectionError('SSE 연결 생성 실패');
    }
  }, [enabled, cleanup, reconnectInterval, maxReconnectAttempts]);

  /**
   * 실시간 업데이트 중단
   */
  const stopRealtimeUpdates = useCallback(() => {
    console.log('[useRealtimeStatus] 실시간 업데이트 중단');
    cleanup();
  }, [cleanup]);

  /**
   * 연결 상태 확인
   */
  const checkConnection = useCallback(() => {
    return {
      isConnected,
      hasError: !!connectionError,
      error: connectionError,
      reconnectAttempts: reconnectAttemptsRef.current,
      lastUpdate,
    };
  }, [isConnected, connectionError, lastUpdate]);

  return {
    // 상태
    isConnected,
    connectionError,
    lastUpdate,
    
    // 메서드
    startRealtimeUpdates,
    stopRealtimeUpdates,
    checkConnection,
    
    // 설정
    isEnabled: enabled,
  };
}