import React from 'react';
import { SuggestedTitle } from '@/entities/autopilot/model/types';

export interface SuggestedTitleListProps {
  keyword: string;
  suggestedTitles: SuggestedTitle[];
  cartTitles: SuggestedTitle[];
  setSuggestedTitles: (titles: SuggestedTitle[]) => void;
  setCartTitles: (titles: SuggestedTitle[]) => void;
  handleGenerateTitles: () => void;
  isGeneratingTitles: boolean;
  onKeywordReset: () => void;
}

export function SuggestedTitleList({
  keyword,
  suggestedTitles,
  cartTitles,
  setSuggestedTitles,
  setCartTitles,
  handleGenerateTitles,
  isGeneratingTitles,
  onKeywordReset,
}: SuggestedTitleListProps) {
  return (
    <div className="flex flex-col border border-slate-800/50 rounded-xl overflow-hidden bg-slate-900/50 max-h-[600px]">
      <div className="flex justify-between items-center p-3 border-b border-slate-800/50 bg-slate-800/30 sticky top-0 z-10 backdrop-blur-md">
        <span className="text-xs font-bold text-slate-300">AI 추천 목록</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const duplicatesRemoved = suggestedTitles.filter(st => !cartTitles.some(ct => ct.title === st.title));
              setCartTitles([...cartTitles, ...duplicatesRemoved]);
              setSuggestedTitles([]);
            }}
            className="text-[10px] font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
          >
            모두 담기
          </button>
          <button
            type="button"
            onClick={handleGenerateTitles}
            disabled={isGeneratingTitles}
            className="text-[10px] font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded hover:bg-purple-500/20 transition-colors disabled:opacity-50"
          >
            {isGeneratingTitles ? '생성 중...' : '추가 추천 받기'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {suggestedTitles.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            추천 가능한 제목이 없습니다.<br/>'추가 추천 받기'를 눌러보세요.
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/50">
            {suggestedTitles.map((item, i) => (
              <li key={i} className="p-3 hover:bg-slate-800/40 transition-colors flex items-start gap-3 group">
                <button
                  type="button"
                  onClick={() => {
                    setCartTitles([...cartTitles, item]);
                    setSuggestedTitles(suggestedTitles.filter((_, idx) => idx !== i));
                  }}
                  className="mt-0.5 shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                </button>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const newList = [...suggestedTitles];
                      newList[i] = { ...newList[i], title: e.target.value };
                      setSuggestedTitles(newList);
                    }}
                    className="w-full bg-transparent border border-transparent outline-none text-sm font-medium text-slate-200 focus:bg-slate-800 focus:border-slate-700/50 rounded px-2 -mx-2 transition-colors"
                  />
                  {item.subtitle && <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.subtitle}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      item.searchIntent.includes('구매') ? 'bg-emerald-500/10 text-emerald-400'
                      : item.searchIntent.includes('비교') ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-blue-500/10 text-blue-400'
                    }`}>{item.searchIntent}</span>
                    <span className="text-[10px] text-slate-400 truncate">{item.targetAudience}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
