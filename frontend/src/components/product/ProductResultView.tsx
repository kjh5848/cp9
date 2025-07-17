'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductItem, useSearchStore } from '@/store/searchStore';

interface ProductResultViewProps {
  loading: boolean;
  viewType: 'grid' | 'list';
  setViewType: (value: 'grid' | 'list') => void;
  filteredResults: ProductItem[];
  handleDeeplinkConvert: () => void;
  sortOrder: 'asc' | 'desc' | null;
  setSortOrder: (order: 'asc' | 'desc' | null) => void;
}

const cardClass =
  "border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col p-4 text-left relative cursor-pointer transition-colors min-h-[220px]";
const cardSelected = "bg-blue-50 border-blue-400 ring-2 ring-blue-300";

export default function ProductResultView({
  loading,
  viewType,
  setViewType,
  filteredResults,
  handleDeeplinkConvert,
  sortOrder,
  setSortOrder,
}: ProductResultViewProps) {
  const { selected, setSelected } = useSearchStore();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editLink, setEditLink] = useState("");

  const handleSelect = (id: string) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  };

  const handleEditLink = (idx: number, link: string) => {
    // This logic needs to be lifted up to the parent component
    // to modify the actual deeplinkResult state.
    // For now, we'll just close the edit mode.
    setEditIndex(null);
    setEditLink("");
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">
          딥링크/상품 결과{" "}
          <span className="text-sm text-gray-500 font-normal">
            ({filteredResults.length})
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
        <ul
          className={`${viewType === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
              : "flex flex-col gap-2"
            } h-full w-full`}
        >
          {filteredResults.map((item, i) => (
            <li
              key={i}
              className={`${cardClass} ${
                selected.includes(item.productId || item.url)
                  ? cardSelected
                  : ""
                }`}
              onClick={() => handleSelect(item.productId || item.url)}
            >
              {(item.isRocket || item.rocketShipping) && (
                <span className="absolute right-2 top-2 rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                  로켓
                </span>
              )}
              {item.productImage && (
                <img
                  src={item.productImage}
                  alt={item.productName || item.title}
                  className="mx-auto mb-2 h-32 w-32 object-cover rounded"
                />
              )}
              <div className="mb-2 flex flex-1 flex-col gap-2">
                <span className="pr-10 font-bold line-clamp-2">
                  {item.title || item.productName}
                </span>
                <div className="border-t"></div>
                <div className="text-sm text-gray-500">
                  가격:{" "}
                  <span className="font-semibold text-gray-800">
                    {Number(
                      item.price ?? item.productPrice
                    ).toLocaleString()}
                    원
                  </span>
                </div>
                <div className="border-t"></div>
                {item.categoryName && (
                  <div className="text-xs text-gray-500">
                    카테고리: {item.categoryName}
                  </div>
                )}
                <div className="border-t"></div>
                <div className="truncate text-xs text-blue-600">
                  링크:{" "}
                  <a
                    href={item.url || item.productUrl || item.originalUrl}
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.url || item.productUrl || item.originalUrl}
                  </a>
                </div>
              </div>

              {editIndex === i ? (
                <div className="mt-auto flex gap-2">
                  <Input
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") handleEditLink(i, editLink);
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditLink(i, editLink);
                    }}
                  >
                    저장
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditIndex(null);
                    }}
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="mt-auto w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditIndex(i);
                    setEditLink(item.url || item.originalUrl);
                  }}
                >
                  수정
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {filteredResults.length > 0 && (
        <Button
          className="mt-4 w-full"
          onClick={handleDeeplinkConvert}
          disabled={loading || selected.length === 0}
        >
          선택 상품 딥링크 변환
        </Button>
      )}
    </div>
  );
}
