'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSearchStore } from '@/store/searchStore';
import { useProductFilter } from '@/hooks/useProductFilter';
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
  const [viewType, setViewType] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("viewType") as "grid" | "list") || "grid";
    }
    return "grid";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("viewType", viewType);
    }
  }, [viewType]);

  const [rocketOnly, setRocketOnly] = useState(false);
  const [step, setStep] = useState<"search" | "deeplink">("search");
  const [categoryId, setCategoryId] = useState("1002");
  const [imageWidth, setImageWidth] = useState(512);
  const [imageHeight, setImageHeight] = useState(512);
  const [imageRatio, setImageRatio] = useState("1:1");
  const [bestLimit, setBestLimit] = useState(20);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000000);

  const getFilteredResults = () => {
    let base = deeplinkResult;
    if (rocketOnly) {
      base = base.filter((item) => item.isRocket || item.rocketShipping);
    }
    if (mode === "category") {
      base = base.filter((item) => {
        const price = item.productPrice ?? item.price ?? 0;
        return price >= priceMin && price <= priceMax;
      });
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

  const handleCategorySearch = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const imageSize = `${imageWidth}x${imageHeight}`;
      const res = await fetch("/api/products/bestcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, limit: bestLimit, imageSize }),
      });
      if (!res.ok) throw new Error(await res.text());
      const products = await res.json();
      setDeeplinkResult(products);
      setStep("deeplink");
      // 카테고리 검색도 이력에 저장
      if (Array.isArray(products) && products.length > 0) {
        addHistory(products[0].categoryName || categoryId, products);
      } else {
        addHistory(categoryId, products);
      }
    } catch (e) {
      alert(
        "카테고리 상품 검색 실패: " + (e instanceof Error ? e.message : "")
      );
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

  const handleLinkSubmit = async () => {
    setLoading(true);
    const urls = links
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 20);
    const items = urls.map((url) => ({
      title: url,
      image: "",
      price: 0,
      url,
      productId: url,
      deepLink: url + "?deeplink=1",
      rocketShipping: false,
    }));
    setTimeout(() => {
      setDeeplinkResult(items);
      setLoading(false);
      setStep("deeplink");
      safeAddHistory(links, items);
    }, 500);
  };

  const handleKeywordSearch = async () => {
    setLoading(true);
    setDeeplinkResult([]);
    try {
      const res = await fetch("/api/products/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      setDeeplinkResult(Array.isArray(data) ? data.slice(0, itemCount) : []);
      setStep("deeplink");
      safeAddHistory(
        keyword,
        Array.isArray(data) ? data.slice(0, itemCount) : []
      );
    } finally {
      setLoading(false);
    }
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
            keyword={keyword}
            setKeyword={setKeyword}
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