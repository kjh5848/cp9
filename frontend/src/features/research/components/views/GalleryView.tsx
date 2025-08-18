'use client';

import Image from 'next/image';
import { useState } from 'react';
import { GlassCard, ScaleOnHover, FadeInSection } from '@/shared/components/advanced-ui';
import { ResearchItem } from '../../types';
import { Star, Tag, Eye } from 'lucide-react';

interface GalleryViewProps {
  data: ResearchItem[];
}

/**
 * 갤러리 뷰 컴포넌트
 * Pinterest 스타일의 Masonry 레이아웃으로 상품 이미지를 표시
 */
export default function GalleryView({ data }: GalleryViewProps) {
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);

  // Masonry 레이아웃을 위한 컬럼 분배
  const columns = 4;
  const columnItems: ResearchItem[][] = Array.from({ length: columns }, () => []);
  
  data.forEach((item, index) => {
    columnItems[index % columns].push(item);
  });

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {columnItems.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-4">
            {column.map((item, index) => (
              <FadeInSection key={item.id} delay={index * 100}>
                <ScaleOnHover scale={1.02}>
                  <GlassCard className="relative group cursor-pointer overflow-hidden">
                    {/* 이미지 */}
                    <div className="relative w-full" style={{ paddingBottom: `${100 + Math.random() * 50}%` }}>
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      
                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-bold text-lg mb-2 line-clamp-2">
                            {item.productName}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl font-bold">
                              ₩{item.productPrice.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{item.analysis.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.analysis.keywords.slice(0, 3).map((keyword, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">
                                #{keyword}
                              </span>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="flex items-center gap-2 text-sm hover:underline"
                          >
                            <Eye className="w-4 h-4" />
                            자세히 보기
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* 카테고리 배지 */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
                        {item.category}
                      </span>
                    </div>
                  </GlassCard>
                </ScaleOnHover>
              </FadeInSection>
            ))}
          </div>
        ))}
      </div>

      {/* 라이트박스 모달 (간단한 버전) */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div className="max-w-4xl w-full bg-gray-900 rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative h-96">
              <Image
                src={selectedItem.productImage}
                alt={selectedItem.productName}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{selectedItem.productName}</h2>
              <p className="text-gray-300 mb-4">{selectedItem.analysis.summary}</p>
              <div className="flex gap-4">
                <a 
                  href={selectedItem.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  상품 보기
                </a>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}