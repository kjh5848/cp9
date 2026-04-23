import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import type { CategoryCampaign } from '@/entities/campaign/model/types';

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch');
  }
  return data.data;
};

export function useCategoryCampaignViewModel() {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: campaigns = [], error: fetchError, isLoading, mutate: refreshCampaigns } = useSWR<CategoryCampaign[]>(
    '/api/autopilot/campaign',
    fetcher,
    {
      revalidateOnFocus: false, // Optional: FSD best practices standard caching behavior
    }
  );

  const createCampaign = async (payload: any) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch('/api/autopilot/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await refreshCampaigns(); // SWR 캐시 갱신
        return true;
      } else {
        throw new Error(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const updateCampaign = async (id: string, payload: any) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch('/api/autopilot/campaign', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...payload }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshCampaigns(); // SWR 캐시 갱신
        return true;
      } else {
        throw new Error(data.error || 'Failed to update campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch(`/api/autopilot/campaign?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await refreshCampaigns();
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteCampaigns = async (ids: string[]) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch(`/api/autopilot/campaign?ids=${ids.join(',')}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await refreshCampaigns();
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete campaigns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const approveQueues = async (queueIds: string[]) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch('/api/autopilot/campaign/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queueIds }),
      });
      const data = await res.json();
      if (data.success) {
        return true;
      } else {
        throw new Error(data.error || 'Failed to approve queues');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // 기존 레거시 호환성을 위해 이름 유지
  const fetchCampaigns = async () => {
    await refreshCampaigns();
  };

  return {
    campaigns,
    isLoading: isLoading || isMutating,
    error: error || (fetchError ? fetchError.message : null),
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    deleteCampaigns,
    approveQueues,
  };
}
