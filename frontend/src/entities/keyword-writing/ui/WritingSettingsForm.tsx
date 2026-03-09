/**
 * [Entities/KeywordWriting] 글 설정 폼 컴포넌트
 * 페르소나, 톤, 글 유형, 모델, 글자수 등 글 작성 설정을 선택하는 순수 UI 컴포넌트입니다.
 */
import { Check, Settings } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { GlassCard } from "@/shared/ui/GlassCard";
import {
  PERSONA_OPTIONS,
  TONE_OPTIONS,
  ARTICLE_TYPE_OPTIONS,
  CHAR_LIMIT_OPTIONS,
} from "../model/types";
import {
  IMAGE_MODEL_OPTIONS,
  getTextModelGroups,
} from "@/shared/config/model-options";

interface WritingSettingsFormProps {
  persona: string;
  setPersona: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  articleType: string;
  setArticleType: (v: string) => void;
  textModel: string;
  setTextModel: (v: string) => void;
  imageModel: string;
  setImageModel: (v: string) => void;
  charLimit: string;
  setCharLimit: (v: string) => void;
}

export function WritingSettingsForm({
  persona, setPersona,
  tone, setTone,
  articleType, setArticleType,
  textModel, setTextModel,
  imageModel, setImageModel,
  charLimit, setCharLimit,
}: WritingSettingsFormProps) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Settings className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">글 설정</h3>
          <p className="text-xs text-muted-foreground mt-0.5">페르소나, 톤, 모델 등을 선택하세요</p>
        </div>
      </div>
      <div className="space-y-5">
        {/* 페르소나 */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">페르소나</label>
          <div className="grid grid-cols-1 gap-2">
            {PERSONA_OPTIONS.map((p) => (
              <button key={p.value} onClick={() => setPersona(p.value)} className={cn(
                "flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                persona === p.value ? "border-emerald-500/40 bg-emerald-500/10" : "border-border/50 bg-background/30 hover:bg-muted/30"
              )}>
                <div>
                  <span className="text-sm font-medium text-foreground">{p.label}</span>
                  <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                </div>
                {persona === p.value ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : null}
              </button>
            ))}
          </div>
        </div>
        {/* 톤 + 유형 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">톤앤매너</label>
            <div className="space-y-1.5">
              {TONE_OPTIONS.map((t) => (
                <button key={t.value} onClick={() => setTone(t.value)} className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                  tone === t.value ? "bg-blue-500/15 text-blue-400 font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}>{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">글 유형</label>
            <div className="space-y-1.5">
              {ARTICLE_TYPE_OPTIONS.map((a) => (
                <button key={a.value} onClick={() => setArticleType(a.value)} className={cn(
                  "w-full text-left px-3 py-2 rounded-lg transition-all",
                  articleType === a.value ? "bg-purple-500/15 text-purple-400 font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}>
                  <span className="text-sm">{a.label}</span>
                  <p className="text-[10px] opacity-70">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* 텍스트 모델 + 이미지 모델 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">텍스트 모델</label>
            <select className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500" value={textModel} onChange={(e) => setTextModel(e.target.value)}>
              {getTextModelGroups().map((g) => (
                <optgroup key={g.group} label={`— ${g.group} —`}>
                  {g.models.map((m) => <option key={m.value} value={m.value} className="bg-card">{m.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">이미지 모델</label>
            <select className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500" value={imageModel} onChange={(e) => setImageModel(e.target.value)}>
              {IMAGE_MODEL_OPTIONS.map((m) => <option key={m.value} value={m.value} className="bg-card">{m.label}</option>)}
            </select>
          </div>
        </div>
        {/* 목표 글자수 */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">목표 글자수</label>
          <select className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500" value={charLimit} onChange={(e) => setCharLimit(e.target.value)}>
            {CHAR_LIMIT_OPTIONS.map((c) => <option key={c.value} value={c.value} className="bg-card">{c.label} — {c.desc}</option>)}
          </select>
        </div>
      </div>
    </GlassCard>
  );
}
