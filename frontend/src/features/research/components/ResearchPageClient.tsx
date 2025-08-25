'use client';

import { useState, useMemo, useEffect } from 'react';
import { CoupangProduct } from '../types';
import ResearchHeader from './ResearchHeader';
import ResearchProgressBar from './ResearchProgressBar';
import GalleryView from './views/GalleryView';
import { useResearchData } from '../hooks/useResearchData';
import { LoadingSpinner } from '@/shared/components/advanced-ui';
import { useJobStatusTracker } from '@/shared/hooks/useJobStatusTracker';
import { WebSocketMessage } from '@/shared/types/websocket';
import { useResearchSessions } from '../hooks/useResearchSessions';
import { CacheDebugPanel } from './CacheDebugPanel';
// 기존 전체 페이지 에러/빈 상태 처리 제거됨 - GalleryView에서 처리

interface ResearchPageClientProps {
  sessionId?: string;
  currentSessionId?: string; // 하위호환성
}

/**
 * 리서치 결과 페이지 클라이언트 컴포넌트
 * 선택된 상품들의 리서치 결과를 다양한 뷰로 표시
 * WebSocket을 통한 실시간 업데이트 지원
 */
export default function ResearchPageClient({ 
  sessionId, 
}: ResearchPageClientProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('pending');
  const [progressData, setProgressData] = useState<{
    current: number;
    total: number;
    percentage: number;
    currentItem?: string;
  } | null>(null);

  const { data, loading, error } = useResearchData();
  const { sessions, refreshSessions } = useResearchSessions();

  // WebSocket 메시지 핸들러
  const handleJobUpdate = (message: WebSocketMessage) => {
    console.log('[ResearchPageClient] WebSocket 메시지:', message);
    
    switch (message.type) {
      case 'job_status':
        setJobStatus(message.data.status);
        if (message.data.total_items && message.data.successful_items !== undefined) {
          setProgressData({
            current: message.data.successful_items,
            total: message.data.total_items,
            percentage: (message.data.successful_items / message.data.total_items) * 100,
          });
        }
        break;
        
      case 'job_progress':
        setProgressData({
          current: message.data.current_item,
          total: message.data.total_items,
          percentage: message.data.progress_percentage,
          currentItem: message.data.current_item_name
        });
        break;
        
      case 'job_complete':
        setJobStatus('completed');
        setProgressData(prev => prev ? { ...prev, percentage: 100 } : null);
        // 세션 새로고침하여 최신 결과 반영
        setTimeout(() => refreshSessions(), 1000);
        break;
        
      case 'job_error':
        setJobStatus('failed');
        console.error('[ResearchPageClient] 작업 실패:', message.data);
        // 백엔드 표준 에러 처리 - 필요시 에러 메시지 한국어화
        const errorMessage = message.data?.message || message.data?.detail || '알 수 없는 오류가 발생했습니다';
        console.log('[ResearchPageClient] 처리된 에러 메시지:', errorMessage);
        break;
    }
  };

  // WebSocket 트래커 초기화
  useJobStatusTracker(jobId, handleJobUpdate);

  // sessionId에서 job_id 추출 로직
  useEffect(() => {
    if (sessionId) {
      console.log('[ResearchPageClient] 세션 ID:', sessionId);
      
      // 세션 목록에서 해당 세션을 찾아 job_id 추출
      const session = sessions.find(s => s.id === sessionId);
      if (session && session.job_id) {
        setJobId(session.job_id);
        console.log('[ResearchPageClient] Job ID 설정:', session.job_id);
      } else if (sessionId.startsWith('temp_') || sessionId.includes('-')) {
        // 임시 세션이거나 UUID 형식인 경우 job_id로 사용
        setJobId(sessionId);
        console.log('[ResearchPageClient] 세션 ID를 Job ID로 사용:', sessionId);
      }
    }
  }, [sessionId, sessions]);

  // ResearchItem을 CoupangProduct로 변환하는 메모화된 함수
  const coupangProducts = useMemo((): CoupangProduct[] => {
    return data.map((item, index) => ({
      productName: item.productName,
      productImage: item.productImage,
      productPrice: item.productPrice,
      productUrl: item.productUrl,
      productId: parseInt(item.productId) || index + 1,
      isRocket: false, // ResearchItem에는 없는 정보
      isFreeShipping: false, // ResearchItem에는 없는 정보
      categoryName: item.category
    }));
  }, [data]);


  // 전체 페이지 로딩/에러 상태 처리 제거 - 갤러리 영역에서만 처리

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <ResearchHeader 
        title="AI 리서치 결과"
        subtitle="AI가 분석한 상품 리서치 보고서를 확인하고 활용하세요"
        itemCount={data.length}
      />
      
      {/* 컨테이너 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 진행률 표시 */}
        <ResearchProgressBar
          status={jobStatus}
          progressData={progressData}
          jobId={jobId}
        />
        
        
        {/* 컨텐츠 영역 */}
        <div className="mt-6">
          <GalleryView 
            products={coupangProducts} 
            loading={loading}
            error={error}
          />
        </div>
      </div>
      
      {/* 개발 환경 캐시 디버그 패널 */}
      <CacheDebugPanel />
    </div>
  );
}