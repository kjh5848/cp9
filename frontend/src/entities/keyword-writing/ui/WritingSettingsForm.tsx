/**
 * [Entities/KeywordWriting] 글 설정 폼 컴포넌트
 * 페르소나, 톤, 글 유형, 모델, 글자수 등 글 작성 설정을 선택하는 래퍼 컴포넌트입니다.
 * 내부적으로 공용 SharedArticleSettings UI를 사용합니다.
 */
"use client";

import { useEffect } from "react";
import { Settings } from "lucide-react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { usePersonaViewModel } from "@/features/persona/model/usePersonaViewModel";
import { SharedArticleSettings } from "@/shared/ui/SharedArticleSettings";

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
  itemCount?: number;
}

export function WritingSettingsForm(props: WritingSettingsFormProps) {
  const { personas, fetchPersonas } = usePersonaViewModel();

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

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
      />
    </GlassCard>
  );
}
