import useSWR from "swr";
import { QueueData } from "@/entities/queue/model/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminQueuesResponse {
  queues: QueueData[];
  total: number;
  page: number;
  totalPages: number;
}

export function useAdminMonitoringViewModel() {
  // refreshInterval 30000 옵션으로 30초마다 자동 폴링 (구 useEffect setInterval 대체)
  const { data, error, isLoading } = useSWR<AdminQueuesResponse>(
    "/api/admin/queues",
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    queues: data?.queues || [],
    isLoading,
    isError: error
  };
}
