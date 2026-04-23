"use client";

import React from "react";
import Image from "next/image";
import { X, Trash2, Package } from "lucide-react";
import { CoupangProductResponse } from "@/shared/types/api";
import { cn } from "@/shared/lib/utils";

interface SelectedProductListProps {
  products: CoupangProductResponse[];
  onRemove?: (productId: number) => void;
  onClearAll?: () => void;
  className?: string;
}

export function SelectedProductList({
  products,
  onRemove,
  onClearAll,
  className,
}: SelectedProductListProps) {
  if (products.length === 0) return null;

  const isEditable = !!onRemove || !!onClearAll;

  return (
    <div className={cn("p-6 bg-card/50 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 rounded-md">
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            선택된 상품 <span className="text-emerald-400 ml-1 font-black">{products.length}</span>개
          </h3>
        </div>
        {onClearAll ? (
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-background/50 rounded-lg border border-border/50 hover:border-red-500/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            전체 해제
          </button>
        ) : null}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {products.map((p) => (
          <div
            key={p.productId}
            className="group relative flex-none w-20 rounded-md border border-slate-700/50 overflow-hidden bg-slate-800/20 transition-all hover:border-slate-500/50"
          >
            {onRemove ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(p.productId);
                }}
                className="absolute -top-1 -right-1 z-20 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            ) : null}

            <div className="relative w-full aspect-square bg-slate-900/50">
              {p.productImage ? (
                <Image
                  src={p.productImage}
                  alt={p.productName}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Package className="w-6 h-6 text-slate-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            
            <div className="p-1.5">
              <p
                className="text-[9px] text-slate-300 line-clamp-1 leading-tight mb-0.5"
                title={p.productName}
              >
                {p.productName}
              </p>
              <p className="text-[10px] text-blue-400 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                {p.productPrice.toLocaleString()}원
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
