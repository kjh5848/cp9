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

interface SearchStore {
  results: ProductItem[];
  setResults: (items: ProductItem[]) => void;
  selected: string[]; // productId or url
  setSelected: (ids: string[]) => void;
  history: ProductItem[][];
  addHistory: (items: ProductItem[]) => void;
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
      addHistory: (items) => set({ history: [...get().history, items] }),
      clear: () => set({ results: [], selected: [] }),
    }),
    { name: 'search-store' }
  )
); 