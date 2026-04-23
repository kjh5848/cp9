"use client";

import React from 'react';
import { ApiIntegrationSettingsForm } from '@/entities/user-settings/ui/ApiIntegrationSettingsForm';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';

export const ApiIntegrationSettingsWidget: React.FC = () => {
  const { 
    articleSettings, 
    isLoading, 
    isError,
    saveArticleSettings 
  } = useUserSettingsViewModel();

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async (newSettings: Parameters<typeof saveArticleSettings>[0]) => {
    setIsSaving(true);
    const { success } = await saveArticleSettings(newSettings);
    setIsSaving(false);
    
    if (success) {
      console.log('API Integration settings saved successfully.');
    } else {
      console.error('Failed to save API integration settings.');
    }
  };

  if (isError) {
    return null;
  }

  return (
    <ApiIntegrationSettingsForm 
      settings={articleSettings}
      isLoading={isLoading}
      isSaving={isSaving}
      onSave={handleSave}
    />
  );
};
