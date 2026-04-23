import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductItem, ProductHistory, PricePreset } from '@/entities/product/model/types';

interface SearchSharedState {
  results: ProductItem[];
  selected: string[];
  history: ProductHistory[];
  pricePresets: PricePreset[];
  sortOrder: 'asc' | 'desc' | null;
  
  // Actions
  setResults: (items: ProductItem[]) => void;
  setSelected: (ids: string[]) => void;
  addHistory: (keyword: string, items: ProductItem[]) => void;
  clearHistory: () => void;
  clear: () => void;
  
  setPricePresets: (presets: PricePreset[]) => void;
  addPricePreset: (preset: PricePreset) => void;
  updatePricePreset: (index: number, preset: PricePreset) => void;
  removePricePreset: (index: number) => void;
  setSortOrder: (order: 'asc' | 'desc' | null) => void;
}

/**
 * [Features/SearchProduct Layer]
 * 애플리케이션 전반에서 유지되어야 하는 검색 결과와 히스토리를 보관합니다.
 * 컴포넌트에 종속되지 않는 비즈니스 데이터 보관소입니다. (FSD 구조에 맞춰 Entities 타입을 참조합니다.)
 */
export const useSearchStore = create<SearchSharedState>()(
  persist(
    (set) => ({
      results: [],
      selected: [],
      history: [],
      pricePresets: [
        { label: "0~5만원", min: 0, max: 50000 },
        { label: "5~10만원", min: 50000, max: 100000 },
        { label: "10~20만원", min: 100000, max: 200000 },
        { label: "20~50만원", min: 200000, max: 500000 },
      ],
      sortOrder: null,

      setResults: (items) => set({ results: items }),
      setSelected: (ids) => set({ selected: ids }),
      
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
      clear: () => set({ results: [], selected: [] }),
      
      setPricePresets: (presets) => set({ pricePresets: presets }),
      addPricePreset: (preset) => set((state) => ({ pricePresets: [...state.pricePresets, preset] })),
      updatePricePreset: (index, preset) => set((state) => ({
        pricePresets: state.pricePresets.map((p, i) => (i === index ? preset : p)),
      })),
      removePricePreset: (index) => set((state) => ({
        pricePresets: state.pricePresets.filter((_, i) => i !== index),
      })),
      
      setSortOrder: (order) => set({ sortOrder: order }),
    }),
    { name: 'fsd-search-store' }
  )
);
