'use client';

import React, { useState } from 'react';
import { Share2, Globe, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { Switch } from '@/shared/ui/switch';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

export interface PublishTarget {
  platform: 'wordpress' | 'google' | 'naver_cafe';
  enabled: boolean;
  meta: Record<string, string>;
}

interface PublishTargetSectionProps {
  targets?: PublishTarget[];
  onChange?: (targets: PublishTarget[]) => void;
  hideLoadMySettings?: boolean;
}

const DEFAULT_TARGETS: PublishTarget[] = [
  { platform: 'wordpress', enabled: false, meta: { categoryId: '' } },
  { platform: 'google', enabled: false, meta: { blogId: '' } },
  { platform: 'naver_cafe', enabled: false, meta: { clubId: '', menuId: '' } },
];

export function PublishTargetSection({
  targets = DEFAULT_TARGETS,
  onChange,
  hideLoadMySettings = false
}: PublishTargetSectionProps) {
  // Ensure we have all 3 platforms even if some are missing in props
  const safeTargets = DEFAULT_TARGETS.map(def => {
    const found = targets.find(t => t.platform === def.platform);
    return found ? found : def;
  });

  const [wpCategories, setWpCategories] = useState<{id: string|number, name: string}[]>([]);
  const [isLoadingWp, setIsLoadingWp] = useState(false);

  const fetchWpCategories = async () => {
    setIsLoadingWp(true);
    try {
      const res = await fetch('/api/wordpress/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setWpCategories(data.categories);
        }
      }
    } catch (e) {
      console.error('Failed to fetch WordPress categories', e);
    } finally {
      setIsLoadingWp(false);
    }
  };

  const handleToggle = (platform: PublishTarget['platform'], enabled: boolean) => {
    const newTargets = safeTargets.map(t =>
      t.platform === platform ? { ...t, enabled } : t
    );
    onChange?.(newTargets);
  };

  const handleMetaChange = (platform: PublishTarget['platform'], key: string, value: string) => {
    const newTargets = safeTargets.map(t =>
      t.platform === platform
        ? { ...t, meta: { ...t.meta, [key]: value } }
        : t
    );
    onChange?.(newTargets);
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'wordpress': return <Globe className="w-5 h-5 text-blue-400" />;
      case 'google': return <Share2 className="w-5 h-5 text-emerald-400" />;
      case 'naver_cafe': return <FileText className="w-5 h-5 text-green-500" />;
      default: return <Share2 className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch(platform) {
      case 'wordpress': return '워드프레스 (WordPress)';
      case 'google': return '구글 블로거 (Google)';
      case 'naver_cafe': return '네이버 카페 (Naver Cafe)';
      default: return platform;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="text-sm font-semibold text-slate-300">다중 플랫폼 발행 설정</h3>
        {!hideLoadMySettings ? (
          <span className="text-[10px] text-slate-500 hidden xl:inline-block mr-1">플랫폼별 동시 발행을 제어합니다.</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {safeTargets.map((target) => (
          <div 
            key={target.platform} 
            className={`border rounded-xl p-4 transition-all duration-300 ${
              target.enabled 
                ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                : 'border-slate-800/50 bg-slate-900/40 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  {getPlatformIcon(target.platform)}
                </div>
                <span className={`text-sm font-medium ${target.enabled ? 'text-white' : 'text-slate-400'}`}>
                  {getPlatformName(target.platform)}
                </span>
              </div>
              <Switch 
                checked={target.enabled}
                onCheckedChange={(c) => handleToggle(target.platform, c)}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>

            {/* Sub-form when enabled */}
            <div className={`space-y-3 transition-all duration-500 overflow-hidden ${target.enabled ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 m-0'}`}>
              <div className="h-px w-full bg-slate-700/50 mb-3" />
              
              {target.platform === 'wordpress' ? (
                <div className="space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs text-slate-400">발행 카테고리 (선택)</Label>
                    <button 
                      onClick={fetchWpCategories} 
                      disabled={isLoadingWp}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingWp ? 'animate-spin' : ''}`} />
                      카테고리 불러오기
                    </button>
                  </div>
                  {wpCategories.length > 0 ? (
                    <Select 
                      value={target.meta.categoryId || ''} 
                      onValueChange={(val) => handleMetaChange(target.platform, 'categoryId', val === 'none' ? '' : val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-slate-900 border-slate-700 w-full">
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">선택 안 함 (기본값)</SelectItem>
                        {wpCategories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      placeholder="카테고리 ID 직접 입력 (예: 12)" 
                      value={target.meta.categoryId || ''}
                      onChange={(e) => handleMetaChange(target.platform, 'categoryId', e.target.value)}
                      className="h-8 text-xs bg-slate-900 border-slate-700"
                    />
                  )}
                </div>
              ) : null}

              {target.platform === 'google' ? (
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">블로그 ID (필수)</Label>
                  <Input 
                    placeholder="블로그 고유 ID 입력" 
                    value={target.meta.blogId || ''}
                    onChange={(e) => handleMetaChange(target.platform, 'blogId', e.target.value)}
                    className="h-8 text-xs bg-slate-900 border-slate-700"
                  />
                </div>
              ) : null}

              {target.platform === 'naver_cafe' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">클럽 ID</Label>
                    <Input 
                      placeholder="예: 23145" 
                      value={target.meta.clubId || ''}
                      onChange={(e) => handleMetaChange(target.platform, 'clubId', e.target.value)}
                      className="h-8 text-xs bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">메뉴 ID</Label>
                    <Input 
                      placeholder="예: 42" 
                      value={target.meta.menuId || ''}
                      onChange={(e) => handleMetaChange(target.platform, 'menuId', e.target.value)}
                      className="h-8 text-xs bg-slate-900 border-slate-700"
                    />
                  </div>
                </div>
              ) : null}
              
              {target.enabled ? (
                <div className="pt-2 flex items-center gap-1.5 text-xs text-indigo-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>설정 시 자동 발행됩니다.</span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
