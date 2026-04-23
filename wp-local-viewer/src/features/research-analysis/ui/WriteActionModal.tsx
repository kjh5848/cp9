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
  publishTargets?: PublishTarget[];
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
import { PublishTarget } from "@/shared/ui/PublishTargetSection";
import { Switch } from "@/shared/ui/switch";

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
    publishTargets, setPublishTargets,
    articleTypeAvailability, publishPreview, handleConfirm, canGoNext,
    isQuickPublish, setIsQuickPublish, handleNext, handlePrev
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
      <DialogContent className="sm:max-w-[1100px] xl:max-w-[1200px] bg-gray-900 border-gray-800 text-slate-200 max-h-[85vh] overflow-hidden p-0 flex flex-col">
        <div className="px-6 pt-6 shrink-0 flex items-start justify-between">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-3xl font-bold text-white mb-2">포스팅 생성 설정</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              <span className="text-blue-400 font-semibold">[{title}]</span> — {itemCount}개 상품 선택됨
            </DialogDescription>
          </DialogHeader>

          {/* 마이페이지 설정으로 빠른 발행 토글/이동 영역 */}
          {step === 0 && (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 px-4 py-2.5 rounded-xl">
                
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-200">마이페이지 설정으로 빠른 발행</span>
                  <span className="text-xs text-slate-400">페르소나, 테마 설정 과정을 모두 건너뜁니다.</span>
                </div>
                <Switch
                  checked={isQuickPublish}
                  onCheckedChange={setIsQuickPublish}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              <Link href="/settings" target="_blank" className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                기본 설정 변경하러 가기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        <div className="px-6 shrink-0 mt-2">
          <StepIndicator current={step} total={TOTAL_STEPS} />
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[420px] mt-1">
          {/* 왼쪽 단: 상품 목록 */}
          <div className="md:col-span-4 lg:col-span-3 border-r border-slate-800 pr-4 flex flex-col max-h-[500px]">
            <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              선택된 상품
            </h4>
            <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full">
              <SelectedProductList products={selectedItems} className="mb-2" />
            </div>
          </div>

          {/* 오른쪽 단: 셋팅 영역 */}
          <div className="md:col-span-8 lg:col-span-9 py-1 space-y-6 flex flex-col">
          {/* ════════ Step 0: 글 유형 선택 ════════ */}
          {step === 0 && (
            <ArticleTypeSelectionStep
              articleType={articleType}
              setArticleType={(v) => setArticleType(v as ArticleType)}
              articleTypeAvailability={articleTypeAvailabilityWithIcons}
              itemCount={itemCount}
            />
          )}

          {/* ════════ Step 1: 페르소나 & AI 모델 ════════ */}
          {step === 1 && (
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
                themes={themes as import('@/entities/design/ui/ThemeSwitcher').ThemeSwitcherTheme[]}
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

          {/* ════════ Step 2: 제목 설정 ════════ */}
          {step === 2 && (
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

          {/* ════════ Step 3: 발행 방식 & 주기 ════════ */}
          {step === 3 && (
            <PublishActionStep
              isQuickPublish={isQuickPublish}
              actionType={actionType}
              setActionType={setActionType}
              scheduleDate={scheduleDate}
              setScheduleDate={setScheduleDate}
              scheduleTime={scheduleTime}
              setScheduleTime={setScheduleTime}
              publishPreview={publishPreview}
              publishTargets={publishTargets}
              setPublishTargets={setPublishTargets}
            />
          )}
          </div>
        </div>
        </div> {/* 본문 스크롤 영역 종료 */}

        {/* ════════ 하단 네비게이션 ════════ */}
        <div className="shrink-0 px-6 pb-6 pt-4 border-t border-slate-800 bg-gray-900 mt-auto">
          <DialogFooter className="flex w-full items-center justify-between sm:justify-between">
            <div>
            {step > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
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
                onClick={handleNext}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
