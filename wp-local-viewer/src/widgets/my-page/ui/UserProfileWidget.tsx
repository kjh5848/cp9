"use client";

import React from 'react';
import { ProfileCard } from '@/entities/user-settings/ui/ProfileCard';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';

export const UserProfileWidget: React.FC = () => {
  const { 
    profile, 
    isLoading, 
    isError,
    saveProfile, 
    handleChangePassword, 
    handleUpgradeSubscription 
  } = useUserSettingsViewModel();

  if (isError) {
    return (
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-jakarta text-sm">
        Failed to load user profile. Please try refreshing the page.
      </div>
    );
  }

  return (
    <ProfileCard 
      profile={profile}
      isLoading={isLoading}
      onSaveProfile={(name: string) => saveProfile({ name })}
      onChangePassword={handleChangePassword}
      onUpgradeSubscription={handleUpgradeSubscription}
    />
  );
};
