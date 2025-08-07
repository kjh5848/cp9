/**
 * Product Feature - 메인 인덱스
 * 상품 검색, 카테고리 탐색, 딥링크 변환, 상품 액션 등의 기능을 제공
 */

// === Legacy Hooks (호환성 유지) ===
export { useProductFilter } from './hooks/useProductFilter';
export { usePriceRange } from './hooks/usePriceRange';
export { usePricePreset } from './hooks/usePricePreset';
export { useSearchOptions } from './hooks/useSearchOptions';
export { useProductActions } from './hooks/useProductActions';
export { useProductActions as useProductActionsRefactored } from './hooks/useProductActions.refactored';

// === New Feature-Based Hooks ===
// API 레이어
export { 
  useProductAPI, 
  type ProductSearchParams, 
  type ProductCategoryParams, 
  type DeepLinkParams 
} from './hooks/useProductAPI';

// 비즈니스 로직 레이어
export { 
  useProductActions as useProductActionsNew 
} from './hooks/useProductActionsNew';

// === Components ===
export { 
  ActionModal,
  ProductCategorySearchForm,
  ProductHistoryView,
  ProductInput,
  ProductKeywordSearchForm,
  ProductLinkSearchForm,
  ProductResultView,
  SeoLoadingOverlay
} from './components';

// === Types ===
export type { ProductItem } from './types';

// === Utils ===
export * from './utils/product-helpers';