import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductItem } from '../types';

interface ProductResultsStore {
  results: ProductItem[];
  setResults: (items: ProductItem[]) => void;
  selected: string[];
  setSelected: (ids: string[]) => void;
  clear: () => void;
}

/**
 * 상품 검색 결과 및 선택 상태를 관리하는 스토어
 * 
 * @description 검색된 상품 목록과 사용자가 선택한 상품들을 관리합니다.
 * persist를 통해 새로고침 시에도 상태가 유지됩니다.
 */
export const useProductResultsStore = create<ProductResultsStore>()(
  persist(
    (set) => ({
      results: [],
      setResults: (items) => set({ results: items }),
      selected: [],
      setSelected: (ids) => set({ selected: ids }),
      clear: () => set({ results: [], selected: [] }),
    }),
    { 
      name: 'product-results-store',
      partialize: (state) => ({
        // results는 새로고침 시 유지하지 않음 (최신 데이터 필요)
        selected: state.selected,
      })
    }
  )
);