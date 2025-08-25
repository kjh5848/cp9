'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from '@/shared/components';
import { CoupangProduct } from '@/features/research/types';

interface GalleryCardProps {
  sessionId: string;
  products: CoupangProduct[];
  researchStatus: 'pending' | 'processing' | 'completed' | 'failed';
  title?: string;
  onClick?: (sessionId: string) => void;
}

/**
 * 갤러리 카드 컴포넌트
 * 여러 제품을 슬라이더로 표시하고, 호버 시 전체 제품 목록을 오버레이로 표시
 */
export default function GalleryCard({
  sessionId,
  products,
  researchStatus,
  title,
  onClick
}: GalleryCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [autoSlideInterval, setAutoSlideInterval] = useState<NodeJS.Timeout | null>(null);

  // 상태별 색상 매핑
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-600/90';
      case 'processing':
        return 'bg-orange-600/90';
      case 'completed':
        return 'bg-green-600/90';
      case 'failed':
        return 'bg-red-600/90';
      default:
        return 'bg-gray-600/90';
    }
  };

  // 상태별 텍스트 매핑
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기';
      case 'processing':
        return '진행중';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      default:
        return '대기';
    }
  };

  // 자동 슬라이드 설정
  useEffect(() => {
    if (products.length > 1 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % products.length);
      }, 3000);
      setAutoSlideInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        setAutoSlideInterval(null);
      }
      return undefined;
    }
  }, [products.length, isHovered]);

  // 이전 이미지로 이동
  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? products.length - 1 : prev - 1
    );
  };

  // 다음 이미지로 이동
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % products.length);
  };

  // 특정 이미지로 이동
  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // 카드 클릭 처리
  const handleCardClick = () => {
    onClick?.(sessionId);
  };

  return (
    <div
      className="relative group cursor-pointer bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 상태 칩들 (우상단) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        {/* 아이템 수 칩 */}
        <div className="px-2 py-1 bg-blue-600/90 text-white text-xs rounded-full font-medium backdrop-blur-sm">
          {products.length}개
        </div>
        
        {/* 리서치 상태 칩 */}
        <div className={`px-2 py-1 text-white text-xs rounded-full font-medium backdrop-blur-sm ${getStatusColor(researchStatus)} ${
          researchStatus === 'processing' ? 'animate-pulse' : ''
        }`}>
          {getStatusText(researchStatus)}
        </div>
      </div>

      {/* 메인 이미지 영역 */}
      <div className="aspect-[3/2] relative overflow-hidden">
        {/* 현재 이미지 */}
        <div className="w-full h-full">
          <ProductImage
            src={products[currentImageIndex]?.productImage || ''}
            alt={products[currentImageIndex]?.productName || ''}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* 슬라이더 컨트롤 (2개 이상일 때만 표시) */}
        {products.length > 1 && (
          <>
            {/* 이전/다음 버튼 */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 인디케이터 도트 */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? 'bg-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 호버 오버레이 (전체 제품 목록) */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-start p-6 transition-opacity duration-200 z-10">
          <div className="space-y-3 text-left max-h-full overflow-y-auto scrollbar-hide w-full">
            {title && (
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                <div className="w-12 h-0.5 bg-blue-400"></div>
              </div>
            )}
            {products.map((product, index) => (
              <div key={index} className="text-white">
                <div className="font-medium text-sm line-clamp-2 mb-1">
                  {product.productName}
                </div>
                <div className="text-blue-400 font-bold text-base">
                  ₩{product.productPrice.toLocaleString()}
                </div>
                {index < products.length - 1 && (
                  <div className="w-8 h-px bg-gray-600 mt-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}