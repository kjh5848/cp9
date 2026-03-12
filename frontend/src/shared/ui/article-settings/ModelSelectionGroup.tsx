import React from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { IMAGE_MODEL_OPTIONS, getTextModelGroups } from '@/shared/config/model-options';

export interface ModelSelectionGroupProps {
  textModel: string;
  setTextModel: (v: string) => void;
  imageModel: string;
  setImageModel: (v: string) => void;
}

export function ModelSelectionGroup({
  textModel,
  setTextModel,
  imageModel,
  setImageModel,
}: ModelSelectionGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-1.5">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 tracking-tight">
          사용할 AI 모델 선택
          <Link href="/my-page" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors" title="기본 모델 설정">
            <Settings2 className="w-4 h-4" />
          </Link>
        </h4>
      </div>
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
  );
}
