// Individual stores
export { useProductResultsStore } from './useProductResultsStore';
export { useProductHistoryStore } from './useProductHistoryStore';
export { useProductPresetStore } from './useProductPresetStore';
export { useProductUIStore } from './useProductUIStore';

// Re-export types
export type { ProductItem, ProductHistory, PricePreset } from '../types';

// Combined hook for backward compatibility with useSearchStore
import { useProductResultsStore } from './useProductResultsStore';
import { useProductHistoryStore } from './useProductHistoryStore';
import { useProductPresetStore } from './useProductPresetStore';

/**
 * 기존 useSearchStore와 호환되는 통합 훅
 * 
 * @description 기존 코드의 호환성을 위해 제공되는 통합 인터페이스입니다.
 * 내부적으로는 분리된 여러 store를 조합하여 기존과 동일한 API를 제공합니다.
 * 
 * @deprecated 새로운 코드에서는 개별 store를 직접 사용하는 것을 권장합니다.
 */
export function useSearchStore() {
  const resultsStore = useProductResultsStore();
  const historyStore = useProductHistoryStore();
  const presetStore = useProductPresetStore();

  return {
    // Results store
    results: resultsStore.results,
    setResults: resultsStore.setResults,
    selected: resultsStore.selected,
    setSelected: resultsStore.setSelected,
    clear: resultsStore.clear,
    
    // History store
    history: historyStore.history,
    addHistory: historyStore.addHistory,
    clearHistory: historyStore.clearHistory,
    
    // Preset store
    pricePresets: presetStore.pricePresets,
    setPricePresets: presetStore.setPricePresets,
    addPricePreset: presetStore.addPricePreset,
    updatePricePreset: presetStore.updatePricePreset,
    removePricePreset: presetStore.removePricePreset,
    
    // Legacy compatibility - these methods are deprecated
    sortOrder: null as 'asc' | 'desc' | null,
    setSortOrder: (_order: 'asc' | 'desc' | null) => {
      console.warn('setSortOrder is deprecated. Use useProductUIStore instead.');
    },
  };
}