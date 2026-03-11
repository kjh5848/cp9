import { UserProfile, DefaultArticleSettings, DefaultThemeSettings } from '@/entities/user-settings/model/types';

// Global namespace to act as an in-memory DB during Next.js development
// This avoids losing state across fast refreshes or different API handler modules.
const globalMemory = global as unknown as {
  _userSettingsMockDb: {
    profile: UserProfile;
    articleSettings: DefaultArticleSettings;
    themeSettings: DefaultThemeSettings;
  }
};

if (!globalMemory._userSettingsMockDb) {
  globalMemory._userSettingsMockDb = {
    profile: {
      id: 'usr_12345',
      email: 'nomadlab@example.com',
      name: 'Juhyeok Kim',
      profileImageUrl: '',
      createdAt: '2024-01-01T00:00:00.000Z',
      subscriptionStatus: 'FREE',
    },
    articleSettings: {
      defaultTextModel: 'claude-sonnet-4-5',
      defaultTitleModel: 'gpt-4o-mini',
      defaultImageModel: 'none',
      presetWordCount: 3000,
      openAiApiKey: '',
      geminiApiKey: '',
      wordpressUrl: '',
      wordpressUsername: '',
      wordpressAppPassword: '',
    },
    themeSettings: {
      themeId: 'dark',
      personaId: 'MASTER_CURATOR_H',
    }
  };
}

export const mockDb = globalMemory._userSettingsMockDb;
