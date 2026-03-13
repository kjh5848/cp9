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

  // Actions
  setSeedKeyword: (seedKeyword: string) => void;
  setTargetCount: (targetCount: number) => void;
  setTargetAge: (targetAge: string) => void;
  setTargetGender: (targetGender: string) => void;
  setCategory: (category: string) => void;
  setSearchIntent: (searchIntent: string) => void;
  setSearchModel: (searchModel: string) => void;
  
  setExtractedKeywords: (keywords: ExtractedKeyword[]) => void;
  setSelectedKeywords: (keywords: string[]) => void;
  resetDraft: () => void;
}

const initialState = {
  seedKeyword: "",
  targetCount: 5,
  targetAge: "all",
  targetGender: "all",
  category: "tech",
  searchIntent: "all",
  searchModel: "sonar-deep-research",
  extractedKeywords: [],
  selectedKeywords: [],
};

// 키워드 발굴소용 글로벌 드래프트 상태
export const useKeywordLabStore = create<KeywordLabState>((set) => ({
  ...initialState,

  setSeedKeyword: (seedKeyword) => set({ seedKeyword }),
  setTargetCount: (targetCount) => set({ targetCount }),
  setTargetAge: (targetAge) => set({ targetAge }),
  setTargetGender: (targetGender) => set({ targetGender }),
  setCategory: (category) => set({ category }),
  setSearchIntent: (searchIntent) => set({ searchIntent }),
  setSearchModel: (searchModel) => set({ searchModel }),

  setExtractedKeywords: (extractedKeywords) => set({ extractedKeywords }),
  setSelectedKeywords: (selectedKeywords) => set({ selectedKeywords }),

  resetDraft: () => set(initialState),
}));
