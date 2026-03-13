"use client";

import React from "react";
import { ChevronRight, ChevronLeft, Loader2, Sparkles, Package, PenTool } from "lucide-react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";

import {
  StepIndicator,
  TitleSelector,
  WritingSettingsForm,
  FinalConfirmation,
  ProductGrid,
} from "@/entities/keyword-writing";
import { ProductSearchSection } from "@/entities/keyword-writing/ui/ProductSearchSection";
import { RecommendedProductList } from "@/entities/keyword-writing/ui/RecommendedProductList";
import { SelectedProductList } from "@/shared/ui/SelectedProductList";
import { useKeywordWritingViewModel } from "@/features/keyword-writing/model/useKeywordWritingViewModel";
import { TitleFormatSettingsGroup } from "@/shared/ui/article-settings/TitleFormatSettingsGroup";

type ProductFirstWizardProps = {
  viewModel: ReturnType<typeof useKeywordWritingViewModel>;
  renderCartBar: (actionButton?: React.ReactNode) => React.ReactNode;
  defaultPlAll: any;
  defaultGoldbox: any;
  isDefaultLoading: boolean;
};

const STEP_LABELS_B = ["상품 검색", "상품 선택", "키워드/제목", "글 설정", "생성"];

export const ProductFirstWizard = ({
  viewModel,
  renderCartBar,
  defaultPlAll,
  defaultGoldbox,
  isDefaultLoading
}: ProductFirstWizardProps) => {
  const { state: s, actions: a, router } = viewModel;

  return (
    <>
      <StepIndicator labels={STEP_LABELS_B} current={s.stepB} />

      {/* Step B0: 상품 검색 */}
      {s.stepB === 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ProductSearchSection
            searchMode={s.searchMode}
            onSwitchSearchMode={(m) => {
              a.switchSearchMode(m);
              if (m === "keyword") a.setProductSearchTerm("");
              if (m === "link") a.setLinkValue("");
              if (m === "category") a.setCategoryValue("");
              if (m === "pl_brand") a.setPlBrandValue("");
            }}
            productSearchTerm={s.productSearchTerm}
            onSetProductSearchTerm={a.setProductSearchTerm}
            linkValue={s.linkValue}
            onSetLinkValue={a.setLinkValue}
            categoryValue={s.categoryValue}
            onSetCategoryValue={a.setCategoryValue}
            plBrandValue={s.plBrandValue}
            onSetPlBrandValue={a.setPlBrandValue}
            onSearch={a.searchProducts}
            isSearching={s.isSearchingCoupang}
            layout="large"
          />

          {renderCartBar(
            <Button onClick={() => a.setStepB(1)} disabled={s.selectedProductIds.size === 0} className="bg-blue-600 hover:bg-blue-500 text-white px-6">
              다음: 키워드/제목 추출 <ChevronRight className="w-4 h-4 ml-1" />
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
            <div className="pb-48">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs text-muted-foreground">{s.coupangResults.length}개 결과</span>
                {s.selectedProductIds.size > 0 && <span className="text-xs text-blue-400 font-bold">{s.selectedProductIds.size}개 선택됨</span>}
              </div>
              <ProductGrid products={s.coupangResults} selectedIds={s.selectedProductIds} onToggle={a.toggleProduct} />
            </div>
          )}
          
          {(!s.isSearchingCoupang && s.coupangResults.length === 0) && (
            <div className="space-y-8 mt-8 pb-48">
              {isDefaultLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  <RecommendedProductList
                    title="오늘의 골드박스 특가"
                    items={defaultGoldbox || []}
                    icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
                    selectedProductIds={s.selectedProductIds}
                    onToggleProduct={a.toggleProduct}
                  />
                  <RecommendedProductList
                    title="쿠팡 전문 브랜드 (PL) 인기상품"
                    items={defaultPlAll || []}
                    icon={<Package className="w-5 h-5 text-emerald-400" />}
                    selectedProductIds={s.selectedProductIds}
                    onToggleProduct={a.toggleProduct}
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step B1: 상품 확인 → 키워드/제목 추출 */}
      {s.stepB === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <SelectedProductList products={s.selectedProducts} className="bg-slate-900/40 backdrop-blur-md" />

          {/* 제목 자동화 설정 */}
          <TitleFormatSettingsGroup
            titleModel={s.titleModel}
            setTitleModel={a.setTitleModel}
            defaultTitleModel="gpt-4o-mini"
            titleExamples={s.titleExamples}
            setTitleExamples={a.setTitleExamples}
            titleExclusions={s.titleExclusions}
            setTitleExclusions={a.setTitleExclusions}
          />

          <Button
            onClick={() => {
              a.handleExtractFromProducts();
              a.setStepB(2);
            }}
            disabled={s.isExtractingKeywords}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold"
          >
            {s.isExtractingKeywords ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />AI가 키워드를 추출 중...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />AI 키워드 + 제목 자동 추출</>
            )}
          </Button>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => a.setStepB(0)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
          </div>
        </div>
      )}

      {/* Step B2: 키워드/제목 확인 */}
      {s.stepB === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg"><PenTool className="w-5 h-5 text-purple-400" /></div>
              <div>
                <h3 className="text-lg font-bold text-foreground">AI 추출 결과</h3>
                <p className="text-xs text-muted-foreground mt-0.5">추출된 키워드와 제목을 확인/수정하세요</p>
              </div>
            </div>
            {/* 추출된 키워드 */}
            <div className="mb-4">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">메인 키워드</label>
              <input
                type="text"
                className="w-full bg-background/50 border border-purple-500/30 rounded-lg px-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                value={s.keyword}
                onChange={(e) => a.setKeyword(e.target.value)}
              />
            </div>
          </GlassCard>
          
          {s.isExtractingKeywords ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground">AI가 키워드와 제목을 추출 중...</p>
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
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => a.setStepB(1)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
            <Button onClick={() => a.setStepB(3)} disabled={s.selectedTitleIdx === null && !s.editedTitle.trim()} className="bg-blue-600 hover:bg-blue-500 text-white px-6">
              다음: 글 설정 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step B3: 글 설정 */}
      {s.stepB === 3 && (
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
            publishTargets={s.publishTargets}
            setPublishTargets={a.setPublishTargets}
          />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => a.setStepB(2)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
            <Button onClick={() => a.setStepB(4)} className="bg-blue-600 hover:bg-blue-500 text-white px-6">
              다음: 최종 확인 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step B4: 최종 확인 + 생성 */}
      {s.stepB === 4 && (
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
            onPrev={() => a.setStepB(3)}
            router={router}
          />
        </div>
      )}
    </>
  );
};
