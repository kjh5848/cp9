/**
 * [Features/KeywordWriting] 키워드 글쓰기 ViewModel
 * 모든 비즈니스 상태와 액션을 관리하는 커스텀 훅입니다.
 * Widget에서 호출하여 state/actions를 Entity UI 컴포넌트에 주입합니다.
 */
"use client";

import { useRouter } from "next/navigation";
import { useKeywordWritingState } from "./useKeywordWritingState";
import { useKeywordWritingActions } from "./useKeywordWritingActions";
import { useKeywordWritingDraft } from "./useKeywordWritingDraft";

export function useKeywordWritingViewModel() {
  const router = useRouter();

  // 1. 상태 훅
  const state = useKeywordWritingState();

  // 2. Draft(자동저장/복원) 동기화 훅
  useKeywordWritingDraft(state);

  // 3. 비즈니스 로직(액션) 훅
  const actions = useKeywordWritingActions(state);

  return {
    router,

    // 상태
    state: {
      mode: state.mode,
      keyword: state.keyword,
      editedTitle: state.editedTitle,
      isEditingTitle: state.isEditingTitle,
      selectedTitleIdx: state.selectedTitleIdx,
      titles: state.titles,
      persona: state.persona,
      articleType: state.articleType,
      textModel: state.textModel,
      imageModel: state.imageModel,
      charLimit: state.charLimit,
      titleModel: state.titleModel,
      titleExamples: state.titleExamples,
      titleExclusions: state.titleExclusions,
      themeId: state.themeId,
      publishTargets: state.publishTargets,
      isGenerating: state.isGenerating,
      generationResult: state.generationResult,
      coupangResults: state.coupangResults,
      selectedProductIds: state.selectedProductIds,
      isSearchingCoupang: state.isSearchingCoupang,
      coupangSearchTerm: state.coupangSearchTerm,
      selectedProducts: state.selectedProducts,
      // 상품 검색 모드
      searchMode: state.searchMode,
      categoryValue: state.categoryValue,
      plBrandValue: state.plBrandValue,
      linkValue: state.linkValue,
      deepLinkResult: state.deepLinkResult,
      // 모드 A 전용
      stepA: state.stepA,
      category: state.category,
      suggestedKws: state.suggestedKws,
      isLoadingKeywords: state.isLoadingKeywords,
      isLoadingTitles: state.isLoadingTitles,
      interests: state.interests,
      interestInput: state.interestInput,
      previouslyRecommended: state.previouslyRecommended,
      // 모드 B 전용
      stepB: state.stepB,
      productSearchTerm: state.productSearchTerm,
      isExtractingKeywords: state.isExtractingKeywords,
    },

    // 액션
    actions: {
      switchMode: actions.switchMode,
      setKeyword: state.setKeyword,
      setEditedTitle: state.setEditedTitle,
      setIsEditingTitle: state.setIsEditingTitle,
      setSelectedTitleIdx: state.setSelectedTitleIdx,
      setPersona: state.setPersona,
      setArticleType: state.setArticleType,
      setTextModel: state.setTextModel,
      setImageModel: state.setImageModel,
      setCharLimit: state.setCharLimit,
      setTitleModel: state.setTitleModel,
      setTitleExamples: state.setTitleExamples,
      setTitleExclusions: state.setTitleExclusions,
      setThemeId: state.setThemeId,
      setPublishTargets: state.setPublishTargets,
      setCoupangSearchTerm: state.setCoupangSearchTerm,
      setStepA: state.setStepA,
      setCategory: state.setCategory,
      setInterestInput: state.setInterestInput,
      setStepB: state.setStepB,
      setProductSearchTerm: state.setProductSearchTerm,
      toggleProduct: actions.toggleProduct,
      removeSelectedProduct: actions.removeSelectedProduct,
      clearSelectedProducts: actions.clearSelectedProducts,
      handleSelectTitle: actions.handleSelectTitle,
      searchCoupang: actions.searchCoupang,
      addInterest: actions.addInterest,
      removeInterest: actions.removeInterest,
      handleSuggestKeywords: actions.handleSuggestKeywords,
      handleGenerateTitles: actions.handleGenerateTitles,
      handleExtractFromProducts: actions.handleExtractFromProducts,
      handleGenerate: actions.handleGenerate,
      // 통합 상품 검색
      switchSearchMode: actions.switchSearchMode,
      searchProducts: actions.searchProducts,
      setCategoryValue: state.setCategoryValue,
      setPlBrandValue: state.setPlBrandValue,
      setLinkValue: state.setLinkValue,
    },
  };
}
