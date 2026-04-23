import { UserSettingsDTO, DefaultArticleSettings, DefaultThemeSettings, DefaultAutopilotSettings, UserProfile } from '@/entities/user-settings/model/types';

const API_BASE_URL = '/api/user-settings';

export const userSettingsApi = {
  // SWR fetcher
  fetchSettings: async (url: string): Promise<UserSettingsDTO> => {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
         throw new Error('Unauthorized');
      }
      throw new Error(`Failed to fetch user settings: ${response.statusText}`);
    }
    return response.json();
  },

  updateArticleSettings: async (settings: DefaultArticleSettings): Promise<DefaultArticleSettings> => {
    const response = await fetch(`${API_BASE_URL}/article`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) throw new Error('Failed to update article settings');
    return response.json();
  },

  updateThemeSettings: async (settings: DefaultThemeSettings): Promise<DefaultThemeSettings> => {
    const response = await fetch(`${API_BASE_URL}/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) throw new Error('Failed to update theme settings');
    return response.json();
  },

  updateAutopilotSettings: async (settings: DefaultAutopilotSettings): Promise<DefaultAutopilotSettings> => {
    const response = await fetch(`${API_BASE_URL}/autopilot`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) throw new Error('Failed to update autopilot settings');
    return response.json();
  },

  // (Optional) 별도의 프로필 수정/탈퇴/구독 등 API (추후 확장)
  updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }
};
