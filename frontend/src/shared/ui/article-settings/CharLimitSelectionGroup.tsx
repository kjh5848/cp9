import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CHAR_LIMIT_OPTIONS } from '@/entities/keyword-writing/model/types';

const CHAR_LIMIT_PRESETS = [
  { label: "1천자", value: "1000" },
  { label: "2천자", value: "2000" },
  { label: "3천자", value: "3000" },
  { label: "5천자", value: "5000" },
  { label: "직접", value: "custom" },
];

const CURATION_CHAR_LIMIT_PRESETS = [
  { label: "300자", value: "300" },
  { label: "500자", value: "500" },
  { label: "700자", value: "700" },
  { label: "1000자", value: "1000" },
];

export interface CharLimitSelectionGroupProps {
  articleType: string;
  charLimit: number | string;
  setCharLimit: (v: number | string) => void;
  charLimitMode?: string;
  setCharLimitMode?: (v: string) => void;
  itemCount: number;
}

export function CharLimitSelectionGroup({
  articleType,
  charLimit,
  setCharLimit,
  charLimitMode,
  setCharLimitMode,
  itemCount,
}: CharLimitSelectionGroupProps) {
  return (
    <div className="pt-2 space-y-3">
      <h4 className="text-sm font-semibold text-slate-300 tracking-tight">
        {articleType === "curation" ? "아이템당 목표 분량 (공백 포함)" : "목표 글자수 (공백 포함)"}
      </h4>
      {articleType === "curation" ? (
        <div className="space-y-3">
          {setCharLimitMode && charLimitMode ? (
            <div className="grid grid-cols-4 gap-2">
              {CURATION_CHAR_LIMIT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setCharLimitMode(preset.value);
                    setCharLimit(Number(preset.value));
                  }}
                  className={cn(
                    "flex flex-col items-center py-2.5 px-1 rounded-lg border text-center transition-all duration-200 cursor-pointer",
                    String(charLimit) === preset.value
                      ? "bg-purple-600/20 border-purple-500 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800"
                  )}
                >
                  <span className="text-xs font-bold">{preset.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <select 
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" 
              value={String(charLimit)} 
              onChange={(e) => setCharLimit(e.target.value)}
            >
              {CURATION_CHAR_LIMIT_PRESETS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          )}

          <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 mt-2">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-purple-200 font-bold mb-0.5">
                총 예상 분량: ~{((Number(charLimit) || 300) * itemCount + 1000).toLocaleString()}자
              </p>
              <p className="text-[11px] text-purple-400 leading-relaxed">
                (아이템 {itemCount}개 × {Number(charLimit) || 300}자) + (도입/결론 ~1,000자)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {setCharLimitMode && charLimitMode ? (
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
            <select 
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
              value={String(charLimit)} 
              onChange={(e) => setCharLimit(e.target.value)}
            >
              {CHAR_LIMIT_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label} — {c.desc}</option>)}
            </select>
          )}

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
  );
}
