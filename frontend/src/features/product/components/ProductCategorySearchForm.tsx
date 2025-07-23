'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { PricePreset, useSearchStore } from '@/store/searchStore';
import { formatNumber, parseNumber } from '../utils';
import { ImageSizeOption } from '../types';

interface ProductCategorySearchFormProps {
  loading: boolean;
  handleCategorySearch: () => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  imageSize: number;
  setImageSize: (value: number) => void;
  bestLimit: number;
  setBestLimit: (value: number) => void;
  priceMin: number;
  setPriceMin: (value: number) => void;
  priceMax: number;
  setPriceMax: (value: number) => void;
}

const imageSizeOptions: ImageSizeOption[] = [256, 512, 768, 1024];

export default function ProductCategorySearchForm({
  loading,
  handleCategorySearch,
  categoryId,
  setCategoryId,
  imageSize,
  setImageSize,
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

  // 표시용 포맷된 가격 상태
  const [priceMinDisplay, setPriceMinDisplay] = useState(priceMin.toLocaleString());
  const [priceMaxDisplay, setPriceMaxDisplay] = useState(priceMax.toLocaleString());
  const [newMinDisplay, setNewMinDisplay] = useState('0');
  const [newMaxDisplay, setNewMaxDisplay] = useState('0');

  // 가격 최소값 변경 핸들러
  const handlePriceMinChange = (value: string) => {
    const formatted = formatNumber(value);
    setPriceMinDisplay(formatted);
    setPriceMin(parseNumber(value));
  };

  // 가격 최대값 변경 핸들러
  const handlePriceMaxChange = (value: string) => {
    const formatted = formatNumber(value);
    setPriceMaxDisplay(formatted);
    setPriceMax(parseNumber(value));
  };

  // 프리셋 새 최소값 변경 핸들러
  const handleNewMinChange = (value: string) => {
    const formatted = formatNumber(value);
    setNewMinDisplay(formatted);
    setNewMin(parseNumber(value));
  };

  // 프리셋 새 최대값 변경 핸들러
  const handleNewMaxChange = (value: string) => {
    const formatted = formatNumber(value);
    setNewMaxDisplay(formatted);
    setNewMax(parseNumber(value));
  };

  const resetPrice = () => {
    setPriceMin(0);
    setPriceMax(5000000);
    setPriceMinDisplay('0');
    setPriceMaxDisplay('5,000,000');
  };

  // priceMin, priceMax가 외부에서 변경될 때 display 업데이트
  useState(() => {
    setPriceMinDisplay(priceMin.toLocaleString());
    setPriceMaxDisplay(priceMax.toLocaleString());
  });

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
        <label className="w-20 text-sm font-medium">이미지 크기</label>
        <span className="text-xs">크기</span>
        <select
          value={imageSize}
          onChange={(e) => setImageSize(Number(e.target.value))}
          className="w-20 rounded border px-2 py-1"
        >
          {imageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">px (1:1 비율 고정)</span>
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
          type="text"
          value={priceMinDisplay}
          onChange={(e) => handlePriceMinChange(e.target.value)}
          className="w-24 rounded border px-2 py-1"
          placeholder="0"
        />
        <span className="mx-1">~</span>
        <input
          type="text"
          value={priceMaxDisplay}
          onChange={(e) => handlePriceMaxChange(e.target.value)}
          className="w-24 rounded border px-2 py-1"
          placeholder="5,000,000"
        />
        <span className="text-xs text-gray-500">원</span>
        <Button
          size="sm"
          variant="outline"
          onClick={resetPrice}
          className="ml-2 text-xs px-2 py-1 h-8"
        >
          초기화
        </Button>
      </div>
      {/* 프리셋 리스트 + 추가 버튼 (더 작게) */}
      <div className="flex flex-wrap gap-1 my-2 items-center">
        {pricePresets.map((preset, idx) => (
          <div key={preset.label} className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPriceMin(preset.min);
                setPriceMax(preset.max);
                setPriceMinDisplay(preset.min.toLocaleString());
                setPriceMaxDisplay(preset.max.toLocaleString());
              }}
              className="whitespace-nowrap text-xs px-2 py-1 h-7"
            >
              {preset.label}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removePricePreset(idx)}
              className="text-xs px-1 py-1 h-7 w-7"
            >
              ❌
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowPresetForm((v) => !v)}
          className="text-xs px-2 py-1 h-7"
        >
          프리셋 추가
        </Button>
      </div>

      {/* 프리셋 추가 입력폼 (토글) */}
      {showPresetForm && (
        <div className="flex gap-2 my-2 items-center">
          <label className="w-20 text-sm font-medium">가격 프리셋</label>
          <input
            type="text"
            placeholder="최소"
            value={newMinDisplay}
            onChange={(e) => handleNewMinChange(e.target.value)}
            className="border px-2 py-1 rounded w-24 text-sm"
          />
          <span className="text-xs">~</span>
          <input
            type="text"
            placeholder="최대"
            value={newMaxDisplay}
            onChange={(e) => handleNewMaxChange(e.target.value)}
            className="border px-2 py-1 rounded w-24 text-sm"
          />
          <span className="text-xs text-gray-500">원</span>
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
                setNewMinDisplay('0');
                setNewMaxDisplay('0');
                setShowPresetForm(false);
              }
            }}
            className="text-xs px-2 py-1 h-8"
          >
            추가
          </Button>
        </div>
      )}

      <Button
        className="mt-4 w-full bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors"
        onClick={handleCategorySearch}
        disabled={loading}
      >
        카테고리 상품 검색
      </Button>
    </>
  );
} 