'use client';

import Image from 'next/image';
import { Card } from '@/shared/ui';
import { StaggeredList, AnimatedButton, ScaleOnHover } from '@/shared/components/advanced-ui';
import { ResearchItem } from '../../types';
import { Star, ThumbsUp, ThumbsDown, ShoppingCart, FileText } from 'lucide-react';

interface CardViewProps {
  data: ResearchItem[];
}

/**
 * 카드 뷰 컴포넌트
 * 균일한 카드 그리드 레이아웃으로 상품 정보를 표시
 */
export default function CardView({ data }: CardViewProps) {
  const handleViewProduct = (url: string) => {
    window.open(url, '_blank');
  };

  const handleViewSEO = (item: ResearchItem) => {
    // SEO 콘텐츠 보기 로직
    console.log('View SEO content for:', item.productName);
  };

  return (
    <StaggeredList 
      staggerDelay={100}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {data.map((item) => (
        <ScaleOnHover key={item.id} scale={1.02}>
          <Card className="bg-gray-800/50 border-gray-700 overflow-hidden h-full flex flex-col">
            {/* 이미지 섹션 */}
            <div className="relative h-48 bg-gray-900">
              <Image
                src={item.productImage}
                alt={item.productName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* 평점 배지 */}
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-sm font-bold">{item.analysis.rating}</span>
              </div>
            </div>

            {/* 콘텐츠 섹션 */}
            <div className="p-4 flex-1 flex flex-col">
              {/* 제목과 가격 */}
              <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                {item.productName}
              </h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-blue-400">
                  ₩{item.productPrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">
                  {item.category}
                </span>
              </div>

              {/* 키워드 태그 */}
              <div className="flex flex-wrap gap-1 mb-4">
                {item.analysis.keywords.slice(0, 4).map((keyword, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>

              {/* 요약 */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3 flex-1">
                {item.analysis.summary}
              </p>

              {/* 장단점 */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-start gap-1">
                  <ThumbsUp className="w-4 h-4 text-green-400 mt-0.5" />
                  <div>
                    <span className="text-xs text-green-400 font-semibold">장점</span>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {item.analysis.pros[0]}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <ThumbsDown className="w-4 h-4 text-red-400 mt-0.5" />
                  <div>
                    <span className="text-xs text-red-400 font-semibold">단점</span>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {item.analysis.cons[0]}
                    </p>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2 mt-auto">
                <AnimatedButton
                  variant="gradient"
                  size="sm"
                  onClick={() => handleViewProduct(item.productUrl)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  상품 보기
                </AnimatedButton>
                {item.seoContent && (
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSEO(item)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    SEO 글
                  </AnimatedButton>
                )}
              </div>
            </div>
          </Card>
        </ScaleOnHover>
      ))}
    </StaggeredList>
  );
}