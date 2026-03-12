import React from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { PersonaOption } from '../SharedArticleSettings';

export interface PersonaSelectionGroupProps {
  personas: PersonaOption[];
  persona: string;
  setPersona: (v: string) => void;
  personaName?: string;
  setPersonaName?: (v: string) => void;
  hidePersona?: boolean;
}

export function PersonaSelectionGroup({
  personas,
  persona,
  setPersona,
  personaName,
  setPersonaName,
  hidePersona,
}: PersonaSelectionGroupProps) {
  if (hidePersona) return null;

  const displayPersonas = personas.length > 0 
    ? personas.map(p => ({
        id: p.id,
        label: p.name.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim(),
        desc: p.toneDescription.slice(0, 30) + '...'
      }))
    : [{ id: "IT", label: "기본 IT 페르소나", desc: "전문적이고 신뢰감 있는 IT 기기 리뷰어체" }];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-1.5">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 tracking-tight">
          작성자 페르소나 선택
          <Link href="/my-page" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors" title="기본 모델 설정">
            <Settings2 className="w-4 h-4" />
          </Link>
        </h4>
      </div>
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
  );
}
