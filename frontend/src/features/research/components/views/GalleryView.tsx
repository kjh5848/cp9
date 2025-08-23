'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FadeInSection } from '@/shared/components/advanced-ui';
import { GalleryCard } from '@/shared/components';
import { CoupangProduct } from '../../types';
import { Package } from 'lucide-react';

interface GalleryViewProps {
  products: CoupangProduct[];
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

  // 빈 상태 처리
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">표시할 상품이 없습니다</h3>
        <p className="text-gray-400">상품을 추가하여 갤러리를 확인하세요.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 갤러리 개요 */}
      {sessionGroups.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-blue-400" />
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