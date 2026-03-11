/**
 * [Features/KeywordWriting] 키워드 글쓰기 ViewModel
 * 모든 비즈니스 상태와 액션을 관리하는 커스텀 훅입니다.
 * Widget에서 호출하여 state/actions를 Entity UI 컴포넌트에 주입합니다.
 */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  suggestKeywords,
  generateTitles,
  extractKeywords,
  type SuggestedKeyword,
  type TitleCandidate,
} from "../api/keyword-api";
import { CoupangProductResponse } from "@/shared/types/api";
import { DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from "@/shared/config/model-options";
import { type WritingMode, type GenerationResult, ARTICLE_TYPE_OPTIONS } from "@/entities/keyword-writing/model/types";
import { useWriteDraftStore } from "@/entities/keyword-writing/model/useWriteDraftStore";
import type { CoupangSearchMode } from "@/shared/constants/coupang-constants";
import { useUserSettingsViewModel } from "@/features/user-settings/model/useUserSettingsViewModel";

export function useKeywordWritingViewModel() {
  const router = useRouter();

  // ── 모드 ──
  const [mode, setMode] = useState<WritingMode>("keyword_first");

  const { articleSettings } = useUserSettingsViewModel();

  // ── 공통 상태 ──
  const [keyword, setKeyword] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedTitleIdx, setSelectedTitleIdx] = useState<number | null>(null);
  const [titles, setTitles] = useState<TitleCandidate[]>([]);
  const [persona, setPersona] = useState("IT");
  const [articleType, setArticleType] = useState("single");
  const [textModel, setTextModel] = useState(DEFAULT_TEXT_MODEL);
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);
  const [charLimit, setCharLimit] = useState("5000");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  // ── Zustand Draft 연동 (Silent Recovery) ──
  const draftMode = useWriteDraftStore(state => state.mode);
  const draftStepA = useWriteDraftStore(state => state.stepA);
  const draftStepB = useWriteDraftStore(state => state.stepB);
  const draftKeyword = useWriteDraftStore(state => state.keyword);
  const draftEditedTitle = useWriteDraftStore(state => state.editedTitle);
  const draftTitles = useWriteDraftStore(state => state.titles);
  const draftSelectedTitleIdx = useWriteDraftStore(state => state.selectedTitleIdx);
  const draftCartItems = useWriteDraftStore(state => state.cartItems);
  const draftSettings = useWriteDraftStore(state => state.settings);

  const setDraftMode = useWriteDraftStore(state => state.setMode);
  const setDraftStepA = useWriteDraftStore(state => state.setStepA);
  const setDraftStepB = useWriteDraftStore(state => state.setStepB);
  const setDraftKeyword = useWriteDraftStore(state => state.setKeyword);
  const setDraftEditedTitle = useWriteDraftStore(state => state.setEditedTitle);
  const setDraftTitles = useWriteDraftStore(state => state.setTitles);
  const setDraftSelectedTitleIdx = useWriteDraftStore(state => state.setSelectedTitleIdx);
  const setDraftCartItems = useWriteDraftStore(state => state.setCartItems);
  const updateDraftSettings = useWriteDraftStore(state => state.updateSettings);
  const resetDraft = useWriteDraftStore(state => state.resetDraft);
  const [isDraftRestored, setIsDraftRestored] = useState(false);


  // ── 쿠팡 상품 (장바구니 패턴: Map으로 선택 상품 데이터를 보존) ──
  const [coupangResults, setCoupangResults] = useState<CoupangProductResponse[]>([]);
  const [selectedProductMap, setSelectedProductMap] = useState<Map<number, CoupangProductResponse>>(new Map());

  // 글 유형이 유효한지 체크하여 자동 리셋 (상품 선택 변경 시)
  const selectedProductsLength = selectedProductMap.size;
  useEffect(() => {
    const currentOption = ARTICLE_TYPE_OPTIONS.find(a => a.value === articleType);
    if (currentOption) {
      const isValid = selectedProductsLength >= currentOption.minItems && selectedProductsLength <= currentOption.maxItems;
      if (!isValid) {
        setArticleType("single");
      }
    }
  }, [selectedProductsLength, articleType]);

  const [isSearchingCoupang, setIsSearchingCoupang] = useState(false);
  const [coupangSearchTerm, setCoupangSearchTerm] = useState("");

  // ── 상품 검색 모드 (키워드/URL/카테고리/PL브랜드) ──
  const [searchMode, setSearchMode] = useState<CoupangSearchMode>("keyword");
  const [categoryValue, setCategoryValue] = useState("");
  const [plBrandValue, setPlBrandValue] = useState("");
  const [linkValue, setLinkValue] = useState("");
  const [deepLinkResult, setDeepLinkResult] = useState<string | null>(null);

  // ── 모드 A 전용 ──
  const [stepA, setStepA] = useState(0);
  const [category, setCategory] = useState("all");
  const [suggestedKws, setSuggestedKws] = useState<SuggestedKeyword[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [previouslyRecommended, setPreviouslyRecommended] = useState<string[]>([]);

  // ── 모드 B 전용 ──
  const [stepB, setStepB] = useState(0);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);

  // ── Draft 복원 & 동기화 로직 ──
  useEffect(() => {
    if (!isDraftRestored) {
      if (draftMode) setMode(draftMode);
      if (draftStepA !== undefined) setStepA(draftStepA);
      if (draftStepB !== undefined) setStepB(draftStepB);
      if (draftKeyword) setKeyword(draftKeyword);
      if (draftEditedTitle) setEditedTitle(draftEditedTitle);
      if (draftTitles && draftTitles.length > 0) setTitles(draftTitles);
      if (draftSelectedTitleIdx !== null && draftSelectedTitleIdx !== undefined) setSelectedTitleIdx(draftSelectedTitleIdx);
      
      const restoredMap = new Map<number, CoupangProductResponse>();
      if (draftCartItems && Object.keys(draftCartItems).length > 0) {
        Object.values(draftCartItems).forEach(item => restoredMap.set(item.productId, item));
      }
      setSelectedProductMap(restoredMap);

      if (draftSettings) {
        setPersona(draftSettings.persona);
        setArticleType(draftSettings.articleType);
        setTextModel(draftSettings.textModel);
        setImageModel(draftSettings.imageModel);
        setCharLimit(draftSettings.charLimit);
      }
      setIsDraftRestored(true);
    }
  }, [draftMode, draftStepA, draftStepB, draftKeyword, draftEditedTitle, draftTitles, draftSelectedTitleIdx, draftCartItems, draftSettings, isDraftRestored]);

  useEffect(() => {
    if (isDraftRestored) {
      setDraftMode(mode);
      setDraftStepA(stepA);
      setDraftStepB(stepB);
      setDraftKeyword(keyword);
      setDraftEditedTitle(editedTitle);
      setDraftTitles(titles);
      setDraftSelectedTitleIdx(selectedTitleIdx);
      
      const newCartItems: Record<number, CoupangProductResponse> = {};
      selectedProductMap.forEach((val, key) => { newCartItems[key] = val; });
      setDraftCartItems(newCartItems);

      updateDraftSettings({
        persona, articleType, textModel, imageModel, charLimit
      });
    }
  }, [mode, stepA, stepB, keyword, editedTitle, titles, selectedTitleIdx, selectedProductMap, persona, articleType, textModel, imageModel, charLimit, isDraftRestored, setDraftMode, setDraftStepA, setDraftStepB, setDraftKeyword, setDraftEditedTitle, setDraftTitles, setDraftSelectedTitleIdx, setDraftCartItems, updateDraftSettings]);

  // ── 파생 상태 (Map에서 파생) ──
  const selectedProductIds = useMemo(
    () => new Set(selectedProductMap.keys()),
    [selectedProductMap]
  );
  const selectedProducts = useMemo(
    () => Array.from(selectedProductMap.values()),
    [selectedProductMap]
  );

  // ── 액션: 상품 토글 (Map 기반 — 검색 결과에서 상품 데이터를 함께 저장) ──
  const toggleProduct = (id: number) => {
    setSelectedProductMap(prev => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // 현재 검색 결과에서 상품 데이터를 찾아 Map에 저장
        const product = coupangResults.find(p => p.productId === id);
        if (product) next.set(id, product);
      }
      return next;
    });
  };

  // ── 액션: 장바구니에서 개별 상품 제거 ──
  const removeSelectedProduct = (id: number) => {
    setSelectedProductMap(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  // ── 액션: 장바구니 전체 초기화 ──
  const clearSelectedProducts = () => {
    setSelectedProductMap(new Map());
  };

  // ── 액션: 제목 선택 ──
  const handleSelectTitle = (idx: number) => {
    setSelectedTitleIdx(idx);
    setEditedTitle(titles[idx].title);
    setIsEditingTitle(false);
  };

  // ── 액션: 검색 모드 변경 (검색 결과만 초기화, 선택은 유지) ──
  const switchSearchMode = useCallback((newMode: CoupangSearchMode) => {
    setSearchMode(newMode);
    setCoupangResults([]);
    setDeepLinkResult(null);
  }, []);

  // ── 액션: 쿠팡 상품 검색 (모드별 분기 — 선택은 유지) ──
  const searchProducts = useCallback(async (searchModeProp: CoupangSearchMode, value: string) => {
    if (!value.trim()) return;
    setIsSearchingCoupang(true);
    setDeepLinkResult(null);

    try {
      let endpoint = "";
      let body: Record<string, unknown> = {};

      switch (searchModeProp) {
        case "keyword":
          endpoint = "/api/products/search";
          body = { keyword: value.trim(), limit: 10 };
          break;
        case "category":
          endpoint = "/api/products/bestcategories";
          body = { categoryId: value.trim(), limit: 100 };
          break;
        case "pl_brand":
          endpoint = "/api/products/coupang-pl-brand";
          body = { brandId: value.trim(), limit: 100 };
          break;
        case "link": {
          // URL 변환은 별도 처리
          const urls = value.split("\n").map(u => u.trim()).filter(Boolean);
          if (urls.length === 0) {
            toast.error("URL을 입력해주세요.");
            setIsSearchingCoupang(false);
            return;
          }
          const res = await fetch("/api/products/deeplink", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls }),
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.error ?? `딥링크 변환 실패 (${res.status})`);
          }
          const json = await res.json();
          setDeepLinkResult(`딥링크 변환 완료:\n${(json.data ?? []).join("\n")}`);
          setIsSearchingCoupang(false);
          return;
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `검색 실패 (${res.status})`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setCoupangResults(data);
        if (data.length === 0) toast("검색 결과가 없습니다. 다른 조건을 시도해보세요.", { icon: "🔍" });
      } else {
        console.error("[쿠팡 검색] 예상치 못한 응답:", data);
        setCoupangResults([]);
      }
    } catch (err) {
      console.error("[쿠팡 검색] 실패:", err);
      toast.error("쿠팡 검색에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setCoupangResults([]);
    } finally {
      setIsSearchingCoupang(false);
    }
  }, []);

  // ── 하위 호환: 기존 searchCoupang 래핑 ──
  const searchCoupang = useCallback(async (term: string) => {
    return searchProducts("keyword", term);
  }, [searchProducts]);

  // ── 액션: 관심사 태그 추가/삭제 ──
  const addInterest = useCallback(() => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests(prev => [...prev, trimmed]);
    }
    setInterestInput("");
  }, [interestInput, interests]);

  const removeInterest = (tag: string) => {
    setInterests(prev => prev.filter(t => t !== tag));
  };

  // ── 액션: 모드 A - 키워드 추천 ──
  const handleSuggestKeywords = useCallback(async () => {
    setIsLoadingKeywords(true);
    try {
      const result = await suggestKeywords({
        category: category === "all" ? undefined : category,
        baseKeyword: keyword || undefined,
        interests: interests.length > 0 ? interests : undefined,
        excludeKeywords: previouslyRecommended.length > 0 ? previouslyRecommended : undefined,
      });
      setSuggestedKws(result.keywords);
      // 추천된 키워드를 이전 추천 목록에 누적 (다음 추천 시 제외용)
      setPreviouslyRecommended(prev => [...prev, ...result.keywords.map((k: SuggestedKeyword) => k.keyword)]);
    } catch {} finally { setIsLoadingKeywords(false); }
  }, [category, keyword, interests, previouslyRecommended]);

  // ── 액션: 모드 A - 제목 생성 ──
  const handleGenerateTitles = useCallback(async () => {
    if (!keyword.trim()) return;
    setIsLoadingTitles(true);
    setSelectedTitleIdx(null);
    try {
      const textModel = articleSettings?.defaultTitleModel || 'gpt-4o-mini';
      const result = await generateTitles({ keyword: keyword.trim(), persona, articleType, textModel });
      setTitles(result.titles);
    } catch {} finally { setIsLoadingTitles(false); }
  }, [keyword, persona, articleType, articleSettings?.defaultTitleModel]);

  // ── 액션: 모드 B - 상품에서 키워드+제목 추출 ──
  const handleExtractFromProducts = useCallback(async () => {
    if (selectedProducts.length === 0) return;
    setIsExtractingKeywords(true);
    try {
      const result = await extractKeywords({
        productNames: selectedProducts.map(p => p.productName),
        articleType,
      });
      setKeyword(result.mainKeyword);
      setTitles(result.titles);
      setArticleType(result.inferredArticleType);
      setSelectedTitleIdx(null);
    } catch { toast.error("키워드 추출에 실패했습니다."); }
    finally { setIsExtractingKeywords(false); }
  }, [selectedProducts, articleType]);

  // ── 액션: 파이프라인 실행 ──
  const handleGenerate = useCallback(async () => {
    const finalTitle = editedTitle || (selectedTitleIdx !== null ? titles[selectedTitleIdx].title : "");
    if (!finalTitle) return;

    setIsGenerating(true);
    const leadProduct = selectedProducts.length > 0 ? selectedProducts[0] : null;
    const itemId = leadProduct ? String(leadProduct.productId) : `kw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const projectId = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const requestBody: Record<string, unknown> = {
        itemName: finalTitle,
        projectId,
        itemId,
        seoConfig: { persona, textModel, imageModel, charLimit: parseInt(charLimit), articleType, publishTarget: "DB_ONLY" },
        keywordMode: { keyword: keyword.trim() || finalTitle, selectedTitle: finalTitle },
      };
      if (leadProduct) {
        requestBody.productData = {
          productName: leadProduct.productName, productPrice: leadProduct.productPrice,
          productImage: leadProduct.productImage, productUrl: leadProduct.productUrl,
          categoryName: leadProduct.categoryName || "", isRocket: leadProduct.isRocket, isFreeShipping: leadProduct.isFreeShipping,
        };
      }
      if (selectedProducts.length > 1) {
        requestBody.items = selectedProducts.map(p => ({
          productName: p.productName, productPrice: p.productPrice, productImage: p.productImage,
          productUrl: p.productUrl, categoryName: p.categoryName || "", isRocket: p.isRocket,
          isFreeShipping: p.isFreeShipping, productId: String(p.productId),
        }));
      }

      const res = await fetch("/api/item-research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
      if (res.ok) {
        setGenerationResult({ projectId, itemId });
        resetDraft(); // 제출 성공 후 드래프트 초기화
        toast.success("글 생성이 시작되었습니다!", { duration: 4000 });
      } else { toast.error("글 생성 요청에 실패했습니다."); }
    } catch { toast.error("글 생성 중 오류가 발생했습니다."); }
    finally { setIsGenerating(false); }
  }, [keyword, editedTitle, selectedTitleIdx, titles, selectedProducts, persona, textModel, imageModel, charLimit, articleType, resetDraft]);

  // ── 액션: 모드 전환 ──
  const switchMode = (newMode: WritingMode) => {
    setMode(newMode);
    setStepA(0);
    setStepB(0);
  };

  return {
    router,

    // 상태
    state: {
      mode,
      keyword,
      editedTitle,
      isEditingTitle,
      selectedTitleIdx,
      titles,
      persona,
      articleType,
      textModel,
      imageModel,
      charLimit,
      isGenerating,
      generationResult,
      coupangResults,
      selectedProductIds,
      isSearchingCoupang,
      coupangSearchTerm,
      selectedProducts,
      // 상품 검색 모드
      searchMode,
      categoryValue,
      plBrandValue,
      linkValue,
      deepLinkResult,
      // 모드 A 전용
      stepA,
      category,
      suggestedKws,
      isLoadingKeywords,
      isLoadingTitles,
      interests,
      interestInput,
      previouslyRecommended,
      // 모드 B 전용
      stepB,
      productSearchTerm,
      isExtractingKeywords,
    },

    // 액션
    actions: {
      switchMode,
      setKeyword,
      setEditedTitle,
      setIsEditingTitle,
      setSelectedTitleIdx,
      setPersona,
      setArticleType,
      setTextModel,
      setImageModel,
      setCharLimit,
      setCoupangSearchTerm,
      setStepA,
      setCategory,
      setInterestInput,
      setStepB,
      setProductSearchTerm,
      toggleProduct,
      removeSelectedProduct,
      clearSelectedProducts,
      handleSelectTitle,
      searchCoupang,
      addInterest,
      removeInterest,
      handleSuggestKeywords,
      handleGenerateTitles,
      handleExtractFromProducts,
      handleGenerate,
      // 통합 상품 검색
      switchSearchMode,
      searchProducts,
      setCategoryValue,
      setPlBrandValue,
      setLinkValue,
    },
  };
}
