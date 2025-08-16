'use client';

import { Input } from '@/features/components/ui/input';
import { Button } from '@/features/components/ui/button';
import { Label } from '@/features/components/ui/label';
import { ScaleOnHover } from '@/features/components/ui/animated-sections';
import { useItemCountForm } from '../hooks/useItemCountForm';

interface ProductKeywordSearchFormProps {
  loading: boolean;
  keyword: string;
  setKeyword: (value: string) => void;
  itemCount: number;
  setItemCount: (value: number) => void;
  handleKeywordSearch: () => void;
  handleEnter: (e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => void;
}

export default function ProductKeywordSearchForm({
  loading,
  keyword,
  setKeyword,
  itemCount,
  setItemCount,
  handleKeywordSearch,
  handleEnter,
}: ProductKeywordSearchFormProps) {
  // 아이템 개수 입력 검증 로직
  const { handleItemCountChange } = useItemCountForm(setItemCount, {
    min: 1,
    max: 10,
    alertMessage: '최대 10개까지만 검색할 수 있습니다.'
  });

  return (
    <div className="max-w-full">
      <div className="mb-4 grid gap-3 grid-cols-[auto,1fr]">
        <div className="flex flex-col gap-1">
          <Label htmlFor="itemCount" className="text-white text-xs">
            개수
          </Label>
          <Input
            id="itemCount"
            type="number"
            min={1}
            max={10}
            value={itemCount}
            onChange={handleItemCountChange}
            className="w-24 bg-gray-800 border-gray-600 text-white focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="keyword" className="text-white text-xs">
            검색 키워드
          </Label>
          <Input
            id="keyword"
            placeholder="검색할 키워드 입력"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => handleEnter(e, handleKeywordSearch)}
            disabled={loading}
            className="min-w-0 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
          />
        </div>
      </div>

      <ScaleOnHover scale={1.02}>
        <Button
          className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
          onClick={handleKeywordSearch}
          disabled={loading}
        >
          상품 검색
        </Button>
      </ScaleOnHover>
    </div>
  );
}
