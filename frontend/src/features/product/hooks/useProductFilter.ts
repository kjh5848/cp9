import { useMemo } from 'react';

export function useProductFilter({
  deeplinkResult,
  rocketOnly,
  mode,
  selected,
  setSelected,
}: {
  deeplinkResult: any[];
  rocketOnly: boolean;
  mode: string;
  selected: string[];
  setSelected: (ids: string[]) => void;
}) {
  // 필터링된 결과 (로켓배송 필터만 적용)
  const filteredResults = useMemo(() => {
    let base = deeplinkResult;
    if (rocketOnly) {
      base = base.filter((item) => item.isRocket || item.rocketShipping);
    }
    // 가격 필터링은 ProductCategorySearchForm에서 처리
    return base;
  }, [deeplinkResult, rocketOnly]);

  // 전체선택
  const allIds = useMemo(() => filteredResults.map((item: any) => item.productId || item.url), [filteredResults]);
  const allChecked = allIds.length > 0 && allIds.every((id: any) => selected.includes(id));
  const handleSelectAll = () => {
    setSelected(allChecked ? [] : allIds);
  };

  return { filteredResults, allIds, allChecked, handleSelectAll };
} 