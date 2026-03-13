import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { suggestKeywords, generateTitles, extractKeywords, type SuggestedKeyword } from "../api/keyword-api";
import { useWriteDraftStore } from "@/entities/keyword-writing/model/useWriteDraftStore";
import type { CoupangProductResponse } from "@/shared/types/api";
import type { CoupangSearchMode } from "@/shared/constants/coupang-constants";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StateReturn = any; // Will be properly typed when imported into ViewModel

export function useKeywordWritingActions(state: StateReturn) {
  const resetDraft = useWriteDraftStore(state => state.resetDraft);

  const toggleProduct = useCallback((product: CoupangProductResponse) => {
    state.setSelectedProductMap((prev: Map<number, CoupangProductResponse>) => {
      const next = new Map(prev);
      if (next.has(product.productId)) {
        next.delete(product.productId);
      } else {
        next.set(product.productId, product);
      }
      return next;
    });
  }, [state.setSelectedProductMap]);

  const removeSelectedProduct = useCallback((id: number) => {
    state.setSelectedProductMap((prev: Map<number, CoupangProductResponse>) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, [state.setSelectedProductMap]);

  const clearSelectedProducts = useCallback(() => {
    state.setSelectedProductMap(new Map());
  }, [state.setSelectedProductMap]);

  const handleSelectTitle = useCallback((idx: number) => {
    state.setSelectedTitleIdx(idx);
    state.setEditedTitle(state.titles[idx].title);
    state.setIsEditingTitle(false);
  }, [state]);

  const switchSearchMode = useCallback((newMode: CoupangSearchMode) => {
    state.setSearchMode(newMode);
    state.setCoupangResults([]);
    state.setDeepLinkResult(null);
  }, [state]);

  const searchProducts = useCallback(async (searchModeProp: CoupangSearchMode, value: string) => {
    if (!value.trim()) return;
    state.setIsSearchingCoupang(true);
    state.setDeepLinkResult(null);

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
          const urls = value.split("\n").map(u => u.trim()).filter(Boolean);
          if (urls.length === 0) {
            toast.error("URL을 입력해주세요.");
            state.setIsSearchingCoupang(false);
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
          state.setDeepLinkResult(`딥링크 변환 완료:\n${(json.data ?? []).join("\n")}`);
          state.setIsSearchingCoupang(false);
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
        state.setCoupangResults(data);
        if (data.length === 0) toast("검색 결과가 없습니다. 다른 조건을 시도해보세요.", { icon: "🔍" });
      } else {
        console.error("[쿠팡 검색] 예상치 못한 응답:", data);
        state.setCoupangResults([]);
      }
    } catch (err) {
      console.error("[쿠팡 검색] 실패:", err);
      toast.error("쿠팡 검색에 실패했습니다. 잠시 후 다시 시도해주세요.");
      state.setCoupangResults([]);
    } finally {
      state.setIsSearchingCoupang(false);
    }
  }, [state]);

  const searchCoupang = useCallback(async (term: string) => {
    return searchProducts("keyword", term);
  }, [searchProducts]);

  const addInterest = useCallback(() => {
    const trimmed = state.interestInput.trim();
    if (trimmed && !state.interests.includes(trimmed)) {
      state.setInterests((prev: string[]) => [...prev, trimmed]);
    }
    state.setInterestInput("");
  }, [state]);

  const removeInterest = useCallback((tag: string) => {
    state.setInterests((prev: string[]) => prev.filter(t => t !== tag));
  }, [state.setInterests]);

  const handleSuggestKeywords = useCallback(async () => {
    state.setIsLoadingKeywords(true);
    try {
      const result = await suggestKeywords({
        category: state.category === "all" ? undefined : state.category,
        baseKeyword: state.keyword || undefined,
        interests: state.interests.length > 0 ? state.interests : undefined,
        excludeKeywords: state.previouslyRecommended.length > 0 ? state.previouslyRecommended : undefined,
      });
      state.setSuggestedKws(result.keywords);
      state.setPreviouslyRecommended((prev: string[]) => [...prev, ...result.keywords.map((k: SuggestedKeyword) => k.keyword)]);
    } catch {} finally { state.setIsLoadingKeywords(false); }
  }, [state]);

  const handleGenerateTitles = useCallback(async () => {
    if (!state.keyword.trim()) return;
    state.setIsLoadingTitles(true);
    state.setSelectedTitleIdx(null);
    try {
      const result = await generateTitles({ 
        keyword: state.keyword.trim(), 
        persona: state.persona, 
        articleType: state.articleType, 
        textModel: state.titleModel,
        titleExamples: state.titleExamples,
        titleExclusions: state.titleExclusions
      });
      state.setTitles(result.titles);
    } catch {} finally { state.setIsLoadingTitles(false); }
  }, [state]);

  const handleExtractFromProducts = useCallback(async () => {
    if (state.selectedProducts.length === 0) return;
    state.setIsExtractingKeywords(true);
    try {
      const result = await extractKeywords({
        productNames: state.selectedProducts.map((p: CoupangProductResponse) => p.productName),
        articleType: state.articleType,
      });
      state.setKeyword(result.mainKeyword);
      state.setTitles(result.titles);
      state.setArticleType(result.inferredArticleType);
      state.setSelectedTitleIdx(null);
    } catch { toast.error("키워드 추출에 실패했습니다."); }
    finally { state.setIsExtractingKeywords(false); }
  }, [state]);

  const handleGenerate = useCallback(async () => {
    const finalTitle = state.editedTitle || (state.selectedTitleIdx !== null ? state.titles[state.selectedTitleIdx].title : "");
    if (!finalTitle) return;

    state.setIsGenerating(true);
    const leadProduct = state.selectedProducts.length > 0 ? state.selectedProducts[0] : null;
    const itemId = leadProduct ? String(leadProduct.productId) : `kw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const projectId = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const requestBody: Record<string, unknown> = {
        itemName: finalTitle,
        projectId,
        itemId,
        seoConfig: { 
          persona: state.persona, 
          textModel: state.textModel, 
          imageModel: state.imageModel, 
          charLimit: parseInt(state.charLimit), 
          articleType: state.articleType, 
          publishTarget: "DB_ONLY",
          ...(state.themeId && { themeId: state.themeId })
        },
        publishTargets: state.publishTargets,
        keywordMode: { keyword: state.keyword.trim() || finalTitle, selectedTitle: finalTitle },
      };
      if (leadProduct) {
        requestBody.productData = {
          productName: leadProduct.productName, productPrice: leadProduct.productPrice,
          productImage: leadProduct.productImage, productUrl: leadProduct.productUrl,
          categoryName: leadProduct.categoryName || "", isRocket: leadProduct.isRocket, isFreeShipping: leadProduct.isFreeShipping,
        };
      }
      if (state.selectedProducts.length > 1) {
        requestBody.items = state.selectedProducts.map((p: CoupangProductResponse) => ({
          productName: p.productName, productPrice: p.productPrice, productImage: p.productImage,
          productUrl: p.productUrl, categoryName: p.categoryName || "", isRocket: p.isRocket,
          isFreeShipping: p.isFreeShipping, productId: String(p.productId),
        }));
      }

      const res = await fetch("/api/item-research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
      if (res.ok) {
        state.setGenerationResult({ projectId, itemId });
        resetDraft();
        toast.success("글 생성이 시작되었습니다!", { duration: 4000 });
      } else { toast.error("글 생성 요청에 실패했습니다."); }
    } catch { toast.error("글 생성 중 오류가 발생했습니다."); }
    finally { state.setIsGenerating(false); }
  }, [state, resetDraft]);

  const switchMode = useCallback((newMode: string) => {
    state.setMode(newMode);
    state.setStepA(0);
    state.setStepB(0);
  }, [state]);

  return {
    toggleProduct,
    removeSelectedProduct,
    clearSelectedProducts,
    handleSelectTitle,
    switchSearchMode,
    searchProducts,
    searchCoupang,
    addInterest,
    removeInterest,
    handleSuggestKeywords,
    handleGenerateTitles,
    handleExtractFromProducts,
    handleGenerate,
    switchMode
  };
}
