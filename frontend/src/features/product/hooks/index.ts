// Legacy hooks
export { useProductFilter } from './useProductFilter';
export { usePriceRange } from './usePriceRange';
export { usePricePreset } from './usePricePreset';
export { useSearchOptions } from './useSearchOptions';
export { useProductActions } from './useProductActions';

// New feature-based hooks
export { useProductAPI, type ProductSearchParams, type ProductCategoryParams, type DeepLinkParams } from './useProductAPI';
export { useProductActions as useProductActionsNew } from './useProductActionsNew';

// UI State Hook
export { useProductUIState } from './useProductUIState';

// Feature-specific hooks
// Keyword hooks
export { useKeywordSearch } from './keyword/useKeywordSearch';

// Category hooks  
export { useCategorySearch } from './category/useCategorySearch';

// Form hooks
export { useItemCountForm } from './useItemCountForm';

// Deeplink hooks
export { useDeeplinkConversion } from './deeplink/useDeeplinkConversion'; 