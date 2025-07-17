'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductHistory, useSearchStore } from '@/store/searchStore';

const formatDate = (iso: string) => {
  if (!iso) return "---";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "---";
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

export default function ProductHistoryView() {
  const { history, clearHistory } = useSearchStore();
  const [showHistory, setShowHistory] = useState(false);
  const [historyDetail, setHistoryDetail] = useState<ProductHistory | null>(
    null
  );

  const handleClearHistoryOnly = () => {
    clearHistory();
  };

  return (
    <>
      {/* PC: 사이드 이력, 모바일: 버튼+모달 */}
      <div className="hidden md:block md:w-80 lg:w-96">
        <Card className="sticky top-24 p-4 hover:bg-white hover:bg-opacity-90 hover:shadow-md transition-colors bg-white text-[#171717]">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-bold">검색 이력</h4>
            <Button
              size="sm"
              variant="outline"
              className="px-2 py-1 text-xs"
              onClick={handleClearHistoryOnly}
            >
              이력 지우기
            </Button>
          </div>
          <ul className="max-h-[60vh] space-y-1 overflow-y-auto text-xs">
            {history.map((h, idx) => (
              <li
                key={idx}
                className="truncate cursor-pointer border-b pb-1 hover:bg-gray-100"
                onClick={() => setHistoryDetail(h)}
              >
                <span className="font-semibold">{h.keyword}</span>{" "}
                <span className="text-gray-500">{formatDate(h.date)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="block md:hidden mt-4">
        <Button onClick={() => setShowHistory(true)} className="w-full">
          검색 이력 보기
        </Button>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="mx-auto w-11/12 max-w-md rounded-lg bg-white p-4">
              <h4 className="font-bold mb-2">검색 이력</h4>
              <ul className="max-h-60 space-y-1 overflow-y-auto text-xs">
                {history.map((h, idx) => (
                  <li
                    key={idx}
                    className="truncate cursor-pointer border-b pb-1 hover:bg-gray-100"
                    onClick={() => {
                      setHistoryDetail(h);
                      setShowHistory(false);
                    }}
                  >
                    <span className="font-semibold">{h.keyword}</span>{" "}
                    <span className="text-gray-500">{formatDate(h.date)}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-2 w-full"
                variant="outline"
                onClick={handleClearHistoryOnly}
              >
                이력 지우기
              </Button>
              <Button
                className="mt-4 w-full"
                onClick={() => setShowHistory(false)}
              >
                닫기
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* 상세 모달 */}
      {historyDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative mx-auto w-11/12 max-w-2xl rounded-lg bg-white p-6">
            <button
              className="absolute right-2 top-2 text-xl"
              onClick={() => setHistoryDetail(null)}
            >
              &times;
            </button>
            <h4 className="font-bold mb-2">
              검색 상세:{" "}
              <span className="text-blue-700">{historyDetail.keyword}</span>{" "}
              <span className="text-gray-500">
                {formatDate(historyDetail.date)}
              </span>
            </h4>
            <ul className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
              {Array.isArray(historyDetail.results) &&
                historyDetail.results.map((item, i) => (
                  <li key={i} className="flex flex-col gap-2 rounded border p-2">
                    {/* 이미지 */}
                    {(item.productImage || item.image) && (
                      <img
                        src={item.productImage || item.image}
                        alt={item.productName || item.title}
                        className="mx-auto h-32 w-32 rounded object-cover"
                      />
                    )}
                    {/* 상품명 */}
                    <div className="font-bold line-clamp-2">
                      {item.title || item.productName}
                    </div>
                    {/* 가격 */}
                    <div>
                      가격: {(item.price ?? item.productPrice)?.toLocaleString()}원
                    </div>
                    {/* 링크 */}
                    <div className="truncate overflow-hidden whitespace-nowrap max-w-full">
                      링크: {" "}
                      <a
                        href={item.url || item.productUrl || item.originalUrl}
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="inline-block max-w-[180px] align-bottom truncate">
                          {item.url || item.productUrl || item.originalUrl}
                        </span>
                      </a>
                    </div>
                    {/* 로켓배송 */}
                    {(item.rocketShipping || item.isRocket) && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        로켓
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
