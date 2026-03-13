import { useState, useCallback } from 'react';

export interface CategoryCampaign {
  id: string;
  categoryName: string;
  personaId: string | null;
  themeId: string | null;
  intervalHours: number;
  activeTimeStart: number | null;
  activeTimeEnd: number | null;
  batchSize: number;
  isAutoApprove: boolean;
  targetAge?: string | null;
  targetGender?: string | null;
  targetPrice?: string | null;
  targetIndustry?: string | null;
  createdAt: string;
  persona?: { name: string } | null;
  _count?: {
    queues: number;
  };
}

export function useCategoryCampaignViewModel() {
  const [campaigns, setCampaigns] = useState<CategoryCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/autopilot/campaign?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch campaigns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCampaign = async (payload: any) => {
    setIsLoading(true);
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
        await fetchCampaigns();
        return true;
      } else {
        throw new Error(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/autopilot/campaign?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchCampaigns();
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const approveQueues = async (queueIds: string[]) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    createCampaign,
    deleteCampaign,
    approveQueues
  };
}
