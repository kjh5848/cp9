import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SuggestedTitle } from './types';

export interface AutopilotSettings {
  intervalHours: string;
  activeTimeStart: string;
  activeTimeEnd: string;
}

interface AutopilotState {
  cartTitles: SuggestedTitle[];
  settings: AutopilotSettings;

  // Actions
  setCartTitles: (titles: SuggestedTitle[]) => void;
  updateSettings: (settings: Partial<AutopilotSettings>) => void;
  clearCart: () => void;
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

      setCartTitles: (cartTitles) => set({ cartTitles }),
      clearCart: () => set({ cartTitles: [] }),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'cp9-autopilot-cart-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
