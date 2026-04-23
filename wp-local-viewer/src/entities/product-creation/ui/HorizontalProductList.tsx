import React from 'react';
import Image from 'next/image';
import { GlassCard } from '@/shared/ui/GlassCard';
import { ChevronLeft, ChevronRight, CheckCircle2, Package } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CoupangProductResponse } from '@/shared/types/api';

export interface HorizontalProductListProps {
  title: string;
  items: CoupangProductResponse[];
  icon: React.ReactNode;
  selectedProductIds: Set<number>;
  toggleSelection: (productId: number) => void;
}

export function HorizontalProductList({
  title,
  items,
  icon,
  selectedProductIds,
  toggleSelection
}: HorizontalProductListProps) {
  if (!items || !items.length) return null;

  const scrollLeft = (e: React.MouseEvent<HTMLButtonElement>) => {
    const container = e.currentTarget.parentElement?.querySelector('.scroll-container');
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = (e: React.MouseEvent<HTMLButtonElement>) => {
    const container = e.currentTarget.parentElement?.querySelector('.scroll-container');
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        {icon}
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="relative group">
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-800/90 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 backdrop-blur-md border border-white/10"
          aria-label="왼쪽으로 스크롤"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="scroll-container flex gap-4 overflow-x-auto pb-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map((product, idx) => {
          const isSelected = selectedProductIds.has(product.productId);
          return (
            <GlassCard
              key={`horizontal-${product.productId}-${idx}`}
              onClick={() => toggleSelection(product.productId)}
              className={cn(
                "flex-none w-44 p-0 overflow-hidden flex flex-col cursor-pointer transition-all duration-200",
                isSelected ?
                "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-blue-500/10 ring-2 ring-blue-500 ring-inset" :
                "hover:border-blue-500/40 border-transparent bg-white/5"
              )}>
              
              <div className="relative w-full aspect-square bg-white/5">
                {isSelected ?
                <div className="absolute top-2 right-2 z-10">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                  </div> : null
                }
                {product.productImage ?
                <Image
                  src={product.productImage}
                  alt={product.productName}
                  fill
                  sizes="176px"
                  className="object-cover"
                  unoptimized /> :

                <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-700" />
                  </div>
                }
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isRocket ?
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/90 text-black rounded-full font-semibold">
                      🚀 로켓
                    </span> : null
                  }
                  {(product.isFreeShipping ? !product.isRocket : null) ?
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-600/90 text-white rounded-full font-semibold">
                      무배
                    </span> : null
                  }
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1.5 flex-1 max-h-24">
                <p className="text-white text-xs font-medium leading-snug line-clamp-2">
                  {product.productName}
                </p>
                <p className="text-blue-400 font-bold text-sm mt-auto">
                  {product.productPrice.toLocaleString()}원
                </p>
              </div>
            </GlassCard>);

        })}
        </div>
        
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-800/90 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 backdrop-blur-md border border-white/10"
          aria-label="오른쪽으로 스크롤"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
