import React from 'react';
import { SuggestedTitle } from '@/entities/autopilot/model/types';

export interface CartTitleListProps {
  cartTitles: SuggestedTitle[];
  setCartTitles: (titles: SuggestedTitle[]) => void;
  customTitleInput: string;
  setCustomTitleInput: (input: string) => void;
  onProceed: () => void;
}

export function CartTitleList({
  cartTitles,
  setCartTitles,
  customTitleInput,
  setCustomTitleInput,
  onProceed,
}: CartTitleListProps) {
  return (
    <div className="flex flex-col border border-emerald-500/20 rounded-xl overflow-hidden bg-slate-900/50 max-h-[600px] shadow-[0_0_15px_rgba(16,185,129,0.05)]">
      <div className="flex justify-between items-center p-3 border-b border-slate-800/50 bg-slate-800/30 sticky top-0 z-10 backdrop-blur-md">
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          선택된 제목 장바구니 ({cartTitles.length})
        </span>
        <button
          type="button"
          onClick={() => setCartTitles([])}
          className="text-[10px] font-medium text-slate-500 hover:text-red-400 transition-colors"
        >
          비우기
        </button>
      </div>

      <div className="p-3 border-b border-slate-800/50 bg-slate-950/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!customTitleInput.trim()) return;
            setCartTitles([...cartTitles, {
              title: customTitleInput.trim(),
              subtitle: '수동 추가됨',
              targetAudience: '범용',
              searchIntent: '정보형'
            }]);
            setCustomTitleInput('');
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={customTitleInput}
            onChange={(e) => setCustomTitleInput(e.target.value)}
            placeholder="직접 제목을 입력하세요..."
            className="flex-1 px-3 py-1.5 text-sm bg-slate-900 border border-slate-700/50 rounded-lg focus:outline-none focus:border-emerald-500/50 text-slate-200 placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!customTitleInput.trim()}
            className="shrink-0 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-600/30 disabled:opacity-50 transition-colors"
          >
            추가
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {cartTitles.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            먼저 왼쪽 목록에서 제목을 추가하거나,<br/>상단에서 직접 인풋으로 추가해주세요.
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/30">
            {cartTitles.map((item, i) => (
              <li key={i} className="p-3 hover:bg-slate-800/40 transition-colors flex items-start gap-3 group">
                <button
                  type="button"
                  onClick={() => setCartTitles(cartTitles.filter((_, idx) => idx !== i))}
                  className="mt-0.5 shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-slate-900 text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const newCart = [...cartTitles];
                      newCart[i] = { ...newCart[i], title: e.target.value };
                      setCartTitles(newCart);
                    }}
                    className="w-full bg-transparent border-none outline-none text-sm font-medium text-emerald-100 focus:bg-slate-800/50 rounded px-1 -mx-1 transition-colors"
                  />
                  <div className="flex items-center gap-2 mt-1.5 px-1">
                    <select
                      value={item.articleType || 'auto'}
                      onChange={(e) => {
                        const newCart = [...cartTitles];
                        newCart[i] = { ...newCart[i], articleType: e.target.value };
                        setCartTitles(newCart);
                      }}
                      className="bg-slate-900 border border-slate-700/50 text-slate-300 text-[11px] rounded px-1.5 py-0.5 outline-none focus:border-emerald-500/50 transition-colors"
                    >
                      <option value="auto">AI가 추천하는 유형 사용</option>
                      <option value="single">단일 아이템 리뷰</option>
                      <option value="compare">비교 분석 (2~5개)</option>
                      <option value="curation">다중 큐레이션 (TOP N)</option>
                    </select>
                    {item.subtitle ? <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p> : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* 하단 CTA */}
      <div className="flex justify-end p-4 border-t border-slate-800/50 mt-auto bg-slate-900">
        <button
          type="button"
          onClick={onProceed}
          disabled={cartTitles.length === 0}
          className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 shadow-[0_4px_15px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          장바구니 {cartTitles.length}개 제목으로 설정 진행
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>
    </div>
  );
}
