'use client';

import { useState, useEffect } from 'react';
import { ViewType } from '../types';

type SearchMode = "link" | "keyword" | "category";
type PriceSort = 'none' | 'asc' | 'desc';

interface UseProductUIStateReturn {
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
  itemCount: number;
  setItemCount: (count: number) => void;
  viewType: ViewType;
  setViewType: (type: ViewType) => void;
  rocketOnly: boolean;
  setRocketOnly: (value: boolean) => void;
  priceSort: PriceSort;
  setPriceSort: (sort: PriceSort) => void;
  handleModeChange: (newMode: SearchMode) => void;
  handlePriceSortChange: (newSort: PriceSort) => void;
  sortOrder: 'asc' | 'desc' | null;
  setSortOrder: (order: 'asc' | 'desc' | null) => void;
}

/**
 * 상품 검색 UI 상태를 관리하는 커스텀 훅
 * 
 * @returns UI 상태 관련 변수와 함수들
 */
export function useProductUIState(): UseProductUIStateReturn {
  const [mode, setMode] = useState<SearchMode>("category");
  const [itemCount, setItemCount] = useState(5);
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [rocketOnly, setRocketOnly] = useState(false);
  const [priceSort, setPriceSort] = useState<PriceSort>('none');

  // localStorage에서 viewType 복원
  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewType((localStorage.getItem("viewType") as ViewType) || "grid");
    }
  }, []);

  // localStorage에서 priceSort 복원
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPriceSort = localStorage.getItem("priceSort") as PriceSort;
      if (savedPriceSort) {
        setPriceSort(savedPriceSort);
      }
    }
  }, []);

  // viewType 변경 시 localStorage에 저장
  const handleViewTypeChange = (type: ViewType) => {
    setViewType(type);
    if (typeof window !== "undefined") {
      localStorage.setItem("viewType", type);
    }
  };

  const handlePriceSortChange = (newSort: PriceSort) => {
    setPriceSort(newSort);
    if (typeof window !== "undefined") {
      localStorage.setItem("priceSort", newSort);
    }
  };

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
  };

  // sortOrder로 변환하는 계산된 값
  const sortOrder: 'asc' | 'desc' | null = priceSort === 'none' ? null : priceSort as 'asc' | 'desc';
  const setSortOrder = (order: 'asc' | 'desc' | null) => {
    setPriceSort(order === null ? 'none' : order);
  };

  return {
    mode,
    setMode,
    itemCount,
    setItemCount,
    viewType,
    setViewType: handleViewTypeChange,
    rocketOnly,
    setRocketOnly,
    priceSort,
    setPriceSort,
    handleModeChange,
    handlePriceSortChange,
    sortOrder,
    setSortOrder,
  };
}