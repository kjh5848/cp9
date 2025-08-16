'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ProductItem } from '../../types';

interface UseKeywordSearchReturn {
  keywordInput: string;
  setKeywordInput: (value: string) => void;
  keywordResults: ProductItem[];
  handleKeywordSearch: (keyword?: string, itemCount?: number) => Promise<void>;
  loading: boolean;
}

/**
 * 키워드 검색 기능을 관리하는 커스텀 훅
 * 
 * @returns 키워드 검색 관련 상태와 함수들
 */
export function useKeywordSearch(): UseKeywordSearchReturn {
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordResults, setKeywordResults] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleKeywordSearch = async (keyword?: string, itemCount?: number) => {
    // 외부에서 전달된 값이 있으면 우선 사용, 없으면 내부 상태 사용
    const searchKeyword = keyword !== undefined ? keyword : keywordInput;
    const searchItemCount = itemCount !== undefined ? itemCount : 5;
    
    // 입력 검증
    if (!searchKeyword.trim()) {
      toast.error('검색할 키워드를 입력해주세요');
      return;
    }

    setLoading(true);
    setKeywordResults([]);
    try {
      const res = await fetch('/api/products/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchKeyword, limit: searchItemCount }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // API에서 오류 응답이 온 경우 체크
      if (data.error) {
        throw new Error(data.error);
      }
      
      const results = Array.isArray(data) ? data : [];
      
      setKeywordResults(results);
      
      if (results.length > 0) {
        toast.success(`${results.length}개의 상품을 찾았습니다`);
      } else {
        toast.error('검색 결과가 없습니다');
      }
    } catch (e) {
      console.error('키워드 검색 오류:', e);
      toast.error('키워드 검색 실패: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setLoading(false);
    }
  };

  return {
    keywordInput,
    setKeywordInput,
    keywordResults,
    handleKeywordSearch,
    loading,
  };
}