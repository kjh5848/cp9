'use client';

import { useEffect, useRef, useCallback } from 'react';
import { WebSocketMessage, JobUpdateHandler } from '../types/websocket';

/**
 * JobStatusTracker 클래스
 * API 가이드에서 제공하는 WebSocket + Polling Fallback 구현
 */
class JobStatusTracker {
  private ws: WebSocket | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private jobId: string;
  private onUpdate: JobUpdateHandler;
  private baseUrl: string;

  constructor(jobId: string, onUpdate: JobUpdateHandler, baseUrl = 'localhost:8000') {
    this.jobId = jobId;
    this.onUpdate = onUpdate;
    this.baseUrl = baseUrl;
  }

  start() {
    console.log('[JobStatusTracker] 시작:', this.jobId);
    
    // WebSocket 연결 시도
    this.connectWebSocket();
    
    // 5초 후 WebSocket 연결 실패 시 폴링으로 fallback
    setTimeout(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.log('[JobStatusTracker] WebSocket 연결 실패, 폴링으로 전환');
        this.startPolling();
      }
    }, 5000);
  }

  private connectWebSocket() {
    try {
      const wsUrl = `ws://${this.baseUrl}/api/v1/ws/research/${this.jobId}`;
      console.log('[JobStatusTracker] WebSocket 연결 시도:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('[JobStatusTracker] WebSocket 연결 성공');
        if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('[JobStatusTracker] WebSocket 메시지 수신:', message);
          this.handleUpdate(message);
        } catch (error) {
          console.error('[JobStatusTracker] WebSocket 메시지 파싱 오류:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('[JobStatusTracker] WebSocket 오류:', error);
        this.startPolling();
      };
      
      this.ws.onclose = (event) => {
        console.log(`[JobStatusTracker] WebSocket 연결 종료: ${event.code} - ${event.reason}`);
        if (event.code !== 1000) { // 정상 종료가 아닌 경우
          console.log('[JobStatusTracker] WebSocket 비정상 종료, 폴링으로 전환');
          this.startPolling();
        }
      };
    } catch (error) {
      console.error('[JobStatusTracker] WebSocket 생성 오류:', error);
      this.startPolling();
    }
  }

  private startPolling() {
    if (this.pollingInterval) return; // 이미 폴링 중
    
    console.log('[JobStatusTracker] 폴링 시작');
    this.pollingInterval = setInterval(async () => {
      try {
        const statusUrl = `/api/v1/research/products/${this.jobId}/status`;
        const response = await fetch(statusUrl);
        
        if (!response.ok) {
          console.error('[JobStatusTracker] 폴링 API 오류:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('[JobStatusTracker] 폴링 데이터 수신:', data);
        
        // WebSocket 메시지 형식으로 변환
        const message: WebSocketMessage = {
          type: 'job_status',
          job_id: this.jobId,
          data: data,
          timestamp: new Date().toISOString()
        };
        
        this.handleUpdate(message);
        
        if (data.status === 'completed' || data.status === 'failed') {
          this.stop();
        }
      } catch (error) {
        console.error('[JobStatusTracker] 폴링 중 오류:', error);
      }
    }, 2000);
  }

  private handleUpdate(message: WebSocketMessage) {
    this.onUpdate(message);
    
    // job_complete나 job_error 시 자동 종료
    if (message.type === 'job_complete' || message.type === 'job_error') {
      setTimeout(() => this.stop(), 1000); // 1초 후 정리
    }
  }

  stop() {
    console.log('[JobStatusTracker] 종료');
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

/**
 * JobStatusTracker를 React Hook으로 제공
 */
export function useJobStatusTracker(jobId: string | null, onUpdate: JobUpdateHandler) {
  const trackerRef = useRef<JobStatusTracker | null>(null);

  const startTracking = useCallback(() => {
    if (!jobId || trackerRef.current) return;
    
    console.log('[useJobStatusTracker] 트래킹 시작:', jobId);
    trackerRef.current = new JobStatusTracker(jobId, onUpdate);
    trackerRef.current.start();
  }, [jobId, onUpdate]);

  const stopTracking = useCallback(() => {
    if (trackerRef.current) {
      console.log('[useJobStatusTracker] 트래킹 중지');
      trackerRef.current.stop();
      trackerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (jobId) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [jobId, startTracking, stopTracking]);

  return {
    startTracking,
    stopTracking,
    isTracking: !!trackerRef.current
  };
}