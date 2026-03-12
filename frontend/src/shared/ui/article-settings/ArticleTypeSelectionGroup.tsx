import React from 'react';
import { cn } from '@/shared/lib/utils';
import { ARTICLE_TYPE_OPTIONS, TONE_OPTIONS } from '@/entities/keyword-writing/model/types';

export interface ArticleTypeSelectionGroupProps {
  articleType: string;
  setArticleType: (v: string) => void;
  tone?: string;
  setTone?: (v: string) => void;
  itemCount: number;
  hideArticleType?: boolean;
  hideTone?: boolean;
}

export function ArticleTypeSelectionGroup({
  articleType,
  setArticleType,
  tone,
  setTone,
  itemCount,
  hideArticleType,
  hideTone,
}: ArticleTypeSelectionGroupProps) {
  if (hideArticleType && (hideTone || !setTone || !tone)) return null;

  return (
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
  );
}
