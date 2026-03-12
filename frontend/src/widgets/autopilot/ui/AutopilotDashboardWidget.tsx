'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutopilotViewModel } from '@/features/autopilot/model/useAutopilotViewModel';
import { usePersonaViewModel } from '@/features/persona/model/usePersonaViewModel';
import { SharedArticleSettings } from '@/shared/ui/SharedArticleSettings';
import { DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from '@/shared/config/model-options';
import { AiResearchKeyword, CreateAutopilotQueuePayload, SuggestedTitle } from '@/entities/autopilot/model/types';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';
import { useAutopilotStore } from '@/entities/autopilot/model/useAutopilotStore';

// FSD Components
import { SingleKeywordWizard } from '@/features/autopilot/ui/SingleKeywordWizard';
import { BulkKeywordWizard } from '@/features/autopilot/ui/BulkKeywordWizard';
import { SourcingCriteriaSection } from '@/entities/autopilot/ui/SourcingCriteriaSection';
import { ScheduleSettingsSection } from '@/entities/autopilot/ui/ScheduleSettingsSection';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';

export function AutopilotDashboardWidget() {
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

  const { personas, fetchPersonas } = usePersonaViewModel();
  const { themeSettings, articleSettings, profile, autopilotSettings } = useUserSettingsViewModel();

  // Mode state
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('single');
  const [wizardStep, setWizardStep] = useState(1);

  // Single Keyword State
  const [keyword, setKeyword] = useState('');
  const [titleCount, setTitleCount] = useState(15);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<SuggestedTitle[]>([]);
  const [cartTitles, setCartTitles] = useState<SuggestedTitle[]>([]); 
  const [customTitleInput, setCustomTitleInput] = useState('');
  const [singleKeywordResearchMeta, setSingleKeywordResearchMeta] = useState<{
    trafficKeyword: string;
    coupangSearchTerm: string;
    recommendedItemCount: number;
    intent: string;
  } | null>(null);

  // Bulk Keyword State
  const [topic, setTopic] = useState('');
  const [researchResults, setResearchResults] = useState<AiResearchKeyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [isResearching, setIsResearching] = useState(false);

  // Common Settings
  const [personaId, setPersonaId] = useState<string>('');
  const [personaName, setPersonaName] = useState('');
  const [articleType, setArticleType] = useState('auto');
  const [textModel, setTextModel] = useState(DEFAULT_TEXT_MODEL);
  const [titleModel, setTitleModel] = useState(articleSettings?.defaultTitleModel || 'gpt-4o-mini');
  const [titleExamples, setTitleExamples] = useState('');
  const [titleExclusions, setTitleExclusions] = useState('');
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);
  const [charLimit, setCharLimit] = useState<string | number>('5000');
  
  // Theme State
  const [themes, setThemes] = useState<import('@/entities/design/ui/ThemeSwitcher').ThemeSwitcherTheme[]>([]);
  const [themeId, setThemeId] = useState<string | null>(null);
  
  // Quick Preset
  const [quickPreset, setQuickPreset] = useState<string>('');

  // Sourcing & Scheduling
  const [sortCriteria, setSortCriteria] = useState('salePriceAsc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isRocketOnly, setIsRocketOnly] = useState(false);
  const [intervalHours, setIntervalHours] = useState('24');
  const [activeTimeStart, setActiveTimeStart] = useState('9');
  const [activeTimeEnd, setActiveTimeEnd] = useState('22');
  const [startDate, setStartDate] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Zustand Draft 연동 (Silent Recovery)
  const { cartTitles: storeCartTitles, settings: storeSettings, draftState, setCartTitles: setStoreCartTitles, updateSettings: setStoreSettings, updateDraftState, clearCart: storeClearCart } = useAutopilotStore();
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
      if (draftState) {
        if (draftState.inputMode) setInputMode(draftState.inputMode);
        if (draftState.wizardStep) setWizardStep(draftState.wizardStep);
        if (draftState.keyword) setKeyword(draftState.keyword);
        if (draftState.topic) setTopic(draftState.topic);
        if (draftState.suggestedTitles) setSuggestedTitles(draftState.suggestedTitles);
      }
      setIsStoreRestored(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStoreRestored]);

  // 입력 내용 변경 시 Store 스토리지 자동 업데이트
  useEffect(() => {
    if (isStoreRestored) {
      setStoreCartTitles(cartTitles);
      setStoreSettings({ intervalHours, activeTimeStart, activeTimeEnd });
      updateDraftState({ inputMode, wizardStep, keyword, topic, suggestedTitles });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTitles, intervalHours, activeTimeStart, activeTimeEnd, inputMode, wizardStep, keyword, topic, suggestedTitles, isStoreRestored]);

  // ────────────────────────────────────────────────────────
  // Side Effects & Initialization
  // ────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (articleSettings?.defaultTitleModel) setTitleModel(articleSettings.defaultTitleModel);
    if (articleSettings?.defaultTextModel) setTextModel(articleSettings.defaultTextModel);
    if (articleSettings?.defaultImageModel) setImageModel(articleSettings.defaultImageModel);
    if (articleSettings?.presetWordCount) setCharLimit(articleSettings.presetWordCount);
    if (profile?.name) setPersonaName(profile.name);
    
    if (autopilotSettings) {
      if (autopilotSettings.sortCriteria) setSortCriteria(autopilotSettings.sortCriteria);
      if (autopilotSettings.isRocketOnly !== undefined) setIsRocketOnly(autopilotSettings.isRocketOnly);
      if (autopilotSettings.minPrice !== null && autopilotSettings.minPrice !== undefined) setMinPrice(String(autopilotSettings.minPrice));
      if (autopilotSettings.maxPrice !== null && autopilotSettings.maxPrice !== undefined) setMaxPrice(String(autopilotSettings.maxPrice));
      if (autopilotSettings.intervalHours !== null && autopilotSettings.intervalHours !== undefined) setIntervalHours(String(autopilotSettings.intervalHours));
      if (autopilotSettings.activeTimeStart !== null && autopilotSettings.activeTimeStart !== undefined) setActiveTimeStart(String(autopilotSettings.activeTimeStart));
      if (autopilotSettings.activeTimeEnd !== null && autopilotSettings.activeTimeEnd !== undefined) setActiveTimeEnd(String(autopilotSettings.activeTimeEnd));
    }
  }, [articleSettings, profile, autopilotSettings]);

  useEffect(() => {
    if (personas && personas.length > 0 && !personaId) {
      setPersonaId(personas[0].id);
    }
  }, [personas, personaId]);

  // ────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────
  const handleGenerateTitles = async () => {
    if (!keyword.trim()) {
      alert('키워드를 입력해주세요.');
      return;
    }
    setIsGeneratingTitles(true);
    setSingleKeywordResearchMeta(null); // Reset previous meta
    try {
      const excludeTitles = cartTitles.map((t) => t.title);
      
      const [titlesRes, metaRes] = await Promise.all([
        fetch('/api/keyword-titles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword: keyword.trim(),
            persona: personaId,
            articleType: articleType === 'auto' ? undefined : articleType,
            textModel: titleModel,
            titleExamples: titleExamples.trim(),
            titleExclusions: titleExclusions.trim(),
            count: titleCount,
            excludeTitles,
          }),
        }),
        fetch('/api/autopilot/research-single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword: keyword.trim(),
            personaId: personaId,
          }),
        })
      ]);

      const [result, metaResult] = await Promise.all([
        titlesRes.json(),
        metaRes.json()
      ]);

      if (metaResult && metaResult.result) {
        setSingleKeywordResearchMeta(metaResult.result);
      }

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

  const handleResearch = async () => {
    setIsResearching(true);
    // TODO: MOCK Data or API Call logic
    setTimeout(() => setIsResearching(false), 1000);
  };

  const toggleAllKeywords = () => {
    if (selectedKeywords.size === researchResults.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(researchResults.map(r => r.trafficKeyword)));
    }
  };

  const toggleKeywordSelection = (kw: string) => {
    const next = new Set(selectedKeywords);
    if (next.has(kw)) next.delete(kw);
    else next.add(kw);
    setSelectedKeywords(next);
  };

  const calculateSchedulePreview = () => {
    const base = startDate ? new Date(startDate) : new Date();
    const interval = parseInt(intervalHours || '24', 10);
    const activeStart = parseInt(activeTimeStart || '9', 10);
    const activeEnd = parseInt(activeTimeEnd || '22', 10);

    return cartTitles.map((item, i) => {
      const runTime = new Date(base.getTime() + i * interval * 60 * 60 * 1000);
      const hour = runTime.getHours();
      if (activeEnd > activeStart) {
        if (hour < activeStart) runTime.setHours(activeStart, 0, 0, 0);
        else if (hour >= activeEnd) {
          runTime.setDate(runTime.getDate() + 1);
          runTime.setHours(activeStart, 0, 0, 0);
        }
      }
      return { index: i, title: item.title, scheduledAt: runTime };
    });
  };

  const handleSingleSubmit = async () => {
    const preview = calculateSchedulePreview();
    if (preview.length === 0) {
      alert('발행할 제목을 하나 이상 장바구니에 담아주세요.');
      return;
    }

    const payloads: CreateAutopilotQueuePayload[] = preview.map((item) => {
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
        intervalHours: undefined, // 한 제목당 반복 발행하지 않으므로 undefined (단발성)
        activeTimeStart: activeTimeStart ? parseInt(activeTimeStart, 10) : undefined,
        activeTimeEnd: activeTimeEnd ? parseInt(activeTimeEnd, 10) : undefined,
        startDate: item.scheduledAt.toISOString(),
        expiresAt: expiresAt || undefined,
        trafficKeyword: singleKeywordResearchMeta?.trafficKeyword,
        coupangSearchTerm: singleKeywordResearchMeta?.coupangSearchTerm,
        recommendedItemCount: singleKeywordResearchMeta?.recommendedItemCount,
        searchIntent: singleKeywordResearchMeta?.intent,
      };
    });

    const success = await addBulkToQueue(payloads);
    if (success) {
      alert(`${payloads.length}개 제목이 큐에 등록되었습니다.`);
      storeClearCart();
      setKeyword('');
      setSuggestedTitles([]);
      setCartTitles([]);
      setWizardStep(1);
      router.push('/schedule');
    }
  };

  const handleBulkSubmit = async (selectedItems: AiResearchKeyword[]) => {
    if (selectedItems.length === 0) return;

    const preview = calculateSchedulePreview();
    if (preview.length === 0) {
       // 대량의 경우 cartTitles가 아니라 선택된 키워드들에 직접 매핑합니다.
       const base = startDate ? new Date(startDate) : new Date();
       const interval = parseInt(intervalHours || '24', 10);
       const activeStart = parseInt(activeTimeStart || '9', 10);
       const activeEnd = parseInt(activeTimeEnd || '22', 10);

       selectedItems.forEach((_, i) => {
         const runTime = new Date(base.getTime() + i * interval * 60 * 60 * 1000);
         const hour = runTime.getHours();
         if (activeEnd > activeStart) {
           if (hour < activeStart) runTime.setHours(activeStart, 0, 0, 0);
           else if (hour >= activeEnd) {
             runTime.setDate(runTime.getDate() + 1);
             runTime.setHours(activeStart, 0, 0, 0);
           }
         }
         preview.push({ index: i, title: selectedItems[i].blogTitle, scheduledAt: runTime });
       });
    }

    const payloads: CreateAutopilotQueuePayload[] = preview.map((item, i) => {
      const researchItem = selectedItems[i];
      return {
        keyword: item.title,
        trafficKeyword: researchItem?.trafficKeyword,
        coupangSearchTerm: researchItem?.coupangSearchTerm,
        recommendedItemCount: researchItem?.recommendedItemCount,
        searchIntent: researchItem?.intent,
        
        personaId: personaId || undefined,
        themeId: themeId || undefined,
        articleType,
        textModel,
        imageModel,
        charLimit: parseInt(charLimit as string, 10),
        sortCriteria,
        minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
        isRocketOnly,
        intervalHours: undefined, 
        activeTimeStart: activeTimeStart ? parseInt(activeTimeStart, 10) : undefined,
        activeTimeEnd: activeTimeEnd ? parseInt(activeTimeEnd, 10) : undefined,
        startDate: item.scheduledAt.toISOString(),
        expiresAt: expiresAt || undefined,
      };
    });

    const success = await addBulkToQueue(payloads);
    if (success) {
      alert(`${payloads.length}개 AI 리서치 항목이 큐에 일괄 등록되었습니다.`);
      setTopic('');
      setResearchResults([]);
      setSelectedKeywords(new Set());
      router.push('/schedule');
    }
  };

  const quickPresetNode = (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 hidden sm:inline-block">선택 시 설정값이 자동 입력됩니다.</span>
      <select
        className="bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2 py-1.5 outline-none border border-slate-700/50 focus:border-blue-500 transition-colors"
        value={quickPreset}
        onChange={(e) => {
          const val = e.target.value;
          setQuickPreset(val);
          if (val === "my-settings") {
            // Apply all My Page settings here
            if (articleSettings?.defaultTextModel) setTextModel(articleSettings.defaultTextModel);
            if (articleSettings?.defaultImageModel) setImageModel(articleSettings.defaultImageModel);
            if (articleSettings?.defaultTitleModel) setTitleModel(articleSettings.defaultTitleModel);
            if (articleSettings?.presetWordCount) setCharLimit(articleSettings.presetWordCount);
            
            if (themeSettings?.personaId) setPersonaId(themeSettings.personaId);
            if (themeSettings?.personaName) setPersonaName(themeSettings.personaName);
            
            if (themeSettings?.themeId && themes && themes.length > 0) {
              const isValid = themes.some(t => t.id === themeSettings.themeId);
              setThemeId(isValid ? themeSettings.themeId : (themes.find(t => t.isDefault)?.id || themes[0].id));
            } else if (themes && themes.length > 0) {
              setThemeId(themes.find(t => t.isDefault)?.id || themes[0].id);
            }

            if (autopilotSettings) {
              if (autopilotSettings.sortCriteria) setSortCriteria(autopilotSettings.sortCriteria);
              if (autopilotSettings.minPrice !== null && autopilotSettings.minPrice !== undefined) setMinPrice(String(autopilotSettings.minPrice));
              if (autopilotSettings.maxPrice !== null && autopilotSettings.maxPrice !== undefined) setMaxPrice(String(autopilotSettings.maxPrice));
              if (autopilotSettings.isRocketOnly !== undefined) setIsRocketOnly(autopilotSettings.isRocketOnly);
              if (autopilotSettings.intervalHours !== null && autopilotSettings.intervalHours !== undefined) setIntervalHours(String(autopilotSettings.intervalHours));
              if (autopilotSettings.activeTimeStart !== null && autopilotSettings.activeTimeStart !== undefined) setActiveTimeStart(String(autopilotSettings.activeTimeStart));
              if (autopilotSettings.activeTimeEnd !== null && autopilotSettings.activeTimeEnd !== undefined) setActiveTimeEnd(String(autopilotSettings.activeTimeEnd));
            }
          }
        }}
      >
        <option value="">간편설정 불러오기</option>
        <option value="my-settings">마이페이지 내 설정</option>
      </select>
    </div>
  );

  // 공통 설정 요소 (아코디언 형태)
  const configNodes = (
    <Accordion type="multiple" className="w-full space-y-4">
      <AccordionItem value="article-settings" className="border border-slate-800/50 bg-slate-900/40 rounded-xl px-4 overflow-hidden data-[state=open]:bg-slate-900/60 transition-colors">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            기본 글 / 모델 설정
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 border-t border-slate-800/50">
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
            hideTheme={false}
            autoLoadMySettings={true}
            hideQuickPreset={true}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="sourcing-settings" className="border border-slate-800/50 bg-slate-900/40 rounded-xl px-4 overflow-hidden data-[state=open]:bg-slate-900/60 transition-colors">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            아이템 소싱 기준
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 border-t border-slate-800/50">
          <SourcingCriteriaSection
            sortCriteria={sortCriteria}
            setSortCriteria={setSortCriteria}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            isRocketOnly={isRocketOnly}
            setIsRocketOnly={setIsRocketOnly}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="schedule-settings" className="border border-slate-800/50 bg-slate-900/40 rounded-xl px-4 overflow-hidden data-[state=open]:bg-slate-900/60 transition-colors">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            발행 스케줄 상세 설정
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 border-t border-slate-800/50">
          <ScheduleSettingsSection
            intervalHours={intervalHours}
            setIntervalHours={setIntervalHours}
            activeTimeStart={activeTimeStart}
            setActiveTimeStart={setActiveTimeStart}
            activeTimeEnd={activeTimeEnd}
            setActiveTimeEnd={setActiveTimeEnd}
            startDate={startDate}
            setStartDate={setStartDate}
            expiresAt={expiresAt}
            setExpiresAt={setExpiresAt}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  // ────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* 헤더 */}
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

      {/* 큐 등록 폼 컨테이너 */}
      <div className="bg-slate-900/50 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.2)] border border-slate-800/50 p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>

        {/* 탭 네비게이션 */}
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
            <SingleKeywordWizard 
              wizardStep={wizardStep}
              setWizardStep={setWizardStep}
              titleModel={titleModel}
              setTitleModel={setTitleModel}
              defaultTitleModel={articleSettings?.defaultTitleModel}
              titleExamples={titleExamples}
              setTitleExamples={setTitleExamples}
              titleExclusions={titleExclusions}
              setTitleExclusions={setTitleExclusions}
              keyword={keyword}
              setKeyword={setKeyword}
              titleCount={titleCount}
              setTitleCount={setTitleCount}
              isGeneratingTitles={isGeneratingTitles}
              handleGenerateTitles={handleGenerateTitles}
              suggestedTitles={suggestedTitles}
              setSuggestedTitles={setSuggestedTitles}
              cartTitles={cartTitles}
              setCartTitles={setCartTitles}
              customTitleInput={customTitleInput}
              setCustomTitleInput={setCustomTitleInput}
              startDate={startDate}
              intervalHours={intervalHours}
              activeTimeStart={activeTimeStart}
              activeTimeEnd={activeTimeEnd}
              handleSingleSubmit={handleSingleSubmit}
              isQueueLoading={isQueueLoading}
              configNode={configNodes}
              quickPresetNode={quickPresetNode}
            />
          ) : (
            <>
              <BulkKeywordWizard 
                topic={topic}
                setTopic={setTopic}
                personaId={personaId}
                handleResearch={handleResearch}
                isResearching={isResearching}
                researchResults={researchResults}
                selectedKeywords={selectedKeywords}
                toggleAllKeywords={toggleAllKeywords}
                toggleKeywordSelection={toggleKeywordSelection}
                handleBulkSubmit={handleBulkSubmit}
                isQueueLoading={isQueueLoading}
                configNode={configNodes}
                quickPresetNode={quickPresetNode}
              />
              {/* 대량 모드에서는 결과를 고른 후에 설정이 표시됨 */}
              <div className={`transition-all duration-500 pt-6 mt-6 border-t border-slate-800/50 ${
                researchResults.length === 0 ? 'opacity-50 pointer-events-none hidden' : 'opacity-100 flex flex-col'
              }`}>
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-sm font-semibold text-slate-300">자동화 일괄 상세 설정 (모든 제목에 공통 적용)</h3>
                  {quickPresetNode}
                </div>
                {configNodes}
              </div>
            </>
          )}
        </div>

        {queueError ? <p className="mt-4 text-sm font-medium text-red-400 relative z-10">{queueError}</p> : null}
      </div>
    </div>
  );
}
