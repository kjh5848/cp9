import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const PRICE_PRESETS = [
  { label: "전체", min: 0, max: Infinity },
  { label: "~1만원", min: 0, max: 10000 },
  { label: "1~3만원", min: 10000, max: 30000 },
  { label: "3~5만원", min: 30000, max: 50000 },
  { label: "5~10만원", min: 50000, max: 100000 },
  { label: "10만원~", min: 100000, max: Infinity }
];

export interface ProductFilterBarProps {
  filteredCount: number;
  totalCount: number;
  pricePresetIdx: number;
  setPricePresetIdx: (idx: number) => void;
  rocketOnly: boolean;
  setRocketOnly: (v: boolean | ((prev: boolean) => boolean)) => void;
  freeShipOnly: boolean;
  setFreeShipOnly: (v: boolean | ((prev: boolean) => boolean)) => void;
  sortBy: "default" | "price_asc" | "price_desc";
  setSortBy: (v: "default" | "price_asc" | "price_desc") => void;
}

export function ProductFilterBar({
  filteredCount,
  totalCount,
  pricePresetIdx,
  setPricePresetIdx,
  rocketOnly,
  setRocketOnly,
  freeShipOnly,
  setFreeShipOnly,
  sortBy,
  setSortBy,
}: ProductFilterBarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <SlidersHorizontal className="w-4 h-4" />
        <span>필터 &amp; 정렬</span>
        <span className="ml-auto text-slate-500 text-xs">
          {filteredCount} / {totalCount}개 표시
        </span>
      </div>

      {/* 가격 프리셋 */}
      <div className="flex flex-wrap gap-2">
        {PRICE_PRESETS.map((p, idx) => (
          <button
            key={p.label}
            onClick={() => setPricePresetIdx(idx)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
              pricePresetIdx === idx ?
              "bg-blue-600 border-blue-500 text-white" :
              "bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
            )}>
            {p.label}
          </button>
        ))}
      </div>

      {/* 배송 필터 + 정렬 */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setRocketOnly((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all",
            rocketOnly ?
            "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" :
            "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
          )}>
          🚀 로켓배송만
          {rocketOnly ? <X className="w-3 h-3" /> : null}
        </button>

        <button
          onClick={() => setFreeShipOnly((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all",
            freeShipOnly ?
            "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
            "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
          )}>
          📦 무료배송만
          {freeShipOnly ? <X className="w-3 h-3" /> : null}
        </button>

        <div className="ml-auto flex items-center gap-1">
          {(["default", "price_asc", "price_desc"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs border transition-all",
                sortBy === s ?
                "bg-purple-500/20 border-purple-500/50 text-purple-400" :
                "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
              )}>
              {s === "default" && "기본"}
              {s === "price_asc" && "가격 낮은순"}
              {s === "price_desc" && "가격 높은순"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
