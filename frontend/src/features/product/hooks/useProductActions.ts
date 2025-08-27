'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ProductItem, DeepLinkResponse } from '../types';
import { apiClients, isApiError, isNetworkError, isServerError } from '@/infrastructure/api';

/**
 * 상품 액션 관련 로직을 관리하는 훅
 * 링크 복사, SEO 글 생성 등의 액션을 처리
 * 
 * @param filteredResults - 필터링된 상품 결과
 * @param selected - 선택된 상품 ID 배열
 * @returns 액션 관련 상태와 핸들러들
 * 
 * @example
 * ```tsx
 * const { 
 *   isActionModalOpen, 
 *   isSeoLoading, 
 *   handleCopySelectedLinks, 
 *   handleGenerateSeo, 
 *   handleActionButtonClick,
 *   closeActionModal 
 * } = useProductActions(filteredResults, selected);
 * ```
 */
export function useProductActions(
  filteredResults: (ProductItem | DeepLinkResponse)[],
  selected: string[]
) {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [isResearchLoading, setIsResearchLoading] = useState(false);

  // 타입 가드: ProductItem인지 확인
  const isProductItem = (item: ProductItem | DeepLinkResponse): item is ProductItem => {
    return 'productId' in item;
  };

  // 타입 가드: DeepLinkResponse인지 확인
  const isDeepLinkResponse = (item: ProductItem | DeepLinkResponse): item is DeepLinkResponse => {
    return 'originalUrl' in item;
  };

  // 클립보드 복사 함수
  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}이(가) 클립보드에 복사되었습니다`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('복사에 실패했습니다');
      }
    } 
  };

  // 선택된 상품들의 링크 복사
  const handleCopySelectedLinks = async () => {
    const selectedItems = filteredResults.filter((_, index) => {
      const itemId = isProductItem(filteredResults[index]) 
        ? filteredResults[index].productId.toString()
        : isDeepLinkResponse(filteredResults[index])
        ? filteredResults[index].originalUrl || index.toString()
        : index.toString();
      return selected.includes(itemId);
    });

    const links = selectedItems.map(item => {
      if (isProductItem(item)) {
        return `${item.productName}: ${item.productUrl}`;
      } else if (isDeepLinkResponse(item)) {
        return `딥링크: ${item.originalUrl}`;
      }
      return '';
    }).filter(link => link);

    const linksText = links.join('\n');
    await handleCopyToClipboard(linksText, '선택된 상품 링크들');
    setIsActionModalOpen(false);
  };

  // SEO 글 작성 (임시 비활성화 - LangGraph 도입 예정)
  const handleGenerateSeo = async () => {
    // LangGraph 도입 전까지 임시 비활성화
    toast('SEO 글 작성 기능은 현재 준비 중입니다. 곧 업데이트될 예정입니다!', { 
      icon: 'ℹ️',
      duration: 3000 
    });
    setIsActionModalOpen(false);
  };

  // 리서치만 하기 (쿠팡 즉시 리턴 워크플로우)
  const handleResearch = async () => {
    setIsResearchLoading(true);
    try {
      const selectedItems = filteredResults.filter((_, index) => {
        const itemId = isProductItem(filteredResults[index]) 
          ? filteredResults[index].productId.toString()
          : isDeepLinkResponse(filteredResults[index])
          ? filteredResults[index].originalUrl || index.toString()
          : index.toString();
        return selected.includes(itemId);
      });

      // 선택된 상품 정보를 API 가이드 형식으로 변환
      const apiItems = selectedItems.map(item => {
        if (isProductItem(item)) {
          return {
            product_name: item.productName,
            category: item.categoryName,
            price_exact: item.productPrice,
            currency: 'KRW',
            // 쿠팡 API 필드들 (있는 경우)
            product_id: item.productId,
            product_url: item.productUrl,
            product_image: item.productImage,
            is_rocket: item.isRocket || false,
            is_free_shipping: item.isFreeShipping || false,
            category_name: item.categoryName,
            seller_or_store: '쿠팡'
          };
        }
        return null;
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      console.log('쿠팡 즉시 리턴 리서치 요청:', {
        itemsCount: apiItems.length,
        items: apiItems.map(i => ({ name: i.product_name, price: i.price_exact }))
      });

      // 새로운 Research API 클라이언트 사용 (수정된 올바른 방식)
      const result = await apiClients.research.createResearchWithCoupangPreview(apiItems);
      
      console.log('쿠팡 즉시 리턴 성공:', {
        job_id: result.job_id,
        coupangResults: result.results ? result.results.length : 0,
        message: result.message
      });

      // 리서치 관리 페이지를 새 탭에서 열기
      const researchUrl = result.session_id 
        ? `/research?session=${result.session_id}`
        : '/research';
      
      window.open(researchUrl, '_blank');

      toast.success(`리서치가 시작되었습니다! (${apiItems.length}개 상품)`);
      setIsActionModalOpen(false);
    } catch (error: unknown) {
      console.error('리서치 분석 오류:', error);
      
      if (isApiError(error)) {
        // API 에러의 경우 사용자 친화적 메시지 표시
        toast.error(`리서치 분석에 실패했습니다: ${error.getUserMessage()}`);
        
        // 네트워크 오류나 서버 오류의 경우 추가 가이드 제공
        if (isNetworkError(error)) {
          toast.error('네트워크 연결을 확인하고 다시 시도해주세요.', { duration: 5000 });
        } else if (isServerError(error)) {
          toast.error('서버에 문제가 있습니다. 잠시 후 다시 시도해주세요.', { duration: 5000 });
        }
      } else if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        console.error('에러 스택:', error.stack);
        toast.error(`리서치 분석에 실패했습니다: ${error.message}`);
      } else {
        console.error('알 수 없는 에러 타입:', typeof error);
        console.error('에러 내용:', JSON.stringify(error, null, 2));
        toast.error('리서치 분석에 실패했습니다 (알 수 없는 오류)');
      }
    } finally {
      setIsResearchLoading(false);
    }
  };

  // 액션 버튼 클릭 핸들러
  const handleActionButtonClick = () => {
    if (selected.length === 0) {
      toast.error('선택된 상품이 없습니다');
      return;
    }
    setIsActionModalOpen(true);
  };

  // 액션 모달 닫기
  const closeActionModal = () => {
    setIsActionModalOpen(false);
  };

  return {
    isActionModalOpen,
    isSeoLoading,
    isResearchLoading,
    handleCopySelectedLinks,
    handleGenerateSeo,
    handleResearch,
    handleActionButtonClick,
    closeActionModal,
    handleCopyToClipboard
  };
} 