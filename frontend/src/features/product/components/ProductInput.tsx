'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useSearchStore } from '@/store/searchStore';
import { useProductFilter } from '@/features/product/hooks/useProductFilter';
import ProductCategorySearchForm from './ProductCategorySearchForm';
import ProductKeywordSearchForm from './ProductKeywordSearchForm';
import ProductLinkSearchForm from './ProductLinkSearchForm';
import ProductResultView from './ProductResultView';
import ProductHistoryView from './ProductHistoryView';

export default function ProductInput() {
  const {
    selected,
    setSelected,
    addHistory,
  } = useSearchStore();

  const [mode, setMode] = useState<"link" | "keyword" | "category">("category");
  const [links, setLinks] = useState("");
  const [keyword, setKeyword] = useState("");
  const [itemCount, setItemCount] = useState(5);
  const [deeplinkResult, setDeeplinkResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewType((localStorage.getItem("viewType") as "grid" | "list") || "grid");
    }
  }, []);

  const [rocketOnly, setRocketOnly] = useState(false);
  const [step, setStep] = useState<"search" | "deeplink">("search");
  const [imageWidth, setImageWidth] = useState(512);
  const [imageHeight, setImageHeight] = useState(512);
  const [imageRatio, setImageRatio] = useState("1:1");
  const [bestLimit, setBestLimit] = useState(20);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000000);

  // 링크 입력/결과
  const [linkInput, setLinkInput] = useState('');
  const [linkResults, setLinkResults] = useState<any[]>([]);

  // 키워드 입력/결과
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordResults, setKeywordResults] = useState<any[]>([]);

  // 카테고리 입력/결과
  const [categoryId, setCategoryId] = useState('1002');
  const [categoryResults, setCategoryResults] = useState<any[]>([]);

  // 가격 정렬 상태 추가
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');

  // sortOrder로 변환하는 계산된 값 추가
  const sortOrder: 'asc' | 'desc' | null = priceSort === 'none' ? null : priceSort as 'asc' | 'desc';
  const setSortOrder = (order: 'asc' | 'desc' | null) => {
    setPriceSort(order === null ? 'none' : order);
  };

  // 모드별로 입력/결과 상태를 분리한 상태를 실제 검색/입력/결과 핸들러와 렌더링에 모두 반영한다.
  let currentResults: any[] = [];
  if (mode === 'link') currentResults = linkResults;
  else if (mode === 'keyword') currentResults = keywordResults;
  else if (mode === 'category') currentResults = categoryResults;

  // getFilteredResults에서 currentResults를 사용하고 항상 배열을 반환하도록 보장
  const getFilteredResults = (): any[] => {
    // 타입 안전성 보장: currentResults가 배열이 아니면 빈 배열 반환
    if (!Array.isArray(currentResults)) {
      console.warn('currentResults is not an array:', currentResults);
      return [];
    }

    let base = currentResults;
    if (rocketOnly) {
      base = base.filter((item) => item.isRocket || item.rocketShipping);
    }
    if (mode === "category") {
      base = base.filter((item) => {
        const price = item.productPrice ?? item.price ?? 0;
        return price >= priceMin && price <= priceMax;
      });
    }
    // 가격 정렬
    if (priceSort === 'asc') {
      base = [...base].sort((a, b) => (a.productPrice ?? a.price ?? 0) - (b.productPrice ?? b.price ?? 0));
    } else if (priceSort === 'desc') {
      base = [...base].sort((a, b) => (b.productPrice ?? b.price ?? 0) - (a.productPrice ?? a.price ?? 0));
    }
    return base;
  };

  const filteredResults = getFilteredResults();

  const { allChecked, handleSelectAll } = useProductFilter({
    deeplinkResult,
    rocketOnly,
    mode,
    priceMin,
    priceMax,
    selected,
    setSelected,
  });

  // 링크 검색 핸들러
  const handleLinkSubmit = async () => {
    setLoading(true);
    try {
      const urls = linkInput
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 20);
      const res = await fetch('/api/products/deeplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const items = await res.json();
      setLinkResults(Array.isArray(items) ? items : []);
      setStep('deeplink');
      safeAddHistory(linkInput, Array.isArray(items) ? items : []);
    } catch (e) {
      alert('딥링크 변환 실패: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setLoading(false);
    }
  };

  // 키워드 검색 핸들러
  const handleKeywordSearch = async () => {
    setLoading(true);
    setKeywordResults([]);
    try {
      const res = await fetch('/api/products/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keywordInput }),
      });
      const data = await res.json();
      setKeywordResults(Array.isArray(data) ? data.slice(0, itemCount) : []);
      setStep('deeplink');
      safeAddHistory(keywordInput, Array.isArray(data) ? data.slice(0, itemCount) : []);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 검색 핸들러
  const handleCategorySearch = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const imageSize = `${imageWidth}x${imageHeight}`;
      const res = await fetch('/api/products/bestcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, limit: bestLimit, imageSize }),
      });
      if (!res.ok) throw new Error(await res.text());
      const products = await res.json();
      setCategoryResults(Array.isArray(products) ? products : []);
      setStep('deeplink');
      if (Array.isArray(products) && products.length > 0) {
        addHistory(products[0].categoryName || categoryId, products);
      } else {
        addHistory(categoryId, Array.isArray(products) ? products : []);
      }
    } catch (e) {
      alert('카테고리 상품 검색 실패: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void
  ) => {
    if (e.key === "Enter") action();
  };

  const safeAddHistory = (keyword: string, items: any[]) => {
    if (keyword.trim()) addHistory(keyword, items);
  };

  const handleDeeplinkConvert = () => {
    setLoading(true);
    setTimeout(() => {
      setDeeplinkResult(
        deeplinkResult.map((item) =>
          selected.includes(item.productId || item.url)
            ? {
                ...item,
                deepLink: (item.url || item.originalUrl) + "?deeplink=1",
              }
            : item
        )
      );
      setLoading(false);
    }, 500);
  };

  const handleModeChange = (newMode: "link" | "keyword" | "category") => {
    setMode(newMode);
    setSelected([]);
    setStep("search");
  };

  // 렌더링 시 currentResults만 사용

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row">
      <Card className="w-full flex-1 p-6 hover:bg-white hover:bg-opacity-90 hover:shadow-md transition-colors bg-white text-[#171717]">
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "link" ? "default" : "outline"}
            onClick={() => handleModeChange("link")}
            className="bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors"
          >
            링크 직접 입력
          </Button>
          <Button
            variant={mode === "keyword" ? "default" : "outline"}
            onClick={() => handleModeChange("keyword")}
            className="bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors"
          >
            키워드 검색
          </Button>
          <Button
            variant={mode === "category" ? "default" : "outline"}
            onClick={() => handleModeChange("category")}
            className="bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors"
          >
            카테고리 검색
          </Button>
        </div>

        {mode === "category" && (
          <ProductCategorySearchForm
            loading={loading}
            handleCategorySearch={handleCategorySearch}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            imageWidth={imageWidth}
            setImageWidth={setImageWidth}
            imageHeight={imageHeight}
            setImageHeight={setImageHeight}
            imageRatio={imageRatio}
            setImageRatio={setImageRatio}
            bestLimit={bestLimit}
            setBestLimit={setBestLimit}
            priceMin={priceMin}
            setPriceMin={setPriceMin}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
          />
        )}

        {mode === "keyword" && (
          <ProductKeywordSearchForm
            loading={loading}
            keyword={keywordInput}
            setKeyword={setKeywordInput}
            itemCount={itemCount}
            setItemCount={setItemCount}
            handleKeywordSearch={handleKeywordSearch}
            handleEnter={handleEnter}
          />
        )}

        {mode === "link" && (
          <ProductLinkSearchForm
            loading={loading}
            links={links}
            setLinks={setLinks}
            handleLinkSubmit={handleLinkSubmit}
            handleEnter={handleEnter}
          />
        )}

        <div className="my-2 flex items-center gap-4">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={rocketOnly}
              onChange={(e) => setRocketOnly(e.target.checked)}
            />
            로켓배송만 보기
          </label>

          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={handleSelectAll}
            />
            전체선택
          </label>
          <Button
            size="sm"
            variant="outline"
            className="ml-2"
            onClick={() => {
              setPriceMin(0);
              setPriceMax(500000);
              setRocketOnly(false);
              // 필요시 기타 필터도 초기화
            }}
          >
            필터 초기화
          </Button>
        </div>

        {/* 가격 필터 UI 근처에 정렬 드롭다운 추가 */}
        <div className="flex items-center gap-2">
          <label className="text-sm">가격 정렬</label>
          <select value={priceSort} onChange={e => setPriceSort(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
            <option value="none">기본</option>
            <option value="desc">높은순</option>
            <option value="asc">낮은순</option>
          </select>
        </div>

        <ProductResultView
          loading={loading}
          viewType={viewType}
          setViewType={setViewType}
          filteredResults={filteredResults}
          handleDeeplinkConvert={handleDeeplinkConvert}
        />
      </Card>

      <ProductHistoryView />
    </div>
  );
} 