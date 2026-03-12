import React from 'react';
import { Copy, Plus, X, Search, Settings2 } from "lucide-react";
import Link from "next/link";
import { SuggestedTitle } from '@/entities/autopilot/model/types';
import { SuggestedTitleList } from '@/entities/autopilot/ui/SuggestedTitleList';
import { CartTitleList } from '@/entities/autopilot/ui/CartTitleList';
import { TitleFormatSettingsGroup } from '@/shared/ui/article-settings/TitleFormatSettingsGroup';

export interface SingleKeywordWizardProps {
  wizardStep: number;
  setWizardStep: (step: number) => void;
  titleModel: string;
  setTitleModel: (model: string) => void;
  defaultTitleModel?: string;
  titleExamples: string;
  setTitleExamples: (examples: string) => void;
  titleExclusions: string;
  setTitleExclusions: (exclusions: string) => void;
  keyword: string;
  setKeyword: (kw: string) => void;
  titleCount: number;
  setTitleCount: (c: number) => void;
  isGeneratingTitles: boolean;
  handleGenerateTitles: () => void;
  suggestedTitles: SuggestedTitle[];
  setSuggestedTitles: (titles: SuggestedTitle[]) => void;
  cartTitles: SuggestedTitle[];
  setCartTitles: (titles: SuggestedTitle[]) => void;
  customTitleInput: string;
  setCustomTitleInput: (input: string) => void;
  startDate: string;
  intervalHours: string;
  activeTimeStart: string;
  activeTimeEnd: string;
  handleSingleSubmit: () => void;
  isQueueLoading: boolean;
  configNode?: React.ReactNode;
  quickPresetNode?: React.ReactNode;
}

export function SingleKeywordWizard({
  wizardStep,
  setWizardStep,
  titleModel,
  setTitleModel,
  defaultTitleModel,
  titleExamples,
  setTitleExamples,
  titleExclusions,
  setTitleExclusions,
  keyword,
  setKeyword,
  titleCount,
  setTitleCount,
  isGeneratingTitles,
  handleGenerateTitles,
  suggestedTitles,
  setSuggestedTitles,
  cartTitles,
  setCartTitles,
  customTitleInput,
  setCustomTitleInput,
  startDate,
  intervalHours,
  activeTimeStart,
  activeTimeEnd,
  handleSingleSubmit,
  isQueueLoading,
  configNode,
  quickPresetNode
}: SingleKeywordWizardProps) {

  // 스케줄 미리보기 계산
  const calculateSchedulePreview = () => {
    const base = startDate ? new Date(startDate) : new Date();
    const interval = parseInt(intervalHours || '24', 10);
    const activeStart = parseInt(activeTimeStart || '9', 10);
    const activeEnd = parseInt(activeTimeEnd || '22', 10);

    return cartTitles.map((item, i) => {
      // interval은 시간 단위이므로 밀리초로 변환 시 i * interval * 60 * 60 * 1000
      const runTime = new Date(base.getTime() + i * interval * 60 * 60 * 1000);
      const hour = runTime.getHours();
      if (activeEnd > activeStart) {
        if (hour < activeStart) runTime.setHours(activeStart, 0, 0, 0);
        else if (hour >= activeEnd) {
          runTime.setDate(runTime.getDate() + 1);
          runTime.setHours(activeStart, 0, 0, 0);
        }
      }
      return {
        index: i,
        title: item.title,
        scheduledAt: runTime,
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <button
              type="button"
              onClick={() => {
                if (step === 1) setWizardStep(1);
                else if (step === 2 && (suggestedTitles.length > 0 || cartTitles.length > 0)) setWizardStep(2);
                else if (step === 3 && cartTitles.length > 0) setWizardStep(3);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                wizardStep === step
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : wizardStep > step
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-700/30'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                wizardStep === step ? 'bg-blue-500 text-white' : wizardStep > step ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>{wizardStep > step ? '✓' : step}</span>
              {step === 1 ? '키워드 입력' : step === 2 ? '제목 선택' : '설정 & 등록'}
            </button>
            {step < 3 ? <div className={`flex-1 h-px ${wizardStep > step ? 'bg-emerald-500/30' : 'bg-slate-700/50'}`} /> : null}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: 키워드 입력 + 제목 개수 선택 */}
      {wizardStep === 1 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 tracking-tight">키워드 (검색어)</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예: 다이슨 청소기 추천"
                className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder:text-slate-600 outline-none shadow-inner"
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateTitles(); }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300 tracking-tight">생성할 제목 개수</label>
              <select
                value={titleCount}
                onChange={(e) => setTitleCount(Number(e.target.value))}
                className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none shadow-inner"
              >
                <option value={5}>5개</option>
                <option value={10}>10개</option>
                <option value={15}>15개 (추천)</option>
                <option value={20}>20개</option>
                <option value={30}>30개</option>
              </select>
            </div>
          </div>

          <TitleFormatSettingsGroup 
            titleModel={titleModel}
            setTitleModel={setTitleModel}
            defaultTitleModel={defaultTitleModel}
            titleExamples={titleExamples}
            setTitleExamples={setTitleExamples}
            titleExclusions={titleExclusions}
            setTitleExclusions={setTitleExclusions}
          />

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleGenerateTitles}
              disabled={isGeneratingTitles || !keyword.trim()}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 shadow-[0_4px_15px_rgba(59,130,246,0.3)] active:scale-[0.98] transition-all"
            >
              {isGeneratingTitles ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI 제목 생성 중...
                </span>
              ) : `AI 제목 ${titleCount}개 생성`}
            </button>
          </div>
        </div>
      ) : null}

      {/* Step 2: AI 제안 & 장바구니 */}
      {wizardStep === 2 ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-200">
              {`"`}{keyword}{`"`} 관련 제목 추천
            </h3>
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50"
            >
              ← 키워드 다시 설정
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SuggestedTitleList 
              keyword={keyword}
              suggestedTitles={suggestedTitles}
              cartTitles={cartTitles}
              setSuggestedTitles={setSuggestedTitles}
              setCartTitles={setCartTitles}
              handleGenerateTitles={handleGenerateTitles}
              isGeneratingTitles={isGeneratingTitles}
              onKeywordReset={() => setWizardStep(1)}
            />
            <CartTitleList 
              cartTitles={cartTitles}
              setCartTitles={setCartTitles}
              customTitleInput={customTitleInput}
              setCustomTitleInput={setCustomTitleInput}
              onProceed={() => setWizardStep(3)}
            />
          </div>
        </div>
      ) : null}

      {/* Step 3: 발행 스케줄 미리보기 & 자동화 등록 */}
      {wizardStep === 3 && cartTitles.length > 0 ? (
        <div className="mt-6 pt-6 border-t border-slate-800/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽영역: 스케줄 미리보기 테이블 */}
            <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden">
              <div className="p-4 border-b border-slate-800/50 bg-slate-900 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  발행 스케줄 미리보기 ({cartTitles.length}건)
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide border-b border-slate-800/50 bg-slate-900/20" style={{ maxHeight: 'calc(100vh - 250px)', minHeight: '500px' }}>
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 sticky top-0 z-10 text-xs text-slate-400 uppercase tracking-widest backdrop-blur-md">
                    <tr>
                      <th className="px-4 py-3 w-[50px] border-b border-slate-800">#</th>
                      <th className="px-4 py-3 border-b border-slate-800">제목</th>
                      <th className="px-4 py-3 w-[150px] border-b border-slate-800 shrink-0">예약 일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {calculateSchedulePreview().map((item, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-slate-500 text-xs font-mono">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-white break-words">{item.title}</td>
                        <td className="px-4 py-3 text-emerald-400 font-mono text-xs whitespace-nowrap">
                          {item.scheduledAt.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', weekday: 'short' })}
                          {' '}
                          {item.scheduledAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 오른쪽: 설정(아코디언 형태) */}
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  자동화 상세 설정
                </h3>
                {quickPresetNode}
              </div>
              <div className="flex-1 relative">
                 {configNode}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-8 mt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="px-4 py-3 text-sm font-medium text-slate-400 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 hover:text-slate-300 border border-slate-700/50 transition-all"
              >
                ← 제목 선택으로
              </button>
              <button
                type="button"
                onClick={handleSingleSubmit}
                disabled={isQueueLoading || cartTitles.length === 0}
                className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),0_4px_10px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all flex items-center justify-center min-w-[200px]"
              >
                {isQueueLoading ? '등록 중...' : `${cartTitles.length}개 제목 큐에 등록`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
