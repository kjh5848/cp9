"use client";

import React from 'react';
import { ArticleSettingsForm } from '@/entities/user-settings/ui/ArticleSettingsForm';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';

export const DefaultArticleSettingsWidget: React.FC = () => {
  const { 
    articleSettings, 
    isLoading, 
    isError,
    saveArticleSettings 
  } = useUserSettingsViewModel();

  // 낙관적 업데이트 대응용 자체 Saving 상태
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async (newSettings: Parameters<typeof saveArticleSettings>[0]) => {
    setIsSaving(true);
    const { success } = await saveArticleSettings(newSettings);
    setIsSaving(false);
    
    if (success) {
      // Toast 알림 추가 (가정)
      console.log('Article settings saved successfully.');
    } else {
      console.error('Failed to save article settings.');
    }
  };

  if (isError) {
    return null; // Error handling could be expanded
  }

  return (
    <ArticleSettingsForm 
      settings={articleSettings}
      isLoading={isLoading}
      isSaving={isSaving}
      onSave={handleSave}
    />
  );
};
