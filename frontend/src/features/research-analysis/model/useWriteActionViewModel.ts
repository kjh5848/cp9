import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { usePersonaViewModel } from "@/features/persona/model/usePersonaViewModel";
import { useUserSettingsViewModel } from "@/features/user-settings/model/useUserSettingsViewModel";
import { CoupangProductResponse } from "@/shared/types/api";
import { DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from "@/shared/config/model-options";
import { getCurationCharLimit } from "@/features/research-analysis/ui/steps/ArticleTypeSelectionStep";
import { WriteActionExecuteParams } from "@/features/research-analysis/ui/WriteActionModal";
import { PublishTarget } from "@/shared/ui/PublishTargetSection";

type ArticleType = "single" | "compare" | "curation";

export const FALLBACK_PERSONA_OPTIONS = [
  { id: "IT", label: "💻 IT/테크 전문가", desc: "스펙 비교표 · 벤치마크 · 호환성 분석" },
  { id: "LIVING", label: "🏠 살림/인테리어 고수", desc: "공간별 활용 · 유지관리 · 가성비 판정" },
  { id: "BEAUTY", label: "✨ 패션/뷰티 쇼퍼", desc: "트렌드 핏 · 실착 후기 · 스타일링 가이드" },
  { id: "HUNTER", label: "🔥 가성비/할인 헌터", desc: "가격 비교표 · 할인 분석 · 구매 긴박성 CTA" },
  { id: "MASTER_CURATOR_H", label: "마스터 큐레이터", desc: "렌탈 딥다이브 · 하이엔드 비교 · SEO 구조화" },
];

export const ARTICLE_TYPES: { id: ArticleType; label: string; desc: string; minItems: number; maxItems: number }[] = [
  { id: "single", label: "📄 개별 발행", desc: "아이템 1개당 독립 글 1편", minItems: 1, maxItems: 100 },
  { id: "compare", label: "⚔️ 비교 분석", desc: "선택한 아이템을 하나의 글에서 비교", minItems: 2, maxItems: 5 },
  { id: "curation", label: "📋 큐레이션", desc: "간략 소개형 리스트로 소개", minItems: 3, maxItems: 50 },
];

export const TOTAL_STEPS = 5;

interface UseWriteActionViewModelProps {
  isOpen: boolean;
  selectedItems: CoupangProductResponse[];
  defaultAction: "NOW" | "SCHEDULE";
  onExecute: (params: WriteActionExecuteParams) => void;
}

export function useWriteActionViewModel({ isOpen, selectedItems, defaultAction, onExecute }: UseWriteActionViewModelProps) {
  const itemCount = selectedItems.length;

  // ── Step 관리 ──
  const [step, setStep] = useState(0);

  // ── Step 1: 글 유형 ──
  const [articleType, setArticleType] = useState<ArticleType>("single");

  // ── Step 3: 설정(Settings) 로드 빛 페르소나 연동 ──
  const { personas, fetchPersonas } = usePersonaViewModel();
  const { profile, articleSettings, themeSettings } = useUserSettingsViewModel();

  useEffect(() => {
    if (isOpen) fetchPersonas();
  }, [isOpen, fetchPersonas]);

  const displayPersonas = personas.length > 0
    ? personas.map(p => ({
        id: p.id,
        label: p.name.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim(),
        desc: p.toneDescription.slice(0, 30) + '...'
      }))
    : FALLBACK_PERSONA_OPTIONS;

  const defaultPersonaId = themeSettings?.personaId || (displayPersonas[0]?.id || "IT");
  const [selectedPersona, setSelectedPersona] = useState(defaultPersonaId);
  const [personaName, setPersonaName] = useState(themeSettings?.personaName || profile?.name || "마스터 큐레이터 H");
  const [selectedTextModel, setSelectedTextModel] = useState(articleSettings?.defaultTextModel || DEFAULT_TEXT_MODEL);
  const [selectedImageModel, setSelectedImageModel] = useState(articleSettings?.defaultImageModel || DEFAULT_IMAGE_MODEL);
  const [titleModel, setTitleModel] = useState(articleSettings?.defaultTitleModel || DEFAULT_TEXT_MODEL);
  const [titleExamples, setTitleExamples] = useState("");
  const [titleExclusions, setTitleExclusions] = useState("");
  const [charLimit, setCharLimit] = useState(articleSettings?.presetWordCount || 2000);
  const [charLimitMode, setCharLimitMode] = useState(articleSettings?.presetWordCount ? "custom" : "2000");

  useEffect(() => {
    if (isOpen) {
      if (themeSettings?.personaId) setSelectedPersona(themeSettings.personaId);
      if (themeSettings?.personaName) {
        setPersonaName(themeSettings.personaName);
      } else if (profile?.name) {
        setPersonaName(profile.name);
      }
      if (articleSettings?.defaultTextModel) setSelectedTextModel(articleSettings.defaultTextModel);
      if (articleSettings?.defaultImageModel) setSelectedImageModel(articleSettings.defaultImageModel);
      if (articleSettings?.defaultTitleModel) setTitleModel(articleSettings.defaultTitleModel);
    }
  }, [isOpen, profile?.name, themeSettings?.personaId, themeSettings?.personaName, articleSettings?.defaultTextModel, articleSettings?.defaultImageModel, articleSettings?.defaultTitleModel]);

  useEffect(() => {
    if (displayPersonas.length > 0 && !displayPersonas.find(p => p.id === selectedPersona)) {
      setSelectedPersona(displayPersonas[0].id);
    }
  }, [displayPersonas, selectedPersona]);

  // ── 아티클 디자인 테마 ──
  const [themeId, setThemeId] = useState<string | null>(null);
  const [themes, setThemes] = useState<{ id: string; name: string; isDefault: boolean }[]>([]);

  const fetchThemes = useCallback(async () => {
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
        }
      }
    } catch { /* 조용히 실패 */ }
  }, [themeSettings?.themeId]);

  useEffect(() => { if (isOpen) fetchThemes(); }, [isOpen, fetchThemes]);

  // ── Step 4: 제목 설정 ──
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});
  const [suggestedTitles, setSuggestedTitles] = useState<Record<string, string[]>>({});
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (articleType === 'single') {
      const initial: Record<string, string> = {};
      selectedItems.forEach(item => {
        initial[item.productId.toString()] = `${item.productName} 리뷰`;
      });
      setCustomTitles(initial);
    } else if (articleType === 'compare') {
      const names = selectedItems.map((i) => i.productName.slice(0, 15));
      setCustomTitles({ main: names.join(" vs ") + " 비교 분석" });
    } else if (articleType === 'curation') {
      setCustomTitles({ main: `${new Date().getFullYear()}년 추천 TOP ${itemCount} 큐레이션` });
    }
  }, [articleType, selectedItems, itemCount]);

  const handleSuggestTitle = async (key: string, itemsForPrompt: CoupangProductResponse[]) => {
    try {
      setIsGeneratingTitle(prev => ({ ...prev, [key]: true }));
      const currentPersona = selectedPersona;
      const currentTextModel = selectedTextModel;

      const res = await fetch('/api/item-research/suggest-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleType,
          items: itemsForPrompt,
          persona: currentPersona,
          textModel: currentTextModel,
          titleModel,
          titleExamples,
          titleExclusions
        })
      });

      if (!res.ok) throw new Error('제목 생성 실패');

      const data = await res.json();
      if (data.titles && Array.isArray(data.titles)) {
        setSuggestedTitles(prev => ({ ...prev, [key]: data.titles }));
      }
    } catch (err) {
      console.error(err);
      alert('AI 제목 추천 목록을 불러오지 못했습니다.');
    } finally {
      setIsGeneratingTitle(prev => ({ ...prev, [key]: false }));
    }
  };

  const [actionType, setActionType] = useState<"NOW" | "SCHEDULE">(defaultAction);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  
  const DEFAULT_TARGETS: PublishTarget[] = [
    { platform: 'wordpress', enabled: false, meta: { categoryId: '' } },
    { platform: 'google', enabled: false, meta: { blogId: '' } },
    { platform: 'naver_cafe', enabled: false, meta: { clubId: '', menuId: '' } },
  ];
  const [publishTargets, setPublishTargets] = useState<PublishTarget[]>(DEFAULT_TARGETS);

  const articleTypeAvailability = useMemo(() => {
    return ARTICLE_TYPES.map((t) => ({
      ...t,
      enabled: itemCount >= t.minItems && itemCount <= t.maxItems,
      reason: itemCount < t.minItems
        ? `최소 ${t.minItems}개 필요`
        : itemCount > t.maxItems
          ? `최대 ${t.maxItems}개 초과`
          : "",
    }));
  }, [itemCount]);

  const autoSuggestedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (step === 3) {
      if (articleType === 'single') {
        selectedItems.forEach(item => {
          const key = item.productId.toString();
          if (!autoSuggestedKeys.current.has(key)) {
            autoSuggestedKeys.current.add(key);
            handleSuggestTitle(key, [item]);
          }
        });
      } else {
        const key = 'main';
        if (!autoSuggestedKeys.current.has(key)) {
          autoSuggestedKeys.current.add(key);
          handleSuggestTitle(key, selectedItems);
        }
      }
    }
  }, [step, articleType, selectedItems]);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      autoSuggestedKeys.current = new Set();
      const defaultType = articleTypeAvailability.find((t) => t.enabled);
      if (defaultType) setArticleType(defaultType.id as ArticleType);
    }
  }, [isOpen, articleTypeAvailability]);

  useEffect(() => {
    if (articleType === "compare") {
      setCharLimit(5000);
      setCharLimitMode("5000");
    } else if (articleType === "curation") {
      const autoLimit = getCurationCharLimit(itemCount);
      setCharLimit(autoLimit);
      setCharLimitMode("custom");
    } else if (articleSettings?.presetWordCount) {
      setCharLimit(articleSettings.presetWordCount);
      setCharLimitMode("custom");
    } else {
      setCharLimit(2000);
      setCharLimitMode("2000");
    }
  }, [articleType, itemCount, articleSettings?.presetWordCount]);

  const publishPreview = useMemo(() => {
    if (articleType === "single") {
      const costPerItem = 0.12;
      return {
        totalArticles: itemCount,
        estimatedMinutes: itemCount * 3,
        estimatedCost: (itemCount * costPerItem).toFixed(2),
        articles: selectedItems.slice(0, 5).map((item, i) => ({
          label: `📄 글 ${i + 1}`,
          title: `${item.productName} 완전 분석 리뷰`,
        })),
        hasMore: itemCount > 5,
      };
    } else if (articleType === "compare") {
      const names = selectedItems.map((i) => i.productName.slice(0, 15));
      return {
        totalArticles: 1,
        estimatedMinutes: 5,
        estimatedCost: "0.15",
        articles: [{ label: "⚔️ 글 1", title: names.join(" vs ") + " 비교 분석" }],
        hasMore: false,
      };
    } else {
      return {
        totalArticles: 1,
        estimatedMinutes: Math.ceil(itemCount * 0.3) + 3,
        estimatedCost: (0.08 + itemCount * 0.003).toFixed(2),
        articles: [{ label: "📋 글 1", title: `${new Date().getFullYear()}년 추천 TOP ${itemCount} 큐레이션` }],
        hasMore: false,
      };
    }
  }, [articleType, itemCount, selectedItems]);

  const handleConfirm = () => {
    const finalPersonaName = personaName.trim() || profile?.name || "마스터 큐레이터 H";
    const baseParams = {
      persona: selectedPersona,
      personaName: finalPersonaName,
      textModel: selectedTextModel,
      imageModel: selectedImageModel,
      charLimit,
      articleType,
      ...(themeId && { themeId }),
      customTitles,
      publishTargets,
    };

    if (actionType === "SCHEDULE") {
      if (!scheduleDate || !scheduleTime) {
        alert("예약 날짜와 시간을 선택해주세요.");
        return;
      }
      const dateObj = new Date(`${scheduleDate}T${scheduleTime}:00`);
      onExecute({ ...baseParams, actionType, scheduledAt: dateObj.toISOString() });
    } else {
      onExecute({ ...baseParams, actionType });
    }
  };

  const canGoNext = () => {
    if (step === 0) return articleTypeAvailability.some((t) => t.id === articleType && t.enabled);
    if (step === 4 && actionType === "SCHEDULE") return scheduleDate && scheduleTime;
    return true;
  };

  return {
    itemCount,
    step,
    setStep,
    articleType,
    setArticleType,
    personas,
    profile,
    selectedPersona,
    setSelectedPersona,
    personaName,
    setPersonaName,
    selectedTextModel,
    setSelectedTextModel,
    selectedImageModel,
    setSelectedImageModel,
    titleModel,
    setTitleModel,
    titleExamples,
    setTitleExamples,
    titleExclusions,
    setTitleExclusions,
    charLimit,
    setCharLimit,
    charLimitMode,
    setCharLimitMode,
    themeId,
    setThemeId,
    themes,
    customTitles,
    setCustomTitles,
    suggestedTitles,
    isGeneratingTitle,
    handleSuggestTitle,
    actionType,
    setActionType,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    publishTargets,
    setPublishTargets,
    articleTypeAvailability,
    publishPreview,
    handleConfirm,
    canGoNext
  };
}
