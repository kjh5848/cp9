import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductItem, ProductHistory, PricePreset} from '@/features/product/types';

interface SearchStore {
  results: ProductItem[];
  setResults: (items: ProductItem[]) => void;
  selected: string[];
  setSelected: (ids: string[]) => void;
  history: ProductHistory[];
  addHistory: (keyword: string, items: ProductItem[]) => void;
  clear: () => void;
  pricePresets: PricePreset[];
  setPricePresets: (presets: PricePreset[]) => void;
  clearHistory: () => void;
  addPricePreset: (preset: PricePreset) => void;
  updatePricePreset: (index: number, preset: PricePreset) => void;
  removePricePreset: (index: number) => void;
  sortOrder: 'asc' | 'desc' | null;
  setSortOrder: (order: 'asc' | 'desc' | null) => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      results: [],
      setResults: (items) => set({ results: items }),
      selected: [],
      setSelected: (ids) => set({ selected: ids }),
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
      clear: () => set({ results: [], selected: [] }),
      pricePresets: [
        { label: "0~5만원", min: 0, max: 50000 },
        { label: "5~10만원", min: 50000, max: 100000 },
        { label: "10~20만원", min: 100000, max: 200000 },
        { label: "20~50만원", min: 200000, max: 500000 },
      ],
      setPricePresets: (presets) => set({ pricePresets: presets }),
      clearHistory: () => set({ history: [] }),
      addPricePreset: (preset) => set((state) => ({ pricePresets: [...state.pricePresets, preset] })),
      updatePricePreset: (index, preset) => set((state) => ({
        pricePresets: state.pricePresets.map((p, i) => (i === index ? preset : p)),
      })),
      removePricePreset: (index) => set((state) => ({
        pricePresets: state.pricePresets.filter((_, i) => i !== index),
      })),
      sortOrder: null,
      setSortOrder: (order) => set({ sortOrder: order }),
    }),
    { name: 'search-store' }
  )
);

// Re-export types for backward compatibility
export type { ProductItem, ProductHistory, PricePreset } from '@/features/product/types'; 