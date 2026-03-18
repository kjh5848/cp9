import { useState } from 'react';
import useSWR from 'swr';
import { AiResearchKeyword, AutopilotQueueItem, CreateAutopilotQueuePayload } from '../../../entities/autopilot/model/types';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(data => {
  if (data.success) return data.data;
  throw new Error(data.error || 'Failed to fetch queue');
});

export function useAutopilotViewModel() {
  const { data: queue = [], error: swrError, isLoading: swrIsLoading, mutate: mutateQueue } = useSWR<AutopilotQueueItem[]>('/api/autopilot/queue', fetcher);

  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const isLoading = swrIsLoading || isMutating;
  const error = swrError?.message || mutationError;

  const fetchQueue = async () => {
    await mutateQueue();
  };

  const addToQueue = async (payload: CreateAutopilotQueuePayload) => {
    setIsMutating(true);
    setMutationError(null);
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
        await mutateQueue(); // 큐 목록 리로드
        return true;
      } else {
        throw new Error(data.error || 'Failed to add item to queue');
      }
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteFromQueue = async (id: string) => {
    setIsMutating(true);
    setMutationError(null);
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
        await mutateQueue(); // 큐 목록 리로드
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete item from queue');
      }
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const bulkDeleteFromQueue = async (ids: string[]) => {
    if (!ids || ids.length === 0) return false;
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await fetch('/api/autopilot/queue', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        await mutateQueue(); // 큐 목록 리로드
        return true;
      } else {
        throw new Error(data.error || 'Failed to bulk delete items from queue');
      }
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const rescheduleQueue = async (id: string, newDate: string) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await fetch('/api/autopilot/queue', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, nextRunAt: newDate }),
      });
      const data = await res.json();
      if (data.success) {
        await mutateQueue(); // 큐 목록 리로드
        return true;
      } else {
        throw new Error(data.error || 'Failed to reschedule item in queue');
      }
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const triggerCronManually = async () => {
    try {
      // 보안 헤더 미적용 로컬 테스트용 옵션 - 실제 운영에선 Secret 필요할 수 있음
      const res = await fetch('/api/cron/autopilot');
      const data = await res.json();
      if (res.ok) {
        alert('크론 작업 트리거 성공: ' + (data.message || data.error));
        await mutateQueue();
      } else {
        alert('크론 작업 트리거 오류: ' + data.error);
      }
    } catch (err) {
      alert('크론 요청 중 에러: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const triggerCampaignCronManually = async () => {
    setIsMutating(true);
    try {
      const res = await fetch('/api/cron/campaigns');
      const data = await res.json();
      if (res.ok) {
        alert(`캠페인 큐 보충 완료!\n생성된 총 큐 개수: ${data.generatedCount}개\n처리된 캠페인: ${data.processedCampaigns}개`);
        await mutateQueue();
      } else {
        alert('캠페인 크론 트리거 오류: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (err) {
      alert('캠페인 크론 요청 중 에러: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsMutating(false);
    }
  };

  const researchKeywords = async (personaId: string, topic: string) => {
    setIsMutating(true);
    setMutationError(null);
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
      setMutationError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  const addBulkToQueue = async (payloads: CreateAutopilotQueuePayload[]) => {
    setIsMutating(true);
    setMutationError(null);
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
      
      await mutateQueue();
      return true;
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    queue,
    isLoading,
    error,
    fetchQueue,
    addToQueue,
    deleteFromQueue,
    bulkDeleteFromQueue,
    rescheduleQueue,
    triggerCronManually,
    triggerCampaignCronManually,
    researchKeywords,
    addBulkToQueue,
  };
}
