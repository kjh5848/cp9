import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WritingSettings, WritingMode } from './types';
import { CoupangProductResponse } from '@/shared/types/api';
import { TitleCandidate } from '@/features/keyword-writing/api/keyword-api';

export interface WriteDraftState {
  // 모드 및 단계 상태
  mode: WritingMode;
  stepA: number;
  stepB: number;

  // 기본 입력 상태
  keyword: string;
  editedTitle: string;
  titles: TitleCandidate[];
  selectedTitleIdx: number | null;
  
  // 장바구니 상태
  cartItems: Record<number, CoupangProductResponse>;

  // 환경 설정 폼 데이터
  settings: WritingSettings;

  // Actions
  setMode: (mode: WritingMode) => void;
  setStepA: (step: number) => void;
  setStepB: (step: number) => void;
  setKeyword: (keyword: string) => void;
  setEditedTitle: (title: string) => void;
  setTitles: (titles: TitleCandidate[]) => void;
  setSelectedTitleIdx: (idx: number | null) => void;
  setCartItems: (cartItems: Record<number, CoupangProductResponse>) => void;
  updateSettings: (settings: Partial<WritingSettings>) => void;
  
  // 최종 제출 완료 후 Draft Storage 초기화
  resetDraft: () => void;
  
  // 전체 상태 덮어쓰기 (필요 시 복원 용도로 사용 가능)
  hydrateDraft: (draft: Partial<WriteDraftState>) => void;
}

const initialSettings: WritingSettings = {
  persona: "IT",
  tone: "professional",
  articleType: "single",
  textModel: "claude-3-5-sonnet-20241022",
  imageModel: "flux-schnell",
  charLimit: "5000",
};

export const useWriteDraftStore = create<WriteDraftState>()(
  persist(
    (set) => ({
      mode: "keyword_first",
      stepA: 0,
      stepB: 0,
      keyword: "",
      editedTitle: "",
      titles: [],
      selectedTitleIdx: null,
      cartItems: {},
      settings: initialSettings,

      setMode: (mode) => set({ mode }),
      setStepA: (stepA) => set({ stepA }),
      setStepB: (stepB) => set({ stepB }),
      setKeyword: (keyword) => set({ keyword }),
      setEditedTitle: (editedTitle) => set({ editedTitle }),
      setTitles: (titles) => set({ titles }),
      setSelectedTitleIdx: (selectedTitleIdx) => set({ selectedTitleIdx }),
      setCartItems: (cartItems) => set({ cartItems }),
      updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),
      
      resetDraft: () => set({
        mode: "keyword_first",
        stepA: 0,
        stepB: 0,
        keyword: "",
        editedTitle: "",
        titles: [],
        selectedTitleIdx: null,
        cartItems: {},
        settings: initialSettings
      }),
      
      hydrateDraft: (draft) => set((state) => ({ ...state, ...draft }))
    }),
    {
      name: 'cp9-keyword-writing-draft',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
