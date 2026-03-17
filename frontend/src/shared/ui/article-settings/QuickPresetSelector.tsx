import React, { useState } from 'react';
import Link from 'next/link';
import { Settings2, AlertCircle } from 'lucide-react';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';

export interface QuickPresetSelectorProps {
  quickPreset: string;
  setQuickPreset: (v: string) => void;
  setTextModel: (v: string) => void;
  setImageModel: (v: string) => void;
  setCharLimit: (v: string | number) => void;
  setCharLimitMode?: (v: string) => void;
  setPersona: (v: string) => void;
  setPersonaName?: (v: string) => void;
  setThemeId?: (v: string | null) => void;
  themes?: import('@/entities/design/ui/ThemeSwitcher').ThemeSwitcherTheme[];
}

export function QuickPresetSelector({
  quickPreset,
  setQuickPreset,
  setTextModel,
  setImageModel,
  setCharLimit,
  setCharLimitMode,
  setPersona,
  setPersonaName,
  setThemeId,
  themes,
}: QuickPresetSelectorProps) {
  const { articleSettings, themeSettings } = useUserSettingsViewModel();
  const [showEmptySettingsWarning, setShowEmptySettingsWarning] = useState(false);

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3 relative">
      <div className="flex items-center justify-between mb-1">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-300">
          간편 설정 불러오기
          <Link href="/my-page" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors" title="내 설정 관리">
            <Settings2 className="w-4 h-4" />
          </Link>
        </h4>
        <span className="text-[10px] text-slate-500">선택 시 설정값이 자동 입력됩니다.</span>
      </div>
      <select
        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        value={quickPreset}
        onChange={(e) => {
          const val = e.target.value;
          setQuickPreset(val);

          const applyTheme = (idToSet: string | undefined | null) => {
            if (!setThemeId) return;
            
            if (idToSet && themes && themes.length > 0) {
              const isValid = themes.some(t => t.id === idToSet);
              if (isValid) {
                setThemeId(idToSet);
              } else {
                const defaultTheme = themes.find(t => t.isDefault);
                setThemeId(defaultTheme ? defaultTheme.id : themes[0].id);
              }
            } else if (idToSet) {
                setThemeId(idToSet);
            } else if (themes && themes.length > 0) {
              // Fallback if no idToSet is given
              const defaultTheme = themes.find(t => t.isDefault);
              setThemeId(defaultTheme ? defaultTheme.id : themes[0].id);
            }
          };

          if (val === "my-settings") {
            const hasArticleSettings = articleSettings && (articleSettings.defaultTextModel || articleSettings.presetWordCount);
            const hasThemeSettings = themeSettings && (themeSettings.personaId || themeSettings.themeId);
            
            if (!hasArticleSettings && !hasThemeSettings) {
              setShowEmptySettingsWarning(true);
            } else {
              setShowEmptySettingsWarning(false);
            }

            if (articleSettings) {
              if (articleSettings.defaultTextModel) setTextModel(articleSettings.defaultTextModel);
              if (articleSettings.defaultImageModel && setImageModel) setImageModel(articleSettings.defaultImageModel);
              if (articleSettings.presetWordCount) {
                setCharLimit(articleSettings.presetWordCount);
                if (setCharLimitMode) setCharLimitMode("custom");
              }
            }
            if (themeSettings?.personaId) setPersona(themeSettings.personaId);
            if (themeSettings?.personaName && setPersonaName) setPersonaName(themeSettings.personaName);
            applyTheme(themeSettings?.themeId);
          } else if (val === "preset-a") {
            setTextModel("gpt-4o-mini");
            if (setImageModel) setImageModel("dall-e-3");
            setCharLimit(2000);
            if (setCharLimitMode) setCharLimitMode("2000");
            if (themeSettings?.personaId) setPersona(themeSettings.personaId);
            if (themeSettings?.personaName && setPersonaName) setPersonaName(themeSettings.personaName);
            applyTheme(themeSettings?.themeId);
          } else if (val === "preset-b") {
            setTextModel("claude-sonnet-4-6");
            if (setImageModel) setImageModel("dall-e-3");
            setCharLimit(5000);
            if (setCharLimitMode) setCharLimitMode("5000");
            if (themeSettings?.personaId) setPersona(themeSettings.personaId);
            if (themeSettings?.personaName && setPersonaName) setPersonaName(themeSettings.personaName);
            applyTheme(themeSettings?.themeId);
          }
        }}
      >
        <option value="" disabled>간편 설정을 선택하세요</option>
        <option value="my-settings">내 설정 불러오기 (마이페이지 기본값)</option>
        <option value="preset-a">권장 A (가성비/스피드) - GPT-4o mini + 2,000자</option>
        <option value="preset-b">권장 B (고품질 전문글) - Claude 4.6 Sonnet + 5,000자</option>
      </select>
      
      {showEmptySettingsWarning && (
        <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-200 leading-relaxed">
            저장된 <strong>[내 설정]</strong>이 없습니다. 
            상단의 <Settings2 className="inline-block w-3 h-3 text-slate-400 mx-1 mb-0.5" /> <Link href="/my-page" target="_blank" className="text-blue-400 underline hover:text-blue-300">마이페이지</Link>로 이동하여 기본값을 저장해보세요!
          </div>
        </div>
      )}
    </div>
  );
}
