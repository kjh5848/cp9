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


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" message="리서치 결과를 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    // 에러 유형 분류
    const getErrorInfo = (errorMessage: string) => {
      const lowerError = errorMessage.toLowerCase();
      
      if (lowerError.includes('network') || lowerError.includes('fetch')) {
        return {
          type: 'network',
          icon: (
            <svg className="w-16 h-16 text-orange-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
          title: '네트워크 연결 오류',
          description: '인터넷 연결을 확인하고 다시 시도해주세요.',
          canRetry: true
        };
      }
      
      if (lowerError.includes('500') || lowerError.includes('502') || lowerError.includes('503')) {
        return {
          type: 'server',
          icon: (
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: '서버 일시 오류',
          description: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          canRetry: true
        };
      }
      
      if (lowerError.includes('401') || lowerError.includes('403') || lowerError.includes('unauthorized')) {
        return {
          type: 'auth',
          icon: (
            <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          title: '접근 권한 오류',
          description: '로그인이 필요하거나 권한이 없습니다.',
          canRetry: false
        };
      }
      
      if (lowerError.includes('404') || lowerError.includes('not found')) {
        return {
          type: 'notfound',
          icon: (
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.464-.881-6.08-2.33" />
            </svg>
          ),
          title: '데이터를 찾을 수 없음',
          description: '요청한 리서치 데이터가 존재하지 않습니다.',
          canRetry: false
        };
      }
      
      // 기본 에러
      return {
        type: 'general',
        icon: (
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: '오류가 발생했습니다',
        description: '알 수 없는 오류가 발생했습니다.',
        canRetry: true
      };
    };

    const errorInfo = getErrorInfo(error);

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          {/* 에러 아이콘 */}
          {errorInfo.icon}
          
          {/* 에러 제목 */}
          <h2 className="text-2xl font-bold text-white mb-3">{errorInfo.title}</h2>
          
          {/* 에러 설명 */}
          <p className="text-gray-300 mb-2">{errorInfo.description}</p>
          
          {/* 상세 에러 메시지 (개발용) */}
          <details className="mb-8">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 mb-2">
              기술적 세부사항 보기
            </summary>
            <div className="text-xs text-gray-400 bg-gray-800 p-3 rounded-lg text-left">
              <code>{error}</code>
            </div>
          </details>
          
          {/* 액션 버튼들 */}
          <div className="space-y-3">
            {/* 다시 시도 버튼 (재시도 가능한 경우만) */}
            {errorInfo.canRetry && (
              <button 
                onClick={() => window.location.reload()}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                다시 시도
              </button>
            )}
            
            {/* 아이템 생성 버튼 (항상 표시) */}
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              새 아이템 생성하기
            </button>
            
            {/* 홈으로 이동 버튼 */}
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              홈으로 돌아가기
            </button>
          </div>
          
          {/* 도움말 텍스트 */}
          <div className="mt-8 text-sm text-gray-500">
            <p>문제가 지속되면 새로운 아이템을 생성해서</p>
            <p>리서치를 다시 시작해보세요.</p>
          </div>
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
          {loading ? (
            <GalleryView products={[]} loading={true} />
          ) : data.length > 0 ? (
            <GalleryView products={coupangProducts} loading={false} />
          ) : (
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
          )}
        </div>
      </div>
      
      {/* 개발 환경 캐시 디버그 패널 */}
      <CacheDebugPanel />
    </div>
  );
}