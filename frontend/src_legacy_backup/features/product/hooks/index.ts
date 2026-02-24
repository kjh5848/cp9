// Legacy hooks
export { useProductFilter } from './useProductFilter';
export { usePriceRange } from './usePriceRange';
export { usePricePreset } from './usePricePreset';
export { useSearchOptions } from './useSearchOptions';
export { useProductActions } from './useProductActions';
export { useProductActions as useProductActionsRefactored } from './useProductActions.refactored';

// New feature-based hooks
export { useProductAPI, type ProductSearchParams, type ProductCategoryParams, type DeepLinkParams } from './useProductAPI';
export { useProductActions as useProductActionsNew } from './useProductActionsNew'; 