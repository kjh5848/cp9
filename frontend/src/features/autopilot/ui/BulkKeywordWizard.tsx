import React from 'react';
import { AiResearchKeyword } from '@/entities/autopilot/model/types';
import { ResearchResultTable } from '@/entities/autopilot/ui/ResearchResultTable';

export interface BulkKeywordWizardProps {
  topic: string;
  setTopic: (topic: string) => void;
  personaId: string;
  handleResearch: () => void;
  isResearching: boolean;
  researchResults: AiResearchKeyword[];
  selectedKeywords: Set<string>;
  toggleAllKeywords: () => void;
  toggleKeywordSelection: (kw: string) => void;
  handleBulkSubmit: () => void;
  isQueueLoading: boolean;
  configNode?: React.ReactNode;
  quickPresetNode?: React.ReactNode;
}

export function BulkKeywordWizard({
  topic,
  setTopic,
  personaId,
  handleResearch,
  isResearching,
  researchResults,
  selectedKeywords,
  toggleAllKeywords,
  toggleKeywordSelection,
  handleBulkSubmit,
  isQueueLoading,
  configNode,
  quickPresetNode
}: BulkKeywordWizardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/30 p-6 rounded-xl border border-slate-800/50">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300 tracking-tight">리서치 주제어 (데이터셋)</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 2024년 최신 가전제품 리뷰 및 비교"
            className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-slate-200 placeholder:text-slate-600 outline-none shadow-inner resize-none h-[120px]"
          />
        </div>
        
        <div className="space-y-4 flex flex-col justify-end">
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleResearch}
              disabled={isResearching || !topic || !personaId}
              className="px-6 py-3 w-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 shadow-[0_4px_15px_rgba(147,51,234,0.3)] active:scale-[0.98] transition-all"
            >
              {isResearching ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  AI 마이닝 중...
                </span>
              ) : 'AI 키워드 대량 리서치 시작'}
            </button>
          </div>
        </div>
      </div>

      <ResearchResultTable 
        researchResults={researchResults}
        selectedKeywords={selectedKeywords}
        toggleAllKeywords={toggleAllKeywords}
        toggleKeywordSelection={toggleKeywordSelection}
      />

      {researchResults.length > 0 ? (
        <div className="flex justify-end pt-8 mt-2 border-t border-slate-800/50">
          <button
            type="button"
            onClick={handleBulkSubmit}
            disabled={isQueueLoading || selectedKeywords.size === 0}
            className="px-8 py-4 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50 shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),0_4px_10px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all flex items-center justify-center min-w-[200px]"
          >
            {isQueueLoading ? '추가 중...' : `${selectedKeywords.size}개 키워드 일괄 큐에 등록`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
