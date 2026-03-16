import { useRouter } from 'next/navigation';
import { CreateAutopilotQueuePayload, AiResearchKeyword } from '@/entities/autopilot/model/types';
import { getNextRunAtKST } from '@/features/autopilot/lib/scheduler';

export function useAutopilotDashboardActions(state: any, autopilotHook: any) {
  const router = useRouter();

  const handleGenerateTitles = async () => {
    if (!state.keyword.trim()) {
      alert('키워드를 입력해주세요.');
      return;
    }
    state.setIsGeneratingTitles(true);
    state.setSingleKeywordResearchMeta(null); // Reset previous meta
    try {
      const excludeTitles = state.cartTitles.map((t: any) => t.title);
      
      const metaRes = await fetch('/api/autopilot/research-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: state.keyword.trim(),
          personaId: state.personaId,
        }),
      });
      const metaResult = await metaRes.json();
      
      let trafficKeyword = state.keyword.trim();
      let searchIntent = '';

      if (metaResult && metaResult.result) {
        state.setSingleKeywordResearchMeta(metaResult.result);
        if (metaResult.result.trafficKeyword) trafficKeyword = metaResult.result.trafficKeyword;
        if (metaResult.result.searchIntent) searchIntent = metaResult.result.searchIntent;
      }

      const titlesRes = await fetch('/api/keyword-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: state.keyword.trim(),
          trafficKeyword,
          searchIntent,
          persona: state.personaId,
          articleType: state.articleType === 'auto' ? undefined : state.articleType,
          textModel: state.titleModel,
          titleExamples: state.titleExamples.trim(),
          titleExclusions: state.titleExclusions.trim(),
          count: state.titleCount,
          excludeTitles,
        }),
      });

      const result = await titlesRes.json();

      if (result && result.titles && result.titles.length > 0) {
        state.setSuggestedTitles(result.titles);
        state.setWizardStep(2);
      } else {
        alert('제목 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (e) {
      alert('제목 생성 중 오류가 발생했습니다.');
      console.error(e);
    }
    state.setIsGeneratingTitles(false);
  };

  const handleResearch = async () => {
    if (!state.topic.trim()) {
      alert('주제어를 입력해주세요.');
      return;
    }
    state.setIsResearching(true);
    try {
      const res = await fetch('/api/autopilot/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.topic.trim(),
          personaId: state.personaId,
          count: state.bulkCount,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        state.setResearchResults(data.data);
        state.setSelectedKeywords(new Set(data.data.map((r: any) => r.trafficKeyword)));
      } else {
        alert(data.error || '리서치에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    } finally {
      state.setIsResearching(false);
    }
  };

  const toggleAllKeywords = () => {
    if (state.selectedKeywords.size === state.researchResults.length) {
      state.setSelectedKeywords(new Set());
    } else {
      state.setSelectedKeywords(new Set(state.researchResults.map((r: any) => r.trafficKeyword)));
    }
  };

  const toggleKeywordSelection = (kw: string) => {
    const next = new Set(state.selectedKeywords);
    if (next.has(kw)) next.delete(kw);
    else next.add(kw);
    state.setSelectedKeywords(next);
  };

  const calculateSchedulePreview = () => {
    const base = state.startDate ? new Date(state.startDate) : new Date();
    const intervalMinutes = state.intervalHours ? parseInt(state.intervalHours, 10) * 60 : 0;
    const activeStart = state.activeTimeStart ? parseInt(state.activeTimeStart, 10) : undefined;
    const activeEnd = state.activeTimeEnd ? parseInt(state.activeTimeEnd, 10) : undefined;
    const parsedPublishTimes = state.publishTimes ? state.publishTimes.split(',').filter(Boolean) : undefined;
    const parsedPublishDays = state.publishDays ? state.publishDays.split(',').filter(Boolean).map(Number) : undefined;
    const jitter = state.jitterMinutes ? parseInt(state.jitterMinutes, 10) : 0;

    return state.cartTitles.map((item: any, i: number) => {
      const runTime = getNextRunAtKST(
          intervalMinutes,
          activeStart,
          activeEnd,
          i, // 순서 인덱스 전달 (이전처럼 i * intervalMinutes 가 아님)
          base,
          parsedPublishTimes,
          parsedPublishDays,
          jitter
      );

      return { index: i, title: item.title, scheduledAt: runTime };
    });
  };

  const handleSingleSubmit = async () => {
    const preview = calculateSchedulePreview();
    if (preview.length === 0) {
      alert('발행할 제목을 하나 이상 장바구니에 담아주세요.');
      return;
    }

    const payloads: CreateAutopilotQueuePayload[] = preview.map((item: any) => {
      const cartItem = state.cartTitles[item.index];
      return {
        keyword: item.title,
        personaId: state.personaId || undefined,
        themeId: state.themeId || undefined,
        articleType: cartItem?.articleType && cartItem.articleType !== 'auto' ? cartItem.articleType : state.articleType,
        textModel: state.textModel,
        imageModel: state.imageModel,
        charLimit: parseInt(state.charLimit as string, 10),
        sortCriteria: state.sortCriteria,
        minPrice: state.minPrice ? parseInt(state.minPrice, 10) : undefined,
        maxPrice: state.maxPrice ? parseInt(state.maxPrice, 10) : undefined,
        isRocketOnly: state.isRocketOnly,
        intervalHours: undefined, 
        publishTimes: state.publishTimes || undefined,
        publishDays: state.publishDays || undefined,
        jitterMinutes: state.jitterMinutes ? parseInt(state.jitterMinutes, 10) : undefined,
        dailyCap: state.dailyCap ? parseInt(state.dailyCap, 10) : undefined,
        activeTimeStart: state.activeTimeStart ? parseInt(state.activeTimeStart, 10) : undefined,
        activeTimeEnd: state.activeTimeEnd ? parseInt(state.activeTimeEnd, 10) : undefined,
        startDate: item.scheduledAt.toISOString(),
        expiresAt: state.expiresAt || undefined,
        trafficKeyword: state.singleKeywordResearchMeta?.trafficKeyword,
        coupangSearchTerm: state.singleKeywordResearchMeta?.coupangSearchTerm,
        recommendedItemCount: state.singleKeywordResearchMeta?.recommendedItemCount,
        searchIntent: state.singleKeywordResearchMeta?.intent,
        publishTargets: state.publishTargets,
      };
    });

    const success = await autopilotHook.addBulkToQueue(payloads);
    if (success) {
      alert(`${payloads.length}개 제목이 큐에 등록되었습니다.`);
      state.storeClearCart();
      state.setKeyword('');
      state.setSuggestedTitles([]);
      state.setCartTitles([]);
      state.setWizardStep(1);
      router.push('/schedule');
    }
  };

  const handleBulkSubmit = async (selectedItems: AiResearchKeyword[]) => {
    if (selectedItems.length === 0) return;

    const preview = calculateSchedulePreview();
    if (preview.length === 0) {
         const base = state.startDate ? new Date(state.startDate) : new Date();
         const intervalMinutes = state.intervalHours ? parseInt(state.intervalHours, 10) * 60 : 0;
         const activeStart = state.activeTimeStart ? parseInt(state.activeTimeStart, 10) : undefined;
         const activeEnd = state.activeTimeEnd ? parseInt(state.activeTimeEnd, 10) : undefined;
         const parsedPublishTimes = state.publishTimes ? state.publishTimes.split(',').filter(Boolean) : undefined;
         const parsedPublishDays = state.publishDays ? state.publishDays.split(',').filter(Boolean).map(Number) : undefined;
         const jitter = state.jitterMinutes ? parseInt(state.jitterMinutes, 10) : 0;
  
         selectedItems.forEach((_, i) => {
           let offset = 0;
           if (i > 0) offset = intervalMinutes;
           const runTime = getNextRunAtKST(
               intervalMinutes,
               activeStart,
               activeEnd,
               i, // 순서 인덱스 전달
               base,
               parsedPublishTimes,
               parsedPublishDays,
               jitter
           );
           preview.push({ index: i, title: selectedItems[i].blogTitle, scheduledAt: runTime });
         });
    }

    const payloads: CreateAutopilotQueuePayload[] = preview.map((item: any, i: number) => {
      const researchItem = selectedItems[i];
      return {
        keyword: item.title,
        trafficKeyword: researchItem?.trafficKeyword,
        coupangSearchTerm: researchItem?.coupangSearchTerm,
        recommendedItemCount: researchItem?.recommendedItemCount,
        searchIntent: researchItem?.intent,
        
        personaId: state.personaId || undefined,
        themeId: state.themeId || undefined,
        articleType: state.articleType,
        textModel: state.textModel,
        imageModel: state.imageModel,
        charLimit: parseInt(state.charLimit as string, 10),
        sortCriteria: state.sortCriteria,
        minPrice: state.minPrice ? parseInt(state.minPrice, 10) : undefined,
        maxPrice: state.maxPrice ? parseInt(state.maxPrice, 10) : undefined,
        isRocketOnly: state.isRocketOnly,
        intervalHours: state.intervalHours ? parseInt(state.intervalHours, 10) : undefined,
        publishTimes: state.publishTimes || undefined,
        publishDays: state.publishDays || undefined,
        jitterMinutes: state.jitterMinutes ? parseInt(state.jitterMinutes, 10) : undefined,
        dailyCap: state.dailyCap ? parseInt(state.dailyCap, 10) : undefined,
        activeTimeStart: state.activeTimeStart ? parseInt(state.activeTimeStart, 10) : undefined,
        activeTimeEnd: state.activeTimeEnd ? parseInt(state.activeTimeEnd, 10) : undefined,
        startDate: item.scheduledAt.toISOString(),
        expiresAt: state.expiresAt || undefined,
        publishTargets: state.publishTargets,
      };
    });

    const success = await autopilotHook.addBulkToQueue(payloads);
    if (success) {
      alert(`${payloads.length}개 AI 리서치 항목이 큐에 일괄 등록되었습니다.`);
      state.setTopic('');
      state.setResearchResults([]);
      state.setSelectedKeywords(new Set());
      router.push('/schedule');
    }
  };

  const handleQuickPresetChange = (val: string) => {
    state.setQuickPreset(val);
    if (val === "my-settings") {
      if (state.articleSettings?.defaultTextModel) state.setTextModel(state.articleSettings.defaultTextModel);
      if (state.articleSettings?.defaultImageModel) state.setImageModel(state.articleSettings.defaultImageModel);
      if (state.articleSettings?.defaultTitleModel) state.setTitleModel(state.articleSettings.defaultTitleModel);
      if (state.articleSettings?.presetWordCount) state.setCharLimit(state.articleSettings.presetWordCount);
      
      if (state.themeSettings?.personaId) state.setPersonaId(state.themeSettings.personaId);
      if (state.themeSettings?.personaName) state.setPersonaName(state.themeSettings.personaName);
      
      if (state.themeSettings?.themeId && state.themes && state.themes.length > 0) {
        const isValid = state.themes.some((t: any) => t.id === state.themeSettings.themeId);
        state.setThemeId(isValid ? state.themeSettings.themeId : (state.themes.find((t: any) => t.isDefault)?.id || state.themes[0].id));
      } else if (state.themes && state.themes.length > 0) {
        state.setThemeId(state.themes.find((t: any) => t.isDefault)?.id || state.themes[0].id);
      }

      if (state.autopilotSettings) {
        if (state.autopilotSettings.sortCriteria) state.setSortCriteria(state.autopilotSettings.sortCriteria);
        if (state.autopilotSettings.minPrice !== null && state.autopilotSettings.minPrice !== undefined) state.setMinPrice(String(state.autopilotSettings.minPrice));
        if (state.autopilotSettings.maxPrice !== null && state.autopilotSettings.maxPrice !== undefined) state.setMaxPrice(String(state.autopilotSettings.maxPrice));
        if (state.autopilotSettings.isRocketOnly !== undefined) state.setIsRocketOnly(state.autopilotSettings.isRocketOnly);
        if (state.autopilotSettings.intervalHours !== null && state.autopilotSettings.intervalHours !== undefined) state.setIntervalHours(String(state.autopilotSettings.intervalHours));
        if (state.autopilotSettings.publishTimes) state.setPublishTimes(state.autopilotSettings.publishTimes);
        if (state.autopilotSettings.publishDays) state.setPublishDays(state.autopilotSettings.publishDays);
        if (state.autopilotSettings.jitterMinutes !== null && state.autopilotSettings.jitterMinutes !== undefined) state.setJitterMinutes(String(state.autopilotSettings.jitterMinutes));
        if (state.autopilotSettings.dailyCap !== null && state.autopilotSettings.dailyCap !== undefined) state.setDailyCap(String(state.autopilotSettings.dailyCap));
        if (state.autopilotSettings.activeTimeStart !== null && state.autopilotSettings.activeTimeStart !== undefined) state.setActiveTimeStart(String(state.autopilotSettings.activeTimeStart));
        if (state.autopilotSettings.activeTimeEnd !== null && state.autopilotSettings.activeTimeEnd !== undefined) state.setActiveTimeEnd(String(state.autopilotSettings.activeTimeEnd));
      }
    }
  };

  const handleRefreshSettings = async () => {
    if (state.refreshSettings) await state.refreshSettings();
    handleQuickPresetChange('my-settings');
  };

  return {
    handleGenerateTitles,
    handleResearch,
    toggleAllKeywords,
    toggleKeywordSelection,
    calculateSchedulePreview,
    handleSingleSubmit,
    handleBulkSubmit,
    handleQuickPresetChange,
    handleRefreshSettings,
  };
}
