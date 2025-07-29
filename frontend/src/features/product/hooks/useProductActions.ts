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
        console.error('SEO 글 생성 API 오류:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
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
    } catch (error) {
      console.error('SEO 글 생성 오류:', error);
      toast.error('SEO 글 생성에 실패했습니다');
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