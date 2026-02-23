'use client';

import { useCallback } from 'react';

/**
 * 상품 관련 API 호출 전용 훅
 */

export interface ProductSearchParams {
  keyword: string;
  limit?: number;
}

export interface ProductCategoryParams {
  categoryId: string;
  limit?: number;
  imageSize?: string;
}

export interface DeepLinkParams {
  urls: string[];
}

export interface ProductAPIResponse {
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  productId: number;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryName: string;
}

export interface DeepLinkAPIResponse {
  originalUrl: string;
  shortenUrl: string;
  landingUrl: string;
}

export function useProductAPI() {
  /**
   * 키워드로 상품 검색
   */
  const searchProducts = useCallback(async (
    params: ProductSearchParams
  ): Promise<ProductAPIResponse[]> => {
    const response = await fetch('/api/products/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }, []);

  /**
   * 카테고리별 베스트 상품 조회
   */
  const getBestCategoryProducts = useCallback(async (
    params: ProductCategoryParams
  ): Promise<ProductAPIResponse[]> => {
    const response = await fetch('/api/products/bestcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }, []);

  /**
   * 딥링크 변환
   */
  const convertToDeepLinks = useCallback(async (
    params: DeepLinkParams
  ): Promise<DeepLinkAPIResponse[]> => {
    const response = await fetch('/api/products/deeplink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }, []);

  return {
    searchProducts,
    getBestCategoryProducts,
    convertToDeepLinks,
  };
}