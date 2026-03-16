import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExtractedKeyword } from '@/features/keyword-extraction/model/useKeywordExtraction';

interface KeywordLabState {
  // 1. 탐색 조건 State
  seedKeyword: string;
  targetCount: number;
  targetAge: string;
  targetGender: string;
  category: string;
  searchIntent: string;
  searchModel: string;
  keywordType: 'single' | 'topic' | 'category';

  // 2. 결과 처리 State
  extractedKeywords: ExtractedKeyword[];
  selectedKeywords: string[];

  // 3. 장바구니 State
  cartKeywords: ExtractedKeyword[];

  // 4. 내보내기 상태 (Export Payload)
  exportPayload: {
    destination: 'keyword-writing' | 'autopilot-single' | 'autopilot-category' | null;
    keywords: ExtractedKeyword[];
  } | null;

  // 5. 모달 상태
  isCartModalOpen: boolean;

  isLoading: boolean;

  // Actions
  setSeedKeyword: (seedKeyword: string) => void;
  setTargetCount: (targetCount: number) => void;
  setTargetAge: (targetAge: string) => void;
  setTargetGender: (targetGender: string) => void;
  setCategory: (category: string) => void;
  setSearchIntent: (searchIntent: string) => void;
  setSearchModel: (searchModel: string) => void;
  setKeywordType: (keywordType: 'single' | 'topic' | 'category') => void;
  setIsLoading: (isLoading: boolean) => void;
  
  setExtractedKeywords: (keywords: ExtractedKeyword[]) => void;
  setSelectedKeywords: (keywords: string[]) => void;
  setCartKeywords: (keywords: ExtractedKeyword[]) => void;
  setExportPayload: (payload: { destination: 'keyword-writing' | 'autopilot-single' | 'autopilot-category' | null; keywords: ExtractedKeyword[] } | null) => void;
  setIsCartModalOpen: (isOpen: boolean) => void;
  resetDraft: () => void;
  
  // API Sync
  fetchCartFromServer: () => Promise<void>;
  syncCartToServer: (keywords: ExtractedKeyword[]) => Promise<void>;
}

const initialState = {
  seedKeyword: "",
  targetCount: 5,
  targetAge: "all",
  targetGender: "all",
  category: "tech",
  searchIntent: "all",
  searchModel: "sonar-pro",
  keywordType: "single" as const,
  isLoading: false,
  extractedKeywords: [],
  selectedKeywords: [],
  cartKeywords: [],
  exportPayload: null,
  isCartModalOpen: false,
};

// 키워드 발굴소용 글로벌 드래프트 상태
export const useKeywordLabStore = create<KeywordLabState>()(
  persist(
    (set, get) => ({
      seedKeyword: initialState.seedKeyword,
      targetCount: initialState.targetCount,
      targetAge: initialState.targetAge,
      targetGender: initialState.targetGender,
      category: initialState.category,
      searchIntent: initialState.searchIntent,
      searchModel: initialState.searchModel,
      keywordType: initialState.keywordType,
      isLoading: initialState.isLoading,
      extractedKeywords: initialState.extractedKeywords,
      selectedKeywords: initialState.selectedKeywords,
      cartKeywords: initialState.cartKeywords,
      exportPayload: initialState.exportPayload,
      isCartModalOpen: initialState.isCartModalOpen,

      setSeedKeyword: (seedKeyword) => set({ seedKeyword }),
      setTargetCount: (targetCount) => set({ targetCount }),
      setTargetAge: (targetAge) => set({ targetAge }),
      setTargetGender: (targetGender) => set({ targetGender }),
      setCategory: (category) => set({ category }),
      setSearchIntent: (searchIntent) => set({ searchIntent }),
      setSearchModel: (searchModel) => set({ searchModel }),
      setKeywordType: (keywordType) => set({ keywordType }),
      setIsLoading: (isLoading) => set({ isLoading }),

      setExtractedKeywords: (extractedKeywords) => set({ extractedKeywords }),
      setSelectedKeywords: (selectedKeywords) => set({ selectedKeywords }),
      setCartKeywords: (cartKeywords) => {
        set({ cartKeywords });
        // Update server on change (fire and forget for UX)
        get().syncCartToServer(cartKeywords);
      },
      setExportPayload: (exportPayload) => set({ exportPayload }),
      setIsCartModalOpen: (isCartModalOpen) => set({ isCartModalOpen }),

      resetDraft: () => set((state) => ({
        ...initialState,
        cartKeywords: state.cartKeywords, 
        isCartModalOpen: state.isCartModalOpen
      })),

      fetchCartFromServer: async () => {
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            set({ cartKeywords: data.keywords || [] });
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        }
      },

      syncCartToServer: async (keywords: ExtractedKeyword[]) => {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords })
          });
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
    }),
    {
      name: 'keyword-cart-storage',
      partialize: (state) => ({ cartKeywords: state.cartKeywords }), 
    }
  )
);
