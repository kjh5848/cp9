import { useState, useCallback } from 'react';
import { SearchOptions, ImageSizeOption } from '../types';
import { DEFAULT_SEARCH_OPTIONS } from '../utils';

/**
 * 검색 옵션 관리를 위한 커스텀 훅
 * 
 * @param initialOptions - 초기 검색 옵션
 * @returns 검색 옵션 상태와 관련 메서드들
 * @example
 * const { options, updateOption, resetOptions } = useSearchOptions();
 */
export function useSearchOptions(initialOptions?: Partial<SearchOptions>) {
  const [options, setOptions] = useState<SearchOptions>({
    ...DEFAULT_SEARCH_OPTIONS,
    ...initialOptions,
  });

  // 특정 옵션 업데이트
  const updateOption = useCallback(<K extends keyof SearchOptions>(
    key: K, 
    value: SearchOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  // 여러 옵션 동시 업데이트
  const updateOptions = useCallback((updates: Partial<SearchOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }));
  }, []);

  // 초기값으로 리셋
  const resetOptions = useCallback(() => {
    setOptions({
      ...DEFAULT_SEARCH_OPTIONS,
      ...initialOptions,
    });
  }, [initialOptions]);

  // 카테고리 ID 업데이트
  const setCategoryId = useCallback((categoryId: string) => {
    updateOption('categoryId', categoryId);
  }, [updateOption]);

  // 이미지 크기 업데이트
  const setImageSize = useCallback((imageSize: number) => {
    updateOption('imageSize', imageSize as ImageSizeOption);
  }, [updateOption]);

  // 베스트 상품 개수 업데이트
  const setBestLimit = useCallback((bestLimit: number) => {
    updateOption('bestLimit', bestLimit);
  }, [updateOption]);

  // 가격 범위 업데이트
  const setPriceRange = useCallback((priceRange: [number, number]) => {
    updateOption('priceRange', priceRange);
  }, [updateOption]);

  return {
    options,
    updateOption,
    updateOptions,
    resetOptions,
    setCategoryId,
    setImageSize,
    setBestLimit,
    setPriceRange,
  };
} 