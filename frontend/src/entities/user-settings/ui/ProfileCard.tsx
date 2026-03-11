import React, { useState } from 'react';
import { UserProfile } from '../model/types';
import { Button } from '@/shared/ui/button'; // Assuming standard shared button
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Check, X } from 'lucide-react';

interface ProfileCardProps {
  profile?: UserProfile;
  isLoading?: boolean;
  onSaveProfile?: (name: string) => Promise<{ success: boolean; error?: any }>;
  onChangePassword?: () => void;
  onUpgradeSubscription?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isLoading = false,
  onSaveProfile,
  onChangePassword,
  onUpgradeSubscription,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  if (isLoading) {
    return (
      <div className="relative p-6 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-noise mix-blend-soft-light opacity-50 pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Falsy fallback 방어
  if (!profile) {
    return null; 
  }

  const { email, name, profileImageUrl, createdAt, subscriptionStatus } = profile;
  
  const displayImage = profileImageUrl ? profileImageUrl : '/placeholder-avatar.png'; // 기본 아바타 (향후 shared/assets 등에서 관리)

  const handleEditClick = () => {
    setEditName(name || '');
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!onSaveProfile) return;
    setIsSaving(true);
    const result = await onSaveProfile(editName);
    setIsSaving(false);
    if (result.success) {
      setIsEditing(false);
    } else {
      alert('프로필 저장에 실패했습니다.');
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return (
    <div className="relative p-6 sm:p-8 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl group transition-all duration-500 hover:border-white/20 hover:shadow-cyan-500/10">
      {/* Background Noise Overlay */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] mix-blend-soft-light opacity-30 pointer-events-none" />
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Avatar Area */}
          <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-br from-white/20 to-white/5 shadow-inner">
            <img 
              src={displayImage} 
              alt={name ? `${name} profile` : 'User profile'} 
              className="w-full h-full rounded-full object-cover"
            />
            {subscriptionStatus === 'PRO' ? (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20 shadow-lg">
                  PRO
                </div>
            ) : null}
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-1">
            {isEditing ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-1">
                <Input 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 text-sm bg-slate-800 border-slate-700 text-white font-syne font-bold w-48"
                  placeholder="닉네임 입력"
                  disabled={isSaving}
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" onClick={handleSaveClick} disabled={isSaving}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-300 hover:bg-slate-800" onClick={handleCancelClick} disabled={isSaving}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <h3 className="text-2xl font-syne font-bold text-white tracking-tight">
                {name ? name : '이름 없는 사용자'}
              </h3>
            )}
            <p className="text-sm font-jakarta text-slate-400">
              {email}
            </p>
            <p className="text-xs font-jakarta text-slate-500 mt-1">
             가입일: {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          {!isEditing && (
            <Button 
              variant="glass" 
              size="sm" 
              onClick={handleEditClick}
              className="font-jakarta border-t-white/30 shadow-inner hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              프로필 수정
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onChangePassword}
            className="font-jakarta text-slate-300 hover:text-white hover:bg-white/5 active:scale-[0.98] transition-all"
          >
            비밀번호 변경
          </Button>
          {subscriptionStatus !== 'PRO' ? (
            <Button 
              variant="tech" 
              size="sm" 
              onClick={onUpgradeSubscription}
              className="font-jakarta bg-gradient-to-r from-cyan-500/80 to-blue-600/80 border-t-cyan-300/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Pro로 업그레이드
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
