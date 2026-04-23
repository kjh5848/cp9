import useSWR from "swr";
import { CoupangProductResponse } from "@/shared/types/api";

const fetcher = async (url: string, body?: any) => {
  const options: RequestInit = {
    method: "POST", // Recommend products endpoints require POST
    headers: { "Content-Type": "application/json" },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error fetching ${url}`);
  }
  return res.json();
};

export const useCoupangDefaults = () => {
  const {
    data: defaultPlAll,
    error: plError,
    isLoading: isPlLoading,
  } = useSWR<CoupangProductResponse[]>(
    ["/api/products/coupang-pl", { limit: 50 }],
    ([url, body]) => fetcher(url, body),
    {
      revalidateOnFocus: false, // 추천 상품이므로 잦은 갱신 불필요
      dedupingInterval: 1000 * 60 * 60, // 1시간 캐싱
    }
  );

  const {
    data: defaultGoldbox,
    error: goldError,
    isLoading: isGoldLoading,
  } = useSWR<CoupangProductResponse[]>(
    ["/api/products/goldbox", null],
    ([url]) => fetcher(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 60,
    }
  );

  return {
    defaultPlAll: defaultPlAll || [],
    defaultGoldbox: defaultGoldbox || [],
    isLoading: isPlLoading || isGoldLoading,
    isError: plError || goldError,
  };
};
