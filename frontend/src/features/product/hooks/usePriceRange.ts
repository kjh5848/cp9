import { useState, useMemo, useCallback } from 'react';
import { formatNumber, parseNumber } from '../utils';

/**
 * 가격 범위 관리를 위한 커스텀 훅
 * 
 * @param initialRange - 초기 가격 범위 [최소값, 최대값]
 * @returns 가격 범위 상태와 관련 메서드들
 * @example
 * const { range, displayRange, setMin, setMax, reset, updateFromDisplay } = usePriceRange([0, 5000000]);
 */
export function usePriceRange(initialRange: [number, number] = [0, 5_000_000]) {
  const [range, setRange] = useState<[number, number]>(initialRange);

  // 표시용 포맷된 값들 (파생값)
  const displayRange = useMemo(() => ({
    min: formatNumber(range[0].toString()),
    max: formatNumber(range[1].toString()),
  }), [range]);

  // 최소값 설정
  const setMin = useCallback((value: number) => {
    setRange(([_, max]) => [value, max]);
  }, []);

  // 최대값 설정
  const setMax = useCallback((value: number) => {
    setRange(([min, _]) => [min, value]);
  }, []);

  // 범위 전체 설정
  const setRangeValues = useCallback((newRange: [number, number]) => {
    setRange(newRange);
  }, []);

  // 초기값으로 리셋
  const reset = useCallback(() => {
    setRange(initialRange);
  }, [initialRange]);

  // 표시용 문자열에서 업데이트
  const updateFromDisplay = useCallback((type: 'min' | 'max', displayValue: string) => {
    const parsedValue = parseNumber(displayValue);
    if (type === 'min') {
      setMin(parsedValue);
    } else {
      setMax(parsedValue);
    }
  }, [setMin, setMax]);

  return {
    range,
    displayRange,
    setMin,
    setMax,
    setRangeValues,
    reset,
    updateFromDisplay,
  };
} 