'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ProductItem, DeepLinkResponse } from '../types';

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

  // SEO 글 작성 (LangGraph 연동)
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

      // 선택된 상품 정보 수집
      const productsData = selectedItems.map(item => {
        if (isProductItem(item)) {
          return {
            name: item.productName,
            price: item.productPrice,
            category: item.categoryName,
            url: item.productUrl,
            image: item.productImage
          };
        }
        return null;
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      // LangGraph API 호출
      console.log('SEO 생성 요청 시작:', {
        productsCount: productsData.length,
        products: productsData.map(p => ({ name: p.name, price: p.price }))
      });

      const response = await fetch('/api/langgraph/seo-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: productsData,
          type: 'product_review'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          errorText
        };
        console.error('SEO 글 생성 API 오류:', errorDetails);
        console.error('API 응답 상태:', response.status);
        console.error('API 응답 메시지:', response.statusText);
        console.error('API 에러 내용:', errorText);
        throw new Error(`SEO 글 생성에 실패했습니다 (${response.status}: ${response.statusText})`);
      }

      const result = await response.json();
      
      // 결과를 새 탭에서 열기
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>SEO 글 생성 결과</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
              .content { max-width: 800px; margin: 0 auto; }
              .product-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              .seo-content { background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="content">
              <div class="header">
                <h1>🎯 AI SEO 글 생성 결과</h1>
                <p>선택된 ${productsData.length}개 상품을 기반으로 생성된 SEO 최적화 글입니다.</p>
              </div>
              
              <div class="product-info">
                <h3>📦 분석된 상품 정보</h3>
                ${productsData.map(product => `
                  <div style="margin-bottom: 10px;">
                    <strong>${product.name}</strong> - ${product.price.toLocaleString()}원
                    <br><small>카테고리: ${product.category}</small>
                  </div>
                `).join('')}
              </div>
              
              <div class="seo-content">
                <h3>📝 SEO 최적화 글</h3>
                <div style="white-space: pre-wrap;">${result.content || 'SEO 글을 생성하는 중입니다...'}</div>
              </div>
            </div>
          </body>
          </html>
        `);
        newWindow.document.close();
      }

      toast.success('SEO 글이 새 탭에서 열렸습니다');
      setIsActionModalOpen(false);
    } catch (error: unknown) {
      console.error('SEO 글 생성 오류:', error);
      
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        console.error('에러 스택:', error.stack);
        toast.error(`SEO 글 생성에 실패했습니다: ${error.message}`);
      } else {
        console.error('알 수 없는 에러 타입:', typeof error);
        console.error('에러 내용:', JSON.stringify(error, null, 2));
        toast.error('SEO 글 생성에 실패했습니다 (알 수 없는 오류)');
      }
    } finally {
      setIsSeoLoading(false);
    }
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

      // 쿠팡 즉시 리턴 워크플로우로 API 호출
      const response = await fetch('/api/research/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: apiItems,
          return_coupang_preview: true,
          priority: 5 // 높은 우선순위
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          errorText
        };
        console.error('리서치 API 오류:', errorDetails);
        throw new Error(`리서치 분석에 실패했습니다 (${response.status}: ${response.statusText})`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || '리서치 결과를 가져올 수 없습니다.');
      }

      console.log('쿠팡 즉시 리턴 성공:', {
        job_id: result.data.job_id,
        coupangResults: result.data.results ? result.data.results.length : 0,
        message: result.message
      });

      // 리서치 관리 페이지를 새 탭에서 열기
      const researchUrl = result.data.session_id 
        ? `/research?session=${result.data.session_id}`
        : '/research';
      
      window.open(researchUrl, '_blank');

      toast.success(`리서치가 시작되었습니다! (${apiItems.length}개 상품)`);
      setIsActionModalOpen(false);
    } catch (error: unknown) {
      console.error('리서치 분석 오류:', error);
      
      if (error instanceof Error) {
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