'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ProductItem, GroupedProductItem } from '../../types';
import { groupProductsByProductId, flattenGroupedProducts } from '../../utils/product-helpers';

interface CategorySearchOptions {
  categoryId: string;
  imageSize: number;
  bestLimit: number;
  priceRange: [number, number];
}

interface UseCategorySearchReturn {
  categoryResults: ProductItem[];
  groupedCategoryResults: GroupedProductItem[];
  handleCategorySearch: (options: CategorySearchOptions) => Promise<void>;
  loading: boolean;
}

/**
 * 카테고리 검색 기능을 관리하는 커스텀 훅
 * 
 * @returns 카테고리 검색 관련 상태와 함수들
 */
export function useCategorySearch(): UseCategorySearchReturn {
  const [categoryResults, setCategoryResults] = useState<ProductItem[]>([]);
  const [groupedCategoryResults, setGroupedCategoryResults] = useState<GroupedProductItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCategorySearch = async (options: CategorySearchOptions) => {
    // 입력 검증
    if (!options.categoryId || !options.categoryId.trim()) {
      toast.error('카테고리를 선택해주세요');
      return;
    }

    setLoading(true);
    try {
      const imageSize = `${options.imageSize}x${options.imageSize}`;
      const res = await fetch('/api/products/bestcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          categoryId: options.categoryId, 
          limit: options.bestLimit, 
          imageSize 
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const products = await res.json();
      const results = Array.isArray(products) ? products : [];
      
      // 중복 productId 그룹화
      const groupedResults = groupProductsByProductId(results);
      setGroupedCategoryResults(groupedResults);
      
      // 호환성을 위해 평탄화된 결과도 저장
      const flattenedResults = flattenGroupedProducts(groupedResults);
      setCategoryResults(flattenedResults);
      
      if (groupedResults.length > 0) {
        const totalVariants = groupedResults.reduce((sum, group) => sum + group.variantCount, 0);
        const duplicateCount = totalVariants - groupedResults.length;
        const message = duplicateCount > 0 
          ? `${groupedResults.length}개의 베스트 상품을 찾았습니다 (${duplicateCount}개 옵션 포함)`
          : `${groupedResults.length}개의 베스트 상품을 찾았습니다`;
        toast.success(message);
      } else {
        toast.error('해당 카테고리에서 상품을 찾을 수 없습니다');
      }
    } catch (e) {
      toast.error('카테고리 상품 검색 실패: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setLoading(false);
    }
  };

  return {
    categoryResults,
    groupedCategoryResults,
    handleCategorySearch,
    loading,
  };
}