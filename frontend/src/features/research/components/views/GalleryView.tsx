'use client';

import Image from 'next/image';
import { useState } from 'react';
import { GlassCard, ScaleOnHover, FadeInSection } from '@/shared/components/advanced-ui';
import { ResearchItem } from '../../types';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import Link from 'next/link';

interface GalleryViewProps {
  data: ResearchItem[];
  currentSessionId?: string;
}

/**
 * 갤러리 뷰 컴포넌트
 * 세션별 리서치 데이터를 하나의 대형 카드로 표시하는 갤러리 뷰
 * 각 상품의 개별 정보가 아닌 전체 리서치 세션 정보를 통합 표시
 */
export default function GalleryView({ data, currentSessionId = '1' }: GalleryViewProps) {
  // 각 카드별 현재 이미지 인덱스를 관리
  const [currentIndexes, setCurrentIndexes] = useState<{ [key: string]: number }>({});
  
  // 전체 아이템 수
  const totalItems = data[0]?.metadata?.totalItems || data.length;

  const handlePrevImage = (researchId: string) => {
    setCurrentIndexes(prev => ({
      ...prev,
      [researchId]: Math.max(0, (prev[researchId] || 0) - 1)
    }));
  };

  const handleNextImage = (researchId: string, maxIndex: number) => {
    setCurrentIndexes(prev => ({
      ...prev,
      [researchId]: Math.min(maxIndex, (prev[researchId] || 0) + 1)
    }));
  };

  return (
    <div>
      {/* 리서치 개요 */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">리서치 개요</h3>
        </div>
        <p className="text-gray-300">
          총 <span className="text-blue-400 font-bold">{totalItems}개</span>의 상품을 분석했습니다
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.map((item, index) => (
            <span key={item.id} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
              {index + 1}. {item.productName} - ₩{item.productPrice.toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      {/* 세션 갤러리 카드 */}
      <div className="max-w-4xl mx-auto">
        <FadeInSection>
          <ScaleOnHover scale={1.02}>
            <GlassCard className="overflow-hidden">
              {/* 대표 이미지 슬라이더 */}
              <div className="relative h-96 bg-gray-800">
                <Image
                  src={data[0]?.productImage || '/placeholder.jpg'}
                  alt="리서치 대표 이미지"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
                
                {/* 카테고리 배지 */}
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-black/80 text-white text-sm rounded-full backdrop-blur-sm">
                    {data[0]?.category || '노트북'}
                  </span>
                </div>
                
                {/* 상품 수 표시 */}
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-2 bg-blue-600/90 text-white text-sm rounded-full backdrop-blur-sm">
                    {totalItems}개 상품 분석
                  </span>
                </div>
                
                {/* 오버레이 정보 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    2024 가성비 노트북 TOP3 리서치
                  </h2>
                  <p className="text-gray-200 text-sm">
                    총 {totalItems}개 제품을 종합 분석한 상세 리서치 보고서
                  </p>
                </div>
              </div>
              
              {/* 상품 목록 */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">분석 상품 목록</h3>
                <div className="grid gap-3">
                  {data.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{item.productName}</h4>
                          <p className="text-gray-400 text-sm">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold">₩{item.productPrice.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">평점 {item.analysis.rating}/5</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 액션 버튼 */}
                <div className="mt-6">
                  <Link
                    href={`/research/${currentSessionId}`}
                    className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
                  >
                    📊 상세 리서치 보고서 보기
                  </Link>
                  <p className="text-center text-gray-400 text-sm mt-2">
                    클릭하여 전체 분석 결과와 구매 가이드를 확인하세요
                  </p>
                </div>
              </div>
            </GlassCard>
          </ScaleOnHover>
        </FadeInSection>
      </div>
    </div>
  );
}