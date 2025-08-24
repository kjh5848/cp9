'use client';

import { useState, useCallback } from 'react';

/**
 * 모달 상태 관리 전용 훅
 * 모든 모달의 열기/닫기 상태를 관리
 */

export interface ModalState {
  isOpen: boolean;
  data?: unknown; // 모달에 전달할 데이터
}

export function useModal(initialState: boolean = false) {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: initialState,
    data: null,
  });

  /**
   * 모달 열기
   */
  const openModal = useCallback((data?: unknown) => {
    setModalState({ isOpen: true, data });
  }, []);

  /**
   * 모달 닫기
   */
  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, data: null });
  }, []);

  /**
   * 모달 토글
   */
  const toggleModal = useCallback((data?: unknown) => {
    setModalState(prev => ({
      isOpen: !prev.isOpen,
      data: prev.isOpen ? null : data,
    }));
  }, []);

  /**
   * 모달 데이터 업데이트 (열린 상태 유지)
   */
  const updateModalData = useCallback((data: unknown) => {
    setModalState(prev => ({ ...prev, data }));
  }, []);

  return {
    // 상태
    isOpen: modalState.isOpen,
    data: modalState.data,
    
    // 액션
    openModal,
    closeModal,
    toggleModal,
    updateModalData,
  };
}