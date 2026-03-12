"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Calendar, Clock, PenTool, CalendarPlus,
  FileText, GitCompare, LayoutList, ChevronLeft, ChevronRight, Check, Info,
  Palette, Package, Loader2
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import { CoupangProductResponse } from "@/shared/types/api";
import {
  TEXT_MODEL_OPTIONS, IMAGE_MODEL_OPTIONS,
  DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL,
  getTextModelGroups,
} from "@/shared/config/model-options";
import { usePersonaViewModel } from "@/features/persona/model/usePersonaViewModel";
import { SharedArticleSettings } from "@/shared/ui/SharedArticleSettings";
import { SelectedProductList } from "@/shared/ui/SelectedProductList";
import { useUserSettingsViewModel } from "@/features/user-settings/model/useUserSettingsViewModel";
import { TitleSettingsStep } from "./steps/TitleSettingsStep";
import { PublishActionStep } from "./steps/PublishActionStep";
import { 
  ArticleTypeSelectionStep, 
  ArticleTypeOptionWithStatus, 
  getCurationCharLimit 
} from "./steps/ArticleTypeSelectionStep";

/* ──────────────────────────── 타입 정의 ──────────────────────────── */

type ArticleType = "single" | "compare" | "curation";

export interface WriteActionExecuteParams {
  persona: string;
  personaName: string;
  textModel: string;
  imageModel: string;
  actionType: "NOW" | "SCHEDULE";
  scheduledAt?: string;
  charLimit?: number;
  articleType: ArticleType;
  themeId?: string;
  customTitles?: Record<string, string>;
}

interface WriteActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** 선택된 상품 목록 — 글 유형 제한/미리보기에 사용 */
  selectedItems?: CoupangProductResponse[];
  defaultAction?: "NOW" | "SCHEDULE";
  onExecute: (params: WriteActionExecuteParams) => void;
}

/* ──────────────────────────── 상수 ──────────────────────────── */

const FALLBACK_PERSONA_OPTIONS = [
  { id: "IT", label: "💻 IT/테크 전문가", desc: "스펙 비교표 · 벤치마크 · 호환성 분석" },
  { id: "LIVING", label: "🏠 살림/인테리어 고수", desc: "공간별 활용 · 유지관리 · 가성비 판정" },
  { id: "BEAUTY", label: "✨ 패션/뷰티 쇼퍼", desc: "트렌드 핏 · 실착 후기 · 스타일링 가이드" },
  { id: "HUNTER", label: "🔥 가성비/할인 헌터", desc: "가격 비교표 · 할인 분석 · 구매 긴박성 CTA" },
  { id: "MASTER_CURATOR_H", label: "마스터 큐레이터", desc: "렌탈 딥다이브 · 하이엔드 비교 · SEO 구조화" },
];

const CHAR_LIMIT_PRESETS = [
  { value: "2000", label: "2,000자", desc: "간결 요약" },
  { value: "5000", label: "5,000자", desc: "표준 리뷰" },
  { value: "8000", label: "8,000자", desc: "심층 분석" },
  { value: "10000", label: "10,000자", desc: "하이엔드 딥다이브" },
  { value: "custom", label: "직접 입력", desc: "원하는 글자수" },
];

// Curation guides are imported from steps/ArticleTypeSelectionStep.tsx

/* ──────────────────────────── 글 유형 정의 ──────────────────────────── */

interface ArticleTypeOption {
  id: ArticleType;
  icon: React.ReactNode;
  label: string;
  desc: string;
  minItems: number;
  maxItems: number;
}

const ARTICLE_TYPES: ArticleTypeOption[] = [
  { id: "single", icon: <FileText className="w-5 h-5" />, label: "📄 개별 발행", desc: "아이템 1개당 독립 글 1편", minItems: 1, maxItems: 100 },
  { id: "compare", icon: <GitCompare className="w-5 h-5" />, label: "⚔️ 비교 분석", desc: "선택한 아이템을 하나의 글에서 비교", minItems: 2, maxItems: 5 },
  { id: "curation", icon: <LayoutList className="w-5 h-5" />, label: "📋 큐레이션", desc: "간략 소개형 리스트로 소개", minItems: 3, maxItems: 50 },
];

/* ──────────────────────────── Step 인디케이터 ──────────────────────────── */

const STEP_LABELS = ["글 유형", "발행 예시", "페르소나 & 모델", "제목 설정", "발행 방식"];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div className={cn(
            "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all",
            i < current ? "bg-blue-600 text-white" :
            i === current ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900" :
            "bg-slate-800 text-slate-500"
          )}>
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={cn(
              "flex-1 h-0.5 rounded-full transition-all",
              i < current ? "bg-blue-600" : "bg-slate-800"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ──────────────────────────── 메인 컴포넌트 ──────────────────────────── */

export const WriteActionModal = ({
  isOpen, onClose, title, selectedItems = [], defaultAction = "NOW", onExecute,
}: WriteActionModalProps) => {
  const itemCount = selectedItems.length;

  // ── Step 관리 ──
  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 5;

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

  // DB 연동된 초기값 할당
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
    // 모달이 열릴 때(또는 설정이 로드될 때) 마이페이지 설정을 최우선 반영하여 초기화
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      // 사용자 설정(themeSettings)에 themeId가 있으면 최우선으로 적용, 없으면 default 지정된 테마 사용
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
  // single: productId -> title, compare/curation: 'main' -> title
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});
  const [suggestedTitles, setSuggestedTitles] = useState<Record<string, string[]>>({});
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<Record<string, boolean>>({});

  // ── 초기 제목 설정 ──
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleType, selectedItems]);

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

  // ── Step 5: 발행 방식 ──
  const [actionType, setActionType] = useState<"NOW" | "SCHEDULE">(defaultAction);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // ── 유형별 활성/비활성 판단 ──
  const articleTypeAvailability = useMemo<ArticleTypeOptionWithStatus[]>(() => {
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

  const autoSuggestedKeys = React.useRef<Set<string>>(new Set());

  // Step 3(제목 설정) 진입 시 자동 AI 추천 트리거
  React.useEffect(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, articleType, selectedItems]);

  // 모달 열릴 때 스텝 초기화
  React.useEffect(() => {
    if (isOpen) {
      setStep(0);
      autoSuggestedKeys.current = new Set();
      // 유효한 기본 타입 설정
      const defaultType = articleTypeAvailability.find((t) => t.enabled);
      if (defaultType) setArticleType(defaultType.id);
    }
  }, [isOpen, articleTypeAvailability]);

  // 글 유형에 따라 기본 글자수 설정
  React.useEffect(() => {
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

  // ── 발행 예시 계산 ──
  const publishPreview = useMemo(() => {
    if (articleType === "single") {
      const costPerItem = 0.12; // GPT + 이미지 예상
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

  // ── 제출 ──
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

  /* ════════════════════ 렌더링 ════════════════════ */

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] bg-gray-900 border-gray-800 text-slate-200 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">포스팅 생성 설정</DialogTitle>
          <DialogDescription className="text-slate-400">
            [{title}] — {itemCount}개 상품 선택됨
          </DialogDescription>
        </DialogHeader>

        <StepIndicator current={step} total={TOTAL_STEPS} />

        <SelectedProductList products={selectedItems} className="mb-2" />

        <div className="py-2 space-y-5 min-h-[280px]">
          {/* ════════ Step 1: 글 유형 선택 ════════ */}
          {step === 0 && (
            <ArticleTypeSelectionStep
              articleType={articleType}
              setArticleType={(v) => setArticleType(v as ArticleType)}
              articleTypeAvailability={articleTypeAvailability}
              itemCount={itemCount}
            />
          )}

          {/* ════════ Step 2: 발행 예시 미리보기 ════════ */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-300">발행 예시 미리보기</h4>
              <div className="space-y-2">
                {publishPreview.articles.map((article, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                    <span className="text-sm font-mono text-blue-400 whitespace-nowrap">{article.label}</span>
                    <span className="text-sm text-slate-300 truncate">{article.title}</span>
                  </div>
                ))}
                {publishPreview.hasMore && (
                  <p className="text-xs text-slate-500 text-center py-1">
                    ... 외 {itemCount - 5}개
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{publishPreview.totalArticles}편</p>
                  <p className="text-[10px] text-slate-500">생성 예정</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">~{publishPreview.estimatedMinutes}분</p>
                  <p className="text-[10px] text-slate-500">예상 소요</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">~${publishPreview.estimatedCost}</p>
                  <p className="text-[10px] text-slate-500">예상 비용</p>
                </div>
              </div>
            </div>
          )}

          {/* ════════ Step 3: 페르소나 & AI 모델 ════════ */}
          {step === 2 && (
            <div className="space-y-5">
              
              <SharedArticleSettings
                personas={personas}
                articleType={articleType} setArticleType={(v) => setArticleType(v as any)}
                hideArticleType={true}
                hideTone={true}
                persona={selectedPersona} setPersona={setSelectedPersona}
                personaName={personaName} setPersonaName={setPersonaName}
                textModel={selectedTextModel} setTextModel={setSelectedTextModel}
                imageModel={selectedImageModel} setImageModel={setSelectedImageModel}
                charLimit={charLimit} setCharLimit={(v) => setCharLimit(Number(v))}
                charLimitMode={charLimitMode} setCharLimitMode={setCharLimitMode}
                itemCount={itemCount}
                themeId={themeId} setThemeId={setThemeId}
                hideTheme={true}
              />

              {/* 아티클 디자인 테마 */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-blue-400" />
                    아티클 디자인
                  </h4>
                  <Link href="/design" target="_blank" className="text-[11px] text-blue-400 hover:text-blue-300 underline">
                    디자인 설정 →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemeId(theme.id)}
                      className={cn(
                        "p-2.5 rounded-lg border text-left transition-all duration-200 cursor-pointer",
                        themeId === theme.id
                          ? "bg-blue-600/20 border-blue-500 text-blue-100"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500",
                      )}
                    >
                      <span className="text-xs font-medium">{theme.name}</span>
                      {theme.isDefault && (
                        <span className="ml-1 text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">기본</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ Step 4: 제목 설정 ════════ */}
          {step === 3 && (
            <TitleSettingsStep
              articleType={articleType}
              selectedItems={selectedItems}
              itemCount={itemCount}
              personaName={personaName || profile?.name || "마스터 큐레이터 H"}
              customTitles={customTitles}
              setCustomTitles={setCustomTitles}
              suggestedTitles={suggestedTitles}
              isGeneratingTitle={isGeneratingTitle}
              handleSuggestTitle={handleSuggestTitle}
              titleModel={titleModel}
              setTitleModel={setTitleModel}
              titleExamples={titleExamples}
              setTitleExamples={setTitleExamples}
              titleExclusions={titleExclusions}
              setTitleExclusions={setTitleExclusions}
            />
          )}

          {/* ════════ Step 5: 발행 방식 & 주기 ════════ */}
          {step === 4 && (
            <PublishActionStep
              actionType={actionType}
              setActionType={setActionType}
              scheduleDate={scheduleDate}
              setScheduleDate={setScheduleDate}
              scheduleTime={scheduleTime}
              setScheduleTime={setScheduleTime}
              publishPreview={publishPreview}
            />
          )}
        </div>

        {/* ════════ 하단 네비게이션 ════════ */}
        <DialogFooter className="mt-2 border-t border-slate-800 pt-4 flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              취소
            </Button>
            {step < TOTAL_STEPS - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canGoNext()}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={handleConfirm}
                disabled={!canGoNext()}
              >
                {actionType === "NOW" ? "지금 글쓰기 시작" : "스케줄 보드에 등록"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
