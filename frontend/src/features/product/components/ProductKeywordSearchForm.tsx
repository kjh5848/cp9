'use client';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

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
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Input
          placeholder="검색할 키워드 입력"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => handleEnter(e, handleKeywordSearch)}
          disabled={loading}
        />
        <Input
          type="number"
          min={1}
          max={20}
          value={itemCount}
          onChange={(e) => setItemCount(Number(e.target.value))}
          className="w-20"
          disabled={loading}
        />
      </div>
      <Button
        className="w-full bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors"
        onClick={handleKeywordSearch}
        disabled={loading}
      >
        상품 검색
      </Button>
    </div>
  );
} 