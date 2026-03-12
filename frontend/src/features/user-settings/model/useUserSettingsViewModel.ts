import useSWR from 'swr';
import { userSettingsApi } from '@/features/user-settings/api/userSettingsApi';
import { DefaultArticleSettings, DefaultThemeSettings, DefaultAutopilotSettings, UserSettingsDTO, UserProfile } from '@/entities/user-settings/model/types';

export const useUserSettingsViewModel = () => {
  // SWR을 사용하여 데이터 패칭 및 Stale-While-Revalidate 캐싱 적용
  const { data, error, isLoading, mutate } = useSWR<UserSettingsDTO>(
    '/api/user-settings',
    userSettingsApi.fetchSettings,
    {
      revalidateOnFocus: false, // 창 포커스 시 무분별한 갱신 방지
      dedupingInterval: 10000,   // 10초 내 동일 요청 디바운스
    }
  );

  // --- Actions ---

  const saveArticleSettings = async (newSettings: DefaultArticleSettings) => {
    try {
      // 낙관적 업데이트 (Optimistic UI Update) - 저장 성공 전 UI 먼저 갱신
      mutate((prev: UserSettingsDTO | undefined) => prev ? { ...prev, articleSettings: newSettings } : undefined, false);
      
      const updatedData = await userSettingsApi.updateArticleSettings(newSettings);
      
      // 실제 서버 데이터로 재검증
      mutate((prev: UserSettingsDTO | undefined) => prev ? { ...prev, articleSettings: updatedData } : undefined, true);
      return { success: true };
    } catch (err) {
      console.error('Failed to save article settings', err);
      // 에러 시 기존 데이터로 복귀를 위해 다시 mutate(revalidate)
      mutate(); 
      return { success: false, error: err };
    }
  };

  const saveThemeSettings = async (newSettings: DefaultThemeSettings) => {
    try {
      mutate((prev: UserSettingsDTO | undefined) => prev ? { ...prev, themeSettings: newSettings } : undefined, false);
      const updatedData = await userSettingsApi.updateThemeSettings(newSettings);
      mutate((prev: UserSettingsDTO | undefined) => prev ? { ...prev, themeSettings: updatedData } : undefined, true);
      return { success: true };
    } catch (err) {
      console.error('Failed to save theme settings', err);
      mutate();
      return { success: false, error: err };
    }
  };

  const saveAutopilotSettings = async (newSettings: DefaultAutopilotSettings) => {
    try {
      mutate((prev: UserSettingsDTO | undefined) => prev ? { ...prev, autopilotSettings: newSettings } : undefined, false);
      const updatedData = await userSettingsApi.updateAutopilotSettings(newSettings);
      mutate((prev: UserSettingsDTO | undefined) => prev ? { ...prev, autopilotSettings: updatedData } : undefined, true);
      return { success: true };
    } catch (err) {
      console.error('Failed to save autopilot settings', err);
      mutate();
      return { success: false, error: err };
    }
  };

  const saveProfile = async (newProfile: Partial<UserProfile>) => {
    try {
      mutate((prev: UserSettingsDTO | undefined) => prev ? { ...prev, profile: { ...prev.profile, ...newProfile } as UserProfile } : undefined, false);
      const updatedData = await userSettingsApi.updateProfile(newProfile);
      mutate((prev: UserSettingsDTO | undefined) => prev ? { ...prev, profile: updatedData } : undefined, true);
      return { success: true };
    } catch (err) {
      console.error('Failed to save profile settings', err);
      mutate();
      return { success: false, error: err };
    }
  };

  const handleChangePassword = () => {
     alert('비밀번호 변경 액션 트리거');
  };
  const handleUpgradeSubscription = () => {
     alert('포트원(PortOne) 결제/구독 모듈 팝업 연동 예정지점');
  };

  return {
    // State
    settings: data,
    isLoading,
    isError: !!error,
    error,
    
    // Derived State for Entities
    profile: data?.profile,
    articleSettings: data?.articleSettings,
    themeSettings: data?.themeSettings,
    autopilotSettings: data?.autopilotSettings,

    // Actions
    saveArticleSettings,
    saveThemeSettings,
    saveAutopilotSettings,
    saveProfile,
    handleChangePassword,
    handleUpgradeSubscription,
  };
};
