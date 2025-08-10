'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ProductItem, DeepLinkResponse } from '../types';
import { ResearchPack } from '@/shared/types/api';

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

  // SEO 글 작성 (새로운 아키텍처: 상품 → 리서치 → 리서치 페이지로 리디렉트)
  const handleGenerateSeo = async () => {
    setIsSeoLoading(true);
    try {
      const selectedItems = filteredResults.filter((_, index) => {
        const itemId = isProductItem(filteredResults[index]) 
          ? filteredResults[index].productId.toString()
          : isDeepLinkResponse(filteredResults[index])
          ? filteredResults[index].originalUrl || index.toString()
          : index.toString();
        return selected.includes(itemId);
      });

      // 선택된 상품 정보 수집 (ProductItem만)
      const productsData = selectedItems
        .filter(isProductItem)
        .map(item => ({
          name: item.productName,
          price: item.productPrice,
          category: item.categoryName,
          url: item.productUrl,
          image: item.productImage,
          productId: item.productId,
          isRocket: item.isRocket,
          isFreeShipping: item.isFreeShipping
        }));

      if (productsData.length === 0) {
        toast.error('선택된 상품이 없습니다');
        return;
      }

      console.log('리서치 생성 요청 시작:', {
        productsCount: productsData.length,
        products: productsData.map(p => ({ name: p.name, price: p.price }))
      });

      // 프로젝트 ID 생성 (UUID 형식)
      const projectId = crypto.randomUUID();

      const completedResults: ResearchPack[] = [];

      // 각 상품에 대해 item-research 호출 (2개씩 배치 처리)
      let processedCount = 0;
      const batchSize = 2;
      
      for (let i = 0; i < productsData.length; i += batchSize) {
        const batch = productsData.slice(i, i + batchSize);
        
        // 배치 내 상품들을 병렬로 처리
        const batchPromises = batch.map(async (product) => {
          try {
            const response = await fetch('/api/item-research', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json; charset=utf-8',
              },
              body: JSON.stringify({
                itemName: product.name,
                projectId: projectId,
                itemId: `item_${product.productId}`,
                productData: {
                  productName: product.name,
                  productPrice: product.price,
                  productImage: product.image,
                  productUrl: product.url,
                  categoryName: product.category,
                  isRocket: product.isRocket,
                  isFreeShipping: product.isFreeShipping
                }
              }, null, 2)
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error(`리서치 실패 (${product.name}):`, {
                status: response.status,
                statusText: response.statusText,
                error: errorData
              });
              throw new Error(`리서치 실패 (${response.status}): ${errorData.details || errorData.error || response.statusText}`);
            }

            const result = await response.json();
            console.log(`리서치 완료: ${product.name}`, result);

            // ResearchPack 형태로 변환하여 저장
            const researchPack: ResearchPack = {
              itemId: `item_${product.productId}`,
              title: product.name,
              priceKRW: product.price,
              isRocket: product.isRocket,
              features: result.researchData.features || [],
              pros: result.researchData.benefits || [],
              cons: ['AI 분석으로 단점 파악 중...'],
              keywords: result.researchData.popularBrands || [],
              metaTitle: `${product.name} 리뷰 및 구매 가이드`,
              metaDescription: result.researchData.overview || '',
              slug: product.name.toLowerCase().replace(/\s+/g, '-')
            };
            
            completedResults.push(researchPack);
            return result;
          } catch (error) {
            console.error(`리서치 오류 (${product.name}):`, error);
            throw error;
          }
        });

        // 배치 완료 대기
        try {
          await Promise.all(batchPromises);
          processedCount += batch.length;
          
          // 진행률 표시
          toast.success(`리서치 진행 중... ${processedCount}/${productsData.length}개 완료`);
        } catch (error) {
          console.error('배치 처리 오류:', error);
          toast.error('일부 상품의 리서치에 실패했습니다');
        }
      }

      // 리서치 완료 후 결과 페이지로 리디렉션
      setIsActionModalOpen(false);
      toast.success('리서치가 완료되었습니다! 결과 페이지로 이동합니다.');
      
      // 결과 데이터를 URL 파라미터로 전달하여 상세 페이지로 이동
      const resultsParam = encodeURIComponent(JSON.stringify(completedResults));
      const resultsUrl = `/research-results?projectId=${projectId}&results=${resultsParam}`;
      
      setTimeout(() => {
        window.location.href = resultsUrl;
      }, 1000);

    } catch (error: unknown) {
      console.error('리서치 생성 오류:', error);
      
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        console.error('에러 스택:', error.stack);
        toast.error(`리서치 생성에 실패했습니다: ${error.message}`);
      } else {
        console.error('알 수 없는 에러 타입:', typeof error);
        console.error('에러 내용:', JSON.stringify(error, null, 2));
        toast.error('리서치 생성에 실패했습니다 (알 수 없는 오류)');
      }
    } finally {
      setIsSeoLoading(false);
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
    handleCopySelectedLinks,
    handleGenerateSeo,
    handleActionButtonClick,
    closeActionModal,
    handleCopyToClipboard
  };
} 