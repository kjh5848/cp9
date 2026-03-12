import React from 'react';
import { AiResearchKeyword } from '@/entities/autopilot/model/types';

export interface ResearchResultTableProps {
  researchResults: AiResearchKeyword[];
  selectedKeywords: Set<string>;
  toggleAllKeywords: () => void;
  toggleKeywordSelection: (kw: string) => void;
}

export function ResearchResultTable({
  researchResults,
  selectedKeywords,
  toggleAllKeywords,
  toggleKeywordSelection,
}: ResearchResultTableProps) {
  return (
    <div className={`transition-all duration-500 ${researchResults.length > 0 ? 'opacity-100 max-h-[1000px] mt-6' : 'opacity-0 max-h-0 overflow-hidden pointer-events-none'}`}>
      <div className="border border-slate-800/50 rounded-xl overflow-hidden bg-slate-900/50">
        <div className="flex justify-between items-center p-4 border-b border-slate-800/50 bg-slate-800/30">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            리서치 결과 ({selectedKeywords.size}/{researchResults.length} 선택됨)
          </h3>
          <button 
            type="button"
            onClick={toggleAllKeywords}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            {selectedKeywords.size === researchResults.length ? '전체 해제' : '전체 선택'}
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 sticky top-0 z-10 text-xs text-slate-400 uppercase tracking-widest backdrop-blur-md">
              <tr>
                <th className="px-4 py-3 w-[50px] text-center border-b border-slate-800">
                  <input 
                    type="checkbox" 
                    checked={selectedKeywords.size === researchResults.length && researchResults.length > 0}
                    onChange={toggleAllKeywords}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-0"
                  />
                </th>
                <th className="px-4 py-3 border-b border-slate-800">분류</th>
                <th className="px-4 py-3 border-b border-slate-800">키워드</th>
                <th className="px-4 py-3 border-b border-slate-800">검색 의도 / 방향</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {researchResults.map((res, i) => (
                <tr 
                  key={i} 
                  className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${selectedKeywords.has(res.keyword) ? 'bg-purple-500/5' : ''}`}
                  onClick={() => toggleKeywordSelection(res.keyword)}
                >
                  <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedKeywords.has(res.keyword)}
                      onChange={() => toggleKeywordSelection(res.keyword)}
                      className="w-4 h-4 rounded appearance-none border border-slate-600 checked:bg-purple-500 checked:border-purple-500 relative transition-colors before:content-[''] before:absolute before:hidden checked:before:block before:w-[4px] before:h-[8px] before:border-r-2 before:border-b-2 before:border-white before:rotate-45 before:top-[2px] before:left-[5.5px]"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {res.type === 'long-tail' ? (
                      <span className="bg-indigo-500/10 text-indigo-400 text-[11px] px-2 py-1 rounded border border-indigo-500/20 font-medium tracking-wide">롱테일</span>
                    ) : res.type === 'short-tail' ? (
                      <span className="bg-pink-500/10 text-pink-400 text-[11px] px-2 py-1 rounded border border-pink-500/20 font-medium tracking-wide">숏테일</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{res.keyword}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-400 max-w-md truncate">{res.intent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
