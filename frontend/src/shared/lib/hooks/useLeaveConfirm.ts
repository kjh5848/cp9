import { useEffect } from 'react';

/**
 * 페이지를 떠나려고 할 때(새로고침, 탭 닫기, 뒤로 가기 등) 경고창을 띄우는 훅입니다.
 * @param isDirty 변경사항이 있는지 여부. true일 때만 경고창을 띄웁니다.
 * @param message 경고창에 표시할 메시지 (대부분의 모던 브라우저에서는 기본 메시지로 대체됨)
 */
export function useLeaveConfirm(isDirty: boolean, message: string = '변경사항이 저장되지 않았습니다. 정말 떠나시겠습니까?') {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message; // Chrome 등 옛 브라우저 호환성을 위함
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);
}
