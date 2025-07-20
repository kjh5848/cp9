'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { PricePreset, useSearchStore } from '@/store/searchStore';

interface ProductCategorySearchFormProps {
  loading: boolean;
  handleCategorySearch: () => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  imageWidth: number;
  setImageWidth: (value: number) => void;
  imageHeight: number;
  setImageHeight: (value: number) => void;
  imageRatio: string;
  setImageRatio: (value: string) => void;
  bestLimit: number;
  setBestLimit: (value: number) => void;
  priceMin: number;
  setPriceMin: (value: number) => void;
  priceMax: number;
  setPriceMax: (value: number) => void;
}

const imageSizeOptions = [256, 512, 768, 1024];

export default function ProductCategorySearchForm({
  loading,
  handleCategorySearch,
  categoryId,
  setCategoryId,
  imageWidth,
  setImageWidth,
  imageHeight,
  setImageHeight,
  imageRatio,
  setImageRatio,
  bestLimit,
  setBestLimit,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
}: ProductCategorySearchFormProps) {
  const { pricePresets, addPricePreset, removePricePreset } = useSearchStore();
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [newMin, setNewMin] = useState(0);
  const [newMax, setNewMax] = useState(0);

  return (
    <>
      <div className="flex items-center gap-4 border-b pb-3 mb-3">
        <label className="w-20 text-sm font-medium">카테고리</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-48 rounded border px-2 py-1"
        >
          <option value="">카테고리 선택</option>
          <option value="1001">여성패션</option>
          <option value="1002">남성패션</option>
          <option value="1010">뷰티</option>
          <option value="1011">출산/유아동</option>
          <option value="1012">식품</option>
          <option value="1013">주방용품</option>
          <option value="1014">생활용품</option>
          <option value="1015">홈인테리어</option>
          <option value="1016">가전디지털</option>
          <option value="1017">스포츠/레저</option>
          <option value="1018">자동차용품</option>
          <option value="1019">도서/음반/DVD</option>
          <option value="1020">완구/취미</option>
          <option value="1021">문구/오피스</option>
          <option value="1024">헬스/건강식품</option>
          <option value="1025">국내여행</option>
          <option value="1026">해외여행</option>
          <option value="1029">반려동물용품</option>
          <option value="1030">유아동패션</option>
        </select>
      </div>
      <div className="flex items-center gap-4 border-b pb-3 mb-3">
        <label className="w-20 text-sm font-medium">이미지</label>
        <span className="text-xs">가로</span>
        <select
          value={imageWidth}
          onChange={(e) => setImageWidth(Number(e.target.value))}
          className="w-20 rounded border px-2 py-1"
        >
          {imageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs">세로</span>
        <select
          value={imageHeight}
          onChange={(e) => setImageHeight(Number(e.target.value))}
          className="w-20 rounded border px-2 py-1"
        >
          {imageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs">비율</span>
        <select
          value={imageRatio}
          onChange={(e) => setImageRatio(e.target.value)}
          className="w-20 rounded border px-2 py-1"
        >
          <option value="1:1">1:1</option>
          <option value="4:3">4:3</option>
          <option value="3:4">3:4</option>
          <option value="16:9">16:9</option>
          <option value="9:16">9:16</option>
        </select>
      </div>
      <div className="flex items-center gap-4 border-b pb-3 mb-3">
        <label className="w-20 text-sm font-medium">개수</label>
        <input
          type="number"
          min={1}
          max={100}
          placeholder="limit"
          value={bestLimit}
          onChange={(e) => setBestLimit(Number(e.target.value))}
          className="w-24 rounded border px-2 py-1"
        />
        <span className="text-xs text-gray-500">최대 100개까지 가능</span>
      </div>
      <div className="flex items-center gap-4">
        <label className="w-20 text-sm font-medium">가격</label>
        <input
          type="number"
          min={0}
          value={priceMin}
          onChange={(e) => setPriceMin(Number(e.target.value))}
          className="w-24 rounded border px-2 py-1"
        />
        <span className="mx-1">~</span>
        <input
          type="number"
          min={0}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-24 rounded border px-2 py-1"
        />
      </div>
      {/* 프리셋 리스트 + 추가 버튼 */}
      <div className="flex flex-wrap gap-1 my-2 items-center">
        {pricePresets.map((preset, idx) => (
          <div key={preset.label} className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPriceMin(preset.min);
                setPriceMax(preset.max);
              }}
              className="whitespace-nowrap"
            >
              {preset.label}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removePricePreset(idx)}
            >
              ❌
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowPresetForm((v) => !v)}
        >
          프리셋 추가
        </Button>
      </div>

      {/* 프리셋 추가 입력폼 (토글) */}
      {showPresetForm && (
        <div className="flex gap-2 my-2 items-center">
          <label className="w-20 text-sm font-medium">가격 프리셋</label>
          <input
            type="number"
            placeholder="최소"
            value={newMin}
            onChange={(e) => setNewMin(Number(e.target.value))}
            className="border px-2 py-1 rounded w-30"
          />
          <span className="text-xs">~</span>
          <input
            type="number"
            placeholder="최대"
            value={newMax}
            onChange={(e) => setNewMax(Number(e.target.value))}
            className="border px-2 py-1 rounded w-30"
          />
          <Button
            size="sm"
            onClick={() => {
              if (newMin >= 0 && newMax > newMin) {
                addPricePreset({
                  label: `${newMin.toLocaleString()}~${newMax.toLocaleString()}원`,
                  min: newMin,
                  max: newMax,
                });
                setNewMin(0);
                setNewMax(0);
                setShowPresetForm(false);
              }
            }}
          >
            추가
          </Button>
        </div>
      )}

      <Button
        className="mt-4 w-full"
        onClick={handleCategorySearch}
        disabled={loading}
      >
        카테고리 상품 검색
      </Button>
    </>
  );
} 