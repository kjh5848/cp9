'use client';

import { Button } from '@/features/components/ui/button';
import { Input } from '@/features/components/ui/input';
import { Label } from '@/features/components/ui/label';
import { ScaleOnHover } from '@/features/components/ui/animated-sections';
import { PricePreset, useProductPresetStore } from '../store';
import { 
  usePriceRange, 
  usePricePreset, 
  useSearchOptions
} from '../hooks';
import { useItemCountForm } from '../hooks/useItemCountForm';
import { 
  COUPANG_CATEGORIES, 
  IMAGE_SIZE_OPTIONS 
} from '../utils';

interface ProductCategorySearchFormProps {
  loading: boolean;
  onSearch: (options: {
    categoryId: string;
    imageSize: number;
    bestLimit: number;
    priceRange: [number, number];
  }) => void;
}

/**
 * 카테고리 상품 검색 폼 컴포넌트
 * 
 * @param loading - 로딩 상태
 * @param onSearch - 검색 실행 콜백 함수
 * @returns JSX.Element
 * 
 * @example
 * ```tsx
 * <ProductCategorySearchForm
 *   loading={false}
 *   onSearch={(options) => handleCategorySearch(options)}
 * />
 * ```
 */
export default function ProductCategorySearchForm({
  loading,
  onSearch,
}: ProductCategorySearchFormProps) {
  // 검색 옵션 관리 (그룹화된 상태)
  const {
    options,
    setCategoryId,
    setImageSize,
    setBestLimit,
    setPriceRange,
  } = useSearchOptions();

  // 아이템 개수 입력 검증 로직
  const { handleItemCountChange } = useItemCountForm(setBestLimit, {
    min: 1,
    max: 100,
    alertMessage: '최대 100개까지만 검색할 수 있습니다.'
  });

  // 가격 범위 관리 (단일 근원 원칙)
  const {
    displayRange,
    updateFromDisplay,
    reset: resetPrice,
  } = usePriceRange(options.priceRange);

  // 프리셋 관리
  const {
    showForm,
    displayPreset,
    isValid,
    toggleForm,
    updateFromDisplay: updatePresetFromDisplay,
    resetForm,
    generateLabel,
  } = usePricePreset();

  

  // 전역 프리셋 관리
  const { pricePresets, addPricePreset, removePricePreset } = useProductPresetStore();

  // 검색 실행
  const handleCategorySearch = () => {
    onSearch({
      categoryId: options.categoryId,
      imageSize: options.imageSize,
      bestLimit: options.bestLimit,
      priceRange: options.priceRange,
    });
  };

  // 프리셋 적용
  const applyPreset = (preset: PricePreset) => {
    setPriceRange([preset.min, preset.max]);
  };

  // 새 프리셋 추가
  const handleAddPreset = () => {
    if (isValid) {
      addPricePreset({
        label: generateLabel(),
        min: displayPreset.min ? parseInt(displayPreset.min.replace(/,/g, '')) : 0,
        max: displayPreset.max ? parseInt(displayPreset.max.replace(/,/g, '')) : 0,
      });
      resetForm();
    }
  };

  return (
    <>
      {/* 카테고리 선택 */}
      <div className="flex items-center gap-4 border-b border-gray-700 pb-3 mb-3">
        <label className="w-20 text-sm font-medium text-white">카테고리</label>
        <select
          value={options.categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-48 rounded border border-gray-600 bg-gray-800 text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {COUPANG_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* 이미지 크기 선택 */}
      <div className="flex items-center gap-4 border-b border-gray-700 pb-3 mb-3">
        <label className="w-20 text-sm font-medium text-white">이미지 크기</label>
        <span className="text-xs text-gray-300">크기</span>
        <select
          value={options.imageSize}
          onChange={(e) => setImageSize(Number(e.target.value))}
          className="w-20 rounded border border-gray-600 bg-gray-800 text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {IMAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-400">px (1:1 비율 고정)</span>
      </div>

      {/* 베스트 상품 개수 */}
      <div className="flex items-center gap-4 border-b border-gray-700 pb-3 mb-3">
        <Label htmlFor="bestLimit" className="w-20 text-sm font-medium text-white">
          개수
        </Label>
        <Input
          id="bestLimit"
          type="number"
          min={1}
          max={100}
          placeholder="limit"
          value={options.bestLimit}
          onChange={handleItemCountChange}
          className="w-24 bg-gray-800 border-gray-600 text-white focus:ring-blue-500"
        />
        <span className="text-xs text-gray-400">최대 100개까지 가능</span>
      </div>

      {/* 가격 범위 */}
      <div className="flex items-center gap-4">
        <label className="w-20 text-sm font-medium text-white">가격</label>
        <input
          type="text"
          value={displayRange.min}
          onChange={(e) => updateFromDisplay('min', e.target.value)}
          className="w-24 rounded border border-gray-600 bg-gray-800 text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
        <span className="mx-1 text-gray-300">~</span>
        <input
          type="text"
          value={displayRange.max}
          onChange={(e) => updateFromDisplay('max', e.target.value)}
          className="w-24 rounded border border-gray-600 bg-gray-800 text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="5,000,000"
        />
        <span className="text-xs text-gray-400">원</span>
        <ScaleOnHover scale={1.05}>
          <Button
            size="sm"
            variant="outline"
            onClick={resetPrice}
            className="ml-2 text-xs px-2 py-1 h-8 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            초기화
          </Button>
        </ScaleOnHover>
      </div>

      {/* 프리셋 리스트 */}
      <div className="flex flex-wrap gap-1 my-2 items-center">
        {pricePresets.map((preset, idx) => (
          <div key={preset.label} className="flex items-center gap-1">
            <ScaleOnHover scale={1.05}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyPreset(preset)}
                className="whitespace-nowrap text-xs px-2 py-1 h-7 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {preset.label}
              </Button>
            </ScaleOnHover>
            <ScaleOnHover scale={1.1}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removePricePreset(idx)}
                className="text-xs px-1 py-1 h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-gray-800"
              >
                ❌
              </Button>
            </ScaleOnHover>
          </div>
        ))}
        <ScaleOnHover scale={1.05}>
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleForm}
            className="text-xs px-2 py-1 h-7 bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            프리셋 추가
          </Button>
        </ScaleOnHover>
      </div>

      {/* 프리셋 추가 입력폼 */}
      {showForm && (
        <div className="flex gap-2 my-2 items-center">
          <label className="w-20 text-sm font-medium text-white">가격 프리셋</label>
          <input
            type="text"
            placeholder="최소"
            value={displayPreset.min}
            onChange={(e) => updatePresetFromDisplay('min', e.target.value)}
            className="border border-gray-600 bg-gray-800 text-white px-2 py-1 rounded w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-300">~</span>
          <input
            type="text"
            placeholder="최대"
            value={displayPreset.max}
            onChange={(e) => updatePresetFromDisplay('max', e.target.value)}
            className="border border-gray-600 bg-gray-800 text-white px-2 py-1 rounded w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-400">원</span>
          <ScaleOnHover scale={1.05}>
            <Button
              size="sm"
              onClick={handleAddPreset}
              disabled={!isValid}
              className="text-xs px-2 py-1 h-8 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400"
            >
              추가
            </Button>
          </ScaleOnHover>
        </div>
      )}

      {/* 검색 버튼 */}
      <ScaleOnHover scale={1.02}>
        <Button
          className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
          onClick={handleCategorySearch}
          disabled={loading}
        >
          카테고리 상품 검색
        </Button>
      </ScaleOnHover>
    </>
  );
} 