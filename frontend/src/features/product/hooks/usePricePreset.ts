import { useState, useMemo, useCallback } from 'react';
import { formatNumber, parseNumber } from '../utils';

/**
 * 가격 프리셋 관리를 위한 커스텀 훅
 * 
 * @returns 프리셋 추가 폼 상태와 관련 메서드들
 * @example
 * const { showForm, newPreset, displayPreset, toggleForm, updatePreset, resetForm } = usePricePreset();
 */
export function usePricePreset() {
  const [showForm, setShowForm] = useState(false);
  const [newPreset, setNewPreset] = useState<[number, number]>([0, 0]);

  // 표시용 포맷된 값들 (파생값)
  const displayPreset = useMemo(() => ({
    min: formatNumber(newPreset[0].toString()),
    max: formatNumber(newPreset[1].toString()),
  }), [newPreset]);

  // 폼 토글
  const toggleForm = useCallback(() => {
    setShowForm((prev) => !prev);
  }, []);

  // 프리셋 값 업데이트
  const updatePreset = useCallback((type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setNewPreset(([_, max]) => [value, max]);
    } else {
      setNewPreset(([min, _]) => [min, value]);
    }
  }, []);

  // 표시용 문자열에서 업데이트
  const updateFromDisplay = useCallback((type: 'min' | 'max', displayValue: string) => {
    const parsedValue = parseNumber(displayValue);
    updatePreset(type, parsedValue);
  }, [updatePreset]);

  // 폼 리셋
  const resetForm = useCallback(() => {
    setNewPreset([0, 0]);
    setShowForm(false);
  }, []);

  // 유효성 검사
  const isValid = useMemo(() => {
    const [min, max] = newPreset;
    return min >= 0 && max > min;
  }, [newPreset]);

  // 프리셋 라벨 생성
  const generateLabel = useCallback(() => {
    const [min, max] = newPreset;
    return `${min.toLocaleString()}~${max.toLocaleString()}원`;
  }, [newPreset]);

  return {
    showForm,
    newPreset,
    displayPreset,
    isValid,
    toggleForm,
    updatePreset,
    updateFromDisplay,
    resetForm,
    generateLabel,
  };
} 