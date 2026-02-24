import React from "react";
import Image from "next/image";
import { ProductItem } from "../model/types";
import { GlassCard } from "@/shared/ui/GlassCard";
import { cn } from "@/shared/lib/utils";

interface ProductCardProps {
  product: ProductItem;
  onClick?: (product: ProductItem) => void;
  className?: string;
}

/**
 * [Entities Layer]
 * 순수하게 ProductItem 데이터를 받아 화면에 그려주는 Dumb Component 입니다.
 * API 호출이나 전역 상태 등 부수 효과(Side-effect)를 갖지 않습니다.
 */
export const ProductCard = ({ product, onClick, className }: ProductCardProps) => {
  return (
    <GlassCard
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer",
        className
      )}
    >
      <div 
        className="relative w-full aspect-square bg-white/5 rounded-xl overflow-hidden mb-4"
        onClick={() => onClick?.(product)}
      >
        {product.productImage ? (
          <Image
            src={product.productImage}
            alt={product.productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            이미지 없음
          </div>
        )}
        
        {/* 쿠팡 로켓배송 뱃지 등 (UI Only) */}
        {product.isRocket && (
          <div className="absolute bottom-2 left-2 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
            로켓배송
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 leading-tight">
          {product.productName}
        </h3>
        
        <div className="mt-auto pt-2 flex items-end justify-between">
          <span className="text-lg font-bold text-foreground">
            {product.productPrice.toLocaleString()}원
          </span>
          {product.brandName && (
            <span className="text-xs text-muted-foreground truncate max-w-[40%]">
              {product.brandName}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
