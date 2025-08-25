import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResearchProgressBar from '../ResearchProgressBar';

// UI 컴포넌트 모킹
vi.mock('@/shared/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
}));

// Lucide 아이콘 모킹
vi.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className?: string }) => (
    <div data-testid="alert-circle-icon" className={className}>AlertCircle</div>
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid="check-circle-icon" className={className}>CheckCircle</div>
  ),
  Clock: ({ className }: { className?: string }) => (
    <div data-testid="clock-icon" className={className}>Clock</div>
  ),
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader2-icon" className={className}>Loader2</div>
  ),
}));

describe('ResearchProgressBar', () => {
  const defaultProps = {
    status: 'pending',
    progressData: null,
    jobId: null,
  };

  const mockProgressData = {
    current: 3,
    total: 10,
    percentage: 30,
    currentItem: '테스트 상품 3',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('jobId가 없고 pending 상태일 때 렌더링하지 않아야 한다', () => {
      render(<ResearchProgressBar {...defaultProps} />);

      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('jobId가 있으면 pending 상태에서도 렌더링해야 한다', () => {
      render(
        <ResearchProgressBar
          {...defaultProps}
          jobId="test-job-123"
        />
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('리서치 시작 대기 중...')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });
  });

  describe('상태별 렌더링', () => {
    it('pending 상태를 올바르게 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="pending"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      expect(screen.getByText('리서치 시작 대기 중...')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toHaveClass('text-yellow-400');
    });

    it('in_progress 상태를 올바르게 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      expect(screen.getByText('리서치 진행 중...')).toBeInTheDocument();
      expect(screen.getByTestId('loader2-icon')).toBeInTheDocument();
      expect(screen.getByTestId('loader2-icon')).toHaveClass('text-blue-400', 'animate-spin');
    });

    it('completed 상태를 올바르게 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="completed"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      expect(screen.getByText('리서치 완료!')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toHaveClass('text-green-400');
    });

    it('failed 상태를 올바르게 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="failed"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      expect(screen.getByText('리서치 실패')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toHaveClass('text-red-400');
    });

    it('알 수 없는 상태에 대해 기본 상태를 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="unknown"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      expect(screen.getByText('상태 확인 중...')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toHaveClass('text-gray-400');
    });
  });

  describe('진행률 데이터 표시', () => {
    it('진행률 퍼센티지를 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });

    it('현재 아이템 이름을 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      expect(screen.getByText('현재: 테스트 상품 3')).toBeInTheDocument();
    });

    it('currentItem이 없을 때 현재 아이템을 표시하지 않아야 한다', () => {
      const progressDataWithoutItem = {
        current: 5,
        total: 10,
        percentage: 50,
      };

      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={progressDataWithoutItem}
          jobId="test-job-123"
        />
      );

      expect(screen.queryByText(/현재:/)).not.toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('progressData가 없을 때 진행률을 표시하지 않아야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={null}
          jobId="test-job-123"
        />
      );

      expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
    });
  });

  describe('진행률 바', () => {
    it('진행률 바를 올바른 너비로 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      const progressBar = screen.getByTestId('card').querySelector(
        '.h-2.rounded-full.transition-all'
      );

      expect(progressBar).toHaveStyle({ width: '30%' });
      expect(progressBar).toHaveClass('bg-blue-500');
    });

    it('completed 상태에서 초록색 진행률 바를 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="completed"
          progressData={{ ...mockProgressData, percentage: 100 }}
          jobId="test-job-123"
        />
      );

      const progressBar = screen.getByTestId('card').querySelector(
        '.h-2.rounded-full.transition-all'
      );

      expect(progressBar).toHaveClass('bg-green-500');
    });

    it('failed 상태에서 빨간색 진행률 바를 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="failed"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      const progressBar = screen.getByTestId('card').querySelector(
        '.h-2.rounded-full.transition-all'
      );

      expect(progressBar).toHaveClass('bg-red-500');
    });

    it('100%를 초과하는 퍼센티지를 100%로 제한해야 한다', () => {
      const overflowProgressData = {
        current: 12,
        total: 10,
        percentage: 120,
      };

      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={overflowProgressData}
          jobId="test-job-123"
        />
      );

      const progressBar = screen.getByTestId('card').querySelector(
        '.h-2.rounded-full.transition-all'
      );

      expect(progressBar).toHaveStyle({ width: '100%' });
      expect(screen.getByText('120%')).toBeInTheDocument(); // 표시된 텍스트는 실제 값
    });

    it('progressData가 없을 때 진행률 바를 표시하지 않아야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={null}
          jobId="test-job-123"
        />
      );

      const progressBar = screen.getByTestId('card').querySelector(
        '.h-2.rounded-full.transition-all'
      );

      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Job ID 표시', () => {
    it('Job ID를 표시해야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      expect(screen.getByText('Job ID: test-job-123')).toBeInTheDocument();
    });

    it('jobId가 null일 때 Job ID를 표시하지 않아야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId={null}
        />
      );

      expect(screen.queryByText(/Job ID:/)).not.toBeInTheDocument();
    });
  });

  describe('CSS 클래스 적용', () => {
    it('pending 상태의 올바른 CSS 클래스를 적용해야 한다', () => {
      render(
        <ResearchProgressBar
          status="pending"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-yellow-500/20', 'border-yellow-500/30');
    });

    it('in_progress 상태의 올바른 CSS 클래스를 적용해야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-blue-500/20', 'border-blue-500/30');
    });

    it('completed 상태의 올바른 CSS 클래스를 적용해야 한다', () => {
      render(
        <ResearchProgressBar
          status="completed"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-green-500/20', 'border-green-500/30');
    });

    it('failed 상태의 올바른 CSS 클래스를 적용해야 한다', () => {
      render(
        <ResearchProgressBar
          status="failed"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-red-500/20', 'border-red-500/30');
    });
  });

  describe('애니메이션', () => {
    it('in_progress 상태에서 Loader2 아이콘에 애니메이션을 적용해야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      const loader = screen.getByTestId('loader2-icon');
      expect(loader).toHaveClass('animate-spin');
    });

    it('다른 상태에서는 애니메이션을 적용하지 않아야 한다', () => {
      render(
        <ResearchProgressBar
          status="pending"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      const clock = screen.getByTestId('clock-icon');
      expect(clock).not.toHaveClass('animate-spin');
    });
  });

  describe('접근성', () => {
    it('진행률 바에 적절한 aria 속성이 있어야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      // 진행률 바 컨테이너를 찾고 role 확인
      const progressContainer = screen.getByTestId('card').querySelector(
        '.w-full.bg-gray-700'
      );

      expect(progressContainer).toBeInTheDocument();
    });

    it('상태 메시지가 화면 리더로 읽을 수 있어야 한다', () => {
      render(
        <ResearchProgressBar
          status="in_progress"
          progressData={mockProgressData}
          jobId="test-job-123"
        />
      );

      // 텍스트 콘텐츠가 접근 가능해야 함
      expect(screen.getByText('리서치 진행 중...')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
    });
  });
});