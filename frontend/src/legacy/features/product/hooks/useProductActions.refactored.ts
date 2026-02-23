'use client';

import { useProductActions as useNewProductActions } from '@/shared/hooks/useProductActions';
import { ProductItem } from '../types';

/**
 * 기존 useProductActions 훅을 대체하는 리팩토링된 버전
 * 기존 인터페이스와 호환성을 유지하면서 내부적으로 분리된 훅들 사용
 */

export function useProductActions(
  filteredResults: ProductItem[], 
  selected: string[]
) {
  const newProductActions = useNewProductActions(filteredResults, selected);

  /**
   * 기존 SEO 글 생성 메서드와 호환성 유지
   */
  const handleGenerateSeo = async () => {
    try {
      const seoContent = await newProductActions.generateSEOContent('추천 상품');
      return seoContent;
    } catch (error) {
      // 기존과 동일한 에러 처리
      console.error('[useProductActions] SEO 생성 오류:', error);
      throw error;
    }
  };

  // 기존 인터페이스와 완전 호환
  return {
    // UI 상태 (기존과 동일)
    isActionModalOpen: newProductActions.isActionModalOpen,
    isSeoLoading: newProductActions.isSEOLoading,
    
    // 액션 메서드 (기존과 동일한 이름)
    handleCopySelectedLinks: newProductActions.copySelectedLinks,
    handleGenerateSeo,
    handleActionButtonClick: newProductActions.handleActionButtonClick,
    closeActionModal: newProductActions.closeActionModal,
    
    // 추가된 기능들 (선택적으로 사용 가능)
    selectedInfo: newProductActions.selectedInfo,
    loadingMessage: newProductActions.loadingMessage,
    clipboardSupported: newProductActions.clipboardSupported,
  };
}

/**
 * 마이그레이션 가이드:
 * 
 * 기존 코드는 변경 없이 동작:
 * const { 
 *   isActionModalOpen, 
 *   isSeoLoading, 
 *   handleCopySelectedLinks, 
 *   handleGenerateSeo, 
 *   handleActionButtonClick,
 *   closeActionModal 
 * } = useProductActions(filteredResults, selected);
 * 
 * 내부적으로는 다음과 같이 개선됨:
 * - 클립보드, 모달, 로딩 상태가 별도 훅으로 분리
 * - 더 세밀한 상태 관리
 * - 더 나은 에러 처리
 * - 확장 가능한 구조
 */