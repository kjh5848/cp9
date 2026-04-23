"use client";

import React, { useState } from 'react';
import { ThemeSettingsForm } from '@/entities/user-settings/ui/ThemeSettingsForm';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';

export const DefaultThemeWidget: React.FC = () => {
  const { 
    themeSettings,
    profile, 
    isLoading, 
    isError,
    saveThemeSettings 
  } = useUserSettingsViewModel();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (newSettings: Parameters<typeof saveThemeSettings>[0]) => {
    setIsSaving(true);
    const { success } = await saveThemeSettings(newSettings);
    setIsSaving(false);
    
    if (success) {
      console.log('Theme settings applied.');
    } else {
      console.error('Failed to apply theme settings.');
    }
  };

  if (isError) return null;

  return (
    <ThemeSettingsForm 
      settings={themeSettings}
      isLoading={isLoading}
      isSaving={isSaving}
      onSave={handleSave}
      profileName={profile?.name}
    />
  );
};
