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

import { 
  useWriteActionViewModel, 
  TOTAL_STEPS 
} from "../model/useWriteActionViewModel";

/* ──────────────────────────── Step 인디케이터 ──────────────────────────── */

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
  const {
    itemCount, step, setStep, articleType, setArticleType,
    personas, profile, selectedPersona, setSelectedPersona,
    personaName, setPersonaName, selectedTextModel, setSelectedTextModel, selectedImageModel, setSelectedImageModel,
    titleModel, setTitleModel, titleExamples, setTitleExamples, titleExclusions, setTitleExclusions,
    charLimit, setCharLimit, charLimitMode, setCharLimitMode,
    themeId, setThemeId, themes,
    customTitles, setCustomTitles, suggestedTitles, isGeneratingTitle, handleSuggestTitle,
    actionType, setActionType, scheduleDate, setScheduleDate, scheduleTime, setScheduleTime,
    articleTypeAvailability, publishPreview, handleConfirm, canGoNext
  } = useWriteActionViewModel({
    isOpen, selectedItems, defaultAction, onExecute
  });

  const articleTypeAvailabilityWithIcons = articleTypeAvailability.map(t => {
    let icon = <FileText className="w-5 h-5" />;
    if (t.id === 'compare') icon = <GitCompare className="w-5 h-5" />;
    if (t.id === 'curation') icon = <LayoutList className="w-5 h-5" />;
    return { ...t, icon };
  });

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
              articleTypeAvailability={articleTypeAvailabilityWithIcons}
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
