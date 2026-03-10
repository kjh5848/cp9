"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import {
  Search,
  Link as LinkIcon,
  Layers,
  Loader2,
  ExternalLink,
  Package,
  SlidersHorizontal,
  X,
  ChevronDown,
  CheckCircle2,
  Settings2 } from
"lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { CoupangProductResponse } from "@/shared/types/api";
import { WriteActionModal } from "@/features/research-analysis/ui/WriteActionModal";
import ReactMarkdown from "react-markdown";
import { useJobPolling } from "@/features/research-analysis/model/useJobPolling";
import { toast } from "react-hot-toast";
import { SelectedProductList } from "@/shared/ui/SelectedProductList";

type SearchMode = "keyword" | "link" | "category" | "pl_brand";
type PersonaType = "Single_Expert" | "Compare_Master" | "Curation_Blogger";
type ToneType = "Professional" | "Friendly" | "Humorous" | "Informative";

/** 가격 구간 프리셋 */
const PRICE_PRESETS = [
{ label: "전체", min: 0, max: Infinity },
{ label: "~1만원", min: 0, max: 10000 },
{ label: "1~3만원", min: 10000, max: 30000 },
{ label: "3~5만원", min: 30000, max: 50000 },
{ label: "5~10만원", min: 50000, max: 100000 },
{ label: "10만원~", min: 100000, max: Infinity }];


/** 카테고리 목록 */
const CATEGORIES = [
{ id: "1001", name: "여성패션" },
{ id: "1002", name: "남성패션" },
{ id: "1010", name: "뷰티" },
{ id: "1011", name: "출산/유아동" },
{ id: "1012", name: "식품" },
{ id: "1013", name: "주방용품" },
{ id: "1014", name: "생활용품" },
{ id: "1015", name: "홈인테리어" },
{ id: "1016", name: "가전디지털" },
{ id: "1017", name: "스포츠/레저" },
{ id: "1018", name: "자동차용품" },
{ id: "1019", name: "도서/음반/DVD" },
{ id: "1020", name: "완구/취미" },
{ id: "1021", name: "문구/오피스" },
{ id: "1024", name: "헬스/건강식품" },
{ id: "1025", name: "국내여행" },
{ id: "1026", name: "해외여행" },
{ id: "1029", name: "반려동물용품" },
{ id: "1030", name: "유아동패션" }];


/** PL 브랜드 목록 */
const PL_BRANDS = [
{ id: "1001", name: "탐사" },
{ id: "1002", name: "코멧" },
{ id: "1003", name: "Gomgom" },
{ id: "1004", name: "줌" },
{ id: "1006", name: "곰곰" },
{ id: "1007", name: "꼬리별" },
{ id: "1008", name: "베이스알파에센셜" },
{ id: "1010", name: "비타할로" },
{ id: "1011", name: "비지엔젤" }];


/**
 * [Widgets Layer]
 * 상품을 검색하거나 URL을 통해 등록하는 통합 상품 생성 위젯입니다.
 * 실제 쿠팡 파트너스 API와 연동됩니다.
 */
export const ProductCreation = () => {
  const [mode, setMode] = useState<SearchMode>("keyword");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<CoupangProductResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* ── 상품 선택 (장바구니 패턴: Map으로 선택 상품 데이터 보존) ── */
  const router = useRouter();
  const [selectedProductMap, setSelectedProductMap] = useState<Map<number, CoupangProductResponse>>(new Map());
  const selectedProductIds = useMemo(() => new Set(selectedProductMap.keys()), [selectedProductMap]);
  const [isResearching, setIsResearching] = useState(false);

  /* ── 폴링 사용: 글 생성 완료 알림 ── */
  const { startPolling, isPolling, jobStatus } = useJobPolling({
    intervalMs: 5000,
    onComplete: (status) => {
      setIsResearching(false);
    },
    onFailed: (status) => {
      setIsResearching(false);
    }
  });

  /* ── 린트 에러 복구용 모달 상태 ── */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ── 기본 추천 상품 데이터 ── */
  const [defaultGoldbox, setDefaultGoldbox] = useState<CoupangProductResponse[]>([]);
  const [defaultPlAll, setDefaultPlAll] = useState<CoupangProductResponse[]>([]);
  const [isDefaultLoading, setIsDefaultLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDefaults = async () => {
      try {
        setIsDefaultLoading(true);
        const [plRes, goldRes] = await Promise.all([
        fetch("/api/products/coupang-pl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit: 50 })
        }),
        fetch("/api/products/goldbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })]
        );
        if (isMounted) {
          if (plRes.ok) setDefaultPlAll(await plRes.json());
          if (goldRes.ok) setDefaultGoldbox(await goldRes.json());
        }
      } catch (err) {
        console.error("기본 상품 불러오기 에러:", err);
      } finally {
        if (isMounted) setIsDefaultLoading(false);
      }
    };
    fetchDefaults();
    return () => {
      isMounted = false;
    };
  }, []);

  /* ── 결과 화면 상태 (제거됨 - 상세 페이지로 이동) ── */
  // generatedSEO 상태는 완전히 제거하고 라우팅으로 대체

  /* ── 필터 상태 ── */
  const [pricePresetIdx, setPricePresetIdx] = useState(0);
  const [rocketOnly, setRocketOnly] = useState(false);
  const [freeShipOnly, setFreeShipOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");

  /** 필터·정렬 적용된 결과 */
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

  /* ── API 호출 ── */
  const handleKeywordSearch = async (): Promise<CoupangProductResponse[]> => {
    const res = await fetch("/api/products/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: value.trim(), limit: 10 })
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? `검색 실패 (${res.status})`);
    }
    return res.json();
  };

  const handleCategorySearch = async (): Promise<CoupangProductResponse[]> => {
    const res = await fetch("/api/products/bestcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: value.trim(), limit: 100 })
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? `카테고리 검색 실패 (${res.status})`);
    }
    return res.json();
  };

  const handlePLBrandSearch = async (): Promise<CoupangProductResponse[]> => {
    const res = await fetch("/api/products/coupang-pl-brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: value.trim(), limit: 100 })
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? `PL 브랜드 검색 실패 (${res.status})`);
    }
    return res.json();
  };

  const handleDeepLink = async () => {
    const urls = value.split("\n").map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) throw new Error("URL을 입력해주세요.");
    const res = await fetch("/api/products/deeplink", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls })
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? `딥링크 변환 실패 (${res.status})`);
    }
    const json = await res.json();
    setError(`딥링크 변환 완료:\n${(json.data ?? []).join("\n")}`);
  };

  const handleAction = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    /* 필터 초기화 */
    setPricePresetIdx(0);
    setRocketOnly(false);
    setFreeShipOnly(false);
    setSortBy("default");

    try {
      if (mode === "keyword") {
        const data = await handleKeywordSearch();
        setResults(data);
        if (data.length === 0) setError("검색 결과가 없습니다. 다른 키워드를 시도해보세요.");
      } else if (mode === "link") {
        await handleDeepLink();
      } else if (mode === "category") {
        const data = await handleCategorySearch();
        setResults(data);
        if (data.length === 0) setError("해당 카테고리에 상품이 없습니다.");
      } else if (mode === "pl_brand") {
        const data = await handlePLBrandSearch();
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
    setSelectedProductMap((prev) => {
      const next = new Map(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        // 현재 검색 결과 + 기본 추천 상품에서 데이터 찾기
        const allAvailable = [...results, ...defaultPlAll, ...defaultGoldbox];
        const product = allAvailable.find((p) => p.productId === productId);
        if (product) next.set(productId, product);
      }
      return next;
    });
  };

  const handleStartResearch = async (params: {persona: string;textModel: string;imageModel: string;actionType: 'NOW' | 'SCHEDULE';scheduledAt?: string;charLimit?: number;articleType?: 'single' | 'compare' | 'curation';themeId?: string;customTitles?: Record<string, string>;}) => {
    if (selectedProductIds.size === 0) return;
    setIsResearching(true);
    setIsModalOpen(false);
    setError(null);

    // 프로젝트 ID 생성
    const newProjectId = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      // 선택된 상품을 Map에서 직접 가져오기 (장바구니 패턴)
      const uniqueSelectedProducts = Array.from(selectedProductMap.values());
      const resolvedArticleType = params.articleType || 'single';

      if (resolvedArticleType === 'compare' || resolvedArticleType === 'curation') {
        // ── 비교/큐레이션: 다중 아이템을 하나의 요청으로 묶어 호출 ──
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
            // 다중 아이템 데이터
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
          toast.success(`📝 ${resolvedArticleType === 'compare' ? '비교 분석' : '큐레이션'} 글 생성이 시작되었습니다!`, {
            duration: 4000
          });
          // 스케줄 등록 시 스케줄 페이지로, 즉시 발행 시 글 상세 페이지로 이동
          if (params.actionType === 'SCHEDULE') {
            router.push('/schedule');
          } else {
            router.push(`/research/${leadProduct.productId}?projectId=${newProjectId}`);
          }
        } else {
          toast.error('글 생성 요청에 실패했습니다.');
          setIsResearching(false);
        }
      } else {
        // ── 개별 발행: 기존 방식 (병렬 호출) ──
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

          toast.success(`📝 ${successCount}개 상품 글 생성이 시작되었습니다!\n완료 시 알림을 보내드리겠습니다.`, {
            duration: 4000
          });

          if (params.actionType === 'SCHEDULE') {
            // 스케줄 등록 시 스케줄 페이지로 이동
            router.push('/schedule');
          } else if (uniqueSelectedProducts.length === 1) {
            router.push(`/research/${firstProduct.productId}?projectId=${newProjectId}`);
          } else {
            router.push('/research');
          }
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

  const renderProductList = (title: string, items: CoupangProductResponse[], icon: React.ReactNode) => {
    if (!items || !items.length) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          {icon}
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {items.map((product, idx) => {
            const isSelected = selectedProductIds.has(product.productId);
            return (
              <GlassCard
                key={`default-${product.productId}-${idx}`}
                onClick={() => toggleSelection(product.productId)}
                className={cn(
                  "flex-none w-44 p-0 overflow-hidden flex flex-col cursor-pointer transition-all duration-200",
                  isSelected ?
                  "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-blue-500/10 ring-2 ring-blue-500 ring-inset" :
                  "hover:border-blue-500/40 border-transparent bg-white/5"
                )}>
                
                <div className="relative w-full aspect-square bg-white/5">
                  {isSelected ?
                  <div className="absolute top-2 right-2 z-10">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                    </div> : null
                  }
                  {product.productImage ?
                  <Image
                    src={product.productImage}
                    alt={product.productName}
                    fill
                    sizes="176px"
                    className="object-cover"
                    unoptimized /> :


                  <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-700" />
                    </div>
                  }
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isRocket ?
                    <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/90 text-black rounded-full font-semibold">
                        🚀 로켓
                      </span> : null
                    }
                    {(product.isFreeShipping ? !product.isRocket : null) ?
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-600/90 text-white rounded-full font-semibold">
                        무배
                      </span> : null
                    }
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-1.5 flex-1 max-h-24">
                  <p className="text-white text-xs font-medium leading-snug line-clamp-2">
                    {product.productName}
                  </p>
                  <p className="text-blue-400 font-bold text-sm mt-auto">
                    {product.productPrice.toLocaleString()}원
                  </p>
                </div>
              </GlassCard>);

          })}
        </div>
      </div>);

  };

  const hasResults = results.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-8 pb-32 relative">
      {/* ── 로딩 오버레이 ── */}
      {/* ── 폴링 상태 표시 (하단 토스트로 대체, 전체화면 차단 제거) ── */}
      {isPolling ?
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5">
          <GlassCard className="p-4 flex items-center gap-3 border-blue-500/30 bg-gray-900/95 backdrop-blur-xl shadow-2xl max-w-sm">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-white text-sm font-medium">AI가 글을 작성 중...</span>
              <span className="text-xs text-slate-400">완료 시 알림을 보내드립니다</span>
            </div>
          </GlassCard>
        </div> : null
      }

      {/* 모드 선택 탭 */}
      <div className="flex flex-wrap justify-center p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-fit mx-auto gap-1">
        {(["keyword", "link", "category", "pl_brand"] as const).map((m) =>
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
          
            {m === "keyword" ? "키워드 검색" : null}
            {m === "link" ? "URL 변환" : null}
            {m === "category" ? "카테고리" : null}
            {m === "pl_brand" ? "PL 브랜드" : null}
          </button>
        )}
      </div>

      {/* 검색 입력 카드 */}
      <GlassCard className="p-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            {mode === "keyword" ? <Search className="w-5 h-5 text-blue-400" /> : null}
            {mode === "link" ? <LinkIcon className="w-5 h-5 text-emerald-400" /> : null}
            {mode === "category" || mode === "pl_brand" ? <Layers className="w-5 h-5 text-purple-400" /> : null}
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">
              {mode.replace('_', ' ')} Search
            </h2>
          </div>

          {mode === "link" ?
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="쿠팡 상품 URL을 입력하세요 (여러 줄 가능)"
            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" /> :

          mode === "category" ?
          <div className="relative">
              <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
              
                <option value="" disabled className="text-slate-500">카테고리를 선택하세요</option>
                {CATEGORIES.map((cat) =>
              <option key={cat.id} value={cat.id} className="text-black">
                    {cat.name}
                  </option>
              )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div> :
          mode === "pl_brand" ?
          <div className="relative">
              <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
              
                <option value="" disabled className="text-slate-500">PL 브랜드를 선택하세요</option>
                {PL_BRANDS.map((cat) =>
              <option key={cat.id} value={cat.id} className="text-black">
                    {cat.name}
                  </option>
              )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div> :

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" ? handleAction() : null}
            placeholder="티셔츠, 무선충전기 등 키워드를 입력하세요"
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />

          }

          <Button
            onClick={handleAction}
            disabled={loading || !value.trim()}
            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20">
            
            {loading ?
            <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                검색 중...
              </> :

            "상품 검색"
            }
          </Button>
        </div>
      </GlassCard>

      {/* 에러 메시지 */}
      {error ?
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-400 whitespace-pre-line">
          {error}
        </div> : null
      }

      {/* ── 필터 바 (검색 결과가 있을 때만) ── */}
      {hasResults ?
      <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span>필터 &amp; 정렬</span>
            <span className="ml-auto text-slate-500 text-xs">
              {filtered.length} / {results.length}개 표시
            </span>
          </div>

          {/* 가격 프리셋 */}
          <div className="flex flex-wrap gap-2">
            {PRICE_PRESETS.map((p, idx) =>
          <button
            key={p.label}
            onClick={() => setPricePresetIdx(idx)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
              pricePresetIdx === idx ?
              "bg-blue-600 border-blue-500 text-white" :
              "bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
            )}>
            
                {p.label}
              </button>
          )}
          </div>

          {/* 배송 필터 + 정렬 */}
          <div className="flex flex-wrap items-center gap-3">
            <button
            onClick={() => setRocketOnly((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all",
              rocketOnly ?
              "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" :
              "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
            )}>
            
              🚀 로켓배송만
              {rocketOnly ? <X className="w-3 h-3" /> : null}
            </button>

            <button
            onClick={() => setFreeShipOnly((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all",
              freeShipOnly ?
              "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
              "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
            )}>
            
              📦 무료배송만
              {freeShipOnly ? <X className="w-3 h-3" /> : null}
            </button>

            <div className="ml-auto flex items-center gap-1">
              {(["default", "price_asc", "price_desc"] as const).map((s) =>
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs border transition-all",
                sortBy === s ?
                "bg-purple-500/20 border-purple-500/50 text-purple-400" :
                "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
              )}>
              
                  {s === "default" ? "기본" : null}
                  {s === "price_asc" ? "가격 낮은순" : null}
                  {s === "price_desc" ? "가격 높은순" : null}
                </button>
            )}
            </div>
          </div>
        </div> : null
      }

      {/* ── 검색 결과 그리드 ── */}
      {(hasResults ? filtered.length === 0 : null) ?
      <p className="text-center text-slate-500 py-8 text-sm">
          해당 조건에 맞는 상품이 없습니다. 필터를 조정해보세요.
        </p> : null
      }

      {filtered.length > 0 ?
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, idx) => {
          const isSelected = selectedProductIds.has(product.productId);

          return (
            <GlassCard
              key={`${product.productId}-${idx}`}
              onClick={() => toggleSelection(product.productId)}
              className={cn(
                "p-0 overflow-hidden flex flex-col cursor-pointer transition-all duration-200",
                isSelected ?
                "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-blue-500/10 ring-2 ring-blue-500 ring-inset" :
                "hover:border-blue-500/40"
              )}>
              
                {/* 상품 이미지 */}
                <div className="relative w-full aspect-square bg-white/5">
                  {isSelected ?
                <div className="absolute top-2 right-2 z-10">
                      <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                    </div> : null
                }
                  {product.productImage ?
                <Image
                  src={product.productImage}
                  alt={product.productName}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized /> :


                <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-12 h-12 text-slate-700" />
                  </div>
                }
                {/* 배지 */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isRocket ?
                  <span className="text-[10px] px-2 py-0.5 bg-yellow-500/90 text-black rounded-full font-semibold">
                      🚀 로켓
                    </span> : null
                  }
                  {(product.isFreeShipping ? !product.isRocket : null) ?
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-600/90 text-white rounded-full font-semibold">
                      무료배송
                    </span> : null
                  }
                </div>
              </div>

              {/* 상품 정보 */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                  {product.productName}
                </p>
                <p className="text-blue-400 font-bold text-lg mt-auto">
                  {product.productPrice.toLocaleString()}원
                </p>
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-400 transition-colors">
                  
                   쿠팡에서 보기 <ExternalLink className="w-3 h-3" />
                 </a>
               </div>
             </GlassCard>);

        })}
        </div> : null
      }

      {/* 추천 상품 및 도움말 (검색 결과 없을 때) */}
      {(!hasResults ? !error : null) ?
      <div className="space-y-12">
          {/* 오늘의 골드박스 특가 */}
          {isDefaultLoading ?
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p>추천 상품을 불러오는 중입니다...</p>
            </div> :

        <>
              {renderProductList(
            "오늘의 골드박스 특가",
            defaultGoldbox,
            <Package className="w-6 h-6 text-yellow-400" />
          )}
              {renderProductList(
            "쿠팡 전문 브랜드(PL) 인기상품",
            defaultPlAll,
            <Layers className="w-6 h-6 text-purple-400" />
          )}
            </>
        }

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
          { label: "키워드", desc: "인기 키워드로 상품 자동 매칭" },
          { label: "URL", desc: "직접 입력한 상품 딥링크 변환" },
          { label: "BEST", desc: "카테고리별 실시간 수익 최적화" }].
          map((item, idx) =>
          <GlassCard key={idx} className="p-4 text-center border-none bg-white/[0.02]">
                <h4 className="text-sm font-bold text-slate-300 mb-1">{item.label}</h4>
                <p className="text-[10px] text-slate-500">{item.desc}</p>
              </GlassCard>
          )}
          </div>
        </div> : null
      }

      {/* ── 선택 상품 액션 (Sticky) + 장바구니 미리보기 ── */}
      {selectedProductIds.size > 0 ?
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
          <div className="max-w-3xl mx-auto">
            <GlassCard className="p-4 border-blue-500/30 bg-gray-900/95 backdrop-blur-xl shadow-2xl space-y-3">
              {/* 상단: 선택 상품 썸네일 미리보기 (장바구니 바) */}
              <SelectedProductList
                products={Array.from(selectedProductMap.values())}
                onRemove={toggleSelection}
                onClearAll={() => setSelectedProductMap(new Map())}
                className="p-0 border-none bg-transparent shadow-none backdrop-blur-none"
              />

              {/* 하단: 액션 버튼 */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <Button
                onClick={() => setIsModalOpen(true)}
                disabled={isResearching}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20">
                
                  {isResearching ?
                <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      처리 중...
                    </> :

                "SEO 글 작성 설정"
                }
                </Button>
              </div>
            </GlassCard>
          </div>
        </div> : null
      }

      {/* ── SEO 설정 옵션 모달 ── */}
      <WriteActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${selectedProductIds.size}개 상품`}
        selectedItems={Array.from(selectedProductMap.values())}
        onExecute={handleStartResearch} />
      
    </div>);

};