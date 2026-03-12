import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutopilotViewModel } from '@/features/autopilot/model/useAutopilotViewModel';
import { usePersonaViewModel } from '@/features/persona/model/usePersonaViewModel';
import { DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from '@/shared/config/model-options';
import { AiResearchKeyword, CreateAutopilotQueuePayload, SuggestedTitle } from '@/entities/autopilot/model/types';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';
import { useAutopilotStore } from '@/entities/autopilot/model/useAutopilotStore';
import { ThemeSwitcherTheme } from '@/entities/design/ui/ThemeSwitcher';

export function useAutopilotDashboardViewModel() {
  const router = useRouter();
  const {
    isLoading: isQueueLoading,
    error: queueError,
    fetchQueue,
    triggerCronManually,
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
  const [bulkCount, setBulkCount] = useState(30);
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
  const [themes, setThemes] = useState<ThemeSwitcherTheme[]>([]);
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

  const fetchThemes = async () => {
    try {
      const res = await fetch('/api/design');
      const data = await res.json();
      const list = data.themes || [];
      setThemes(list);
      
      if (themeSettings?.themeId && list.some((t: ThemeSwitcherTheme) => t.id === themeSettings.themeId)) {
        setThemeId(themeSettings.themeId);
      } else {
        const defaultTheme = list.find((t: ThemeSwitcherTheme) => t.isDefault);
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

  const handleGenerateTitles = async () => {
    if (!keyword.trim()) {
      alert('키워드를 입력해주세요.');
      return;
    }
    setIsGeneratingTitles(true);
    setSingleKeywordResearchMeta(null); // Reset previous meta
    try {
      const excludeTitles = cartTitles.map((t) => t.title);
      
      // 1. 퍼플렉시티 리서치 선행 (팩트 수집)
      const metaRes = await fetch('/api/autopilot/research-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          personaId: personaId,
        }),
      });
      const metaResult = await metaRes.json();
      
      let trafficKeyword = keyword.trim();
      let searchIntent = '';

      if (metaResult && metaResult.result) {
        setSingleKeywordResearchMeta(metaResult.result);
        if (metaResult.result.trafficKeyword) trafficKeyword = metaResult.result.trafficKeyword;
        if (metaResult.result.searchIntent) searchIntent = metaResult.result.searchIntent;
      }

      // 2. 수집된 팩트(트래픽 키워드, 인텐트) 기반으로 GPT 직렬 호출
      const titlesRes = await fetch('/api/keyword-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          trafficKeyword,
          searchIntent,
          persona: personaId,
          articleType: articleType === 'auto' ? undefined : articleType,
          textModel: titleModel,
          titleExamples: titleExamples.trim(),
          titleExclusions: titleExclusions.trim(),
          count: titleCount,
          excludeTitles,
        }),
      });

      const result = await titlesRes.json();

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
    if (!topic.trim()) {
      alert('주제어를 입력해주세요.');
      return;
    }
    setIsResearching(true);
    try {
      const res = await fetch('/api/autopilot/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          personaId,
          count: bulkCount,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResearchResults(data.data);
        setSelectedKeywords(new Set(data.data.map((r: any) => r.trafficKeyword)));
      } else {
        alert(data.error || '리서치에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    } finally {
      setIsResearching(false);
    }
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
        intervalHours: intervalHours ? parseInt(intervalHours, 10) : undefined,
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

  const handleQuickPresetChange = (val: string) => {
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
  };

  return {
    queueError,
    triggerCronManually,
    inputMode, setInputMode,
    wizardStep, setWizardStep,
    keyword, setKeyword,
    titleCount, setTitleCount,
    isGeneratingTitles,
    suggestedTitles, setSuggestedTitles,
    cartTitles, setCartTitles,
    customTitleInput, setCustomTitleInput,
    handleGenerateTitles, handleSingleSubmit,
    isQueueLoading,
    
    topic, setTopic,
    bulkCount, setBulkCount,
    researchResults, setResearchResults,
    selectedKeywords, setSelectedKeywords,
    isResearching,
    handleResearch, toggleAllKeywords, toggleKeywordSelection, handleBulkSubmit,
    
    personaId, setPersonaId,
    personaName, setPersonaName,
    articleType, setArticleType,
    textModel, setTextModel,
    titleModel, setTitleModel,
    titleExamples, setTitleExamples,
    titleExclusions, setTitleExclusions,
    imageModel, setImageModel,
    charLimit, setCharLimit,
    themes, themeId, setThemeId,
    personas,
    
    quickPreset, setQuickPreset, handleQuickPresetChange,

    sortCriteria, setSortCriteria,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    isRocketOnly, setIsRocketOnly,
    intervalHours, setIntervalHours,
    activeTimeStart, setActiveTimeStart,
    activeTimeEnd, setActiveTimeEnd,
    startDate, setStartDate,
    expiresAt, setExpiresAt
  };
}
