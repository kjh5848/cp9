import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface JobStatus {
  status: 'PROCESSING' | 'PUBLISHED' | 'FAILED' | 'NOT_FOUND' | 'UNKNOWN';
  title?: string;
  completedAt?: string;
  failedAt?: string;
  error?: string;
}

interface UseJobPollingOptions {
  /** 폴링 간격 (기본: 5초) */
  intervalMs?: number;
  /** 완료 시 콜백 */
  onComplete?: (status: JobStatus) => void;
  /** 실패 시 콜백 */
  onFailed?: (status: JobStatus) => void;
}

/**
 * 글 생성 상태를 주기적으로 폴링하는 커스텀 훅
 * 
 * 사용법:
 * const { startPolling, stopPolling, jobStatus, isPolling } = useJobPolling({
 *   onComplete: () => { toast.success('완료!'); },
 * });
 * startPolling(projectId, itemId);
 */
export const useJobPolling = (options: UseJobPollingOptions = {}) => {
  const { intervalMs = 5000, onComplete, onFailed } = options;
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paramsRef = useRef<{ projectId: string; itemId: string } | null>(null);

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }, []);

  // 브라우저 알림 전송
  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/cp9-icon.png',
        tag: 'cp9-article-complete',
      });
    }
  }, []);

  // 상태 확인 API 호출
  const checkStatus = useCallback(async () => {
    if (!paramsRef.current) return;

    const { projectId, itemId } = paramsRef.current;
    try {
      const res = await fetch(`/api/research/status?projectId=${projectId}&itemId=${itemId}`);
      const data = await res.json();
      const status: JobStatus = {
        status: data.status,
        title: data.title,
        completedAt: data.completedAt,
        failedAt: data.failedAt,
        error: data.error,
      };
      setJobStatus(status);

      // 완료 시 폴링 중단 + 알림
      if (status.status === 'PUBLISHED') {
        stopPolling();
        toast.success(`📝 "${status.title}" 글 생성 완료!`, { duration: 5000 });
        sendBrowserNotification('CP9 글 생성 완료! 🎉', `"${status.title}" 글이 생성되었습니다.`);
        onComplete?.(status);
      }

      // 실패 시 폴링 중단 + 에러
      if (status.status === 'FAILED') {
        stopPolling();
        toast.error(`❌ 글 생성 실패: ${status.error || '알 수 없는 오류'}`, { duration: 5000 });
        onFailed?.(status);
      }
    } catch (err) {
      console.error('폴링 상태 확인 실패:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onComplete, onFailed, sendBrowserNotification]);

  // 폴링 시작
  const startPolling = useCallback((projectId: string, itemId: string) => {
    // 기존 폴링 중단
    if (intervalRef.current) clearInterval(intervalRef.current);

    paramsRef.current = { projectId, itemId };
    setIsPolling(true);
    setJobStatus({ status: 'PROCESSING' });

    // 알림 권한 요청
    requestNotificationPermission();

    // 첫 번째 체크는 3초 후
    setTimeout(() => checkStatus(), 3000);

    // 이후 intervalMs 간격으로 폴링
    intervalRef.current = setInterval(() => {
      checkStatus();
    }, intervalMs);
  }, [intervalMs, checkStatus, requestNotificationPermission]);

  // 폴링 중단
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    startPolling,
    stopPolling,
    jobStatus,
    isPolling,
  };
};
