"use client";

import React from "react";
import { ChevronRight, ChevronLeft, Loader2, Sparkles, Edit3, Tag, Package, Lightbulb, PenTool } from "lucide-react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

import {
  StepIndicator,
  TitleSelector,
  WritingSettingsForm,
  FinalConfirmation,
  ProductGrid,
  CATEGORIES
} from "@/entities/keyword-writing";
import { ProductSearchSection } from "@/entities/keyword-writing/ui/ProductSearchSection";
import { useKeywordWritingViewModel } from "@/features/keyword-writing/model/useKeywordWritingViewModel";
import { TitleFormatSettingsGroup } from "@/shared/ui/article-settings/TitleFormatSettingsGroup";

type KeywordFirstWizardProps = {
  viewModel: ReturnType<typeof useKeywordWritingViewModel>;
  renderCartBar: (actionButton?: React.ReactNode) => React.ReactNode;
};

const STEP_LABELS_A = ["키워드 선정", "제목 선택", "상품 연결", "글 설정", "생성"];

export const KeywordFirstWizard = ({ viewModel, renderCartBar }: KeywordFirstWizardProps) => {
  const { state: s, actions: a, router } = viewModel;

  return (
    <>
      <StepIndicator labels={STEP_LABELS_A} current={s.stepA} />

      {/* Step A0: 키워드 입력 */}
      {s.stepA === 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* ① 직접 키워드 입력 */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-500/20 rounded-lg"><Edit3 className="w-5 h-5 text-blue-400" /></div>
              <div>
                <h3 className="text-lg font-bold text-foreground">직접 키워드 입력</h3>
                <p className="text-xs text-muted-foreground mt-0.5">글을 작성할 키워드를 직접 입력하세요</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="예: 로봇청소기 추천 2026, 신혼가전 패키지..."
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-[15px]"
                value={s.keyword}
                onChange={(e) => a.setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && s.keyword.trim()) {
                    a.setStepA(1);
                    if (s.titles.length === 0) a.handleGenerateTitles();
                  }
                }}
              />
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
            </div>
            {s.keyword.trim() && (
              <div className="flex justify-end mt-3">
                <Button
                  onClick={() => {
                    a.setStepA(1);
                    if (s.titles.length === 0) a.handleGenerateTitles();
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6"
                >
                  다음: 제목 생성 <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </GlassCard>

          {/* OR 구분선 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ② AI 키워드 추천 */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-purple-500/20 rounded-lg"><Sparkles className="w-5 h-5 text-purple-400" /></div>
              <div>
                <h3 className="text-lg font-bold text-foreground">AI 키워드 추천</h3>
                <p className="text-xs text-muted-foreground mt-0.5">관심 분야와 카테고리를 설정하면 AI가 고수익 키워드를 추천합니다</p>
              </div>
            </div>

            {/* 관심사 태그 */}
            <div className="mb-4">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">관심 분야</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="예: 게이밍, 신혼, 1인가구..."
                  value={s.interestInput}
                  onChange={(e) => a.setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      a.addInterest();
                    }
                  }}
                />
                <Button size="sm" variant="outline" onClick={a.addInterest} disabled={!s.interestInput.trim()} className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10 text-xs px-3">추가</Button>
              </div>
              {s.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {s.interests.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-purple-500/15 text-purple-400 text-xs px-2.5 py-1 rounded-full">
                      {tag}
                      <button onClick={() => a.removeInterest(tag)} className="hover:text-white transition-colors">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 카테고리 선택 */}
            <div className="mb-4">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => a.setCategory(cat.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                      s.category === cat.id ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-muted/50 text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI 추천 버튼 */}
            <Button
              onClick={a.handleSuggestKeywords}
              disabled={s.isLoadingKeywords}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold"
            >
              {s.isLoadingKeywords ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
              {s.isLoadingKeywords ? "AI가 키워드를 분석 중..." : s.previouslyRecommended.length > 0 ? "새로운 AI 키워드 추천 받기" : "AI 키워드 추천 받기"}
            </Button>
          </GlassCard>

          {/* 추천 결과 */}
          {s.suggestedKws.length > 0 && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-foreground">추천 키워드</h4>
                <span className="text-xs text-muted-foreground ml-auto">{s.suggestedKws.length}개 — 클릭하여 선택</span>
              </div>
              <div className="space-y-2">
                {s.suggestedKws.map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => a.setKeyword(kw.keyword)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all duration-200",
                      s.keyword === kw.keyword ? "border-blue-500/40 bg-blue-500/10" : "border-border/50 bg-background/30 hover:border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{kw.keyword}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        kw.estimatedVolume === "높음" ? "bg-emerald-500/15 text-emerald-400"
                        : kw.estimatedVolume === "중간" ? "bg-amber-500/15 text-amber-400"
                        : "bg-gray-500/15 text-gray-400"
                      )}>
                        검색량 {kw.estimatedVolume}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{kw.reason}</p>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {/* 제목 자동화 설정 */}
          {(s.keyword.trim() || s.suggestedKws.length > 0) && (
            <TitleFormatSettingsGroup
              titleModel={s.titleModel}
              setTitleModel={a.setTitleModel}
              defaultTitleModel="gpt-4o-mini"
              titleExamples={s.titleExamples}
              setTitleExamples={a.setTitleExamples}
              titleExclusions={s.titleExclusions}
              setTitleExclusions={a.setTitleExclusions}
            />
          )}

          {/* 다음 버튼 (키워드 선택 후) */}
          {(s.keyword.trim() && s.suggestedKws.length > 0) && (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  a.setStepA(1);
                  if (s.titles.length === 0) a.handleGenerateTitles();
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6"
              >
                다음: 제목 생성 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step A1: 제목 선택 */}
      {s.stepA === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg"><PenTool className="w-5 h-5 text-purple-400" /></div>
              <div>
                <h3 className="text-lg font-bold text-foreground">제목 선택</h3>
                <p className="text-xs text-muted-foreground mt-0.5">"<span className="text-blue-400">{s.keyword}</span>" 키워드에 최적화된 제목 선택</p>
              </div>
            </div>
          </GlassCard>
          {s.isLoadingTitles ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground">AI가 제목을 생성 중...</p>
            </div>
          ) : s.titles.length > 0 ? (
            <TitleSelector
              titles={s.titles}
              selectedIdx={s.selectedTitleIdx}
              onSelect={a.handleSelectTitle}
              editedTitle={s.editedTitle}
              isEditing={s.isEditingTitle}
              onEditToggle={() => a.setIsEditingTitle(!s.isEditingTitle)}
              onEditChange={a.setEditedTitle}
            />
          ) : null}
          <Button onClick={a.handleGenerateTitles} disabled={s.isLoadingTitles} variant="outline" size="sm" className="text-xs border-dashed"><Sparkles className="w-3 h-3 mr-1" />다른 제목 생성</Button>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => a.setStepA(0)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
            <Button
              onClick={() => {
                a.setStepA(2);
                a.setCoupangSearchTerm(s.keyword);
                a.searchCoupang(s.keyword);
              }}
              disabled={s.selectedTitleIdx === null && !s.editedTitle.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6"
            >
              다음: 상품 연결 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step A2: 쿠팡 상품 연결 */}
      {s.stepA === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ProductSearchSection
            searchMode={s.searchMode}
            onSwitchSearchMode={a.switchSearchMode}
            productSearchTerm={s.coupangSearchTerm}
            onSetProductSearchTerm={a.setCoupangSearchTerm}
            linkValue={s.linkValue}
            onSetLinkValue={a.setLinkValue}
            categoryValue={s.categoryValue}
            onSetCategoryValue={a.setCategoryValue}
            plBrandValue={s.plBrandValue}
            onSetPlBrandValue={a.setPlBrandValue}
            onSearch={a.searchProducts}
            isSearching={s.isSearchingCoupang}
            layout="compact"
          />

          {renderCartBar(
            <Button onClick={() => a.setStepA(3)} className="bg-blue-600 hover:bg-blue-500 text-white px-6">
              다음: 글 설정 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {s.deepLinkResult && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-400 whitespace-pre-line">{s.deepLinkResult}</div>
          )}
          {s.isSearchingCoupang && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-sm text-muted-foreground">쿠팡 검색 중...</p>
            </div>
          )}
          {(!s.isSearchingCoupang && s.coupangResults.length > 0) && (
            <ProductGrid products={s.coupangResults} selectedIds={s.selectedProductIds} onToggle={a.toggleProduct} />
          )}
          {(!s.isSearchingCoupang && s.coupangResults.length === 0 && !s.deepLinkResult) && (
            <div className="text-center py-10">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">검색 결과 없음. 검색 조건을 수정해보세요.</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-8">
            <Button variant="ghost" onClick={() => a.setStepA(1)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
            {s.selectedProductIds.size === 0 && (
              <Button onClick={() => a.setStepA(3)} variant="ghost" className="text-muted-foreground text-sm">
                건너뛰기 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step A3: 글 설정 */}
      {s.stepA === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <WritingSettingsForm
            persona={s.persona}
            setPersona={a.setPersona}
            articleType={s.articleType}
            setArticleType={a.setArticleType}
            textModel={s.textModel}
            setTextModel={a.setTextModel}
            imageModel={s.imageModel}
            setImageModel={a.setImageModel}
            charLimit={s.charLimit}
            setCharLimit={a.setCharLimit}
            themeId={s.themeId}
            setThemeId={a.setThemeId}
            itemCount={s.selectedProducts.length}
          />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => a.setStepA(2)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
            <Button onClick={() => a.setStepA(4)} className="bg-blue-600 hover:bg-blue-500 text-white px-6">다음: 최종 확인 <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {/* Step A4: 최종 확인 + 생성 */}
      {s.stepA === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <FinalConfirmation
            keyword={s.keyword}
            editedTitle={s.editedTitle}
            selectedProducts={s.selectedProducts}
            persona={s.persona}
            articleType={s.articleType}
            textModel={s.textModel}
            imageModel={s.imageModel}
            charLimit={s.charLimit}
            isGenerating={s.isGenerating}
            generationResult={s.generationResult}
            onGenerate={a.handleGenerate}
            onPrev={() => a.setStepA(3)}
            router={router}
          />
        </div>
      )}
    </>
  );
};
