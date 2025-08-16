'use client';

import toast from "react-hot-toast";

interface UseItemCountFormOptions {
  min?: number;
  max?: number;
  alertMessage?: string;
}

interface UseItemCountFormReturn {
  handleItemCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * 아이템 개수 입력 검증 로직을 관리하는 범용 커스텀 훅
 * 
 * @param setItemCount - 아이템 개수 설정 함수
 * @param options - 최소값, 최대값, 알림 메시지 설정
 * @returns 아이템 개수 입력 핸들러
 * 
 * @example
 * ```tsx
 * const { handleItemCountChange } = useItemCountForm(setCount, {
 *   min: 1,
 *   max: 100,
 *   alertMessage: '최대 100개까지만 검색할 수 있습니다.'
 * });
 * ```
 */
export function useItemCountForm(
  setItemCount: (value: number) => void,
  options: UseItemCountFormOptions = {}
): UseItemCountFormReturn {
  const { 
    min = 1, 
    max = 100, 
    alertMessage = `최대 ${max}개까지만 검색할 수 있습니다.` 
  } = options;

  const handleItemCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    
    if (value > max) {
      toast.error(alertMessage);
      setItemCount(max);
    } else if (value < min) {
      setItemCount(min);
    } else {
      setItemCount(value);
    }
  };

  return {
    handleItemCountChange,
  };
}