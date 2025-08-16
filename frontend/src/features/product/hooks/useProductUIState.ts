'use client';

import { useState, useEffect } from 'react';
import { ViewType } from '../types';

type PriceSort = 'none' | 'asc' | 'desc';

interface UseProductUIStateReturn {
  viewType: ViewType;
  setViewType: (type: ViewType) => void;
  priceSort: PriceSort;
  setPriceSort: (sort: PriceSort) => void;
  handlePriceSortChange: (newSort: PriceSort) => void;
}

/**
 * 상품 검색 UI 상태를 관리하는 커스텀 훅 (레거시)
 * 
 * @description 이제 주요 UI 상태는 useProductUIStore에서 관리됩니다.
 * 이 훅은 localStorage 관련 기능만 담당합니다.
 * 
 * @returns UI 상태 관련 변수와 함수들
 */
export function useProductUIState(): UseProductUIStateReturn {
  const [viewType, setViewType] = useState<ViewType>("grid");
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

  return {
    viewType,
    setViewType: handleViewTypeChange,
    priceSort,
    setPriceSort,
    handlePriceSortChange,
  };
}