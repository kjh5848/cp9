'use client';

import { GradientBackground } from '@/shared/components/advanced-ui';
import { Search, Package, TrendingUp } from 'lucide-react';

interface ResearchHeaderProps {
  title: string;
  itemCount: number;
  subtitle?: string;
}

/**
 * 리서치 헤더 컴포넌트
 * 페이지 상단의 타이틀과 정보를 표시
 */
export default function ResearchHeader({ title, itemCount, subtitle }: ResearchHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      <GradientBackground />
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center">
          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600/20 rounded-full backdrop-blur-sm">
              <Search className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* 타이틀 */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h1>

          {/* 서브타이틀 */}
          {subtitle && (
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}

          {/* 통계 */}
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="text-white">
                <span className="font-bold text-2xl">{itemCount}</span>
                <span className="text-gray-400 ml-1">개 상품</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white">
                AI 분석 완료
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}