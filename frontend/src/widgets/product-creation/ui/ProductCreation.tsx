"use client";

import React, { useState, useMemo, useEffect } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { Loader2, Package, Layers, Settings, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { CoupangProductResponse } from "@/shared/types/api";
import { WriteActionModal } from "@/features/research-analysis/ui/WriteActionModal";
import { useJobPolling } from "@/features/research-analysis/model/useJobPolling";
import { toast } from "react-hot-toast";
import { SelectedProductList } from "@/shared/ui/SelectedProductList";
import { useProductCartStore } from "@/entities/product-creation/model/useProductCartStore";
import { useCoupangDefaults } from "@/shared/api/useCoupangDefaults";

import { HorizontalProductList } from "@/entities/product-creation/ui/HorizontalProductList";
import { ProductFilterBar, PRICE_PRESETS } from "@/entities/product-creation/ui/ProductFilterBar";
import { ProductSearchGrid } from "@/entities/product-creation/ui/ProductSearchGrid";
import { ProductSearchInputForm } from "@/features/product-creation/ui/ProductSearchInputForm";

export type SearchMode = "keyword" | "link" | "category" | "pl_brand";

export const ProductCreation = () => {
  const [mode, setMode] = useState<SearchMode>("keyword");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<CoupangProductResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { cartItems, toggleItem, clearCart } = useProductCartStore();
  const [isStoreReady, setIsStoreReady] = useState(false);
  useEffect(() => setIsStoreReady(true), []);

  const selectedProductMap = useMemo(() => {
    const map = new Map<number, CoupangProductResponse>();
    if (isStoreReady) {
      Object.values(cartItems).forEach(item => map.set(item.productId, item));
    }
    return map;
  }, [cartItems, isStoreReady]);
  const selectedProductIds = useMemo(() => isStoreReady ? new Set(Object.keys(cartItems).map(Number)) : new Set<number>(), [cartItems, isStoreReady]);
  const [isResearching, setIsResearching] = useState(false);

  const { startPolling, isPolling } = useJobPolling({
    intervalMs: 5000,
    onComplete: () => setIsResearching(false),
    onFailed: () => setIsResearching(false)
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { defaultPlAll, defaultGoldbox, isLoading: isDefaultLoading, isError: defaultError } = useCoupangDefaults();

  const [pricePresetIdx, setPricePresetIdx] = useState(0);
  const [rocketOnly, setRocketOnly] = useState(false);
  const [freeShipOnly, setFreeShipOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");

  const filtered = useMemo(() => {
    const preset = PRICE_PRESETS[pricePresetIdx];
    let list = results.filter(
      (p) =>
      p.productPrice >= preset.min &&
      p.productPrice <= preset.max && (
      !rocketOnly || p.isRocket) && (
      !freeShipOnly || p.isFreeShipping)
    );
    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.productPrice - b.productPrice);
    if (sortBy === "price_desc") list = [...list].sort((a, b) => b.productPrice - a.productPrice);
    return list;
  }, [results, pricePresetIdx, rocketOnly, freeShipOnly, sortBy]);

  const handleAction = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setPricePresetIdx(0);
    setRocketOnly(false);
    setFreeShipOnly(false);
    setSortBy("default");

    try {
      if (mode === "keyword") {
        const res = await fetch("/api/products/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keyword: value.trim(), limit: 10 }) });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `검색 실패 (${res.status})`);
        const data = await res.json();
        setResults(data);
        if (data.length === 0) setError("검색 결과가 없습니다. 다른 키워드를 시도해보세요.");
      } else if (mode === "link") {
        const urls = value.split("\n").map((u) => u.trim()).filter(Boolean);
        if (urls.length === 0) throw new Error("URL을 입력해주세요.");
        const res = await fetch("/api/products/deeplink", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls }) });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `딥링크 변환 실패 (${res.status})`);
        const json = await res.json();
        setError(`딥링크 변환 완료:\n${(json.data ?? []).join("\n")}`);
      } else if (mode === "category") {
        const res = await fetch("/api/products/bestcategories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId: value.trim(), limit: 100 }) });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `카테고리 검색 실패 (${res.status})`);
        const data = await res.json();
        setResults(data);
        if (data.length === 0) setError("해당 카테고리에 상품이 없습니다.");
      } else if (mode === "pl_brand") {
        const res = await fetch("/api/products/coupang-pl-brand", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brandId: value.trim(), limit: 100 }) });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `PL 브랜드 검색 실패 (${res.status})`);
        const data = await res.json();
        setResults(data);
        if (data.length === 0) setError("해당 PL 브랜드에 상품이 없습니다.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (productId: number) => {
    if (cartItems[productId]) {
      useProductCartStore.getState().removeItem(productId);
    } else {
      const allAvailable = [...results, ...defaultPlAll, ...defaultGoldbox];
      const product = allAvailable.find((p) => p.productId === productId);
      if (product) toggleItem(product);
    }
  };

  const handleStartResearch = async (params: any) => {
    if (selectedProductIds.size === 0) return;
    setIsResearching(true);
    setIsModalOpen(false);
    setError(null);

    const newProjectId = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const uniqueSelectedProducts = Array.from(selectedProductMap.values());
      const resolvedArticleType = params.articleType || 'single';

      if (resolvedArticleType === 'compare' || resolvedArticleType === 'curation') {
        const leadProduct = uniqueSelectedProducts[0];
        const titleFromModal = params.customTitles?.['main'];
        const fallbackTitle = resolvedArticleType === 'compare' ?
        uniqueSelectedProducts.map((p) => p.productName.slice(0, 20)).join(' vs ') :
        `TOP ${uniqueSelectedProducts.length} 큐레이션`;

        const res = await fetch("/api/item-research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: titleFromModal || fallbackTitle,
            projectId: newProjectId,
            itemId: String(leadProduct.productId),
            productData: {
              productName: leadProduct.productName,
              productPrice: leadProduct.productPrice,
              productImage: leadProduct.productImage,
              productUrl: leadProduct.productUrl,
              categoryName: leadProduct.categoryName || "",
              isRocket: leadProduct.isRocket,
              isFreeShipping: leadProduct.isFreeShipping
            },
            items: uniqueSelectedProducts.map((p) => ({
              productName: p.productName,
              productPrice: p.productPrice,
              productImage: p.productImage,
              productUrl: p.productUrl,
              categoryName: p.categoryName || "",
              isRocket: p.isRocket,
              isFreeShipping: p.isFreeShipping,
              productId: String(p.productId)
            })),
            seoConfig: {
              persona: params.persona,
              textModel: params.textModel,
              imageModel: params.imageModel,
              actionType: params.actionType,
              scheduledAt: params.scheduledAt,
              charLimit: params.charLimit,
              articleType: resolvedArticleType,
              ...(params.themeId && { themeId: params.themeId })
            }
          })
        });

        if (res.ok) {
          startPolling(newProjectId, String(leadProduct.productId));
          toast.success(`📝 ${resolvedArticleType === 'compare' ? '비교 분석' : '큐레이션'} 글 생성이 시작되었습니다!`, { duration: 4000 });
          if (params.actionType === 'SCHEDULE') router.push('/schedule');
          else router.push(`/research/${leadProduct.productId}?projectId=${newProjectId}`);
        } else {
          toast.error('글 생성 요청에 실패했습니다.');
          setIsResearching(false);
        }
      } else {
        const responses = await Promise.all(
          uniqueSelectedProducts.map(async (product) => {
            const titleFromModal = params.customTitles?.[String(product.productId)];
            const res = await fetch("/api/item-research", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                itemName: titleFromModal || product.productName,
                projectId: newProjectId,
                itemId: String(product.productId),
                productData: {
                  productName: product.productName,
                  productPrice: product.productPrice,
                  productImage: product.productImage,
                  productUrl: product.productUrl,
                  categoryName: product.categoryName || "",
                  isRocket: product.isRocket,
                  isFreeShipping: product.isFreeShipping
                },
                seoConfig: {
                  persona: params.persona,
                  textModel: params.textModel,
                  imageModel: params.imageModel,
                  actionType: params.actionType,
                  scheduledAt: params.scheduledAt,
                  charLimit: params.charLimit,
                  articleType: 'single',
                  ...(params.themeId && { themeId: params.themeId })
                }
              })
            });
            return { product, ok: res.ok, data: await res.json() };
          })
        );

        const successCount = responses.filter((r) => r.ok).length;

        if (successCount > 0) {
          const firstProduct = uniqueSelectedProducts[0];
          startPolling(newProjectId, String(firstProduct.productId));
          toast.success(`📝 ${successCount}개 상품 글 생성이 시작되었습니다!\n완료 시 알림을 보내드리겠습니다.`, { duration: 4000 });

          if (params.actionType === 'SCHEDULE') router.push('/schedule');
          else if (uniqueSelectedProducts.length === 1) router.push(`/research/${firstProduct.productId}?projectId=${newProjectId}`);
          else router.push('/research');
        } else {
          toast.error('글 생성 요청에 실패했습니다.');
          setIsResearching(false);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "SEO 리서치 전환 중 오류가 발생했습니다.");
      setIsResearching(false);
    }
  };

  const hasResults = results.length > 0;
  
  const combinedError = error || (!hasResults && defaultError ? defaultError.message : null);
  const isSettingMissing = combinedError && (combinedError.includes("설정") || combinedError.includes("API 연동"));

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 py-8 pb-32 relative">
      {isPolling && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5">
          <GlassCard className="p-4 flex items-center gap-3 border-blue-500/30 bg-gray-900/95 backdrop-blur-xl shadow-2xl max-w-sm">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-white text-sm font-medium">AI가 글을 작성 중...</span>
              <span className="text-xs text-slate-400">완료 시 알림을 보내드립니다</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 모드 선택 탭 */}
      <div className="flex flex-wrap justify-center p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-fit mx-auto gap-1">
        {(["keyword", "link", "category", "pl_brand"] as SearchMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setResults([]);
              setError(null);
              setValue("");
            }}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              mode === m ?
              "bg-blue-600 text-white shadow-lg shadow-blue-500/20" :
              "text-slate-400 hover:text-white hover:bg-white/5"
            )}>
            {m === "keyword" && "키워드 검색"}
            {m === "link" && "URL 변환"}
            {m === "category" && "카테고리"}
            {m === "pl_brand" && "PL 브랜드"}
          </button>
        ))}
      </div>

      <ProductSearchInputForm
        mode={mode}
        value={value}
        setValue={setValue}
        onAction={handleAction}
        loading={loading}
      />

      {error && !isSettingMissing && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-400 whitespace-pre-line flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isSettingMissing && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
            <Settings className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white">쿠팡 파트너스 API 설정 필요</h3>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            아이템 생성을 위해 쿠팡 파트너스 API 연동이 필수입니다.<br/>
            마이페이지에서 Access Key와 Secret Key를 먼저 등록해주세요.
          </p>
          <Button 
            onClick={() => router.push("/my-page")} 
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium px-8 h-11"
          >
            마이페이지로 이동하기
          </Button>
        </div>
      )}

      {hasResults && (
        <ProductFilterBar
          filteredCount={filtered.length}
          totalCount={results.length}
          pricePresetIdx={pricePresetIdx}
          setPricePresetIdx={setPricePresetIdx}
          rocketOnly={rocketOnly}
          setRocketOnly={setRocketOnly}
          freeShipOnly={freeShipOnly}
          setFreeShipOnly={setFreeShipOnly}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      )}

      {hasResults && filtered.length === 0 && (
        <p className="text-center text-slate-500 py-8 text-sm">
          해당 조건에 맞는 상품이 없습니다. 필터를 조정해보세요.
        </p>
      )}

      {filtered.length > 0 && (
        <ProductSearchGrid 
          products={filtered}
          selectedProductIds={selectedProductIds}
          toggleSelection={toggleSelection}
        />
      )}

      {!hasResults && !error && !isSettingMissing && (
        <div className="space-y-12">
          {isDefaultLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p>추천 상품을 불러오는 중입니다...</p>
            </div>
          ) : (
            <>
              {defaultGoldbox.length > 0 && (
                <HorizontalProductList
                  title="오늘의 골드박스 특가"
                  items={defaultGoldbox}
                  icon={<Package className="w-6 h-6 text-yellow-400" />}
                  selectedProductIds={selectedProductIds}
                  toggleSelection={toggleSelection}
                />
              )}
              {defaultPlAll.length > 0 && (
                <HorizontalProductList
                  title="쿠팡 전문 브랜드(PL) 인기상품"
                  items={defaultPlAll}
                  icon={<Layers className="w-6 h-6 text-purple-400" />}
                  selectedProductIds={selectedProductIds}
                  toggleSelection={toggleSelection}
                />
              )}
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { label: "키워드", desc: "인기 키워드로 상품 자동 매칭" },
              { label: "URL", desc: "직접 입력한 상품 딥링크 변환" },
              { label: "BEST", desc: "카테고리별 실시간 수익 최적화" }
            ].map((item, idx) => (
              <GlassCard key={idx} className="p-4 text-center border-none bg-white/[0.02]">
                <h4 className="text-sm font-bold text-slate-300 mb-1">{item.label}</h4>
                <p className="text-[10px] text-slate-500">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {selectedProductIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
          <div className="max-w-[1400px] mx-auto">
            <GlassCard className="p-4 border-blue-500/30 bg-gray-900/95 backdrop-blur-xl shadow-2xl space-y-3">
              <SelectedProductList
                products={Array.from(selectedProductMap.values())}
                onRemove={toggleSelection}
                onClearAll={clearCart}
                className="p-0 border-none bg-transparent shadow-none backdrop-blur-none"
              />

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  disabled={isResearching}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20">
                  {isResearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : "글 작성"}
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      <WriteActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${selectedProductIds.size}개 상품`}
        selectedItems={Array.from(selectedProductMap.values())}
        onExecute={handleStartResearch} 
      />
      
    </div>
  );
};