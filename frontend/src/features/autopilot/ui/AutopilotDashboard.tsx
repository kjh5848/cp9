'use client';

import React, { useEffect, useState } from 'react';
import { useAutopilotViewModel } from '../model/useAutopilotViewModel';
import { usePersonaViewModel } from '@/features/persona/model/usePersonaViewModel';
import { SharedArticleSettings } from '@/shared/ui/SharedArticleSettings';
import { DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from '@/shared/config/model-options';
import { AiResearchKeyword, CreateAutopilotQueuePayload } from '../../../entities/autopilot/model/types';

export function AutopilotDashboard() {
  const {
    queue,
    isLoading: isQueueLoading,
    error: queueError,
    fetchQueue,
    addToQueue,
    deleteFromQueue,
    triggerCronManually,
    researchKeywords,
    addBulkToQueue
  } = useAutopilotViewModel();

  const {
    personas,
    fetchPersonas
  } = usePersonaViewModel();

  // Mode state
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('single');

  // Single Keyword Mode State
  const [keyword, setKeyword] = useState('');

  // Bulk Research Mode State
  const [topic, setTopic] = useState('');
  const [personaId, setPersonaId] = useState('');
  const [researchResults, setResearchResults] = useState<AiResearchKeyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [isResearching, setIsResearching] = useState(false);

  // Phase 3 Configuration States (Shared)
  const [articleType, setArticleType] = useState('auto');
  const [textModel, setTextModel] = useState(DEFAULT_TEXT_MODEL);
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);
  const [charLimit, setCharLimit] = useState<string | number>('5000');

  // Coupang Sourcing Criteria
  const [sortCriteria, setSortCriteria] = useState('salePriceAsc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isRocketOnly, setIsRocketOnly] = useState(false);

  // Scheduling
  const [intervalHours, setIntervalHours] = useState('24'); // 기본 24시간
  const [activeTimeStart, setActiveTimeStart] = useState('9'); // 기본 09:00
  const [activeTimeEnd, setActiveTimeEnd] = useState('22'); // 기본 22:00

  useEffect(() => {
    fetchQueue();
    fetchPersonas();
  }, [fetchQueue, fetchPersonas]);

  // Set the first persona as default if available since the selection UI is hidden
  useEffect(() => {
    if (personas && personas.length > 0 && !personaId) {
      setPersonaId(personas[0].id);
    }
  }, [personas, personaId]);

  const handleSingleSubmit = async () => {
    if (!keyword.trim()) {
      alert('키워드를 입력해주세요.');
      return;
    }
    const success = await addToQueue({
      keyword,
      personaId: personaId || undefined,
      articleType,
      textModel,
      imageModel,
      charLimit: parseInt(charLimit as string, 10),
      sortCriteria,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      isRocketOnly,
      intervalHours: intervalHours ? parseInt(intervalHours, 10) : undefined,
      activeTimeStart: activeTimeStart ? parseInt(activeTimeStart, 10) : undefined,
      activeTimeEnd: activeTimeEnd ? parseInt(activeTimeEnd, 10) : undefined,
    });
    if (success) {
      setKeyword('');
    }
  };

  const handleResearch = async () => {
    if (!topic) {
      alert('주제를 입력해주세요.');
      return;
    }
    const currentPersonaId = personaId || personas?.[0]?.id;
    if (!currentPersonaId) {
      alert('백그라운드 오류: 사용 가능한 시스템 페르소나가 없습니다.');
      return;
    }
    
    setIsResearching(true);
    const results = await researchKeywords(currentPersonaId, topic);
    setIsResearching(false);
    
    if (results && results.length > 0) {
      setResearchResults(results);
      setSelectedKeywords(new Set(results.map(r => r.keyword))); // 다중 선택 기본값
    } else {
      alert('리서치 결과가 없습니다. 다시 시도해주세요.');
    }
  };

  const toggleKeywordSelection = (kw: string) => {
    const next = new Set(selectedKeywords);
    if (next.has(kw)) {
      next.delete(kw);
    } else {
      next.add(kw);
    }
    setSelectedKeywords(next);
  };

  const toggleAllKeywords = () => {
    if (selectedKeywords.size === researchResults.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(researchResults.map(r => r.keyword)));
    }
  };

  const handleBulkSubmit = async () => {
    if (selectedKeywords.size === 0) {
      alert('발행할 키워드를 하나 이상 선택해주세요.');
      return;
    }

    const payloads: CreateAutopilotQueuePayload[] = Array.from(selectedKeywords).map(kw => ({
      keyword: kw,
      personaId: personaId || undefined,
      articleType,
      textModel,
      imageModel,
      charLimit: parseInt(charLimit as string, 10),
      sortCriteria,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      isRocketOnly,
      intervalHours: intervalHours ? parseInt(intervalHours, 10) : undefined,
      activeTimeStart: activeTimeStart ? parseInt(activeTimeStart, 10) : undefined,
      activeTimeEnd: activeTimeEnd ? parseInt(activeTimeEnd, 10) : undefined,
    }));

    const success = await addBulkToQueue(payloads);
    if (success) {
      alert(`${payloads.length}건의 아이템이 큐에 담겼습니다.`);
      setResearchResults([]);
      setSelectedKeywords(new Set());
      setTopic('');
    }
  };

  // View Mode for Schedule
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2.5 py-1 rounded-full border border-yellow-500/20 font-medium tracking-wide">대기 중</span>;
      case 'PROCESSING':
        return <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full border border-blue-500/20 font-medium tracking-wide">처리 중</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium tracking-wide">완료됨</span>;
      case 'FAILED':
        return <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-1 rounded-full border border-red-500/20 font-medium tracking-wide">실패</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium tracking-wide">{status}</span>;
    }
  };
   // 2. 프리셋 핸들러 함수
  const applySourcingPreset = (sort: string, isRocket: boolean, min: string, max: string) => {
    setSortCriteria(sort);
    setIsRocketOnly(isRocket);
    setMinPrice(min);
    setMaxPrice(max);
  };

  const applySchedulePreset = (interval: string, start: string, end: string) => {
    setIntervalHours(interval);
    setActiveTimeStart(start);
    setActiveTimeEnd(end);
  };

  // 3. UI 렌더링
  return (
    <div className="space-y-8">
      {/* 글로벌 헤더/타이틀 & 임의 실행 버튼 */}
      <div className="flex justify-between items-center relative z-10 px-2">
        <div>
          <h2 className="text-2xl font-bold font-syne tracking-tight text-white flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"></span>
            오토파일럿 대시보드
          </h2>
          <p className="text-sm text-slate-400 mt-2 ml-5">
            AI 리서치 기반 키워드 발굴부터 일괄 스케줄링까지 블로그 운영을 자동화합니다.
          </p>
        </div>
        <button
          onClick={triggerCronManually}
          className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 hover:text-white border border-slate-700 transition-all font-syne"
        >
          임의 설정된 큐 배치 실행 시작
        </button>
      </div>

      {/* 큐 등록 폼 영역 */}
      <div className="bg-slate-900/50 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.2)] border border-slate-800/50 p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/50 mb-6 font-syne relative z-10">
          <button 
            type="button"
            onClick={() => setInputMode('single')}
            className={`flex-1 py-3 text-sm font-semibold tracking-tight transition-colors border-b-2 ${inputMode === 'single' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300 text-center'}`}
          >
            단일 키워드 등록
          </button>
          <button 
            type="button"
            onClick={() => setInputMode('bulk')}
            className={`flex-1 py-3 text-sm font-semibold tracking-tight transition-colors border-b-2 ${inputMode === 'bulk' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300 text-center'}`}
          >
            대량 AI 키워드 리서치
          </button>
        </div>

        <div className="relative z-10 space-y-6">
          {inputMode === 'single' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 tracking-tight">키워드 (검색어)</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: 다이슨 청소기 추천"
                  className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder:text-slate-600 outline-none shadow-inner"
                />
              </div>
            </div>
          ) : (
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

              {/* Research Results Table */}
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
            </div>
          )}

          {/* 공통 SEO 글 작성 설정 UI 재사용 (Phase 3 기능) */}
          <div className={`transition-all duration-500 ${inputMode === 'bulk' && researchResults.length === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="pt-8 border-t border-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 tracking-tight">글 생성 상세 설정</h3>
              <SharedArticleSettings
                personas={personas}
                persona={personaId}
                setPersona={setPersonaId}
                articleType={articleType}
                setArticleType={setArticleType}
                textModel={textModel}
                setTextModel={setTextModel}
                imageModel={imageModel}
                setImageModel={setImageModel}
                charLimit={charLimit}
                setCharLimit={setCharLimit}
                hideArticleType={true}
                hideTone={true} // 톤앤매너는 자체 persona select box로 위임하거나 생략
                hidePersona={true} // 오토파일럿에서는 페르소나 선택 사용 안 함
              />
            </div>

            {/* 아이템 소싱 기준 & 스케줄링 설정 UI (Phase 3 기능) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 mt-4 border-t border-slate-800/50">
              {/* 소싱 기준 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 tracking-tight flex-1">아이템 소싱 기준</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => applySourcingPreset('salePriceAsc', true, '', '50000')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-blue-500/20 hover:text-blue-300 transition-colors">
                    기본 (가성비+로켓)
                  </button>
                  <button type="button" onClick={() => applySourcingPreset('랭킹순', false, '50000', '')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors">
                    고급 (랭킹+5만↑)
                  </button>
                </div>
                
                <div className="space-y-3 p-4 bg-slate-800/20 rounded-xl border border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">정렬 기준</label>
                    <select
                      value={sortCriteria}
                      onChange={(e) => setSortCriteria(e.target.value)}
                      className="w-[180px] p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none"
                    >
                      <option value="salePriceAsc">낮은 가격순 (가성비)</option>
                      <option value="salePriceDesc">높은 가격순 (프리미엄)</option>
                      <option value="랭킹순">랭킹순 (베스트셀러)</option>
                      <option value="리뷰많은순">리뷰 많은순</option>
                      <option value="별점높은순">별점 높은순</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">가격 필터 (원)</label>
                    <div className="flex items-center gap-2 w-[180px]">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="최소"
                        className="w-1/2 p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none placeholder:text-slate-600"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="최대"
                        className="w-1/2 p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">로켓배송 전용</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRocketOnly}
                        onChange={(e) => setIsRocketOnly(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 스케줄링 설정 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300 tracking-tight">발행 스케줄링</h3>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => applySchedulePreset('24', '14', '22')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-blue-500/20 hover:text-blue-300 transition-colors">
                      오후 (14~22시)
                    </button>
                    <button type="button" onClick={() => applySchedulePreset('12', '22', '6')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-purple-500/20 hover:text-purple-300 transition-colors">
                      심야 (밤샘)
                    </button>
                    <button type="button" onClick={() => applySchedulePreset('6', '0', '23')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors">
                      종일 (24시간)
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 p-4 bg-slate-800/20 rounded-xl border border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">발행 주기 (시간)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={intervalHours}
                        onChange={(e) => setIntervalHours(e.target.value)}
                        placeholder="24"
                        className="w-[100px] p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none text-right"
                      />
                      <span className="text-sm text-slate-400">시간 마다</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">동작 시간대 (HH:00)</label>
                    <div className="flex items-center gap-2 w-[180px]">
                      <select
                        value={activeTimeStart}
                        onChange={(e) => setActiveTimeStart(e.target.value)}
                        className="w-1/2 p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={`start-${i}`} value={i}>{String(i).padStart(2, '0')}:00</option>
                        ))}
                      </select>
                      <span className="text-slate-500">~</span>
                      <select
                        value={activeTimeEnd}
                        onChange={(e) => setActiveTimeEnd(e.target.value)}
                        className="w-1/2 p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={`end-${i}`} value={i}>{String(i).padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8 mt-2 border-t border-slate-800/50">
              {inputMode === 'single' ? (
                <button
                  type="button"
                  onClick={handleSingleSubmit}
                  disabled={isQueueLoading || !keyword.trim()}
                  className="px-8 py-4 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 disabled:opacity-50 shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),0_4px_10px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all flex items-center justify-center min-w-[200px]"
                >
                  {isQueueLoading ? '추가 중...' : '단일 키워드 큐에 등록'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={isQueueLoading || selectedKeywords.size === 0}
                  className="px-8 py-4 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50 shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),0_4px_10px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all flex items-center justify-center min-w-[200px]"
                >
                  {isQueueLoading ? '추가 중...' : `${selectedKeywords.size}개 키워드 일괄 큐에 등록`}
                </button>
              )}
            </div>
          </div>
        </div>
        {queueError ? <p className="mt-4 text-sm font-medium text-red-400 relative z-10">{queueError}</p> : null}
      </div>
    </div>
  );
}
