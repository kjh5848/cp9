import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SuggestedTitle } from './types';

export interface AutopilotSettings {
  intervalHours: string;
  activeTimeStart: string;
  activeTimeEnd: string;
}

export interface AutopilotDraftState {
  inputMode: 'single' | 'bulk' | 'campaign' | 'inbox';
  wizardStep: number;
  keyword: string;
  topic: string;
  suggestedTitles: SuggestedTitle[];
  depth1?: string;
  depth2?: string;
  depth3?: string;
  customCategory?: string;
}

interface AutopilotState {
  cartTitles: SuggestedTitle[];
  settings: AutopilotSettings;
  draftState: Partial<AutopilotDraftState>;

  // Actions
  setCartTitles: (titles: SuggestedTitle[]) => void;
  updateSettings: (settings: Partial<AutopilotSettings>) => void;
  updateDraftState: (draft: Partial<AutopilotDraftState>) => void;
  clearCart: () => void;
  clearDraft: () => void;
}

const initialSettings: AutopilotSettings = {
  intervalHours: "1440",
  activeTimeStart: "9",
  activeTimeEnd: "22",
};

export const useAutopilotStore = create<AutopilotState>()(
  persist(
    (set) => ({
      cartTitles: [],
      settings: initialSettings,
      draftState: {},

      setCartTitles: (cartTitles) => set({ cartTitles }),
      clearCart: () => set({ cartTitles: [] }),
      clearDraft: () => set({ draftState: {} }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      updateDraftState: (draft) => set((state) => ({
        draftState: { ...state.draftState, ...draft }
      })),
    }),
    {
      name: 'cp9-autopilot-cart-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
