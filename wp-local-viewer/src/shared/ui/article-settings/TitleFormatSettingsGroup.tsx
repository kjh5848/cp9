import React from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { getTextModelGroups } from '@/shared/config/model-options';

export interface TitleFormatSettingsGroupProps {
  titleModel: string;
  setTitleModel: (val: string) => void;
  defaultTitleModel?: string;
  titleExamples: string;
  setTitleExamples: (val: string) => void;
  titleExclusions: string;
  setTitleExclusions: (val: string) => void;
}

export function TitleFormatSettingsGroup({
  titleModel,
  setTitleModel,
  defaultTitleModel,
  titleExamples,
  setTitleExamples,
  titleExclusions,
  setTitleExclusions,
}: TitleFormatSettingsGroupProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="space-y-1.5 md:col-span-2">
        <div className="flex justify-between items-center mb-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 tracking-tight">
            제목 생성 모델 선택
            <Link href="/my-page" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors" title="기본 모델 설정">
              <Settings2 className="w-4 h-4" />
            </Link>
          </label>
        </div>
        <select
          value={titleModel}
          onChange={(e) => setTitleModel(e.target.value)}
          className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none shadow-inner"
        >
          {getTextModelGroups().map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.models.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label} {model.value === defaultTitleModel ? '(기본)' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300 tracking-tight">원하는 제목 예제 (선택)</label>
        <input
          type="text"
          value={titleExamples}
          onChange={(e) => setTitleExamples(e.target.value)}
          placeholder="예: [리쌍] 다이슨 청소기 한달 사용기"
          className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder:text-slate-600 outline-none shadow-inner text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300 tracking-tight">피해야 할 포맷 (선택)</label>
        <input
          type="text"
          value={titleExclusions}
          onChange={(e) => setTitleExclusions(e.target.value)}
          placeholder="예: '장점', '단점' 이라는 단어 금지"
          className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder:text-slate-600 outline-none shadow-inner text-sm"
        />
      </div>
    </div>
  );
}
