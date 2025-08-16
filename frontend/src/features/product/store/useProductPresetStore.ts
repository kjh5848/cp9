import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PricePreset } from '../types';

interface ProductPresetStore {
  pricePresets: PricePreset[];
  setPricePresets: (presets: PricePreset[]) => void;
  addPricePreset: (preset: PricePreset) => void;
  updatePricePreset: (index: number, preset: PricePreset) => void;
  removePricePreset: (index: number) => void;
}

/**
 * 상품 가격 프리셋을 관리하는 스토어
 * 
 * @description 사용자가 자주 사용하는 가격 범위를 프리셋으로 저장하고 관리합니다.
 * persist를 통해 설정한 프리셋이 영구적으로 저장됩니다.
 */
export const useProductPresetStore = create<ProductPresetStore>()(
  persist(
    (set) => ({
      pricePresets: [
        { label: "0~5만원", min: 0, max: 50000 },
        { label: "5~10만원", min: 50000, max: 100000 },
        { label: "10~20만원", min: 100000, max: 200000 },
        { label: "20~50만원", min: 200000, max: 500000 },
      ],
      setPricePresets: (presets) => set({ pricePresets: presets }),
      addPricePreset: (preset) => set((state) => ({ 
        pricePresets: [...state.pricePresets, preset] 
      })),
      updatePricePreset: (index, preset) => set((state) => ({
        pricePresets: state.pricePresets.map((p, i) => (i === index ? preset : p)),
      })),
      removePricePreset: (index) => set((state) => ({
        pricePresets: state.pricePresets.filter((_, i) => i !== index),
      })),
    }),
    { name: 'product-preset-store' }
  )
);