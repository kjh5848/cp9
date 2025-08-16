import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductItem, ProductHistory } from '../types';

interface ProductHistoryStore {
  history: ProductHistory[];
  addHistory: (keyword: string, items: ProductItem[]) => void;
  clearHistory: () => void;
}

/**
 * 상품 검색 기록을 관리하는 스토어
 * 
 * @description 사용자의 검색 기록을 저장하고 관리합니다.
 * persist를 통해 브라우저를 닫았다 열어도 기록이 유지됩니다.
 */
export const useProductHistoryStore = create<ProductHistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (keyword, items) => set((state) => ({ 
        history: [...state.history, { 
          id: crypto.randomUUID(),
          keyword, 
          date: new Date().toISOString(), 
          results: items,
          searchType: 'keyword' as const
        }] 
      })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'product-history-store' }
  )
);