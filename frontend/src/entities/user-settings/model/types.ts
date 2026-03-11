export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  profileImageUrl?: string;
  createdAt: string;
  subscriptionStatus?: 'FREE' | 'PRO' | 'ENTERPRISE'; // PortOne Placeholder
}

export interface DefaultArticleSettings {
  defaultTextModel: string; // e.g. claude-sonnet-4-5
  defaultTitleModel: string; // e.g. gpt-4o-mini
  defaultImageModel: string; // e.g. dall-e-3, nano-banana-2
  presetWordCount: number; // e.g. 3000, 5000
  openAiApiKey?: string;
  geminiApiKey?: string;
  wordpressUrl?: string; // 워드프레스 기본 통신 URL
  wordpressUsername?: string; // 워드프레스 계정명
  wordpressAppPassword?: string; // 워드프레스 앱 비밀번호
}

export interface DefaultThemeSettings {
  themeId: string; // e.g. 'dark', 'light', 'cyberpunk'
  personaId?: string; // e.g. 'master-curator-h'
  personaName?: string;
}

export interface UserSettingsDTO {
  profile: UserProfile;
  articleSettings: DefaultArticleSettings;
  themeSettings: DefaultThemeSettings;
}
