import { create } from 'zustand';
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

  isLoading: boolean;

  // Actions
  setSeedKeyword: (seedKeyword: string) => void;
  setTargetCount: (targetCount: number) => void;
  setTargetAge: (targetAge: string) => void;
  setTargetGender: (targetGender: string) => void;
  setCategory: (category: string) => void;
  setSearchIntent: (searchIntent: string) => void;
  setSearchModel: (searchModel: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  setExtractedKeywords: (keywords: ExtractedKeyword[]) => void;
  setSelectedKeywords: (keywords: string[]) => void;
  setCartKeywords: (keywords: ExtractedKeyword[]) => void;
  setExportPayload: (payload: { destination: 'keyword-writing' | 'autopilot-single' | 'autopilot-category' | null; keywords: ExtractedKeyword[] } | null) => void;
  resetDraft: () => void;
}

const initialState = {
  seedKeyword: "",
  targetCount: 5,
  targetAge: "all",
  targetGender: "all",
  category: "tech",
  searchIntent: "all",
  searchModel: "sonar-pro",
  isLoading: false,
  extractedKeywords: [],
  selectedKeywords: [],
  cartKeywords: [],
  exportPayload: null,
};

// 키워드 발굴소용 글로벌 드래프트 상태
export const useKeywordLabStore = create<KeywordLabState>((set) => ({
  seedKeyword: initialState.seedKeyword,
  targetCount: initialState.targetCount,
  targetAge: initialState.targetAge,
  targetGender: initialState.targetGender,
  category: initialState.category,
  searchIntent: initialState.searchIntent,
  searchModel: initialState.searchModel,
  isLoading: initialState.isLoading,
  extractedKeywords: initialState.extractedKeywords,
  selectedKeywords: initialState.selectedKeywords,
  cartKeywords: initialState.cartKeywords,
  exportPayload: initialState.exportPayload,

  setSeedKeyword: (seedKeyword) => set({ seedKeyword }),
  setTargetCount: (targetCount) => set({ targetCount }),
  setTargetAge: (targetAge) => set({ targetAge }),
  setTargetGender: (targetGender) => set({ targetGender }),
  setCategory: (category) => set({ category }),
  setSearchIntent: (searchIntent) => set({ searchIntent }),
  setSearchModel: (searchModel) => set({ searchModel }),
  setIsLoading: (isLoading) => set({ isLoading }),

  setExtractedKeywords: (extractedKeywords) => set({ extractedKeywords }),
  setSelectedKeywords: (selectedKeywords) => set({ selectedKeywords }),
  setCartKeywords: (cartKeywords) => set({ cartKeywords }),
  setExportPayload: (exportPayload) => set({ exportPayload }),

  resetDraft: () => set(initialState),
}));
