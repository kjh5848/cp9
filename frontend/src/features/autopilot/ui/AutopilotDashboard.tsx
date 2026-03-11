'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutopilotViewModel } from '../model/useAutopilotViewModel';
import { usePersonaViewModel } from '@/features/persona/model/usePersonaViewModel';
import { SharedArticleSettings } from '@/shared/ui/SharedArticleSettings';
import { DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from '@/shared/config/model-options';
import { AiResearchKeyword, CreateAutopilotQueuePayload, SuggestedTitle } from '../../../entities/autopilot/model/types';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';
import { useAutopilotStore } from '@/entities/autopilot/model/useAutopilotStore';

export function AutopilotDashboard() {
  const router = useRouter();
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

  const { themeSettings, articleSettings, profile } = useUserSettingsViewModel();

  // Mode state
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('single');
  const [wizardStep, setWizardStep] = useState(1);

  // ── Single Keyword State ──
  const [keyword, setKeyword] = useState('');
  const [titleCount, setTitleCount] = useState(15);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  // ── Bulk Keyword State ──
  const [bulkKeywordsText, setBulkKeywordsText] = useState('');
  const [bulkTitleCountPerKeyword, setBulkTitleCountPerKeyword] = useState(2);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [personaId, setPersonaId] = useState<string>('');
  const [personaName, setPersonaName] = useState('');('');
  const [researchResults, setResearchResults] = useState<AiResearchKeyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [isResearching, setIsResearching] = useState(false);

  // Phase 3 Configuration States (Shared)
  const [articleType, setArticleType] = useState('auto');
  const [textModel, setTextModel] = useState(DEFAULT_TEXT_MODEL);
  const [titleModel, setTitleModel] = useState('gpt-4o-mini');
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);
  const [charLimit, setCharLimit] = useState<string | number>('5000');

  // Coupang Sourcing Criteria
  const [sortCriteria, setSortCriteria] = useState('salePriceAsc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isRocketOnly, setIsRocketOnly] = useState(false);

  // Scheduling
  const [intervalHours, setIntervalHours] = useState('1440'); // 기본 24시간 (1440분)
  const [activeTimeStart, setActiveTimeStart] = useState('9'); // 기본 09:00
  const [activeTimeEnd, setActiveTimeEnd] = useState('22'); // 기본 22:00
  const [startDate, setStartDate] = useState(''); // 시작 일시지정
  const [maxRuns, setMaxRuns] = useState(''); // 최대 발행 횟수
  const [expiresAt, setExpiresAt] = useState(''); // 발행 종료일

  // 단일 키워드 스텝 위자드
  const [suggestedTitles, setSuggestedTitles] = useState<SuggestedTitle[]>([]);
  
  // 장바구니 상태
  const [cartTitles, setCartTitles] = useState<SuggestedTitle[]>([]); 
  const [customTitleInput, setCustomTitleInput] = useState(''); // 수동 추가 인풋
  

  // ── Zustand Draft 연동 (Silent Recovery) ──
  const { cartTitles: storeCartTitles, settings: storeSettings, setCartTitles: setStoreCartTitles, updateSettings: setStoreSettings, clearCart: storeClearCart } = useAutopilotStore();
  const [isStoreRestored, setIsStoreRestored] = useState(false);

  useEffect(() => {
    if (!isStoreRestored) {
      if (storeCartTitles && storeCartTitles.length > 0) {
        setCartTitles(storeCartTitles);
      }
      if (storeSettings) {
        setIntervalHours(storeSettings.intervalHours);
        setActiveTimeStart(storeSettings.activeTimeStart);
        setActiveTimeEnd(storeSettings.activeTimeEnd);
      }
      setIsStoreRestored(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStoreRestored]);

  // 입력 내용 변경 시 Store 스토리지 자동 업데이트
  useEffect(() => {
    if (isStoreRestored) {
      setStoreCartTitles(cartTitles);
      setStoreSettings({
        intervalHours, activeTimeStart, activeTimeEnd
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTitles, intervalHours, activeTimeStart, activeTimeEnd, isStoreRestored]);


  // Theme State
  const [themes, setThemes] = useState<import('@/entities/design/ui/ThemeSwitcher').ThemeSwitcherTheme[]>([]);
  const [themeId, setThemeId] = useState<string | null>(null);

  const fetchThemes = async () => {
    try {
      const res = await fetch('/api/design');
      const data = await res.json();
      const list = data.themes || [];
      setThemes(list);
      
      if (themeSettings?.themeId && list.some((t: any) => t.id === themeSettings.themeId)) {
        setThemeId(themeSettings.themeId);
      } else {
        const defaultTheme = list.find((t: any) => t.isDefault);
        if (defaultTheme) {
          setThemeId(defaultTheme.id);
        } else if (list.length > 0) {
          setThemeId(list[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch themes', e);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchPersonas();
    fetchThemes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchQueue, fetchPersonas, themeSettings?.themeId]);

  useEffect(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    setStartDate(localISOTime);
  }, []);

  // Sync settings with My Page defaults when available
  useEffect(() => {
    if (articleSettings?.defaultTitleModel) setTitleModel(articleSettings.defaultTitleModel);
    if (articleSettings?.defaultTextModel) setTextModel(articleSettings.defaultTextModel);
    if (articleSettings?.defaultImageModel) setImageModel(articleSettings.defaultImageModel);
    if (articleSettings?.presetWordCount) setCharLimit(articleSettings.presetWordCount);
    if (profile?.name) setPersonaName(profile.name);
  }, [articleSettings, profile]);

  // Set the first persona as default if available since the selection UI is hidden
  useEffect(() => {
    if (personas && personas.length > 0 && !personaId) {
      setPersonaId(personas[0].id);
    }
  }, [personas, personaId]);

  // Helper function to generate titles
  const generateKeywordTitles = async (
    personaId: string | undefined,
    kw: string,
    count: number,
    excludeTitles: string[] = []
  ) => {
    const res = await fetch('/api/keyword-titles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyword: kw.trim(),
        persona: personaId,
        articleType: articleType === 'auto' ? undefined : articleType,
        textModel: titleModel,
        count,
        excludeTitles,
      }),
    });
    return res.json();
  };

  // AI 제목 생성 핸들러 (Step 1 → Step 2)
  const handleGenerateTitles = async () => {
    if (!keyword.trim()) {
      alert('키워드를 입력해주세요.');
      return;
    }
    setIsGeneratingTitles(true);
    try {
      const excludeTitles = cartTitles.map((t) => t.title);
      const result = await generateKeywordTitles(personaId, keyword, titleCount, excludeTitles);
      if (result && result.titles && result.titles.length > 0) {
        setSuggestedTitles(result.titles);
        setWizardStep(2);
      } else {
        alert('제목 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (e) {
      alert('제목 생성 중 오류가 발생했습니다.');
      console.error(e);
    }
    setIsGeneratingTitles(false);
  };

  // 스케줄 미리보기 계산 (장바구니 제목 기준)
  const calculateSchedulePreview = () => {
    const base = startDate ? new Date(startDate) : new Date();
    const interval = parseInt(intervalHours || '1440', 10);
    const activeStart = parseInt(activeTimeStart || '9', 10);
    const activeEnd = parseInt(activeTimeEnd || '22', 10);

    return cartTitles.map((item, i) => {
      const runTime = new Date(base.getTime() + i * interval * 60 * 60 * 1000);
      // 활성 시간대 보정
      const hour = runTime.getHours();
      if (activeEnd > activeStart) {
        // 일반 시간대 (예: 9~22)
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

  // 단일 키워드 스텝 위자드 큐 등록 (Step 3)
  const handleSingleSubmit = async () => {
    const preview = calculateSchedulePreview();
    if (preview.length === 0) {
      alert('발행할 제목을 하나 이상 장바구니에 담아주세요.');
      return;
    }

    const payloads: CreateAutopilotQueuePayload[] = preview.map((item) => {
      // 장바구니에 담긴 개별 설정 가져오기 (preview.index 활용)
      const cartItem = cartTitles[item.index];
      
      return {
        keyword: item.title,
        personaId: personaId || undefined,
        themeId: themeId || undefined,
        articleType: cartItem?.articleType && cartItem.articleType !== 'auto' ? cartItem.articleType : articleType,
        textModel,
      imageModel,
      charLimit: parseInt(charLimit as string, 10),
      sortCriteria,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      isRocketOnly,
      intervalHours: undefined, // 각 제목은 단발성 (반복하지 않음)
      activeTimeStart: activeTimeStart ? parseInt(activeTimeStart, 10) : undefined,
      activeTimeEnd: activeTimeEnd ? parseInt(activeTimeEnd, 10) : undefined,
      startDate: item.scheduledAt.toISOString(),
      maxRuns: maxRuns ? parseInt(maxRuns, 10) : undefined,
      expiresAt: expiresAt || undefined,
    };
  });

    const success = await addBulkToQueue(payloads);
    if (success) {
      alert(`${payloads.length}개 제목이 큐에 등록되었습니다.`);
      storeClearCart(); // 큐에 등록 후 장바구니 비우기
      setKeyword('');
      setBulkKeywordsText('');
      setSuggestedTitles([]);
      setCartTitles([]);
      setWizardStep(1);
      router.push('/schedule');
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
      case 'EXPIRED':
        return <span className="bg-orange-500/10 text-orange-400 text-xs px-2.5 py-1 rounded-full border border-orange-500/20 font-medium tracking-wide">만료됨</span>;
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
                    {step < 3 && <div className={`flex-1 h-px ${wizardStep > step ? 'bg-emerald-500/30' : 'bg-slate-700/50'}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 1: 키워드 입력 + 제목 개수 선택 */}
              {wizardStep === 1 && (
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
                  <div className="flex justify-end">
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
              )}

              {/* Step 2: AI 제안 제목 테이블 & 장바구니 */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  {/* 상단 액션: 다시 생성 */}
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="text-sm font-semibold text-slate-200">
                        {'\u201c'}{keyword}{'\u201d'} 관련 제목 추천
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
                    {/* 왼쪽: AI 제안 목록 */}
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
                                   <p className="text-sm font-medium text-slate-200 break-words">{item.title}</p>
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

                    {/* 오른쪽: 장바구니 담긴 리스트 + 수동 추가 */}
                    <div className="flex flex-col border border-emerald-500/20 rounded-xl overflow-hidden bg-slate-900/50 max-h-[600px] shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                      <div className="flex justify-between items-center p-3 border-b border-slate-800/50 bg-slate-800/30 sticky top-0 z-10 backdrop-blur-md">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                          선택된 제목 장바구니 ({cartTitles.length})
                        </span>
                        <button
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
                                     {item.subtitle && <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p>}
                                   </div>
                                 </div>
                               </li>
                             ))}
                           </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 하단 CTA */}
                  <div className="flex justify-end pt-4 border-t border-slate-800/50 mt-6 md:mt-8">
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      disabled={cartTitles.length === 0}
                      className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 shadow-[0_4px_15px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      장바구니 {cartTitles.length}개 제목으로 설정 진행
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                  </div>
                </div>
              )}
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

          {/* 공통 SEO 글 작성 설정 UI — 단일 키워드 Step 3 또는 대량 모드에서만 표시 */}
          <div className={`transition-all duration-500 ${
            (inputMode === 'single' && wizardStep !== 3) ? 'hidden' :
            (inputMode === 'bulk' && researchResults.length === 0) ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }`}>
            <div className="pt-8 border-t border-slate-800/50">
              <SharedArticleSettings
                personas={personas}
                persona={personaId}
                setPersona={setPersonaId}
                personaName={personaName}
                setPersonaName={setPersonaName}
                articleType={articleType}
                setArticleType={setArticleType}
                textModel={textModel}
                setTextModel={setTextModel}
                imageModel={imageModel}
                setImageModel={setImageModel}
                charLimit={charLimit}
                setCharLimit={setCharLimit}
                themes={themes}
                themeId={themeId}
                setThemeId={setThemeId}
                hideArticleType={true}
                hideTone={true}
                hidePersona={true}
              />
            </div>

            {/* 아이템 소싱 기준 & 스케줄링 설정 UI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 mt-4 border-t border-slate-800/50">
              {/* 소싱 기준 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 tracking-tight flex-1">아이템 소싱 기준</h3>
                  <p className="text-[10.5px] text-slate-500 mt-1 mt-0.5 leading-tight">
                    * 리뷰 데이터는 쿠팡 API 정책상 제공되지 않아 <strong className="text-slate-400 font-medium">인기/랭킹 기준</strong>으로 우선 소싱됩니다.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => applySourcingPreset('salePriceAsc', true, '', '50000')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-blue-500/20 hover:text-blue-300 transition-colors">
                    인기 로켓 가성비 (5만↓)
                  </button>
                  <button type="button" onClick={() => applySourcingPreset('RANK', true, '50000', '')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors">
                    인기 로켓 프리미엄 (5만↑)
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
                      <option value="RANK">쿠팡 랭킹/인기순</option>
                      <option value="salePriceAsc">가격낮은순 (가성비)</option>
                      <option value="salePriceDesc">가격높은순 (프리미엄)</option>
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
                    <button type="button" onClick={() => applySchedulePreset('1440', '14', '22')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-blue-500/20 hover:text-blue-300 transition-colors">
                      오후 (14~22시)
                    </button>
                    <button type="button" onClick={() => applySchedulePreset('720', '22', '6')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-purple-500/20 hover:text-purple-300 transition-colors">
                      심야 (밤샘)
                    </button>
                    <button type="button" onClick={() => applySchedulePreset('360', '0', '23')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors">
                      종일 (24시간)
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 p-4 bg-slate-800/20 rounded-xl border border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">시작 일시지정 (선택)</label>
                    <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-[220px] p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none [color-scheme:dark]"
                        />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">발행 주기/빈도</label>
                    <div className="flex items-center gap-2">
                      <select 
                        className="w-[140px] p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none"
                        value={
                          ['10', '30', '60', '180', '720', '1440', '2880'].includes(intervalHours) 
                            ? intervalHours 
                            : 'custom'
                        }
                        onChange={(e) => {
                          if (e.target.value !== 'custom') {
                            setIntervalHours(e.target.value);
                          } else {
                            setIntervalHours('');
                          }
                        }}
                      >
                        <option value="10">10분 간격 (테스트용 초고속)</option>
                        <option value="30">30분 마다</option>
                        <option value="60">1시간 마다</option>
                        <option value="180">3시간 마다</option>
                        <option value="720">반나절(12시간) 마다</option>
                        <option value="1440">매일 1회 (24시간)</option>
                        <option value="2880">이틀에 1회</option>
                        <option value="custom">분 직접 입력</option>
                      </select>
                      {['10', '30', '60', '180', '720', '1440', '2880'].includes(intervalHours) ? null : (
                        <>
                          <input
                            type="number"
                            value={intervalHours}
                            onChange={(e) => setIntervalHours(e.target.value)}
                            placeholder="60"
                            min="10"
                            className="w-[80px] p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none text-right"
                          />
                          <span className="text-sm text-slate-400">분 마다</span>
                        </>
                      )}
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

                  {/* 반복 횟수 제한 */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">발행 횟수 제한</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={maxRuns}
                        onChange={(e) => setMaxRuns(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-[100px] p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none placeholder:text-slate-600 text-right"
                      />
                      <span className="text-sm text-slate-400">{!maxRuns || maxRuns === '0' ? '무제한' : '회'}</span>
                    </div>
                  </div>

                  {/* 발행 종료일 */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">발행 종료일 (선택)</label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-[220px] p-2 text-sm bg-slate-950/50 border border-slate-800/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 단일 키워드 Step 3: 스케줄 미리보기 테이블 */}
            {inputMode === 'single' && wizardStep === 3 && cartTitles.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <h3 className="text-sm font-semibold text-slate-300 tracking-tight mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  발행 스케줄 미리보기 ({cartTitles.length}건)
                </h3>
                <div className="border border-slate-800/50 rounded-xl overflow-hidden bg-slate-900/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 sticky top-0 z-10 text-xs text-slate-400 uppercase tracking-widest backdrop-blur-md">
                      <tr>
                        <th className="px-4 py-3 w-[50px] border-b border-slate-800">#</th>
                        <th className="px-4 py-3 border-b border-slate-800">제목</th>
                        <th className="px-4 py-3 w-[180px] border-b border-slate-800">예약 발행 시간</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {calculateSchedulePreview().map((item, i) => (
                        <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 text-slate-500 text-xs font-mono">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-white">{item.title}</td>
                          <td className="px-4 py-3 text-emerald-400 font-mono text-xs">
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
            )}

            <div className="flex justify-end pt-8 mt-2 border-t border-slate-800/50">
              {inputMode === 'single' && wizardStep === 3 ? (
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
              ) : inputMode === 'bulk' ? (
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={isQueueLoading || selectedKeywords.size === 0}
                  className="px-8 py-4 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50 shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),0_4px_10px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all flex items-center justify-center min-w-[200px]"
                >
                  {isQueueLoading ? '추가 중...' : `${selectedKeywords.size}개 키워드 일괄 큐에 등록`}
                </button>
              ) : null}
            </div>
          </div>
        </div>
        {queueError ? <p className="mt-4 text-sm font-medium text-red-400 relative z-10">{queueError}</p> : null}
      </div>
    </div>
  );
}
