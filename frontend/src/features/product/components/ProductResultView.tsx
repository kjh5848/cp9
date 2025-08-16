'use client';

import Image from 'next/image';
import { Button, Card } from '@/shared/ui';
import { ScaleOnHover, FadeInSection, StaggeredList } from '@/shared/components/advanced-ui';
import { useSearchStore } from '../store';
import { ProductItem, DeepLinkResponse, ViewType } from '../types';
import { useProductActions } from '../hooks/useProductActions';
import { isProductItem, isDeepLinkResponse, generateItemId } from '../utils/product-helpers';
import ActionModal from './ActionModal';
import SeoLoadingOverlay from './SeoLoadingOverlay';
import { Grid, List, Copy, ExternalLink, Package, Zap, Loader2, Check, Circle } from 'lucide-react';

interface ProductResultViewProps {
  loading: boolean;
  viewType: ViewType;
  setViewType: (value: ViewType) => void;
  filteredResults: (ProductItem | DeepLinkResponse)[];
  mode?: 'product' | 'deeplink';
}

const cardClass =
  "relative flex flex-col rounded-lg border p-4 cursor-pointer transition-all duration-300 ease-out";
const cardDefault = "border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600";
const cardSelected = "border-blue-400 bg-gradient-to-br from-blue-900/40 to-blue-800/30 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/50";

// 선택 표시 인디케이터 컴포넌트
const SelectionIndicator = ({ isSelected }: { isSelected: boolean }) => (
  <div className="absolute top-3 right-3 z-10">
    {isSelected ? (
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
        <Check className="w-4 h-4 text-white" />
      </div>
    ) : (
      <div className="w-6 h-6 border-2 border-gray-400 rounded-full bg-white/10 backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity">
        <Circle className="w-5 h-5 text-transparent" />
      </div>
    )}
  </div>
);

/**
 * 상품 검색 결과를 표시하는 컴포넌트
 * @param loading - 로딩 상태
 * @param viewType - 뷰 타입 (grid | list)
 * @param setViewType - 뷰 타입 설정 함수
 * @param filteredResults - 필터링된 상품 결과
 * @param mode - 표시 모드 (product | deeplink)
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <ProductResultView
 *   loading={false}
 *   viewType="grid"
 *   setViewType={setViewType}
 *   filteredResults={products}
 *   mode="product"
 * />
 * ```
 */
export default function ProductResultView({
  loading,
  viewType,
  setViewType,
  filteredResults,
  mode = 'product',
}: ProductResultViewProps) {
  const { selected, setSelected } = useSearchStore();
  const {
    isActionModalOpen,
    isSeoLoading,
    handleCopySelectedLinks,
    handleGenerateSeo,
    handleActionButtonClick,
    closeActionModal,
    handleCopyToClipboard
  } = useProductActions(filteredResults, selected);

  const handleSelect = (id: string) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  };

  const handleCopyClick = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleCopyToClipboard(text, label);
  };
  

  const handdleUrl = (url: string) => {
    return url.length > 25 ? url.slice(0, 25) + '...' : url;
  }
  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-400" />
          <h3 className="text-base sm:text-lg font-semibold text-white">
            {mode === 'deeplink' ? '딥링크 변환 결과' : '상품 검색 결과'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs sm:text-sm rounded-full">
              {Array.isArray(filteredResults) ? filteredResults.length : 0}개
            </span>
            {selected.length > 0 && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded-full animate-pulse">
                {selected.length}개 선택됨
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <ScaleOnHover scale={1.05}>
            <Button
              size="sm"
              variant={viewType === "grid" ? "default" : "outline"}
              onClick={() => setViewType("grid")}
              className={`flex items-center gap-2 ${
                viewType === "grid" 
                  ? "bg-blue-600 text-white" 
                  : "border-gray-700 text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">그리드</span>
            </Button>
          </ScaleOnHover>
          
          <ScaleOnHover scale={1.05}>
            <Button
              size="sm"
              variant={viewType === "list" ? "default" : "outline"}
              onClick={() => setViewType("list")}
              className={`flex items-center gap-2 ${
                viewType === "list" 
                  ? "bg-blue-600 text-white" 
                  : "border-gray-700 text-gray-300 hover:bg-gray-800"
              }`}
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">리스트</span>
            </Button>
          </ScaleOnHover>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 w-full items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg">검색 중...</span>
          </div>
        </div>
      ) : (
        <StaggeredList 
          staggerDelay={100}
          className={`${viewType === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
              : "flex flex-col gap-3"
            } h-full w-full`}
        >
          {Array.isArray(filteredResults) && filteredResults.map((item, i) => {
            // 아이템 ID 생성
            const itemId = generateItemId(item, i);

            const isSelected = selected.includes(itemId);
            
            return (
              <ScaleOnHover key={i} scale={isSelected ? 1.02 : 1.01}>
                <Card
                  className={`${cardClass} ${
                    isSelected ? cardSelected : cardDefault
                  }`}
                  onClick={() => handleSelect(itemId)}
                  aria-label={`${isSelected ? '선택됨' : '선택 안됨'} - ${
                    isProductItem(item) ? item.productName : `딥링크 #${i + 1}`
                  }`}
                >
                  {/* 선택 표시 인디케이터 */}
                  <SelectionIndicator isSelected={isSelected} />
                {/* 딥링크 모드일 때는 상품 정보 숨기기 */}
                {mode !== 'deeplink' && (
                  <>
                    {isProductItem(item) && item.isRocket && (
                      <div className="absolute right-2 top-12 flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white z-10">
                        <Zap className="w-3 h-3" />
                        로켓배송
                      </div>
                    )}
                    {isProductItem(item) && item.productImage && (
                      <div className="relative mx-auto mb-2 h-32 w-32">
                        <Image
                          src={item.productImage}
                          alt={item.productName || '상품 이미지'}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="mb-2 flex flex-1 flex-col gap-2">
                  {/* 딥링크 모드일 때는 제목 간소화 */}
                  {mode === 'deeplink' ? (
                    <span className="pr-10 text-xs sm:text-sm font-bold text-white line-clamp-2">
                      딥링크 #{i + 1}
                    </span>
                  ) : (
                    <span className="pr-10 text-xs sm:text-sm md:text-base font-bold text-white line-clamp-2">
                      {isProductItem(item) 
                        ? item.productName 
                        : isDeepLinkResponse(item)
                        ? '딥링크 변환 결과'
                        : '알 수 없는 아이템'
                      }
                    </span>
                  )}

                  <div className="border-t border-gray-700 my-3"></div>
                  
                  {/* 딥링크 모드가 아닐 때만 상품 정보 표시 */}
                  {mode !== 'deeplink' && (
                    <>
                      {isProductItem(item) && (
                        <div className="text-xs sm:text-sm text-gray-300 mb-2">
                          가격:{" "}
                          <span className="font-semibold text-blue-400">
                            {item.productPrice.toLocaleString()}원
                          </span>
                        </div>
                      )}
                      {isProductItem(item) && (
                        <div className="text-xs text-gray-400 mb-3 truncate">
                          카테고리: {item.categoryName}
                        </div>
                      )}
                      <div className="border-t border-gray-700 mb-3"></div>
                    </>
                  )}

                  {/* 링크 표시 - 딥링크 모드에서는 복사 아이콘 추가 */}
                  {mode === 'deeplink' && isDeepLinkResponse(item) ? (
                    // 딥링크 모드: 3개 링크만 깔끔하게 표시
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-blue-400 font-medium mb-1">원본 URL:</div>
                          <a
                            href={item.originalUrl}
                            className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 hover:underline truncate block"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.originalUrl}
                          </a>
                        </div>
                        <button
                          onClick={(e) => handleCopyClick(item.originalUrl || '', '원본 URL', e)}
                          className="ml-2 p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-green-600 font-medium mb-1">단축 URL:</div>
                          <a
                            href={item.shortenUrl}
                            className="text-xs sm:text-sm text-green-600 hover:underline truncate block"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.shortenUrl}
                          </a>
                        </div>
                        <button
                          onClick={(e) => handleCopyClick(item.shortenUrl || '', '단축 URL', e)}
                          className="ml-2 p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-purple-600 font-medium mb-1">랜딩 URL:</div>
                          <a
                            href={item.landingUrl}
                            className="text-xs sm:text-sm text-purple-600 hover:underline truncate block"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.landingUrl}
                          </a>
                        </div>
                        <button
                          onClick={(e) => handleCopyClick(item.landingUrl || '', '랜딩 URL', e)}
                          className="ml-2 p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 기존 모드: 기존 방식대로 표시
                    <>
                      <div className="text-xs text-blue-400">
                        {isProductItem(item) ? '링크: ' : '원본 URL: '}
                        <a
                          href={isProductItem(item) ? item.productUrl : isDeepLinkResponse(item) ? item.originalUrl : '#'}
                          className="hover:underline hover:text-blue-300 break-all block mt-1"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {handdleUrl(isProductItem(item) ? item.productUrl : isDeepLinkResponse(item) ? item.originalUrl : '#')}
                        </a>
                      </div>
                      {isDeepLinkResponse(item) && (
                        <>
                          <div className="border-t border-gray-700"></div>
                          <div className="text-xs text-green-600">
                            단축 URL:{" "}
                            <a
                              href={item.shortenUrl}
                              className="hover:underline break-all block mt-1"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.shortenUrl}
                            </a>
                          </div>
                          <div className="border-t border-gray-700"></div>
                          <div className="text-xs text-purple-600">
                            랜딩 URL:{" "}
                            <a
                              href={item.landingUrl}
                              className="hover:underline break-all block mt-1"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.landingUrl}
                            </a>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
                </Card>
              </ScaleOnHover>
            );
          })}
        </StaggeredList>
      )}
      {Array.isArray(filteredResults) && filteredResults.length > 0 && (
        <FadeInSection delay={300}>
          <div className="mt-6 flex justify-center">
            <ScaleOnHover scale={1.05}>
              <Button 
                onClick={handleActionButtonClick} 
                disabled={loading || selected.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                선택된 상품 액션 ({selected.length}개)
              </Button>
            </ScaleOnHover>
          </div>
        </FadeInSection>
      )}

      {/* 액션 선택 모달 */}
      <ActionModal
        isOpen={isActionModalOpen}
        onClose={closeActionModal}
        onCopy={handleCopySelectedLinks}
        onSeo={handleGenerateSeo}
        selectedCount={selected.length}
      />

      {/* SEO 로딩 오버레이 */}
      <SeoLoadingOverlay isLoading={isSeoLoading} />
    </div>
  );
} 