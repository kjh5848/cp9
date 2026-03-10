import { useState, useCallback } from 'react';
import { AiResearchKeyword, AutopilotQueueItem, CreateAutopilotQueuePayload } from '../../../entities/autopilot/model/types';

export function useAutopilotViewModel() {
  const [queue, setQueue] = useState<AutopilotQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/autopilot/queue?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setQueue(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch queue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToQueue = async (payload: CreateAutopilotQueuePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/autopilot/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueue(); // 큐 목록 리로드
        return true;
      } else {
        throw new Error(data.error || 'Failed to add item to queue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromQueue = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/autopilot/queue', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueue(); // 큐 목록 리로드
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete item from queue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const triggerCronManually = async () => {
    try {
      // 보안 헤더 미적용 로컬 테스트용 옵션 - 실제 운영에선 Secret 필요할 수 있음
      const res = await fetch('/api/cron/autopilot');
      const data = await res.json();
      if (res.ok) {
        alert('크론 작업 트리거 성공: ' + (data.message || data.error));
        await fetchQueue();
      } else {
        alert('크론 작업 트리거 오류: ' + data.error);
      }
    } catch (err) {
      alert('크론 요청 중 에러: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const researchKeywords = async (personaId: string, topic: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/autopilot/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personaId, topic, count: 20 }),
      });
      const data = await res.json();
      if (data.success) {
        return data.data as AiResearchKeyword[];
      } else {
        throw new Error(data.error || 'Failed to research keywords');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addBulkToQueue = async (payloads: CreateAutopilotQueuePayload[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/autopilot/queue/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloads }),
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to add bulk items to queue');
      }
      
      await fetchQueue();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    queue,
    isLoading,
    error,
    fetchQueue,
    addToQueue,
    deleteFromQueue,
    triggerCronManually,
    researchKeywords,
    addBulkToQueue,
  };
}
