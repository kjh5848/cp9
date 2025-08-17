'use client';

import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { FadeInSection, ScaleOnHover } from '@/shared/components/advanced-ui';
import { useProductUIStore } from '../store/useProductUIStore';
import { 
  useKeywordSearch,
  useCategorySearch,
  useDeeplinkConversion,
  useProductUIState
} from '@/features/product/hooks';
import ProductCategorySearchForm from './ProductCategorySearchForm';
import ProductKeywordSearchForm from './ProductKeywordSearchForm';
import ProductLinkSearchForm from './ProductLinkSearchForm';
import ProductResultView from './ProductResultView';
import ProductHistoryView from './ProductHistoryView';
import { Link, Search, Package, Filter, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { ProductItem } from '../types';

export default function ProductClientPage() {


  // 새로운 UI 상태 관리
  const {
    mode,
    setMode,
    itemCount,
    setItemCount,
    keywordInput,
    setKeywordInput,
    links,
    setLinks,
    rocketOnly,
    setRocketOnly,
    sortOrder,
    setSortOrder,
  } = useProductUIStore();

  // 선택 상태 관리 (로컬 상태로 변경)
  const [selected, setSelected] = useState<ProductItem[]>([]);

  // 기존 useProductUIState에서 필요한 것들
  const {
    viewType,
    setViewType,
    priceSort,
    handlePriceSortChange,
  } = useProductUIState();

  const {
    keywordResults,
    handleKeywordSearch: keywordSearchHandler,
    loading: keywordLoading,
  } = useKeywordSearch();

  const {
    categoryResults,
    handleCategorySearch: categorySearchHandler,
    loading: categoryLoading,
  } = useCategorySearch();

  const {
    linkResults,
    handleLinkSubmit: linkSubmitHandler,
    loading: linkLoading,
  } = useDeeplinkConversion();

  // 전체 로딩 상태 (모든 hooks의 loading 상태 통합)
  const loading = keywordLoading || categoryLoading || linkLoading;

  // 모드별 결과 선택
  let currentResults: ProductItem[] = [];
  if (mode === 'link') currentResults = linkResults as unknown as ProductItem[]; // TODO: 타입 변환 로직 구현 필요
  else if (mode === 'keyword') currentResults = keywordResults;
  else if (mode === 'category') currentResults = categoryResults;

  // getFilteredResults에서 currentResults를 사용하고 항상 배열을 반환하도록 보장
  const getFilteredResults = (): ProductItem[] => {
    // 타입 안전성 보장: currentResults가 배열이 아니면 빈 배열 반환
    if (!Array.isArray(currentResults)) {
      console.warn('currentResults is not an array:', currentResults);
      return [];
    }

    let base = currentResults;
    if (rocketOnly) {
      base = base.filter((item) => item.isRocket || (item as any).rocketShipping); // TODO: 타입 정의 수정 필요
    }
    // 카테고리 모드에서는 가격 필터링을 ProductCategorySearchForm에서 처리
    // 여기서는 로켓배송 필터만 적용
    // 가격 정렬
    if (priceSort === 'asc') {
      base = [...base].sort((a, b) => (a.productPrice ?? (a as any).price ?? 0) - (b.productPrice ?? (b as any).price ?? 0));
    } else if (priceSort === 'desc') {
      base = [...base].sort((a, b) => (b.productPrice ?? (b as any).price ?? 0) - (a.productPrice ?? (a as any).price ?? 0));
    }
    return base;
  };

  const filteredResults = getFilteredResults();

  // 전체 선택 기능
  const allChecked = filteredResults.length > 0 && selected.length === filteredResults.length;
  const handleSelectAll = () => {
    if (allChecked) {
      setSelected([]);
    } else {
      setSelected(filteredResults);
    }
  };

  // 검색 핸들러들 (히스토리 기능 제거)
  const handleKeywordSearch = async () => {
    await keywordSearchHandler(keywordInput, itemCount);
  };

  const handleCategorySearch = async (options: {
    categoryId: string;
    imageSize: number;
    bestLimit: number;
    priceRange: [number, number];
  }) => {
    await categorySearchHandler(options);
  };

  const handleLinkSubmit = async () => {
    await linkSubmitHandler(links);
  };

  const handleEnter = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void
  ) => {
    if (e.key === "Enter") action();
  };


  const handleModeChangeWithReset = (newMode: "link" | "keyword" | "category") => {
    setMode(newMode);
    setSelected([]);
  };

  // 렌더링 시 currentResults만 사용

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <FadeInSection>
          <div className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              쿠팡 파트너스 상품 검색
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
              딥링크 변환, 키워드 검색, 카테고리별 베스트 상품을 찾아보세요
            </p>
          </div>
        </FadeInSection>

        <div className="flex flex-col gap-8 lg:flex-row">
          <FadeInSection delay={200} className="flex-1">
            <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm">
              <div className="p-6">
                {/* Mode Selection */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <ScaleOnHover scale={1.02}>
                    <Button
                      variant={mode === "link" ? "default" : "outline"}
                      onClick={() => handleModeChangeWithReset("link")}
                      className={`flex items-center gap-2 ${
                        mode === "link" 
                          ? "bg-blue-600 text-white" 
                          : "border-gray-700 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <Link className="w-4 h-4" />
                      딥링크 변환
                    </Button>
                  </ScaleOnHover>
                  
                  <ScaleOnHover scale={1.02}>
                    <Button
                      variant={mode === "keyword" ? "default" : "outline"}
                      onClick={() => handleModeChangeWithReset("keyword")}
                      className={`flex items-center gap-2 ${
                        mode === "keyword" 
                          ? "bg-blue-600 text-white" 
                          : "border-gray-700 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <Search className="w-4 h-4" />
                      키워드 검색
                    </Button>
                  </ScaleOnHover>
                  
                  <ScaleOnHover scale={1.02}>
                    <Button
                      variant={mode === "category" ? "default" : "outline"}
                      onClick={() => handleModeChangeWithReset("category")}
                      className={`flex items-center gap-2 ${
                        mode === "category" 
                          ? "bg-blue-600 text-white" 
                          : "border-gray-700 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      카테고리 검색
                    </Button>
                  </ScaleOnHover>
                </div>

                {/* Search Forms */}
                <div className="mb-6">
                  {mode === "category" && (
                    <ProductCategorySearchForm
                      loading={loading}
                      onSearch={handleCategorySearch}
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
                </div>

                {/* Filters & Controls */}
                <div className="border-t border-gray-800 pt-6">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-white">필터</span>
                    </div>
                    
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rocketOnly}
                        onChange={(e) => setRocketOnly(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                      />
                      로켓배송만 보기
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={handleSelectAll}
                        className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                      />
                      전체선택
                    </label>

                    <ScaleOnHover scale={1.05}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRocketOnly(false);
                        }}
                        className="flex items-center gap-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <RotateCcw className="w-3 h-3" />
                        필터 초기화
                      </Button>
                    </ScaleOnHover>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <label className="text-sm font-medium text-white">가격 정렬</label>
                    <select 
                      value={priceSort} 
                      onChange={e => handlePriceSortChange(e.target.value as any)} 
                      className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">기본순</option>
                      <option value="desc">높은 가격순</option>
                      <option value="asc">낮은 가격순</option>
                    </select>
                  </div>
                </div>

                <ProductResultView
                  loading={loading}
                  viewType={viewType}
                  setViewType={setViewType}
                  filteredResults={filteredResults}
                  // handleDeeplinkConvert={handleDeeplinkConvert}
                  mode={mode === "link" ? "deeplink" : "product"}
                />
              </div>
            </Card>
          </FadeInSection>

          {/* <FadeInSection delay={400} className="lg:w-80">
            <ProductHistoryView />
          </FadeInSection> */}
        </div>
      </div>
    </div>
  );
} 