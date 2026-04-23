"use client";

import { useEffect, useState } from "react";
import { useUserSettingsViewModel } from "@/features/user-settings/model/useUserSettingsViewModel";

import { QuickPresetSelector } from "./article-settings/QuickPresetSelector";
import { ArticleTypeSelectionGroup } from "./article-settings/ArticleTypeSelectionGroup";
import { PersonaSelectionGroup } from "./article-settings/PersonaSelectionGroup";
import { ModelSelectionGroup } from "./article-settings/ModelSelectionGroup";
import { ThemeSelectionGroup } from "./article-settings/ThemeSelectionGroup";
import { CharLimitSelectionGroup } from "./article-settings/CharLimitSelectionGroup";

export interface PersonaOption {
  id: string;
  name: string;
  toneDescription: string;
}

export interface SharedArticleSettingsProps {
  // 데이터 목록
  personas: PersonaOption[];
  
  // 상태 및 Setter
  articleType: string;
  setArticleType: (v: string) => void;
  
  tone?: string;
  setTone?: (v: string) => void;
  
  persona: string;
  setPersona: (v: string) => void;
  
  personaName?: string;
  setPersonaName?: (v: string) => void;
  
  textModel: string;
  setTextModel: (v: string) => void;
  
  imageModel: string;
  setImageModel: (v: string) => void;
  
  charLimit: number | string;
  setCharLimit: (v: number | string) => void;
  
  charLimitMode?: string;
  setCharLimitMode?: (v: string) => void;
  
  itemCount?: number;

  // UI 토글
  hideArticleType?: boolean;
  hideTone?: boolean;
  hidePersona?: boolean;
  hideTheme?: boolean;
  
  // 테마 데이터 및 상태
  themes?: import('@/entities/design/ui/ThemeSwitcher').ThemeSwitcherTheme[];
  themeId?: string | null;
  setThemeId?: (v: string | null) => void;
  
  // 기능 토글
  autoLoadMySettings?: boolean;
  hideQuickPreset?: boolean;
}

export function SharedArticleSettings({
  personas,
  articleType, setArticleType,
  tone, setTone,
  persona, setPersona,
  personaName, setPersonaName,
  textModel, setTextModel,
  imageModel, setImageModel,
  charLimit, setCharLimit,
  charLimitMode, setCharLimitMode,
  itemCount = 1,
  hideArticleType = false,
  hideTone = false,
  hidePersona = false,
  hideTheme = false,
  themes = [],
  themeId, setThemeId,
  autoLoadMySettings = false,
  hideQuickPreset = false,
}: SharedArticleSettingsProps) {
  
  const { articleSettings, themeSettings } = useUserSettingsViewModel();
  const [quickPreset, setQuickPreset] = useState<string>("");
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  // 내 설정 자동 로딩 (1회)
  useEffect(() => {
    if (autoLoadMySettings && !hasAutoLoaded && articleSettings && themeSettings && themes.length > 0) {
      setQuickPreset("my-settings");
      if (articleSettings.defaultTextModel) setTextModel(articleSettings.defaultTextModel);
      if (articleSettings.defaultImageModel && setImageModel) setImageModel(articleSettings.defaultImageModel);
      if (articleSettings.presetWordCount) {
        setCharLimit(articleSettings.presetWordCount);
        if (setCharLimitMode) setCharLimitMode("custom");
      }
      if (themeSettings.personaId) setPersona(themeSettings.personaId);
      if (themeSettings.personaName && setPersonaName) setPersonaName(themeSettings.personaName);
      
      if (themeSettings.themeId && setThemeId) {
        const isValid = themes.some((t: any) => t.id === themeSettings.themeId);
        if (isValid) {
          setThemeId(themeSettings.themeId);
        } else {
          const defaultTheme = themes.find((t: any) => t.isDefault);
          setThemeId(defaultTheme ? defaultTheme.id : themes[0].id);
        }
      }
      
      setHasAutoLoaded(true);
    }
  }, [autoLoadMySettings, hasAutoLoaded, articleSettings, themeSettings, themes, setTextModel, setImageModel, setCharLimit, setCharLimitMode, setPersona, setPersonaName, setThemeId]);

  return (
    <div className="space-y-6">
      {!hideQuickPreset ? (
        <QuickPresetSelector 
          quickPreset={quickPreset}
          setQuickPreset={setQuickPreset}
          setTextModel={setTextModel}
          setImageModel={setImageModel}
          setCharLimit={setCharLimit}
          setCharLimitMode={setCharLimitMode}
          setPersona={setPersona}
          setPersonaName={setPersonaName}
          setThemeId={setThemeId}
          themes={themes}
        />
      ) : null}

      <ArticleTypeSelectionGroup 
        articleType={articleType}
        setArticleType={setArticleType}
        tone={tone}
        setTone={setTone}
        itemCount={itemCount}
        hideArticleType={hideArticleType}
        hideTone={hideTone}
      />

      <PersonaSelectionGroup 
        personas={personas}
        persona={persona}
        setPersona={setPersona}
        personaName={personaName}
        setPersonaName={setPersonaName}
        hidePersona={hidePersona}
      />

      <ModelSelectionGroup 
        textModel={textModel}
        setTextModel={setTextModel}
        imageModel={imageModel}
        setImageModel={setImageModel}
      />

      <ThemeSelectionGroup 
        themes={themes}
        themeId={themeId}
        setThemeId={setThemeId}
        hideTheme={hideTheme}
      />

      <CharLimitSelectionGroup 
        articleType={articleType}
        charLimit={charLimit}
        setCharLimit={setCharLimit}
        charLimitMode={charLimitMode}
        setCharLimitMode={setCharLimitMode}
        itemCount={itemCount}
      />
    </div>
  );
}
