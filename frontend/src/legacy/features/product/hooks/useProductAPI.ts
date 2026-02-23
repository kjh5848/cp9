/**
 * Product Feature - API 호출 전용 훅
 * @module ProductAPI
 */

'use client';

import { useCallback } from 'react';
import { log } from '@/shared/lib/logger';
import type { ProductItem } from '../types';

export interface ProductSearchParams {
  keyword: string;
  limit?: number;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface ProductCategoryParams {
  categoryId: string;
  limit?: number;
  imageSize?: string;
}

export interface DeepLinkParams {
  urls: string[];
}

/**
 * Product API 호출 전용 훅
 */
export function useProductAPI() {
  const searchProducts = useCallback(async (params: ProductSearchParams): Promise<ProductItem[]> => {
    try {
      log('info', '[Product API] 상품 검색 시작', params);

      const response = await fetch('/api/products/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`상품 검색 API 오류: ${response.status} ${response.statusText}`);
      }

      const products = await response.json();
      log('info', '[Product API] 상품 검색 완료', { count: products.length });
      
      return products;
    } catch (error) {
      log('error', '[Product API] 상품 검색 실패', { error: String(error) });
      throw error;
    }
  }, []);

  const searchByCategory = useCallback(async (params: ProductCategoryParams): Promise<ProductItem[]> => {
    try {
      log('info', '[Product API] 카테고리 상품 검색 시작', params);

      const response = await fetch('/api/products/bestcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`카테고리 검색 API 오류: ${response.status} ${response.statusText}`);
      }

      const products = await response.json();
      log('info', '[Product API] 카테고리 검색 완료', { count: products.length });
      
      return products;
    } catch (error) {
      log('error', '[Product API] 카테고리 검색 실패', { error: String(error) });
      throw error;
    }
  }, []);

  const convertToDeepLinks = useCallback(async (params: DeepLinkParams) => {
    try {
      log('info', '[Product API] 딥링크 변환 시작', { urlCount: params.urls.length });

      const response = await fetch('/api/products/deeplink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`딥링크 변환 API 오류: ${response.status} ${response.statusText}`);
      }

      const deepLinks = await response.json();
      log('info', '[Product API] 딥링크 변환 완료', { count: deepLinks.length });
      
      return deepLinks;
    } catch (error) {
      log('error', '[Product API] 딥링크 변환 실패', { error: String(error) });
      throw error;
    }
  }, []);

  return {
    searchProducts,
    searchByCategory,
    convertToDeepLinks,
  };
}