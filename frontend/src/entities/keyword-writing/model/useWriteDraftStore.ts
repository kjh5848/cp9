import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WritingSettings } from './types';

export interface WriteDraftState {
  // 기본 입력 상태
  keyword: string;
  editedTitle: string;
  
  // 환경 설정 폼 데이터
  settings: WritingSettings;

  // Actions
  setKeyword: (keyword: string) => void;
  setEditedTitle: (title: string) => void;
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
      keyword: "",
      editedTitle: "",
      settings: initialSettings,

      setKeyword: (keyword) => set({ keyword }),
      setEditedTitle: (editedTitle) => set({ editedTitle }),
      updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),
      
      resetDraft: () => set({
        keyword: "",
        editedTitle: "",
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
