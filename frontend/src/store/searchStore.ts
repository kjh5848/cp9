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

export type PricePreset = { label: string; min: number; max: number };

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
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      results: [],
      setResults: (items) => set({ results: items }),
      selected: [],
      setSelected: (ids) => set({ selected: ids }),
      history: [],
      addHistory: (keyword, items) => set((state) => ({ history: [...state.history, { keyword, date: new Date().toISOString(), results: items }] })),
      clear: () => set({ results: [], selected: [] }),
      pricePresets: [
        { label: "0~10만", min: 0, max: 100000 },
        { label: "0~20만", min: 0, max: 200000 },
        { label: "0~30만", min: 0, max: 300000 },
        { label: "0~40만", min: 0, max: 400000 },
        { label: "0~50만", min: 0, max: 500000 },
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
    }),
    { name: 'search-store' }
  )
); 