'use client';

import { GlassCard, ScaleOnHover } from '@/shared/components/advanced-ui';
import ProductImage from './ProductImage';
import StatusBadge from './StatusBadge';
import PriceDisplay from './PriceDisplay';
import ProgressBar from './ProgressBar';
import { Button } from '@/shared/ui';
import { CoupangProduct } from '@/features/research/types';

interface ProductCardProps {
  product: CoupangProduct;
  researchStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  researchProgress?: number;
  onSelect?: () => void;
  onViewDetail?: () => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
  showDetailButton?: boolean;
}

/**
 * 제품 카드 컴포넌트 (갤러리 뷰용)
 * 
 * @param product - 쿠팡 제품 데이터
 * @param researchStatus - 리서치 상태
 * @param researchProgress - 리서치 진행률 (0-100)
 * @param onSelect - 선택 시 콜백
 * @param onViewDetail - 상세보기 시 콜백
 * @param isSelected - 선택 상태
 * @param showSelectButton - 선택 버튼 표시 여부
 * @param showDetailButton - 상세보기 버튼 표시 여부
 */
export default function ProductCard({
  product,
  researchStatus = 'pending',
  researchProgress = 0,
  onSelect,
  onViewDetail,
  isSelected = false,
  showSelectButton = false,
  showDetailButton = true
}: ProductCardProps) {
  const getStatusBadgeType = () => {
    switch (researchStatus) {
      case 'processing':
        return 'processing';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      default:
        return 'custom';
    }
  };

  const getStatusText = () => {
    switch (researchStatus) {
      case 'pending':
        return '대기 중';
      case 'processing':
        return '분석 중...';
      case 'completed':
        return '분석 완료';
      case 'failed':
        return '분석 실패';
      default:
        return '준비';
    }
  };

  return (
    <ScaleOnHover scale={1.02}>
      <GlassCard 
        className={`
          overflow-hidden cursor-pointer transition-all duration-200
          ${isSelected ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/20' : ''}
        `}
      >
        {/* 이미지 영역 */}
        <div className="relative aspect-square">
          <ProductImage
            src={product.productImage}
            alt={product.productName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="transition-transform duration-200 hover:scale-105"
          />
          
          {/* 오버레이 배지들 */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isRocket && (
              <StatusBadge type="rocket" size="sm" />
            )}
            {product.isFreeShipping && (
              <StatusBadge type="freeShipping" size="sm" />
            )}
          </div>

          {/* 리서치 상태 배지 */}
          <div className="absolute top-2 right-2">
            <StatusBadge 
              type={getStatusBadgeType()} 
              text={getStatusText()}
              size="sm" 
            />
          </div>

          {/* 선택 체크박스 (선택 모드일 때) */}
          {showSelectButton && (
            <div className="absolute bottom-2 right-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.();
                }}
                className={`
                  w-6 h-6 rounded border-2 flex items-center justify-center
                  transition-colors duration-200
                  ${isSelected 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-black/50 border-gray-400 hover:border-blue-400'
                  }
                `}
              >
                {isSelected && <span className="text-xs">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-4">
          {/* 제품명 */}
          <h3 
            className="text-white font-medium text-sm mb-2 line-clamp-2 leading-tight"
            title={product.productName}
          >
            {product.productName}
          </h3>

          {/* 카테고리 */}
          <p className="text-gray-400 text-xs mb-3">
            {product.categoryName}
          </p>

          {/* 가격 */}
          <div className="mb-3">
            <PriceDisplay 
              price={product.productPrice} 
              size="lg" 
              color="blue"
            />
          </div>

          {/* 리서치 진행 상태 */}
          {researchStatus === 'processing' && (
            <div className="mb-3">
              <ProgressBar 
                value={researchProgress} 
                showPercentage 
                size="sm" 
                color="blue"
              />
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {showSelectButton && (
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.();
                }}
                className="flex-1"
              >
                {isSelected ? '선택됨' : '선택'}
              </Button>
            )}
            
            {showDetailButton && (
              <Button
                variant={researchStatus === 'completed' ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail?.();
                }}
                disabled={researchStatus !== 'completed'}
                className="flex-1"
              >
                {researchStatus === 'completed' ? '상세보기' : '대기중'}
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </ScaleOnHover>
  );
}