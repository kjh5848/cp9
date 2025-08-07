'use client';

import { useCallback } from 'react';
import { useModal } from './useModal';
import { useClipboard } from './useClipboard';
import { useLoading } from './useLoading';
import { useWorkflowOrchestrator } from './useWorkflowOrchestrator';

/**
 * 개선된 상품 액션 훅 - 책임 분리된 버전
 * 다른 전용 훅들을 조합하여 상품 관련 액션 처리
 */

export interface ProductItem {
  productId: number;
  productName: string;
  productPrice: number;
  productUrl: string;
  productImage?: string;
  categoryName?: string;
  isRocket?: boolean;
  isFreeShipping?: boolean;
}

export interface DeepLinkItem {
  originalUrl: string;
  shortenUrl?: string;
  landingUrl?: string;
}

export type ProductActionItem = ProductItem | DeepLinkItem;

export function useProductActions(
  items: ProductActionItem[],
  selectedIds: string[]
) {
  // 전용 훅들 사용
  const actionModal = useModal();
  const clipboard = useClipboard();
  const loading = useLoading();
  const workflowOrchestrator = useWorkflowOrchestrator();

  // 타입 가드
  const isProductItem = (item: ProductActionItem): item is ProductItem => {
    return 'productId' in item;
  };

  const isDeepLinkItem = (item: ProductActionItem): item is DeepLinkItem => {
    return 'originalUrl' in item;
  };

  /**
   * 선택된 아이템들 가져오기
   */
  const getSelectedItems = useCallback(() => {
    return items.filter((_, index) => {
      const itemId = isProductItem(items[index])
        ? items[index].productId.toString()
        : isDeepLinkItem(items[index])
        ? items[index].originalUrl
        : index.toString();
      return selectedIds.includes(itemId);
    });
  }, [items, selectedIds]);

  /**
   * 선택된 아이템들의 링크 복사
   */
  const copySelectedLinks = useCallback(async () => {
    if (selectedIds.length === 0) {
      return false;
    }

    const selectedItems = getSelectedItems();
    const links = selectedItems.map(item => {
      if (isProductItem(item)) {
        return { name: item.productName, url: item.productUrl };
      } else if (isDeepLinkItem(item)) {
        return { name: '딥링크', url: item.originalUrl };
      }
      return { name: '알 수 없는 아이템', url: '' };
    }).filter(link => link.url);

    const success = await clipboard.copyURLs(links, true);
    
    if (success) {
      actionModal.closeModal();
    }
    
    return success;
  }, [selectedIds, getSelectedItems, clipboard, actionModal]);

  /**
   * SEO 글 생성
   */
  const generateSEOContent = useCallback(async (keyword?: string) => {
    if (selectedIds.length === 0) {
      return null;
    }

    const loadingKey = 'seo_generation';
    
    try {
      loading.startLoading(loadingKey, 'SEO 글 생성 중...', 60000); // 60초 타임아웃
      
      const selectedItems = getSelectedItems();
      const productUrls = selectedItems
        .map(item => {
          if (isProductItem(item)) return item.productUrl;
          if (isDeepLinkItem(item)) return item.originalUrl;
          return '';
        })
        .filter(Boolean);

      if (productUrls.length === 0) {
        throw new Error('유효한 상품 URL이 없습니다');
      }

      // 워크플로우로 SEO 콘텐츠 생성
      const seoContent = await workflowOrchestrator.generateSEOContent(
        keyword || '추천 상품',
        productUrls
      );

      if (!seoContent) {
        throw new Error('SEO 콘텐츠 생성에 실패했습니다');
      }

      // 결과를 새 탭에서 표시
      const selectedProducts = selectedItems.filter(isProductItem);
      showSEOResultInNewTab(seoContent, selectedProducts, keyword);
      
      actionModal.closeModal();
      return seoContent;

    } catch (error) {
      console.error('[useProductActions] SEO 생성 오류:', error);
      throw error; // 상위에서 에러 처리
    } finally {
      loading.stopLoading(loadingKey);
    }
  }, [selectedIds, getSelectedItems, loading, workflowOrchestrator, actionModal]);

  /**
   * SEO 결과를 새 탭에서 표시
   */
  const showSEOResultInNewTab = useCallback((
    seoContent: { title: string; content: string; keywords: string[]; summary: string; },
    products: ProductItem[],
    keyword?: string
  ) => {
    const newWindow = window.open('', '_blank');
    if (!newWindow) return;

    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SEO 글 생성 결과 - ${seoContent.title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            margin: 0; padding: 40px; line-height: 1.6; 
            background-color: #f8f9fa;
          }
          .container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { margin: 0 0 10px 0; font-size: 28px; }
          .header p { margin: 0; opacity: 0.9; font-size: 16px; }
          .meta-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .meta-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
          .meta-card h3 { margin: 0 0 10px 0; color: #495057; font-size: 14px; font-weight: 600; text-transform: uppercase; }
          .meta-card p { margin: 0; color: #6c757d; font-size: 16px; }
          .products-section { background: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
          .product-card { background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .product-name { font-weight: 600; margin-bottom: 5px; color: #212529; }
          .product-price { color: #dc3545; font-weight: 600; }
          .product-category { color: #6c757d; font-size: 14px; }
          .content-section { background: white; padding: 30px; border-radius: 8px; border: 1px solid #e9ecef; }
          .content-section h2 { color: #495057; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          .seo-content { white-space: pre-wrap; line-height: 1.8; }
          .keywords { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px; }
          .keyword-tag { background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
          .copy-button { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 15px; }
          .copy-button:hover { background: #218838; }
          @media (max-width: 768px) {
            body { padding: 20px; }
            .container { padding: 20px; }
            .header { padding: 20px; }
            .meta-info { grid-template-columns: 1fr; }
            .products-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 AI SEO 글 생성 완료</h1>
            <p>${keyword ? `키워드: ${keyword} | ` : ''}${products.length}개 상품 분석 완료</p>
          </div>
          
          <div class="meta-info">
            <div class="meta-card">
              <h3>생성된 콘텐츠</h3>
              <p>${seoContent.title}</p>
            </div>
            <div class="meta-card">
              <h3>콘텐츠 길이</h3>
              <p>${seoContent.content.length.toLocaleString()}자</p>
            </div>
            <div class="meta-card">
              <h3>키워드 수</h3>
              <p>${seoContent.keywords.length}개</p>
            </div>
            <div class="meta-card">
              <h3>생성 시각</h3>
              <p>${new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <div class="products-section">
            <h2>📦 분석된 상품 정보 (${products.length}개)</h2>
            <div class="products-grid">
              ${products.map(product => `
                <div class="product-card">
                  <div class="product-name">${product.productName}</div>
                  <div class="product-price">${product.productPrice.toLocaleString()}원</div>
                  <div class="product-category">${product.categoryName || '카테고리 미정'}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="content-section">
            <h2>📝 생성된 SEO 콘텐츠</h2>
            <p><strong>요약:</strong> ${seoContent.summary}</p>
            <div class="keywords">
              ${seoContent.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
            </div>
            <button class="copy-button" onclick="navigator.clipboard.writeText(document.getElementById('seo-content').textContent)">📋 콘텐츠 복사</button>
            <hr style="margin: 20px 0; border: 1px solid #e9ecef;">
            <div id="seo-content" class="seo-content">${seoContent.content}</div>
          </div>
        </div>
      </body>
      </html>
    `);
    newWindow.document.close();
  }, []);

  /**
   * 액션 버튼 클릭 핸들러
   */
  const handleActionButtonClick = useCallback(() => {
    if (selectedIds.length === 0) {
      return false;
    }
    
    actionModal.openModal({ selectedCount: selectedIds.length });
    return true;
  }, [selectedIds, actionModal]);

  /**
   * 선택된 아이템 정보
   */
  const selectedInfo = {
    count: selectedIds.length,
    hasProducts: getSelectedItems().some(isProductItem),
    hasDeepLinks: getSelectedItems().some(isDeepLinkItem),
    items: getSelectedItems(),
  };

  return {
    // UI 상태
    isActionModalOpen: actionModal.isOpen,
    modalData: actionModal.data,
    
    // 로딩 상태
    isSEOLoading: loading.getLoadingState('seo_generation').isLoading,
    loadingMessage: loading.getLoadingState('seo_generation').message,
    
    // 클립보드 상태
    clipboardSupported: clipboard.isSupported,
    lastCopied: clipboard.lastCopied,
    
    // 선택 정보
    selectedInfo,
    
    // 액션 메서드
    handleActionButtonClick,
    copySelectedLinks,
    generateSEOContent,
    closeActionModal: actionModal.closeModal,
    
    // 직접 노출하는 하위 훅 메서드들
    openActionModal: actionModal.openModal,
    copyToClipboard: clipboard.copyToClipboard,
  };
}