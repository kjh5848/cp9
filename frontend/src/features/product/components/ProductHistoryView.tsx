'use client';

import { useState } from 'react';
import { ProductHistory } from '@/store/searchStore';

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
  const [historyDetail, setHistoryDetail] = useState<ProductHistory | null>(
    null
  );

  return (
    <>
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
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="mx-auto h-32 w-32 rounded object-cover"
                      />
                    )}
                    {/* 상품명 */}
                    <div className="font-bold line-clamp-2">
                      {item.productName}
                    </div>
                    {/* 가격 */}
                    <div>
                      가격: {item.productPrice.toLocaleString()}원
                    </div>
                    {/* 링크 */}
                    <div className="truncate overflow-hidden whitespace-nowrap max-w-full">
                      링크: {" "}
                      <a
                        href={item.productUrl}
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="inline-block max-w-[180px] align-bottom truncate">
                          {item.productUrl}
                        </span>
                      </a>
                    </div>
                    {/* 로켓배송 */}
                    {item.isRocket && (
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