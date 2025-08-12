'use client';

import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { useSearchStore } from '@/store/searchStore';
import { ProductItem, DeepLinkResponse, ViewType } from '../types';
import { useProductActions } from '../hooks/useProductActions';
import { isProductItem, isDeepLinkResponse, generateItemId } from '../utils/product-helpers';
import ActionModal from './ActionModal';
import SeoLoadingOverlay from './SeoLoadingOverlay';
import SelectedItemDetail from './SelectedItemDetail';

interface ProductResultViewProps {
  loading: boolean;
  viewType: ViewType;
  setViewType: (value: ViewType) => void;
  filteredResults: (ProductItem | DeepLinkResponse)[];
  mode?: 'product' | 'deeplink';
}

const cardClass =
  "relative flex flex-col rounded-lg border p-4 hover:bg-gray-50 cursor-pointer transition-colors";
const cardSelected = "border-blue-500 bg-blue-50";

/**
 * 상품 검색 결과를 표시하는 컴포넌트
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

  // 선택된 첫 번째 아이템 찾기
  const getSelectedItem = () => {
    if (selected.length === 0) {
      console.log('🔍 getSelectedItem: 선택된 아이템 없음');
      return null;
    }
    const selectedId = selected[0];
    console.log('🔍 getSelectedItem: 선택된 ID:', selectedId);
    console.log('🔍 getSelectedItem: 전체 선택 목록:', selected);
    
    // ID에서 인덱스 추출 (itemId 형식: "product-{index}" 또는 "deeplink-{index}")
    const indexMatch = selectedId.match(/-(.+)$/);
    if (!indexMatch) {
      console.log('🔍 getSelectedItem: ID 패턴 매치 실패');
      return null;
    }
    
    const index = parseInt(indexMatch[1]);
    console.log('🔍 getSelectedItem: 추출된 인덱스:', index);
    console.log('🔍 getSelectedItem: 결과 배열 길이:', filteredResults.length);
    
    if (isNaN(index) || index >= filteredResults.length) {
      console.log('🔍 getSelectedItem: 인덱스 범위 초과');
      return null;
    }
    
    const foundItem = filteredResults[index] || null;
    console.log('🔍 getSelectedItem: 찾은 아이템:', foundItem);
    return foundItem;
  };

  // 복사 아이콘 SVG 컴포넌트
  const CopyIcon = () => (
    <svg 
      className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="mt-6">
      {/* 데스크톱: 7:3 레이아웃, 모바일: 스택 레이아웃 */}
      <div className="lg:grid lg:grid-cols-10 lg:gap-6">
        {/* 왼쪽: 상품 목록 (7) */}
        <div className="lg:col-span-7 flex flex-col h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="font-bold">
              {mode === 'deeplink' ? '딥링크 변환 결과' : '딥링크/상품 결과'}{" "}
              <span className="text-sm text-gray-500 font-normal">
                ({Array.isArray(filteredResults) ? filteredResults.length : 0})
              </span>
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewType === "grid" ? "default" : "outline"}
                onClick={() => setViewType("grid")}
              >
                그리드
              </Button>
              <Button
                size="sm"
                variant={viewType === "list" ? "default" : "outline"}
                onClick={() => setViewType("list")}
              >
                리스트
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex h-48 w-full items-center justify-center">
              로딩 중...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <ul
                className={`${viewType === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
                    : "flex flex-col gap-2"
                  } w-full pb-4`}
              >
                {Array.isArray(filteredResults) && filteredResults.map((item, i) => {
                  // 아이템 ID 생성
                  const itemId = generateItemId(item, i);

                  return (
                    <li
                      key={i}
                      className={`${cardClass} ${
                        selected.includes(itemId)
                          ? cardSelected
                          : ""
                        }`}
                      onClick={() => handleSelect(itemId)}
                    >
                      {/* 딥링크 모드일 때는 상품 정보 숨기기 */}
                      {mode !== 'deeplink' && (
                        <>
                          {isProductItem(item) && item.isRocket && (
                            <span className="absolute right-2 top-2 rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                              로켓
                            </span>
                          )}
                          {isProductItem(item) && item.productImage && (
                            <div className="relative mx-auto mb-2 h-24 w-24">
                              <Image
                                src={item.productImage}
                                alt={item.productName || '상품 이미지'}
                                fill
                                className="object-cover rounded"
                                sizes="96px"
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
                          <span className="pr-10 font-bold line-clamp-2">
                            딥링크 #{i + 1}
                          </span>
                        ) : (
                          <span className="pr-10 font-bold line-clamp-2">
                            {isProductItem(item) 
                              ? item.productName 
                              : isDeepLinkResponse(item)
                              ? '딥링크 변환 결과'
                              : '알 수 없는 아이템'
                            }
                          </span>
                        )}

                        <div className="border-t"></div>
                        
                        {/* 딥링크 모드가 아닐 때만 상품 정보 표시 */}
                        {mode !== 'deeplink' && (
                          <>
                            {isProductItem(item) && (
                              <div className="text-sm text-gray-500">
                                가격:{" "}
                                <span className="font-semibold text-gray-800">
                                  {item.productPrice.toLocaleString()}원
                                </span>
                              </div>
                            )}
                            <div className="border-t"></div>
                            {isProductItem(item) && (
                              <div className="text-xs text-gray-500">
                                카테고리: {item.categoryName}
                              </div>
                            )}
                            <div className="border-t"></div>
                          </>
                        )}

                        {/* 링크 표시 - 딥링크 모드에서는 복사 아이콘 추가 */}
                        {mode === 'deeplink' && isDeepLinkResponse(item) ? (
                          // 딥링크 모드: 3개 링크만 깔끔하게 표시
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-blue-600 font-medium mb-1">원본 URL:</div>
                                <a
                                  href={item.originalUrl}
                                  className="text-sm text-blue-600 hover:underline truncate block"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.originalUrl}
                                </a>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyToClipboard(item.originalUrl || '', '원본 URL');
                                }}
                                className="ml-2 p-1 hover:bg-gray-100 rounded"
                              >
                                <CopyIcon />
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-green-600 font-medium mb-1">단축 URL:</div>
                                <a
                                  href={item.shortenUrl}
                                  className="text-sm text-green-600 hover:underline truncate block"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.shortenUrl}
                                </a>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyToClipboard(item.shortenUrl || '', '단축 URL');
                                }}
                                className="ml-2 p-1 hover:bg-gray-100 rounded"
                              >
                                <CopyIcon />
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-purple-600 font-medium mb-1">랜딩 URL:</div>
                                <a
                                  href={item.landingUrl}
                                  className="text-sm text-purple-600 hover:underline truncate block"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.landingUrl}
                                </a>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyToClipboard(item.landingUrl || '', '랜딩 URL');
                                }}
                                className="ml-2 p-1 hover:bg-gray-100 rounded"
                              >
                                <CopyIcon />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // 기존 모드: 기존 방식대로 표시
                          <>
                            <div className="truncate text-xs text-blue-600">
                              {isProductItem(item) ? '링크: ' : '원본 URL: '}
                              <a
                                href={isProductItem(item) ? item.productUrl : isDeepLinkResponse(item) ? item.originalUrl : '#'}
                                className="hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {isProductItem(item) ? item.productUrl : isDeepLinkResponse(item) ? item.originalUrl : '#'}
                              </a>
                            </div>
                            {isDeepLinkResponse(item) && (
                              <>
                                <div className="border-t"></div>
                                <div className="truncate text-xs text-green-600">
                                  단축 URL:{" "}
                                  <a
                                    href={item.shortenUrl}
                                    className="hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {item.shortenUrl}
                                  </a>
                                </div>
                                <div className="border-t"></div>
                                <div className="truncate text-xs text-purple-600">
                                  랜딩 URL:{" "}
                                  <a
                                    href={item.landingUrl}
                                    className="hover:underline"
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
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* 오른쪽: 선택된 아이템 정보 (3) - 데스크톱만 */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-4">
            <SelectedItemDetail
              item={getSelectedItem()}
              onActionButtonClick={handleActionButtonClick}
              selectedCount={selected.length}
              mode={mode}
            />
          </div>
        </div>
      </div>

      {/* 모바일에서만 표시되는 액션 버튼 */}
      {Array.isArray(filteredResults) && filteredResults.length > 0 && (
        <div className="mt-4 flex justify-center lg:hidden">
          <Button 
            onClick={handleActionButtonClick} 
            disabled={loading || selected.length === 0}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            선택된 상품 액션 ({selected.length}개)
          </Button>
        </div>
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