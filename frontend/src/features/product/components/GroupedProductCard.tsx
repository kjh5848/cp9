'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/shared/ui';
import { ScaleOnHover } from '@/shared/components/advanced-ui';
import { GroupedProductItem } from '../types';
import { ChevronDown, ChevronUp, Zap, Package, DollarSign, Tag, ExternalLink } from 'lucide-react';

interface GroupedProductCardProps {
  group: GroupedProductItem;
  isSelected: boolean;
  onSelect: () => void;
  onVariantSelect?: (variantIndex: number) => void;
}

/**
 * 그룹화된 상품을 표시하는 카드 컴포넌트
 * 동일 상품의 다양한 옵션(변형)을 계단식으로 표시
 */
export default function GroupedProductCard({ group, isSelected, onSelect, onVariantSelect }: GroupedProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasVariants = group.variantCount > 1;

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleVariantSelect = (variantIndex: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVariantSelect) {
      onVariantSelect(variantIndex);
    }
  };

  return (
    <ScaleOnHover scale={isSelected ? 1.02 : 1.01}>
      <Card
        className={`relative rounded-lg border p-4 transition-all duration-300 ${
          isSelected 
            ? 'border-blue-400 bg-gradient-to-br from-blue-900/40 to-blue-800/30' 
            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
        }`}
        onClick={onSelect}
      >
        {/* 로켓배송 표시 */}
        {group.mainItem.isRocket && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white z-10">
            <Zap className="w-3 h-3" />
            로켓배송
          </div>
        )}

        {/* 상품 이미지 */}
        {group.mainItem.productImage && (
          <div className="relative mx-auto mb-4 h-32 w-32">
            <Image
              src={group.mainItem.productImage}
              alt={group.mainItem.productName}
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* 상품명 */}
        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">
          {group.mainItem.productName}
        </h3>

        {/* 옵션 정보 배지 */}
        {hasVariants && (
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
              <Package className="w-3 h-3" />
              {group.variantCount}개 옵션
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
              <DollarSign className="w-3 h-3" />
              {group.priceRange.min.toLocaleString()} ~ {group.priceRange.max.toLocaleString()}원
            </span>
          </div>
        )}

        {/* 메인 상품 가격 */}
        <div className="text-sm text-gray-300 mb-2">
          {!hasVariants && '가격: '}
          {hasVariants && '최저가: '}
          <span className="font-semibold text-blue-400">
            {group.mainItem.productPrice.toLocaleString()}원
          </span>
        </div>

        {/* 카테고리 */}
        <div className="text-xs text-gray-400 mb-3">
          카테고리: {group.mainItem.categoryName}
        </div>

        {/* 옵션 보기 버튼 */}
        {hasVariants && (
          <>
            <button
              onClick={handleExpandClick}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors mb-3"
            >
              <span className="text-xs text-gray-300">
                {isExpanded ? '옵션 닫기' : `${group.variantCount}개 옵션 보기`}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* 옵션 리스트 (확장 시) */}
            {isExpanded && (
              <div className="space-y-2 border-t border-gray-700 pt-3">
                {group.variants.map((variant, index) => (
                  <div
                    key={`${variant.vendorItemId}-${index}`}
                    className="pl-4 pr-2 py-2 bg-gray-900/50 hover:bg-gray-800/70 rounded-md border-l-2 border-gray-600 cursor-pointer transition-colors"
                    onClick={handleVariantSelect(index)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs text-gray-400">옵션 {index + 1}</span>
                      {variant.priceDiff > 0 && (
                        <span className="text-xs text-yellow-500">
                          +{variant.priceDiff.toLocaleString()}원
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white font-medium">
                        {variant.item.productPrice.toLocaleString()}원
                      </span>
                      <a
                        href={variant.item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </a>
                    </div>
                    
                    {variant.vendorItemId && (
                      <div className="text-xs text-gray-500 mt-1">
                        <Tag className="w-3 h-3 inline mr-1" />
                        판매자: {variant.vendorItemId.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 기본 링크 (옵션이 없거나 접혀있을 때) */}
        {(!hasVariants || !isExpanded) && (
          <div className="text-xs text-blue-400 truncate">
            <a
              href={group.mainItem.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
            >
              상품 보기
            </a>
          </div>
        )}
      </Card>
    </ScaleOnHover>
  );
}