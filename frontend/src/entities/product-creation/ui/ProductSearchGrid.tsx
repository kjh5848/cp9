import React from 'react';
import Image from 'next/image';
import { ExternalLink, CheckCircle2, Package } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';
import { cn } from '@/shared/lib/utils';
import { CoupangProductResponse } from '@/shared/types/api';

export interface ProductSearchGridProps {
  products: CoupangProductResponse[];
  selectedProductIds: Set<number>;
  toggleSelection: (productId: number) => void;
}

export function ProductSearchGrid({
  products,
  selectedProductIds,
  toggleSelection
}: ProductSearchGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {products.map((product, idx) => {
        const isSelected = selectedProductIds.has(product.productId);

        return (
          <GlassCard
            key={`${product.productId}-${idx}`}
            onClick={() => toggleSelection(product.productId)}
            className={cn(
              "p-0 overflow-hidden flex flex-col cursor-pointer transition-all duration-200",
              isSelected ?
              "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-blue-500/10 ring-2 ring-blue-500 ring-inset" :
              "hover:border-blue-500/40"
            )}>
            
            {/* 상품 이미지 */}
            <div className="relative w-full aspect-square bg-white/5">
              {isSelected && (
                <div className="absolute top-2 right-2 z-10">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                </div>
              )}
              {product.productImage ? (
                <Image
                  src={product.productImage}
                  alt={product.productName}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-12 h-12 text-slate-700" />
                </div>
              )}
              {/* 배지 */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isRocket && (
                  <span className="text-[10px] px-2 py-0.5 bg-yellow-500/90 text-black rounded-full font-semibold">
                    🚀 로켓
                  </span>
                )}
                {product.isFreeShipping && !product.isRocket && (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-600/90 text-white rounded-full font-semibold">
                    무료배송
                  </span>
                )}
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="p-4 flex flex-col gap-2 flex-1">
              <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                {product.productName}
              </p>
              <p className="text-blue-400 font-bold text-lg mt-auto">
                {product.productPrice.toLocaleString()}원
              </p>
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-400 transition-colors">
                 쿠팡에서 보기 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
