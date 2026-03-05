/**
 * [Entities/KeywordWriting] 상품 그리드 컴포넌트
 * 쿠팡 검색 결과 상품 목록을 그리드 형태로 표시하는 순수 UI 컴포넌트입니다.
 */
import Image from "next/image";
import { CheckCircle2, Package } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CoupangProductResponse } from "@/shared/types/api";

interface ProductGridProps {
  /** 표시할 상품 목록 */
  products: CoupangProductResponse[];
  /** 선택된 상품 ID 집합 */
  selectedIds: Set<number>;
  /** 상품 선택/해제 토글 핸들러 */
  onToggle: (id: number) => void;
}

export function ProductGrid({ products, selectedIds, onToggle }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product, idx) => {
        const isSelected = selectedIds.has(product.productId);
        return (
          <button
            key={`${product.productId}-${idx}`}
            onClick={() => onToggle(product.productId)}
            className={cn(
              "text-left rounded-xl border-2 overflow-hidden transition-all duration-200 group",
              isSelected
                ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                : "border-border/30 bg-background/30 hover:border-border hover:bg-muted/20"
            )}
          >
            <div className="relative w-full aspect-square bg-white/5">
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 z-10">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                </div>
              )}
              {product.productImage ? (
                <Image
                  src={product.productImage}
                  alt={product.productName}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              {product.isRocket && (
                <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 bg-yellow-500/90 text-black rounded-full font-semibold">
                  로켓
                </span>
              )}
            </div>
            <div className="p-2.5 space-y-1">
              <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">
                {product.productName}
              </p>
              <p className="text-blue-400 font-bold text-sm">
                {product.productPrice.toLocaleString()}원
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
