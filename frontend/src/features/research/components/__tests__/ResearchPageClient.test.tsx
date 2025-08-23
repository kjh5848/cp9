import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResearchPageClient from '../ResearchPageClient';
import { WebSocketMessage } from '@/shared/types/websocket';

// 의존성 모킹
vi.mock('../../hooks/useResearchData', () => ({
  useResearchData: vi.fn(),
}));

vi.mock('../../hooks/useResearchSessions', () => ({
  useResearchSessions: vi.fn(),
}));

vi.mock('@/shared/hooks/useJobStatusTracker', () => ({
  useJobStatusTracker: vi.fn(),
}));

vi.mock('@/shared/components/advanced-ui', () => ({
  LoadingSpinner: ({ message }: { message?: string }) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

vi.mock('../ViewSwitcher', () => ({
  default: ({ current, onChange }: { current: string; onChange: (mode: string) => void }) => (
    <div data-testid="view-switcher">
      <button onClick={() => onChange('card')}>Card View</button>
      <button onClick={() => onChange('gallery')}>Gallery View</button>
      <span>Current: {current}</span>
    </div>
  ),
}));

vi.mock('../ResearchHeader', () => ({
  default: ({ title, itemCount }: { title: string; itemCount: number }) => (
    <div data-testid="research-header">
      <h1>{title}</h1>
      <span>Items: {itemCount}</span>
    </div>
  ),
}));

vi.mock('../ResearchProgressBar', () => ({
  default: ({ 
    status, 
    progressData, 
    jobId 
  }: { 
    status: string; 
    progressData: any; 
    jobId: string | null; 
  }) => (
    <div data-testid="progress-bar">
      <span>Status: {status}</span>
      <span>Job ID: {jobId || 'none'}</span>
      {progressData && (
        <span>Progress: {progressData.percentage}%</span>
      )}
      {progressData?.currentItem && (
        <span>Current: {progressData.currentItem}</span>
      )}
    </div>
  ),
}));

vi.mock('../views/GalleryView', () => ({
  default: ({ products }: { products: any[] }) => (
    <div data-testid="gallery-view">Gallery View ({products.length} products)</div>
  ),
}));

vi.mock('../views/CardView', () => ({
  default: ({ data }: { data: any[] }) => (
    <div data-testid="card-view">Card View ({data.length} items)</div>
  ),
}));

// console 모킹
vi.stubGlobal('console', {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
});

describe('ResearchPageClient - WebSocket 메시지 처리', () => {

  // 테스트용 더미 데이터
  const mockResearchData = [
    {
      id: '1',
      productId: '1',
      productName: '테스트 상품 1',
      productImage: 'https://example.com/image1.jpg',
      productPrice: 10000,
      productUrl: 'https://example.com/product1',
      category: '테스트 카테고리',
      analysis: {
        pros: ['장점1', '장점2'],
        cons: ['단점1'],
        summary: '요약',
        rating: 4.5,
        keywords: ['키워드1', '키워드2'],
      },
      createdAt: new Date(),
    },
  ];

  const mockSessions = [
    {
      id: 'session-123',
      title: '테스트 세션',
      description: '테스트 설명',
      products: [],
      total_products: 1,
      created_at: '2024-01-01T00:00:00Z',
      category_focus: '테스트 카테고리',
      job_id: 'job-456',
      status: 'in_progress' as const,
    },
  ];

  let capturedJobUpdateHandler: ((message: WebSocketMessage) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedJobUpdateHandler = null;

    // 기본 mock 설정
    vi.mocked(require('../../hooks/useResearchData').useResearchData).mockReturnValue({
      data: mockResearchData,
      loading: false,
      error: null,
    });

    vi.mocked(require('../../hooks/useResearchSessions').useResearchSessions).mockReturnValue({
      sessions: mockSessions,
      refreshSessions: vi.fn(),
    });

    // WebSocket 핸들러 캡처
    vi.mocked(require('@/shared/hooks/useJobStatusTracker').useJobStatusTracker).mockImplementation((jobId, onUpdate) => {
      capturedJobUpdateHandler = onUpdate;
      return {
        startTracking: vi.fn(),
        stopTracking: vi.fn(),
        isTracking: !!jobId,
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('정상적으로 렌더링되어야 한다', () => {
      render(<ResearchPageClient />);

      expect(screen.getByTestId('research-header')).toBeInTheDocument();
      expect(screen.getByTestId('view-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('card-view')).toBeInTheDocument();
    });

    it('로딩 상태를 표시해야 한다', () => {
      vi.mocked(require('../../hooks/useResearchData').useResearchData).mockReturnValue({
        data: [],
        loading: true,
        error: null,
      });

      render(<ResearchPageClient />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('리서치 결과를 불러오는 중...')).toBeInTheDocument();
    });

    it('에러 상태를 표시해야 한다', () => {
      vi.mocked(require('../../hooks/useResearchData').useResearchData).mockReturnValue({
        data: [],
        loading: false,
        error: '데이터 로드 실패',
      });

      render(<ResearchPageClient />);

      expect(screen.getByText('데이터 로드 실패')).toBeInTheDocument();
      expect(screen.getByText('다시 시도')).toBeInTheDocument();
    });
  });

  describe('WebSocket 메시지 처리', () => {
    it('job_status 메시지를 올바르게 처리해야 한다', () => {
      render(<ResearchPageClient sessionId="session-123" />);

      const jobStatusMessage: WebSocketMessage = {
        type: 'job_status',
        job_id: 'job-456',
        data: {
          status: 'in_progress',
          total_items: 5,
          successful_items: 2,
        },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        capturedJobUpdateHandler?.(jobStatusMessage);
      });

      // 진행률 바에 상태가 반영되어야 함
      expect(screen.getByText('Status: in_progress')).toBeInTheDocument();
      expect(screen.getByText('Progress: 40%')).toBeInTheDocument();
    });

    it('job_progress 메시지를 올바르게 처리해야 한다', () => {
      render(<ResearchPageClient sessionId="session-123" />);

      const jobProgressMessage: WebSocketMessage = {
        type: 'job_progress',
        job_id: 'job-456',
        data: {
          current_item: 3,
          total_items: 5,
          progress_percentage: 60,
          current_item_name: '테스트 상품 3',
        },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        capturedJobUpdateHandler?.(jobProgressMessage);
      });

      expect(screen.getByText('Progress: 60%')).toBeInTheDocument();
      expect(screen.getByText('Current: 테스트 상품 3')).toBeInTheDocument();
    });

    it('job_complete 메시지를 올바르게 처리해야 한다', async () => {
      const mockRefreshSessions = vi.fn();
      vi.mocked(require('../../hooks/useResearchSessions').useResearchSessions).mockReturnValue({
        sessions: mockSessions,
        refreshSessions: mockRefreshSessions,
      });

      render(<ResearchPageClient sessionId="session-123" />);

      const jobCompleteMessage: WebSocketMessage = {
        type: 'job_complete',
        job_id: 'job-456',
        data: {
          result: '작업 완료',
          total_items: 5,
          successful_items: 5,
        },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        capturedJobUpdateHandler?.(jobCompleteMessage);
      });

      expect(screen.getByText('Status: completed')).toBeInTheDocument();
      expect(screen.getByText('Progress: 100%')).toBeInTheDocument();

      // 1초 후 세션 새로고침이 호출되어야 함
      await waitFor(
        () => {
          expect(mockRefreshSessions).toHaveBeenCalled();
        },
        { timeout: 1500 }
      );
    });

    it('job_error 메시지를 올바르게 처리해야 한다', () => {
      render(<ResearchPageClient sessionId="session-123" />);

      const jobErrorMessage: WebSocketMessage = {
        type: 'job_error',
        job_id: 'job-456',
        data: {
          error: '리서치 처리 중 오류 발생',
          error_code: 'RESEARCH_FAILED',
        },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        capturedJobUpdateHandler?.(jobErrorMessage);
      });

      expect(screen.getByText('Status: failed')).toBeInTheDocument();
    });

    it('알 수 없는 메시지 타입은 무시해야 한다', () => {
      render(<ResearchPageClient sessionId="session-123" />);

      const unknownMessage = {
        type: 'unknown_type',
        job_id: 'job-456',
        data: {},
        timestamp: new Date().toISOString(),
      } as any;

      // 에러가 발생하지 않아야 함
      expect(() => {
        act(() => {
          capturedJobUpdateHandler?.(unknownMessage);
        });
      }).not.toThrow();

      // 상태가 변경되지 않아야 함
      expect(screen.getByText('Status: pending')).toBeInTheDocument();
    });
  });

  describe('세션 ID 처리', () => {
    it('세션 ID로 job_id를 찾아 설정해야 한다', () => {
      render(<ResearchPageClient sessionId="session-123" />);

      // useJobStatusTracker가 올바른 job_id로 호출되어야 함
      expect(vi.mocked(require('@/shared/hooks/useJobStatusTracker').useJobStatusTracker)).toHaveBeenCalledWith(
        'job-456',
        expect.any(Function)
      );
    });

    it('세션을 찾을 수 없을 때 sessionId를 job_id로 사용해야 한다', () => {
      // 세션 목록에서 해당 세션을 찾을 수 없는 경우
      vi.mocked(require('../../hooks/useResearchSessions').useResearchSessions).mockReturnValue({
        sessions: [],
        refreshSessions: vi.fn(),
      });

      render(<ResearchPageClient sessionId="temp_123" />);

      // sessionId가 job_id로 사용되어야 함
      expect(vi.mocked(require('@/shared/hooks/useJobStatusTracker').useJobStatusTracker)).toHaveBeenCalledWith(
        'temp_123',
        expect.any(Function)
      );
    });

    it('sessionId가 없을 때 job_id를 null로 설정해야 한다', () => {
      render(<ResearchPageClient />);

      expect(vi.mocked(require('@/shared/hooks/useJobStatusTracker').useJobStatusTracker)).toHaveBeenCalledWith(
        null,
        expect.any(Function)
      );
    });

    it('UUID 형식의 sessionId를 job_id로 사용해야 한다', () => {
      const uuidSessionId = '123e4567-e89b-12d3-a456-426614174000';
      
      vi.mocked(require('../../hooks/useResearchSessions').useResearchSessions).mockReturnValue({
        sessions: [], // 세션 목록에서 찾을 수 없음
        refreshSessions: vi.fn(),
      });

      render(<ResearchPageClient sessionId={uuidSessionId} />);

      expect(vi.mocked(require('@/shared/hooks/useJobStatusTracker').useJobStatusTracker)).toHaveBeenCalledWith(
        uuidSessionId,
        expect.any(Function)
      );
    });
  });

  describe('진행률 데이터 계산', () => {
    it('total_items와 successful_items로 진행률을 계산해야 한다', () => {
      render(<ResearchPageClient sessionId="session-123" />);

      const jobStatusMessage: WebSocketMessage = {
        type: 'job_status',
        job_id: 'job-456',
        data: {
          status: 'in_progress',
          total_items: 10,
          successful_items: 3,
        },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        capturedJobUpdateHandler?.(jobStatusMessage);
      });

      expect(screen.getByText('Progress: 30%')).toBeInTheDocument();
    });

    it('progress_percentage를 직접 사용해야 한다', () => {
      render(<ResearchPageClient sessionId="session-123" />);

      const jobProgressMessage: WebSocketMessage = {
        type: 'job_progress',
        job_id: 'job-456',
        data: {
          current_item: 7,
          total_items: 10,
          progress_percentage: 75,
        },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        capturedJobUpdateHandler?.(jobProgressMessage);
      });

      expect(screen.getByText('Progress: 75%')).toBeInTheDocument();
    });

    it('job_complete 시 100%로 설정해야 한다', () => {
      render(<ResearchPageClient sessionId="session-123" />);

      // 먼저 50% 진행률 설정
      act(() => {
        capturedJobUpdateHandler?.({
          type: 'job_progress',
          job_id: 'job-456',
          data: { progress_percentage: 50 },
          timestamp: new Date().toISOString(),
        });
      });

      expect(screen.getByText('Progress: 50%')).toBeInTheDocument();

      // 작업 완료
      act(() => {
        capturedJobUpdateHandler?.({
          type: 'job_complete',
          job_id: 'job-456',
          data: {},
          timestamp: new Date().toISOString(),
        });
      });

      expect(screen.getByText('Progress: 100%')).toBeInTheDocument();
    });
  });

  describe('뷰 모드 전환', () => {
    it('갤러리 뷰로 전환할 수 있어야 한다', () => {
      render(<ResearchPageClient />);

      expect(screen.getByTestId('card-view')).toBeInTheDocument();

      const galleryButton = screen.getByText('Gallery View');
      act(() => {
        galleryButton.click();
      });

      expect(screen.getByTestId('gallery-view')).toBeInTheDocument();
    });
  });

  describe('에러 경계', () => {
    it('WebSocket 메시지 처리 중 에러가 발생해도 컴포넌트가 크래시되지 않아야 한다', () => {
      render(<ResearchPageClient sessionId="session-123" />);

      // 잘못된 메시지로 에러 유발
      const malformedMessage = null as any;

      expect(() => {
        act(() => {
          capturedJobUpdateHandler?.(malformedMessage);
        });
      }).not.toThrow();
    });
  });
});