"use client";

import { useEffect } from "react";
import { Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { GlassCard } from "@/shared/ui/GlassCard";
import { IMAGE_MODEL_OPTIONS, getTextModelGroups } from "@/shared/config/model-options";
import { TONE_OPTIONS, ARTICLE_TYPE_OPTIONS, CHAR_LIMIT_OPTIONS } from "@/entities/keyword-writing/model/types";

// 글자 수 프리셋 (WriteActionModal 기준)
const CHAR_LIMIT_PRESETS = [
  { label: "1천자", value: "1000" },
  { label: "2천자", value: "2000" },
  { label: "3천자", value: "3000" },
  { label: "5천자", value: "5000" },
  { label: "직접", value: "custom" },
];

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

  // UI 토글 (글 유형이나 톤앤매너 뷰를 렌더링할지 결정)
  hideArticleType?: boolean;
  hideTone?: boolean;
  hidePersona?: boolean;
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
}: SharedArticleSettingsProps) {
  
  // 페르소나 데이터 가공 (Fallback 처리)
  const displayPersonas = personas.length > 0 
    ? personas.map(p => ({
        id: p.id,
        label: p.name.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim(),
        desc: p.toneDescription.slice(0, 30) + '...'
      }))
    : [{ id: "IT", label: "기본 IT 페르소나", desc: "전문적이고 신뢰감 있는 IT 기기 리뷰어체" }];

  // 큐레이션 글자수 자동 계산 헬퍼
  const getCurationGuideForCount = (count: number) => {
    if (count <= 3) return { total: 2000, perItem: 300 };
    if (count <= 5) return { total: 3000, perItem: 400 };
    if (count <= 7) return { total: 4000, perItem: 400 };
    return { total: 5000, perItem: 400 };
  };

  return (
    <div className="space-y-6">
      
      {/* 1. 글 유형 & 톤앤매너 */}
      {(!hideArticleType || (!hideTone && setTone && tone)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hideArticleType && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 tracking-tight">글 유형 선택</h4>
              <div className="grid grid-cols-1 gap-2">
                {ARTICLE_TYPE_OPTIONS.map((a) => {
                  const enabled = itemCount >= a.minItems && itemCount <= a.maxItems;
                  const reason = itemCount < a.minItems ? `최소 ${a.minItems}개 필요` : itemCount > a.maxItems ? `최대 ${a.maxItems}개 초과` : "";
                  return (
                    <button 
                      key={a.value} 
                      type="button"
                      disabled={!enabled}
                      onClick={() => { if (enabled) setArticleType(a.value); }} 
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border transition-all duration-300",
                        !enabled ? "opacity-50 cursor-not-allowed bg-slate-900 border-slate-800" :
                        articleType === a.value 
                          ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          articleType === a.value ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-slate-700"
                        )} />
                        <span className={cn(
                          "font-bold text-sm",
                          articleType === a.value ? "text-purple-100" : "text-slate-300"
                        )}>{a.label}</span>
                        {!enabled && <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-sm ml-auto">{reason}</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 pl-4">{a.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!hideTone && setTone && tone && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 tracking-tight">작성 톤앤매너</h4>
              <div className="grid grid-cols-1 gap-2">
                {TONE_OPTIONS.map((t) => (
                  <button 
                    key={t.value} 
                    type="button"
                    onClick={() => setTone(t.value)} 
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all duration-300",
                      tone === t.value 
                        ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        tone === t.value ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-slate-700"
                      )} />
                      <span className={cn(
                        "font-bold text-sm",
                        tone === t.value ? "text-blue-100" : "text-slate-300"
                      )}>{t.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. 페르소나 선택 */}
      {!hidePersona && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-300 tracking-tight">작성자 페르소나 선택</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayPersonas.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setPersona(opt.id)}
              className={cn(
                "p-3.5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col gap-1.5 relative overflow-hidden group",
                persona === opt.id
                  ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50",
              )}
            >
              {persona === opt.id && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
              )}
              <div className="flex items-center gap-2 relative z-10">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors flex-shrink-0",
                  persona === opt.id ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-slate-700 group-hover:bg-slate-500"
                )} />
                <span className={cn(
                  "font-bold text-sm tracking-tight transition-colors truncate",
                  persona === opt.id ? "text-blue-100" : "text-slate-300 group-hover:text-slate-200"
                )}>{opt.label}</span>
              </div>
              <span className="text-[11px] leading-relaxed text-slate-500 pl-4 relative z-10">{opt.desc}</span>
            </div>
          ))}
        </div>
        
        {setPersonaName && (
          <div className="pt-2">
            <label className="text-xs text-slate-500 mb-1.5 block">작성자 닉네임 (글 본문에 반영 제한적 사용)</label>
            <input
              type="text"
              placeholder="예: 마스터 큐레이터 H"
              value={personaName || ""}
              onChange={(e) => setPersonaName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder:text-slate-600 transition-colors"
            />
          </div>
        )}
      </div>
      )}

      {/* 3. AI 모델 선택 */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-300 tracking-tight">사용할 AI 모델 선택</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500">텍스트 작성 모델</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={textModel}
              onChange={(e) => setTextModel(e.target.value)}
            >
              {getTextModelGroups().map((g) => (
                <optgroup key={g.group} label={`— ${g.group} —`}>
                  {g.models.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500">이미지 생성 모델</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
            >
              {IMAGE_MODEL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 4. 글자수 설정 */}
      <div className="pt-2 space-y-3">
        <h4 className="text-sm font-semibold text-slate-300 tracking-tight">목표 글자수 (공백 포함)</h4>
        {articleType === "curation" ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <Info className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-purple-200 font-bold mb-0.5">
                ~{getCurationGuideForCount(itemCount).total.toLocaleString()}자 (자동 계산)
              </p>
              <p className="text-[11px] text-purple-400 leading-relaxed">
                {itemCount}개 아이템 × ~{getCurationGuideForCount(itemCount).perItem}자/아이템 
                + 도입/결론 ~1,000자
              </p>
            </div>
          </div>
        ) : (
          <>
            {setCharLimitMode && charLimitMode ? (
              // WriteActionModal 스타일의 Preset 형태
              <div className="grid grid-cols-5 gap-2">
                {CHAR_LIMIT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setCharLimitMode(preset.value);
                      if (preset.value !== "custom") setCharLimit(Number(preset.value));
                    }}
                    className={cn(
                      "flex flex-col items-center py-2.5 px-1 rounded-lg border text-center transition-all duration-200 cursor-pointer",
                      charLimitMode === preset.value
                        ? "bg-blue-600/20 border-blue-500 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800"
                    )}
                  >
                    <span className="text-xs font-bold">{preset.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              // KeywordWriting 스타일의 Select 형태 (charLimitMode가 없을 경우)
              <select 
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
                value={String(charLimit)} 
                onChange={(e) => setCharLimit(e.target.value)}
              >
                {CHAR_LIMIT_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label} — {c.desc}</option>)}
              </select>
            )}

            {/* 커스텀 글자수 입력창 */}
            {charLimitMode === "custom" && (
               <div className="flex items-center gap-2 mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                 <input
                   type="number"
                   value={Number(charLimit) ? charLimit : ""}
                   onChange={(e) => setCharLimit(Number(e.target.value))}
                   placeholder="예: 2500"
                   className="w-24 bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500 placeholder:text-slate-600"
                 />
                 <span className="text-xs text-slate-400">자 내외 (권장: 1500 ~ 5000자)</span>
               </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
