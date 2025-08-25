'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FadeInSection } from '@/shared/components/advanced-ui';
import { GalleryCard } from '@/shared/components';
import { CoupangProduct } from '../../types';
import { GallerySkeleton } from '../GallerySkeleton';

interface GalleryViewProps {
  products: CoupangProduct[];
  loading?: boolean;
  researchStates?: Record<number, { 
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
  }>;
  onProductSelect?: (product: CoupangProduct) => void;
  onViewDetail?: (product: CoupangProduct) => void;
  selectedProducts?: number[];
  showSelection?: boolean;
}

/**
 * 갤러리 뷰 컴포넌트
 * 리서치 세션들을 갤러리 카드 그리드로 표시
 * 각 카드는 세션에 포함된 여러 제품을 슬라이더로 보여줌
 */
export default function GalleryView({ 
  products,
  loading = false,
  researchStates = {}
}: GalleryViewProps) {
  const router = useRouter();

  // 제품들을 세션별로 그룹화 (현재는 임시로 3개씩 그룹화)
  const sessionGroups = useMemo(() => {
    const groups = [];
    const groupSize = 3;
    
    for (let i = 0; i < products.length; i += groupSize) {
      const sessionProducts = products.slice(i, i + groupSize);
      const sessionId = `${Math.floor(i / groupSize) + 1}`;
      
      // 세션 내 제품들의 리서치 상태 확인
      const statuses = sessionProducts.map(p => researchStates[p.productId]?.status || 'pending');
      let overallStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
      
      if (statuses.every(s => s === 'completed')) {
        overallStatus = 'completed';
      } else if (statuses.some(s => s === 'processing')) {
        overallStatus = 'processing';
      } else if (statuses.some(s => s === 'failed')) {
        overallStatus = 'failed';
      }

      // 세션 제목 생성 (제품 카테고리 기반)
      const category = sessionProducts[0]?.categoryName || '제품';
      const sessionTitle: string = `${category} 비교분석 ${groups.length + 1}`;

      groups.push({
        sessionId,
        products: sessionProducts,
        researchStatus: overallStatus,
        title: sessionTitle
      });
    }
    
    return groups;
  }, [products, researchStates]);

  // 세션 클릭 핸들러
  const handleSessionClick = (sessionId: string) => {
    router.push(`/research/${sessionId}`);
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div>
        {/* 갤러리 헤더 스켈레톤 */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded w-32"></div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-64 mb-4"></div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-6 bg-gray-700 rounded-full w-24"></div>
            ))}
          </div>
        </div>
        
        {/* 갤러리 카드 스켈레톤 */}
        <GallerySkeleton count={6} />
      </div>
    );
  }

  // 빈 상태 처리
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">아이템을 생성하고 리서치를 시작하세요</h3>
          <p className="text-gray-400 mb-8">상품을 추가하여 AI 리서치 분석을 받아보세요.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            아이템 생성하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 갤러리 개요 */}
      {sessionGroups.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-xl font-bold text-white">리서치 갤러리</h3>
          </div>
          <p className="text-gray-300">
            총 <span className="text-blue-400 font-bold">{sessionGroups.length}개</span>의 리서치 세션이 있습니다
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {sessionGroups.slice(0, 3).map((group, index) => (
              <span key={group.sessionId} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                {index + 1}. {group.title} ({group.products.length}개 제품)
              </span>
            ))}
            {sessionGroups.length > 3 && (
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                +{sessionGroups.length - 3}개 더
              </span>
            )}
          </div>
        </div>
      )}

      {/* 반응형 갤러리 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sessionGroups.map((group, index) => (
          <FadeInSection key={group.sessionId} delay={index * 100}>
            <GalleryCard
              sessionId={group.sessionId}
              products={group.products}
              researchStatus={group.researchStatus}
              title={group.title}
              onClick={handleSessionClick}
            />
          </FadeInSection>
        ))}
      </div>

      {/* 하단 액션 영역 */}
      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm">
          각 갤러리 카드를 클릭하여 세부 리서치 결과를 확인하세요
        </p>
      </div>
    </div>
  );
}