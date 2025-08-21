'use client';

import Image from 'next/image';
import { Card } from '@/shared/ui';
import { StaggeredList, AnimatedButton, ScaleOnHover } from '@/shared/components/advanced-ui';
import { ResearchItem } from '../../types';
import { Star, Package, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CardViewProps {
  data: ResearchItem[];
  currentSessionId?: string;
}

/**
 * 카드 뷰 컴포넌트
 * 세션별 리서치 데이터를 하나의 통합 카드로 표시하는 뷰
 * 각 상품의 개별 카드가 아닌 전체 리서치 세션 정보를 카드 형태로 제공
 */
export default function CardView({ data, currentSessionId = '1' }: CardViewProps) {
  // 전체 아이템 수
  const totalItems = data[0]?.metadata?.totalItems || data.length;

  return (
    <div>
      {/* 리서치 개요 */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">리서치 개요</h3>
        </div>
        <p className="text-gray-300">
          총 <span className="text-purple-400 font-bold">{totalItems}개</span>의 상품을 분석했습니다
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.map((item, index) => (
            <span key={item.id} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
              {index + 1}. {item.productName} - ₩{item.productPrice.toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      {/* 세션 통합 카드 */}
      <div className="max-w-5xl mx-auto">
        <StaggeredList staggerDelay={200} className="space-y-6">
          <ScaleOnHover scale={1.01}>
            <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
              {/* 헤더 섹션 */}
              <div className="relative h-64 bg-gradient-to-r from-purple-900 to-blue-900">
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-8 h-8 text-purple-400" />
                    <h2 className="text-3xl font-bold text-white">2024 가성비 노트북 TOP3</h2>
                  </div>
                  <p className="text-gray-200 text-lg mb-4">
                    총 {totalItems}개 제품을 종합 분석한 상세 리서치 보고서
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>평균 평점 4.2/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span>가격대: ₩489,000 ~ ₩649,000</span>
                    </div>
                  </div>
                </div>
                
                {/* 카테고리 배지 */}
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-black/80 text-white text-sm rounded-full backdrop-blur-sm">
                    {data[0]?.category || '노트북'}
                  </span>
                </div>
                
                {/* 상품 수 배지 */}
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-2 bg-purple-600/90 text-white text-sm rounded-full backdrop-blur-sm">
                    {totalItems}개 상품 분석
                  </span>
                </div>
              </div>

              {/* 상품 비교 섹션 */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">📊 상품 비교 분석</h3>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {data.map((item, index) => (
                    <div key={item.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm line-clamp-1">{item.productName}</h4>
                          <p className="text-purple-400 font-bold text-lg">₩{item.productPrice.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-300">평점 {item.analysis.rating}/5</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-400 line-clamp-2">{item.analysis.pros[0]}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {item.analysis.keywords.slice(0, 2).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 핵심 인사이트 */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 mb-6 border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3">💡 핵심 인사이트</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-green-400 font-semibold text-sm">가성비 최고</p>
                        <p className="text-gray-300 text-sm">레노버 IdeaPad Slim 1 - 489,000원대 최적 선택</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-blue-400 font-semibold text-sm">성능 균형</p>
                        <p className="text-gray-300 text-sm">HP 15s - Ryzen 5 기반 멀티태스킹 우수</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/research/${currentSessionId}`} className="flex-1">
                    <AnimatedButton
                      variant="gradient"
                      className="w-full py-4 text-lg"
                    >
                      📖 전체 리서치 보고서 보기
                    </AnimatedButton>
                  </Link>
                  <Link href={`/research/${currentSessionId}#comparison`} className="flex-1">
                    <AnimatedButton
                      variant="outline"
                      className="w-full py-4 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10"
                    >
                      🔍 상세 비교표 확인
                    </AnimatedButton>
                  </Link>
                </div>
                
                <p className="text-center text-gray-400 text-sm mt-4">
                  클릭하여 각 제품의 상세 스펙, 장단점 분석, 구매 가이드를 확인하세요
                </p>
              </div>
            </Card>
          </ScaleOnHover>
        </StaggeredList>
      </div>
    </div>
  );
}