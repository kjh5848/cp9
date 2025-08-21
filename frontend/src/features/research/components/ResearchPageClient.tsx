'use client';

import { useState } from 'react';
import { ViewMode } from '../types';
import ViewSwitcher from './ViewSwitcher';
import ResearchHeader from './ResearchHeader';
import GalleryView from './views/GalleryView';
import CardView from './views/CardView';
import TableView from './views/TableView';
import BlogView from './views/BlogView';
import { useResearchData } from '../hooks/useResearchData';
import { LoadingSpinner } from '@/shared/components/advanced-ui';

interface ResearchPageClientProps {
  currentSessionId?: string;
}

/**
 * 리서치 결과 페이지 클라이언트 컴포넌트
 * 선택된 상품들의 리서치 결과를 다양한 뷰로 표시
 */
export default function ResearchPageClient({ currentSessionId = '1' }: ResearchPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const { data, loading, error } = useResearchData();

  // 뷰 컴포넌트 매핑
  const ViewComponent = {
    gallery: GalleryView,
    card: CardView,
    table: TableView,
    blog: BlogView
  }[viewMode];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" message="리서치 결과를 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <ResearchHeader 
        title="AI 리서치 결과"
        subtitle="선택하신 상품들에 대한 상세 분석 결과입니다"
        itemCount={data.length}
      />
      
      {/* 뷰 전환 버튼 */}
      <div className="container mx-auto px-4 py-6">
        <ViewSwitcher 
          current={viewMode}
          onChange={setViewMode}
        />
      </div>
      
      {/* 컨텐츠 영역 */}
      <div className="container mx-auto px-4 pb-12">
        {data.length > 0 ? (
          <ViewComponent data={data} currentSessionId={currentSessionId} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">표시할 리서치 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}