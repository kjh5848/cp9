import { useEffect, useState } from 'react';
import { useAutopilotStore } from '@/entities/autopilot/model/useAutopilotStore';
import { usePersonaViewModel } from '@/features/persona/model/usePersonaViewModel';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';
import { DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from '@/shared/config/model-options';
import { AiResearchKeyword, SuggestedTitle } from '@/entities/autopilot/model/types';
import { PublishTarget } from '@/shared/ui/PublishTargetSection';
import { ThemeSwitcherTheme } from '@/entities/design/ui/ThemeSwitcher';

export function useAutopilotDashboardState() {
  const { personas, fetchPersonas } = usePersonaViewModel();
  const { themeSettings, articleSettings, profile, autopilotSettings, refreshSettings } = useUserSettingsViewModel();

  // Mode state
  const [inputMode, setInputMode] = useState<'single' | 'bulk' | 'campaign' | 'inbox'>('single');
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
  const [publishTimes, setPublishTimes] = useState('');
  const [publishDays, setPublishDays] = useState('');
  const [jitterMinutes, setJitterMinutes] = useState('');
  const [dailyCap, setDailyCap] = useState('');
  const [activeTimeStart, setActiveTimeStart] = useState('9');
  const [activeTimeEnd, setActiveTimeEnd] = useState('22');
  const [startDate, setStartDate] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // 다중 플랫폼 발행 대상
  const [publishTargets, setPublishTargets] = useState<PublishTarget[]>();

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
      if (autopilotSettings.publishTimes) setPublishTimes(autopilotSettings.publishTimes);
      if (autopilotSettings.publishDays) setPublishDays(autopilotSettings.publishDays);
      if (autopilotSettings.jitterMinutes !== null && autopilotSettings.jitterMinutes !== undefined) setJitterMinutes(String(autopilotSettings.jitterMinutes));
      if (autopilotSettings.dailyCap !== null && autopilotSettings.dailyCap !== undefined) setDailyCap(String(autopilotSettings.dailyCap));
      if (autopilotSettings.activeTimeStart !== null && autopilotSettings.activeTimeStart !== undefined) setActiveTimeStart(String(autopilotSettings.activeTimeStart));
      if (autopilotSettings.activeTimeEnd !== null && autopilotSettings.activeTimeEnd !== undefined) setActiveTimeEnd(String(autopilotSettings.activeTimeEnd));
    }
  }, [articleSettings, profile, autopilotSettings]);

  useEffect(() => {
    if (personas && personas.length > 0 && !personaId) {
      setPersonaId(personas[0].id);
    }
  }, [personas, personaId]);

  return {
    inputMode, setInputMode,
    wizardStep, setWizardStep,
    keyword, setKeyword,
    titleCount, setTitleCount,
    isGeneratingTitles, setIsGeneratingTitles,
    suggestedTitles, setSuggestedTitles,
    cartTitles, setCartTitles,
    customTitleInput, setCustomTitleInput,
    singleKeywordResearchMeta, setSingleKeywordResearchMeta,
    topic, setTopic,
    bulkCount, setBulkCount,
    researchResults, setResearchResults,
    selectedKeywords, setSelectedKeywords,
    isResearching, setIsResearching,
    personaId, setPersonaId,
    personaName, setPersonaName,
    articleType, setArticleType,
    textModel, setTextModel,
    titleModel, setTitleModel,
    titleExamples, setTitleExamples,
    titleExclusions, setTitleExclusions,
    imageModel, setImageModel,
    charLimit, setCharLimit,
    themes, setThemes,
    themeId, setThemeId,
    quickPreset, setQuickPreset,
    sortCriteria, setSortCriteria,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    isRocketOnly, setIsRocketOnly,
    intervalHours, setIntervalHours,
    publishTimes, setPublishTimes,
    publishDays, setPublishDays,
    jitterMinutes, setJitterMinutes,
    dailyCap, setDailyCap,
    activeTimeStart, setActiveTimeStart,
    activeTimeEnd, setActiveTimeEnd,
    startDate, setStartDate,
    expiresAt, setExpiresAt,
    publishTargets, setPublishTargets,
    storeClearCart,
    
    // Services
    personas, fetchPersonas,
    articleSettings, themeSettings, autopilotSettings,
    fetchThemes, refreshSettings,
  };
}
