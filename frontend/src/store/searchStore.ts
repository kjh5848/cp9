import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProductItem = {
  title: string;
  image: string;
  price: number;
  url: string;
  productId: string;
  rocketShipping?: boolean;
  deepLink?: string;
};

export type ProductHistory = {
  keyword: string;
  date: string; // ISO
  results: ProductItem[];
};

interface SearchStore {
  results: ProductItem[];
  setResults: (items: ProductItem[]) => void;
  selected: string[];
  setSelected: (ids: string[]) => void;
  history: ProductHistory[];
  addHistory: (keyword: string, items: ProductItem[]) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      results: [],
      setResults: (items) => set({ results: items }),
      selected: [],
      setSelected: (ids) => set({ selected: ids }),
      history: [],
      addHistory: (keyword, items) => set({ history: [...get().history, { keyword, date: new Date().toISOString(), results: items }] }),
      clear: () => set({ results: [], selected: [] }),
    }),
    { name: 'search-store' }
  )
); 