/**
 * [Entities/KeywordWriting] 글 설정 폼 컴포넌트
 * 페르소나, 톤, 글 유형, 모델, 글자수 등 글 작성 설정을 선택하는 래퍼 컴포넌트입니다.
 * 내부적으로 공용 SharedArticleSettings UI를 사용합니다.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import { Settings } from "lucide-react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { usePersonaViewModel } from "@/features/persona/model/usePersonaViewModel";
import { useUserSettingsViewModel } from "@/features/user-settings/model/useUserSettingsViewModel";
import { SharedArticleSettings } from "@/shared/ui/SharedArticleSettings";
import { ThemeSwitcherTheme } from "@/entities/design/ui/ThemeSwitcher";
import { PublishTargetSection } from "@/shared/ui/PublishTargetSection";

interface WritingSettingsFormProps {
  persona: string;
  setPersona: (v: string) => void;
  articleType: string;
  setArticleType: (v: string) => void;
  textModel: string;
  setTextModel: (v: string) => void;
  imageModel: string;
  setImageModel: (v: string) => void;
  charLimit: string;
  setCharLimit: (v: string) => void;
  themeId: string | null;
  setThemeId: (v: string | null) => void;
  itemCount?: number;
  publishTargets?: any[];
  setPublishTargets?: (targets: any[]) => void;
}

export function WritingSettingsForm(props: WritingSettingsFormProps) {
  const { personas, fetchPersonas } = usePersonaViewModel();
  const { themeSettings } = useUserSettingsViewModel();

  const [themes, setThemes] = useState<ThemeSwitcherTheme[]>([]);

  const fetchThemes = useCallback(async () => {
    try {
      const res = await fetch('/api/design');
      const data = await res.json();
      const list = data.themes || [];
      setThemes(list);
      
      // 사용자 설정(themeSettings)에 themeId가 있으면 최우선으로 적용, 없으면 default 지정된 테마 사용
      if (!props.themeId) {
        if (themeSettings?.themeId && list.some((t: any) => t.id === themeSettings.themeId)) {
          props.setThemeId(themeSettings.themeId);
        } else {
          const defaultTheme = list.find((t: any) => t.isDefault);
          if (defaultTheme) {
            props.setThemeId(defaultTheme.id);
          } else if (list.length > 0) {
            props.setThemeId(list[0].id);
          }
        }
      }
    } catch { /* 조용히 실패 */ }
  }, [themeSettings?.themeId, props.themeId, props.setThemeId]);

  useEffect(() => {
    fetchPersonas();
    fetchThemes();
  }, [fetchPersonas, fetchThemes]);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Settings className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">글 설정</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">페르소나, 톤, 모델 등을 선택하세요</p>
        </div>
      </div>
      
      <SharedArticleSettings 
        personas={personas}
        articleType={props.articleType} setArticleType={props.setArticleType}
        persona={props.persona} setPersona={props.setPersona}
        textModel={props.textModel} setTextModel={props.setTextModel}
        imageModel={props.imageModel} setImageModel={props.setImageModel}
        charLimit={props.charLimit} setCharLimit={(v) => props.setCharLimit(String(v))}
        itemCount={props.itemCount}
        themes={themes}
        themeId={props.themeId}
        setThemeId={props.setThemeId}
      />

      {props.publishTargets !== undefined && props.setPublishTargets && (
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <PublishTargetSection
            targets={props.publishTargets}
            onChange={props.setPublishTargets}
          />
        </div>
      )}
    </GlassCard>
  );
}
