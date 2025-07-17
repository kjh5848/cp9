import { useMemo } from 'react';

export function useProductFilter({
  deeplinkResult,
  rocketOnly,
  mode,
  priceMin,
  priceMax,
  selected,
  setSelected,
}: {
  deeplinkResult: any[];
  rocketOnly: boolean;
  mode: string;
  priceMin: number;
  priceMax: number;
  selected: string[];
  setSelected: (ids: string[]) => void;
}) {
  // 필터링된 결과
  const filteredResults = useMemo(() => {
    let base = deeplinkResult;
    if (rocketOnly) {
      base = base.filter((item) => item.isRocket || item.rocketShipping);
    }
    if (mode === 'category') {
      base = base.filter((item) => {
        const price = item.productPrice ?? item.price ?? 0;
        return price >= priceMin && price <= priceMax;
      });
    }
    return base;
  }, [deeplinkResult, rocketOnly, mode, priceMin, priceMax]);

  // 전체선택
  const allIds = useMemo(() => filteredResults.map((item: any) => item.productId || item.url), [filteredResults]);
  const allChecked = allIds.length > 0 && allIds.every((id: any) => selected.includes(id));
  const handleSelectAll = () => {
    setSelected(allChecked ? [] : allIds);
  };

  return { filteredResults, allIds, allChecked, handleSelectAll };
} 