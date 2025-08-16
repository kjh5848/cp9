import { useMemo } from 'react';
import { generateItemId } from '../utils/product-helpers';
import { ProductItem, DeepLinkResponse } from '../types';

export function useProductFilter({
  filteredResults,
  selected,
  setSelected,
}: {
  filteredResults: (ProductItem | DeepLinkResponse)[];
  selected: string[];
  setSelected: (ids: string[]) => void;
}) {
  // 전체선택을 위한 모든 ID 생성 (ProductResultView와 동일한 방식 사용)
  const allIds = useMemo(() => 
    filteredResults.map((item, index) => generateItemId(item, index)),
    [filteredResults]
  );

  // 전체선택 상태 확인
  const allChecked = allIds.length > 0 && allIds.every((id) => selected.includes(id));

  // 전체선택/해제 핸들러
  const handleSelectAll = () => {
    setSelected(allChecked ? [] : allIds);
  };

  return { allIds, allChecked, handleSelectAll };
} 