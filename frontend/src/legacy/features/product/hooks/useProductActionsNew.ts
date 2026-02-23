/**
 * Product Feature - 상품 액션 관리 훅 (새로운 아키텍처)
 * @module ProductActions
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { log } from '@/shared/lib/logger';
import { useModal } from '@/shared/hooks/useModal';
import { useClipboard } from '@/shared/hooks/useClipboard';
import { useLoading } from '@/shared/hooks/useLoading';
import { useWorkflowOrchestrator } from '@/features/workflow/hooks/useWorkflowOrchestrator';
import type { ProductItem } from '../types';

/**
 * 새로운 Product Actions 훅
 */
export function useProductActions(
  filteredResults: ProductItem[], 
  selected: string[]
) {
  const modal = useModal();
  const clipboard = useClipboard();
  const loading = useLoading();
  const workflow = useWorkflowOrchestrator();

  // 선택된 상품 정보 계산
  const selectedInfo = useMemo(() => {
    const selectedProducts = filteredResults.filter(item => selected.includes(item.productId.toString()));
    const totalPrice = selectedProducts.reduce((sum, item) => sum + item.productPrice, 0);
    const avgRating = selectedProducts.length > 0 
      ? selectedProducts.reduce((sum, item) => sum + (item.rating || 0), 0) / selectedProducts.length
      : 0;

    return {
      products: selectedProducts,
      count: selectedProducts.length,
      totalPrice,
      avgRating,
      urls: selectedProducts.map(p => p.productUrl).filter(Boolean),
    };
  }, [filteredResults, selected]);

  const handleActionButtonClick = useCallback(() => {
    if (selectedInfo.count === 0) {
      log('warn', '[Product Actions] 선택된 상품이 없음');
      return;
    }

    log('info', '[Product Actions] 액션 모달 열기', { selectedCount: selectedInfo.count });
    modal.openModal();
  }, [selectedInfo.count, modal]);

  const copySelectedLinks = useCallback(async () => {
    try {
      loading.startLoading('clipboard', '링크를 복사하고 있습니다...');
      
      const success = await clipboard.copyURLs(selectedInfo.urls);
      
      if (success) {
        log('info', '[Product Actions] 링크 복사 완료', { count: selectedInfo.urls.length });
        modal.closeModal();
      } else {
        throw new Error('클립보드 복사 실패');
      }
    } catch (error) {
      log('error', '[Product Actions] 링크 복사 실패', { error: String(error) });
    } finally {
      loading.stopLoading('clipboard');
    }
  }, [clipboard, selectedInfo.urls, modal, loading]);

  const generateSEOContent = useCallback(async (keyword: string) => {
    try {
      loading.startLoading('seo', 'SEO 콘텐츠를 생성하고 있습니다...');
      
      const seoContent = await workflow.generateSEOContent(keyword, selectedInfo.urls);
      
      log('info', '[Product Actions] SEO 콘텐츠 생성 완료', {
        keyword,
        title: seoContent.title,
        contentLength: seoContent.content?.length || 0,
      });
      
      modal.closeModal();
      return seoContent;
    } catch (error) {
      log('error', '[Product Actions] SEO 콘텐츠 생성 실패', { error: String(error) });
      throw error;
    } finally {
      loading.stopLoading('seo');
    }
  }, [workflow, selectedInfo.urls, modal, loading]);

  const executeWorkflow = useCallback(async (keyword: string) => {
    try {
      loading.startLoading('workflow', '워크플로우를 실행하고 있습니다...');
      
      const result = await workflow.executeWorkflow({
        urls: selectedInfo.urls,
        keyword,
        config: {
          enablePerplexity: true,
          enableWordPress: true,
          maxProducts: selectedInfo.count,
          realtimeEnabled: true,
        },
      });
      
      log('info', '[Product Actions] 워크플로우 실행 완료', {
        keyword,
        threadId: result.data?.threadId,
      });
      
      modal.closeModal();
      return result;
    } catch (error) {
      log('error', '[Product Actions] 워크플로우 실행 실패', { error: String(error) });
      throw error;
    } finally {
      loading.stopLoading('workflow');
    }
  }, [workflow, selectedInfo, modal, loading]);

  const closeActionModal = useCallback(() => {
    modal.closeModal();
  }, [modal]);

  return {
    // 상태
    isActionModalOpen: modal.isOpen,
    isSEOLoading: loading.isLoading('seo'),
    isWorkflowLoading: loading.isLoading('workflow'),
    isClipboardLoading: loading.isLoading('clipboard'),
    
    // 선택된 상품 정보
    selectedInfo,
    
    // 액션 메서드
    handleActionButtonClick,
    copySelectedLinks,
    generateSEOContent,
    executeWorkflow,
    closeActionModal,
    
    // 로딩 메시지
    loadingMessage: loading.getLoadingMessage('seo') || 
                   loading.getLoadingMessage('workflow') || 
                   loading.getLoadingMessage('clipboard'),
    
    // 클립보드 지원 여부
    clipboardSupported: clipboard.isSupported,
  };
}