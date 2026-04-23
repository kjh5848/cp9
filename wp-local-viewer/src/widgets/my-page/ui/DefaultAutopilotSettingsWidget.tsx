"use client";

import React from 'react';
import { AutopilotSettingsForm } from '@/entities/user-settings/ui/AutopilotSettingsForm';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';

export const DefaultAutopilotSettingsWidget: React.FC = () => {
  const { 
    autopilotSettings, 
    isLoading, 
    isError,
    saveAutopilotSettings 
  } = useUserSettingsViewModel();

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async (newSettings: Parameters<typeof saveAutopilotSettings>[0]) => {
    setIsSaving(true);
    const { success } = await saveAutopilotSettings(newSettings);
    setIsSaving(false);
    
    if (success) {
      console.log('Autopilot settings saved successfully.');
    } else {
      console.error('Failed to save autopilot settings.');
    }
  };

  if (isError) return null;

  return (
    <AutopilotSettingsForm 
      settings={autopilotSettings}
      isLoading={isLoading}
      isSaving={isSaving}
      onSave={handleSave}
    />
  );
};
