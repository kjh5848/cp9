/**
 * [Widgets/KeywordWriting] 키워드 글쓰기 위젯
 * ViewModel(Features)과 Entity UI 컴포넌트를 조합하는 얇은 껍데기 위젯입니다.
 * 비즈니스 로직은 useKeywordWritingViewModel에, 순수 UI는 entities에 위임합니다.
 */
"use client";

import React from "react";
import Image from "next/image";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import {
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Lightbulb,
  PenTool,
  Edit3,
  Tag,
  Package,
  ShoppingCart,
  FileText,
  SkipForward,
  Link as LinkIcon,
  Layers,
  ChevronDown,
  X,
  Trash2 } from
"lucide-react";
import { cn } from "@/shared/lib/utils";

// Entities — 순수 UI + 상수
import {
  StepIndicator,
  ProductGrid,
  TitleSelector,
  WritingSettingsForm,
  FinalConfirmation,
  CATEGORIES } from
"@/entities/keyword-writing";

// Features — ViewModel
import { useKeywordWritingViewModel } from "@/features/keyword-writing";

// 쿠팡 검색 관련 상수
import {
  COUPANG_CATEGORIES,
  COUPANG_PL_BRANDS,
  SEARCH_MODE_LABELS,
  type CoupangSearchMode } from
"@/shared/constants/coupang-constants";

import { SelectedProductList } from "@/shared/ui/SelectedProductList";

/* ──────────────────────────── 스텝 라벨 ──────────────────────────── */
const STEP_LABELS_A = ["키워드 선정", "제목 선택", "상품 연결", "글 설정", "생성"];
const STEP_LABELS_B = ["상품 검색", "상품 선택", "키워드/제목", "글 설정", "생성"];

/* ──────────────────────────── 메인 위젯 ──────────────────────────── */
export const KeywordWriting = () => {
  const { router, state: s, actions: a } = useKeywordWritingViewModel();

  const renderCartBar = () => {
    if (s.selectedProducts.length === 0) return null;
    return (
      <div className="sticky bottom-6 z-20 w-full animate-in slide-in-from-bottom-5">
        <SelectedProductList
          products={s.selectedProducts}
          onRemove={a.removeSelectedProduct}
          onClearAll={s.selectedProducts.length > 0 ? a.clearSelectedProducts : undefined}
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-4">

      {/* ── 모드 선택 탭 ── */}
      <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-fit mx-auto gap-1">
        <button
          onClick={() => a.switchMode("keyword_first")}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            s.mode === "keyword_first" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
          )}>
          
          <FileText className="w-4 h-4" /> 키워드 먼저
        </button>
        <button
          onClick={() => a.switchMode("product_first")}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            s.mode === "product_first" ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
          )}>
          
          <ShoppingCart className="w-4 h-4" /> 상품 먼저
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          모드 A: 키워드 먼저
        ═══════════════════════════════════════════════════════ */}
      {s.mode === "keyword_first" ?
      <>
          <StepIndicator labels={STEP_LABELS_A} current={s.stepA} />

          {/* Step A0: 키워드 입력 */}
          {s.stepA === 0 ?
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
                  <input id="keyword-input" type="text" placeholder="예: 로봇청소기 추천 2026, 신혼가전 패키지..." className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-[15px]" value={s.keyword} onChange={(e) => a.setKeyword(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter" ? s.keyword.trim() : null) {a.setStepA(1);if (s.titles.length === 0) a.handleGenerateTitles();}}} />
                  <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                </div>
                {s.keyword.trim() ?
            <div className="flex justify-end mt-3">
                    <Button onClick={() => {a.setStepA(1);if (s.titles.length === 0) a.handleGenerateTitles();}} className="bg-blue-600 hover:bg-blue-500 text-white px-6">다음: 제목 생성 <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div> : null
            }
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
                    <input type="text" className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="예: 게이밍, 신혼, 1인가구..." value={s.interestInput} onChange={(e) => a.setInterestInput(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter' ? !e.nativeEvent.isComposing : null) {e.preventDefault();a.addInterest();}}} />
                    <Button size="sm" variant="outline" onClick={a.addInterest} disabled={!s.interestInput.trim()} className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10 text-xs px-3">추가</Button>
                  </div>
                  {s.interests.length > 0 ?
              <div className="flex flex-wrap gap-1.5">
                      {s.interests.map((tag) =>
                <span key={tag} className="inline-flex items-center gap-1 bg-purple-500/15 text-purple-400 text-xs px-2.5 py-1 rounded-full">
                          {tag}
                          <button onClick={() => a.removeInterest(tag)} className="hover:text-white transition-colors">&times;</button>
                        </span>
                )}
                    </div> : null
              }
                </div>

                {/* 카테고리 선택 */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">카테고리</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) =>
                <button key={cat.id} onClick={() => a.setCategory(cat.id)} className={cn("px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200", s.category === cat.id ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-muted/50 text-muted-foreground border border-border hover:bg-muted hover:text-foreground")}>{cat.icon} {cat.label}</button>
                )}
                  </div>
                </div>

                {/* AI 추천 버튼 */}
                <Button onClick={a.handleSuggestKeywords} disabled={s.isLoadingKeywords} className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold">
                  {s.isLoadingKeywords ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                  {s.isLoadingKeywords ? "AI가 키워드를 분석 중..." : s.previouslyRecommended.length > 0 ? "새로운 AI 키워드 추천 받기" : "AI 키워드 추천 받기"}
                </Button>
              </GlassCard>

              {/* 추천 결과 */}
              {s.suggestedKws.length > 0 ?
          <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-4"><Tag className="w-4 h-4 text-amber-400" /><h4 className="text-sm font-bold text-foreground">추천 키워드</h4><span className="text-xs text-muted-foreground ml-auto">{s.suggestedKws.length}개 — 클릭하여 선택</span></div>
                  <div className="space-y-2">
                    {s.suggestedKws.map((kw, idx) =>
              <button key={idx} onClick={() => a.setKeyword(kw.keyword)} className={cn("w-full text-left p-3 rounded-lg border transition-all duration-200", s.keyword === kw.keyword ? "border-blue-500/40 bg-blue-500/10" : "border-border/50 bg-background/30 hover:border-border hover:bg-muted/50")}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{kw.keyword}</span>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", kw.estimatedVolume === "높음" ? "bg-emerald-500/15 text-emerald-400" : kw.estimatedVolume === "중간" ? "bg-amber-500/15 text-amber-400" : "bg-gray-500/15 text-gray-400")}>검색량 {kw.estimatedVolume}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{kw.reason}</p>
                      </button>
              )}
                  </div>
                </GlassCard> : null
          }
              {/* 다음 버튼 (키워드 선택 후) */}
              {(s.keyword.trim() ? s.suggestedKws.length > 0 : null) ?
          <div className="flex justify-end">
                  <Button onClick={() => {a.setStepA(1);if (s.titles.length === 0) a.handleGenerateTitles();}} className="bg-blue-600 hover:bg-blue-500 text-white px-6">다음: 제목 생성 <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div> : null
          }
            </div> : null
        }

          {/* Step A1: 제목 선택 */}
          {s.stepA === 1 ?
        <div className="space-y-6 animate-in fade-in duration-300">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-purple-500/20 rounded-lg"><PenTool className="w-5 h-5 text-purple-400" /></div>
                  <div><h3 className="text-lg font-bold text-foreground">제목 선택</h3><p className="text-xs text-muted-foreground mt-0.5">"<span className="text-blue-400">{s.keyword}</span>" 키워드에 최적화된 제목 선택</p></div>
                </div>
              </GlassCard>
              {s.isLoadingTitles ?
          <div className="flex flex-col items-center py-16 gap-3"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /><p className="text-sm text-muted-foreground">AI가 제목을 생성 중...</p></div> :
          s.titles.length > 0 ?
          <TitleSelector titles={s.titles} selectedIdx={s.selectedTitleIdx} onSelect={a.handleSelectTitle} editedTitle={s.editedTitle} isEditing={s.isEditingTitle} onEditToggle={() => a.setIsEditingTitle(!s.isEditingTitle)} onEditChange={a.setEditedTitle} /> :
          null}
              <Button onClick={a.handleGenerateTitles} disabled={s.isLoadingTitles} variant="outline" size="sm" className="text-xs border-dashed"><Sparkles className="w-3 h-3 mr-1" />다른 제목 생성</Button>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => a.setStepA(0)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
                <Button onClick={() => {a.setStepA(2);a.setCoupangSearchTerm(s.keyword);a.searchCoupang(s.keyword);}} disabled={s.selectedTitleIdx === null && !s.editedTitle.trim()} className="bg-blue-600 hover:bg-blue-500 text-white px-6">다음: 상품 연결 <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div> : null
        }

          {/* Step A2: 쿠팡 상품 연결 (선택사항) — 4탭 검색 모드 */}
          {s.stepA === 2 ?
        <div className="space-y-6 animate-in fade-in duration-300">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-orange-500/20 rounded-lg"><ShoppingCart className="w-5 h-5 text-orange-400" /></div>
                  <div className="flex-1"><h3 className="text-lg font-bold text-foreground">쿠팡 상품 연결 <span className="text-xs text-muted-foreground font-normal ml-1">(선택사항)</span></h3><p className="text-xs text-muted-foreground mt-0.5">상품을 선택하면 CTA 링크가 자동 삽입됩니다</p></div>
                  {s.selectedProductIds.size > 0 ? <div className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full">{s.selectedProductIds.size}개 선택</div> : null}
                </div>

                {/* 검색 모드 탭 */}
                <div className="flex flex-wrap gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-4">
                  {(["keyword", "link", "category", "pl_brand"] as CoupangSearchMode[]).map((m) =>
              <button key={m} onClick={() => a.switchSearchMode(m)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap", s.searchMode === m ? "bg-orange-600 text-white shadow" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
                      {SEARCH_MODE_LABELS[m]}
                    </button>
              )}
                </div>

                {/* 모드별 입력 UI */}
                {s.searchMode === "keyword" ?
            <div className="flex gap-2">
                    <input type="text" className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="쿠팡 검색 키워드" value={s.coupangSearchTerm} onChange={(e) => a.setCoupangSearchTerm(e.target.value)} onKeyDown={(e) => e.key === "Enter" ? a.searchProducts("keyword", s.coupangSearchTerm) : null} />
                    <Button size="sm" onClick={() => a.searchProducts("keyword", s.coupangSearchTerm)} disabled={s.isSearchingCoupang || !s.coupangSearchTerm.trim()}><Search className="w-4 h-4 mr-1" />검색</Button>
                  </div> : null
            }
                {s.searchMode === "link" ?
            <div className="space-y-2">
                    <textarea className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 h-24 resize-none" placeholder="쿠팡 상품 URL을 입력하세요 (여러 줄 가능)" value={s.linkValue} onChange={(e) => a.setLinkValue(e.target.value)} />
                    <Button size="sm" onClick={() => a.searchProducts("link", s.linkValue)} disabled={s.isSearchingCoupang || !s.linkValue.trim()} className="w-full"><LinkIcon className="w-4 h-4 mr-1" />딥링크 변환</Button>
                  </div> : null
            }
                {s.searchMode === "category" ?
            <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select value={s.categoryValue} onChange={(e) => a.setCategoryValue(e.target.value)} className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none cursor-pointer">
                        <option value="" disabled>카테고리를 선택하세요</option>
                        {COUPANG_CATEGORIES.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <Button size="sm" onClick={() => a.searchProducts("category", s.categoryValue)} disabled={s.isSearchingCoupang || !s.categoryValue}><Layers className="w-4 h-4 mr-1" />검색</Button>
                  </div> : null
            }
                {s.searchMode === "pl_brand" ?
            <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select value={s.plBrandValue} onChange={(e) => a.setPlBrandValue(e.target.value)} className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none cursor-pointer">
                        <option value="" disabled>PL 브랜드를 선택하세요</option>
                        {COUPANG_PL_BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <Button size="sm" onClick={() => a.searchProducts("pl_brand", s.plBrandValue)} disabled={s.isSearchingCoupang || !s.plBrandValue}><Layers className="w-4 h-4 mr-1" />검색</Button>
                  </div> : null
            }
              </GlassCard>

              {/* 선택된 상품 장바구니 바 */}
              {renderCartBar()}

              {/* 딥링크 변환 결과 */}
              {s.deepLinkResult ?
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-400 whitespace-pre-line">{s.deepLinkResult}</div> : null
          }
              {s.isSearchingCoupang ? <div className="flex flex-col items-center py-12 gap-3"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /><p className="text-sm text-muted-foreground">쿠팡 검색 중...</p></div> : null}
              {(!s.isSearchingCoupang ? s.coupangResults.length > 0 : null) ? <ProductGrid products={s.coupangResults} selectedIds={s.selectedProductIds} onToggle={a.toggleProduct} /> : null}
              {((!s.isSearchingCoupang ? s.coupangResults.length === 0 : null) ? !s.deepLinkResult : null) ? <div className="text-center py-10"><Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">검색 결과 없음. 검색 조건을 수정해보세요.</p></div> : null}
              <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => a.setStepA(1)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
                <div className="flex gap-2">
                  {s.selectedProductIds.size === 0 ? <Button onClick={() => a.setStepA(3)} variant="ghost" className="text-muted-foreground text-sm"><SkipForward className="w-4 h-4 mr-1" />건너뛰기</Button> : null}
                  <Button onClick={() => a.setStepA(3)} className="bg-blue-600 hover:bg-blue-500 text-white px-6">다음: 글 설정 <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            </div> : null
        }

          {/* Step A3: 글 설정 */}
          {s.stepA === 3 ?
        <div className="space-y-6 animate-in fade-in duration-300">
              <WritingSettingsForm persona={s.persona} setPersona={a.setPersona} articleType={s.articleType} setArticleType={a.setArticleType} textModel={s.textModel} setTextModel={a.setTextModel} imageModel={s.imageModel} setImageModel={a.setImageModel} charLimit={s.charLimit} setCharLimit={a.setCharLimit} itemCount={s.selectedProducts.length} />
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => a.setStepA(2)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
                <Button onClick={() => a.setStepA(4)} className="bg-blue-600 hover:bg-blue-500 text-white px-6">다음: 최종 확인 <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div> : null
        }

          {/* Step A4: 최종 확인 + 생성 */}
          {s.stepA === 4 ?
        <div className="space-y-6 animate-in fade-in duration-300">
              <FinalConfirmation keyword={s.keyword} editedTitle={s.editedTitle} selectedProducts={s.selectedProducts} persona={s.persona} articleType={s.articleType} textModel={s.textModel} imageModel={s.imageModel} charLimit={s.charLimit} isGenerating={s.isGenerating} generationResult={s.generationResult} onGenerate={a.handleGenerate} onPrev={() => a.setStepA(3)} router={router} />
            </div> : null
        }
        </> : null
      }

      {/* ═══════════════════════════════════════════════════════
          모드 B: 상품 먼저
        ═══════════════════════════════════════════════════════ */}
      {s.mode === "product_first" ?
      <>
          <StepIndicator labels={STEP_LABELS_B} current={s.stepB} />

          {/* Step B0: 상품 검색 — 4탭 검색 모드 */}
          {s.stepB === 0 ?
        <div className="space-y-6 animate-in fade-in duration-300">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-orange-500/20 rounded-lg"><ShoppingCart className="w-5 h-5 text-orange-400" /></div>
                  <div><h3 className="text-lg font-bold text-foreground">쿠팡 상품 검색</h3><p className="text-xs text-muted-foreground mt-0.5">글을 작성할 상품을 먼저 검색하세요</p></div>
                </div>

                {/* 검색 모드 탭 */}
                <div className="flex flex-wrap gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-4">
                  {(["keyword", "link", "category", "pl_brand"] as CoupangSearchMode[]).map((m) =>
              <button key={m} onClick={() => a.switchSearchMode(m)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap", s.searchMode === m ? "bg-orange-600 text-white shadow" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
                      {SEARCH_MODE_LABELS[m]}
                    </button>
              )}
                </div>

                {/* 모드별 입력 UI */}
                {s.searchMode === "keyword" ?
            <div className="flex gap-2">
                    <input type="text" className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-[15px]" placeholder="예: 로봇청소기, 에어프라이어, 냉장고..." value={s.productSearchTerm} onChange={(e) => a.setProductSearchTerm(e.target.value)} onKeyDown={(e) => (e.key === "Enter" ? s.productSearchTerm.trim() : null) ? a.searchProducts("keyword", s.productSearchTerm) : null} />
                    <Button onClick={() => a.searchProducts("keyword", s.productSearchTerm)} disabled={!s.productSearchTerm.trim() || s.isSearchingCoupang} className="bg-orange-600 hover:bg-orange-500 text-white px-6">{s.isSearchingCoupang ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}</Button>
                  </div> : null
            }
                {s.searchMode === "link" ?
            <div className="space-y-2">
                    <textarea className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-[15px] h-28 resize-none" placeholder="쿠팡 상품 URL을 입력하세요 (여러 줄 가능)" value={s.linkValue} onChange={(e) => a.setLinkValue(e.target.value)} />
                    <Button onClick={() => a.searchProducts("link", s.linkValue)} disabled={s.isSearchingCoupang || !s.linkValue.trim()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">{s.isSearchingCoupang ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}딥링크 변환</Button>
                  </div> : null
            }
                {s.searchMode === "category" ?
            <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select value={s.categoryValue} onChange={(e) => a.setCategoryValue(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-[15px] appearance-none cursor-pointer">
                        <option value="" disabled>카테고리를 선택하세요</option>
                        {COUPANG_CATEGORIES.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <Button onClick={() => a.searchProducts("category", s.categoryValue)} disabled={s.isSearchingCoupang || !s.categoryValue} className="bg-purple-600 hover:bg-purple-500 text-white px-6">{s.isSearchingCoupang ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}</Button>
                  </div> : null
            }
                {s.searchMode === "pl_brand" ?
            <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select value={s.plBrandValue} onChange={(e) => a.setPlBrandValue(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-[15px] appearance-none cursor-pointer">
                        <option value="" disabled>PL 브랜드를 선택하세요</option>
                        {COUPANG_PL_BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <Button onClick={() => a.searchProducts("pl_brand", s.plBrandValue)} disabled={s.isSearchingCoupang || !s.plBrandValue} className="bg-purple-600 hover:bg-purple-500 text-white px-6">{s.isSearchingCoupang ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}</Button>
                  </div> : null
            }
              </GlassCard>

              {/* 선택된 상품 장바구니 바 */}
              {renderCartBar()}

              {/* 딥링크 변환 결과 */}
              {s.deepLinkResult ?
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-400 whitespace-pre-line">{s.deepLinkResult}</div> : null
          }
              {s.isSearchingCoupang ? <div className="flex flex-col items-center py-12 gap-3"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /><p className="text-sm text-muted-foreground">쿠팡 검색 중...</p></div> : null}
              {(!s.isSearchingCoupang ? s.coupangResults.length > 0 : null) ?
          <>
                  <div className="flex items-center justify-between px-1"><span className="text-xs text-muted-foreground">{s.coupangResults.length}개 결과</span>{s.selectedProductIds.size > 0 ? <span className="text-xs text-blue-400 font-bold">{s.selectedProductIds.size}개 선택됨</span> : null}</div>
                  <ProductGrid products={s.coupangResults} selectedIds={s.selectedProductIds} onToggle={a.toggleProduct} />
                  <div className="flex justify-end">
                    <Button onClick={() => a.setStepB(1)} disabled={s.selectedProductIds.size === 0} className="bg-blue-600 hover:bg-blue-500 text-white px-6">다음: 키워드/제목 추출 <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                </> : null
          }
            </div> : null
        }

          {/* Step B1: 상품 확인 → 키워드/제목 추출 */}
          {s.stepB === 1 ?
        <div className="space-y-6 animate-in fade-in duration-300">
              <SelectedProductList products={s.selectedProducts} className="bg-slate-900/40 backdrop-blur-md" />
              <Button onClick={() => {a.handleExtractFromProducts();a.setStepB(2);}} disabled={s.isExtractingKeywords} className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold">
                {s.isExtractingKeywords ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />AI가 키워드를 추출 중...</> : <><Sparkles className="w-4 h-4 mr-2" />AI 키워드 + 제목 자동 추출</>}
              </Button>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => a.setStepB(0)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
              </div>
            </div> : null
        }

          {/* Step B2: 키워드/제목 확인 */}
          {s.stepB === 2 ?
        <div className="space-y-6 animate-in fade-in duration-300">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-purple-500/20 rounded-lg"><PenTool className="w-5 h-5 text-purple-400" /></div>
                  <div><h3 className="text-lg font-bold text-foreground">AI 추출 결과</h3><p className="text-xs text-muted-foreground mt-0.5">추출된 키워드와 제목을 확인/수정하세요</p></div>
                </div>
                {/* 추출된 키워드 */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">메인 키워드</label>
                  <input type="text" className="w-full bg-background/50 border border-purple-500/30 rounded-lg px-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-purple-500" value={s.keyword} onChange={(e) => a.setKeyword(e.target.value)} />
                </div>
              </GlassCard>
              {s.isExtractingKeywords ?
          <div className="flex flex-col items-center py-12 gap-3"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /><p className="text-sm text-muted-foreground">AI가 키워드와 제목을 추출 중...</p></div> :
          s.titles.length > 0 ?
          <TitleSelector titles={s.titles} selectedIdx={s.selectedTitleIdx} onSelect={a.handleSelectTitle} editedTitle={s.editedTitle} isEditing={s.isEditingTitle} onEditToggle={() => a.setIsEditingTitle(!s.isEditingTitle)} onEditChange={a.setEditedTitle} /> :
          null}
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => a.setStepB(1)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
                <Button onClick={() => a.setStepB(3)} disabled={s.selectedTitleIdx === null && !s.editedTitle.trim()} className="bg-blue-600 hover:bg-blue-500 text-white px-6">다음: 글 설정 <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div> : null
        }

          {/* Step B3: 글 설정 */}
          {s.stepB === 3 ?
        <div className="space-y-6 animate-in fade-in duration-300">
              <WritingSettingsForm persona={s.persona} setPersona={a.setPersona} articleType={s.articleType} setArticleType={a.setArticleType} textModel={s.textModel} setTextModel={a.setTextModel} imageModel={s.imageModel} setImageModel={a.setImageModel} charLimit={s.charLimit} setCharLimit={a.setCharLimit} itemCount={s.selectedProducts.length} />
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => a.setStepB(2)}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
                <Button onClick={() => a.setStepB(4)} className="bg-blue-600 hover:bg-blue-500 text-white px-6">다음: 최종 확인 <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div> : null
        }

          {/* Step B4: 최종 확인 + 생성 */}
          {s.stepB === 4 ?
        <div className="space-y-6 animate-in fade-in duration-300">
              <FinalConfirmation keyword={s.keyword} editedTitle={s.editedTitle} selectedProducts={s.selectedProducts} persona={s.persona} articleType={s.articleType} textModel={s.textModel} imageModel={s.imageModel} charLimit={s.charLimit} isGenerating={s.isGenerating} generationResult={s.generationResult} onGenerate={a.handleGenerate} onPrev={() => a.setStepB(3)} router={router} />
            </div> : null
        }
        </> : null
      }
    </div>);

};