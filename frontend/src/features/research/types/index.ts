/**
 * 리서치 결과 관련 타입 정의
 */

/**
 * 리서치 아이템 인터페이스
 */
export interface ResearchItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  productUrl: string;
  category: string;
  analysis: {
    pros: string[];
    cons: string[];
    summary: string;
    rating: number;
    keywords: string[];
  };
  seoContent?: {
    title: string;
    description: string;
    content: string;
    tags: string[];
  };
  createdAt: Date;
}

/**
 * 뷰 모드 타입
 */
export type ViewMode = 'gallery' | 'card' | 'table' | 'blog';

/**
 * 리서치 데이터 상태
 */
export interface ResearchDataState {
  items: ResearchItem[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
}

/**
 * 필터 옵션
 */
export interface FilterOptions {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  keywords?: string[];
}

/**
 * 정렬 옵션
 */
export interface SortOptions {
  field: 'name' | 'price' | 'rating' | 'date';
  order: 'asc' | 'desc';
}