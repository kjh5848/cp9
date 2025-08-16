import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SearchMode = "link" | "keyword" | "category";

interface ProductUIStore {
  // 검색 모드 및 입력값
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
  itemCount: number;
  setItemCount: (count: number) => void;
  keywordInput: string;
  setKeywordInput: (keyword: string) => void;
  links: string;
  setLinks: (links: string) => void;
  
  // 필터 및 정렬 상태
  rocketOnly: boolean;
  setRocketOnly: (value: boolean) => void;
  sortOrder: 'asc' | 'desc' | null;
  setSortOrder: (order: 'asc' | 'desc' | null) => void;
}

/**
 * 상품 페이지 UI 상태를 관리하는 스토어
 * 
 * @description 새로고침 시에도 유지되어야 하는 UI 상태들을 관리합니다.
 * - 선택된 검색 모드
 * - 검색 입력값들
 * - 필터 및 정렬 설정
 */
export const useProductUIStore = create<ProductUIStore>()(
  persist(
    (set) => ({
      // 기본값들
      mode: "category",
      itemCount: 5,
      keywordInput: "",
      links: "",
      rocketOnly: false,
      sortOrder: null,
      
      // Setters
      setMode: (mode) => set({ mode }),
      setItemCount: (count) => set({ itemCount: count }),
      setKeywordInput: (keyword) => set({ keywordInput: keyword }),
      setLinks: (links) => set({ links }),
      setRocketOnly: (value) => set({ rocketOnly: value }),
      setSortOrder: (order) => set({ sortOrder: order }),
    }),
    { name: 'product-ui-store' }
  )
);