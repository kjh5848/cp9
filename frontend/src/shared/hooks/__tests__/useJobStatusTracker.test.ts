import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useJobStatusTracker } from '../useJobStatusTracker';
import { WebSocketMessage, JobUpdateHandler } from '../../types/websocket';

// WebSocket 모킹
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState: number = MockWebSocket.CONNECTING;
  public url: string;
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    // 비동기적으로 연결 시뮬레이션
    setTimeout(() => {
      if (this.readyState === MockWebSocket.CONNECTING) {
        this.readyState = MockWebSocket.OPEN;
        if (this.onopen) {
          this.onopen(new Event('open'));
        }
      }
    }, 100);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    // 송신 기능 모킹 (필요시)
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: code || 1000, reason }));
    }
  }

  // 테스트용 메시지 전송 헬퍼
  simulateMessage(data: unknown): void {
    if (this.readyState === MockWebSocket.OPEN && this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  // 테스트용 에러 시뮬레이션
  simulateError(): void {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  // 테스트용 연결 실패 시뮬레이션
  simulateConnectionFailure(): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

// 전역 WebSocket 모킹
global.WebSocket = MockWebSocket as any;

// fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

// 타이머 모킹
vi.useFakeTimers();

// console 모킹 (불필요한 로그 제거)
vi.stubGlobal('console', {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
});

describe('useJobStatusTracker', () => {
  const mockJobId = 'test-job-123';
  const mockOnUpdate: JobUpdateHandler = vi.fn();

  let mockWebSocketInstance: MockWebSocket | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWebSocketInstance = null;
    
    // WebSocket 인스턴스 캡처
    const OriginalWebSocket = global.WebSocket;
    global.WebSocket = vi.fn().mockImplementation((url: string) => {
      mockWebSocketInstance = new MockWebSocket(url);
      return mockWebSocketInstance;
    }) as any;
    
    // WebSocket 상수들 복원
    (global.WebSocket as any).CONNECTING = MockWebSocket.CONNECTING;
    (global.WebSocket as any).OPEN = MockWebSocket.OPEN;
    (global.WebSocket as any).CLOSING = MockWebSocket.CLOSING;
    (global.WebSocket as any).CLOSED = MockWebSocket.CLOSED;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.restoreAllMocks();
    mockWebSocketInstance = null;
  });

  describe('기본 기능 테스트', () => {
    it('jobId가 있을 때 트래킹을 시작해야 한다', async () => {
      const { result } = renderHook(() =>
        useJobStatusTracker(mockJobId, mockOnUpdate)
      );

      expect(result.current.isTracking).toBe(true);
      expect(global.WebSocket).toHaveBeenCalledWith(
        'ws://localhost:8000/api/v1/ws/research/test-job-123'
      );
    });

    it('jobId가 null일 때 트래킹을 시작하지 않아야 한다', () => {
      const { result } = renderHook(() =>
        useJobStatusTracker(null, mockOnUpdate)
      );

      expect(result.current.isTracking).toBe(false);
      expect(global.WebSocket).not.toHaveBeenCalled();
    });

    it('컴포넌트 언마운트 시 트래킹을 중지해야 한다', async () => {
      const { result, unmount } = renderHook(() =>
        useJobStatusTracker(mockJobId, mockOnUpdate)
      );

      expect(result.current.isTracking).toBe(true);

      unmount();

      expect(mockWebSocketInstance?.readyState).toBe(MockWebSocket.CLOSED);
    });
  });

  describe('WebSocket 연결 테스트', () => {
    it('WebSocket 연결 성공 시 메시지를 처리해야 한다', async () => {
      renderHook(() => useJobStatusTracker(mockJobId, mockOnUpdate));

      await act(async () => {
        vi.advanceTimersByTime(100); // 연결 시뮬레이션
      });

      expect(mockWebSocketInstance?.readyState).toBe(MockWebSocket.OPEN);

      // 메시지 전송 시뮬레이션
      const testMessage: WebSocketMessage = {
        type: 'job_progress',
        job_id: mockJobId,
        data: {
          current_item: 1,
          total_items: 5,
          progress_percentage: 20,
          current_item_name: '테스트 상품'
        },
        timestamp: new Date().toISOString()
      };

      act(() => {
        mockWebSocketInstance?.simulateMessage(testMessage);
      });

      expect(mockOnUpdate).toHaveBeenCalledWith(testMessage);
    });

    it('WebSocket 연결 실패 시 폴링으로 전환해야 한다', async () => {
      const mockResponse = {
        status: 'in_progress',
        current_item: 1,
        total_items: 5,
        progress_percentage: 20
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      renderHook(() => useJobStatusTracker(mockJobId, mockOnUpdate));

      // WebSocket 연결 실패 시뮬레이션
      act(() => {
        mockWebSocketInstance?.simulateConnectionFailure();
      });

      // 5초 후 폴링 시작
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // 폴링 첫 번째 호출
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/research/products/test-job-123/status'
      );
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'job_status',
          job_id: mockJobId,
          data: mockResponse
        })
      );
    });

    it('WebSocket 에러 발생 시 폴링으로 전환해야 한다', async () => {
      const mockResponse = {
        status: 'in_progress'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      renderHook(() => useJobStatusTracker(mockJobId, mockOnUpdate));

      await act(async () => {
        vi.advanceTimersByTime(100); // 연결 성공 대기
      });

      // WebSocket 에러 시뮬레이션
      act(() => {
        mockWebSocketInstance?.simulateError();
      });

      // 폴링 첫 번째 호출
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('5초 후 WebSocket 연결이 안 되면 폴링을 시작해야 한다', async () => {
      // WebSocket이 연결되지 않도록 설정
      global.WebSocket = vi.fn().mockImplementation(() => {
        const mockWs = new MockWebSocket('test-url');
        mockWs.readyState = MockWebSocket.CONNECTING; // 연결 중 상태 유지
        return mockWs;
      }) as any;

      const mockResponse = {
        status: 'in_progress'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      renderHook(() => useJobStatusTracker(mockJobId, mockOnUpdate));

      // 5초 대기 (WebSocket 타임아웃)
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // 폴링 첫 번째 호출
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/research/products/test-job-123/status'
      );
    });
  });

  describe('폴링 기능 테스트', () => {
    it('폴링 중 API 에러 발생 시 계속 시도해야 한다', async () => {
      // 첫 번째 호출은 실패, 두 번째 호출은 성공
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'in_progress' }),
        });

      renderHook(() => useJobStatusTracker(mockJobId, mockOnUpdate));

      // WebSocket 연결 실패로 폴링 시작
      act(() => {
        mockWebSocketInstance?.simulateError();
      });

      // 첫 번째 폴링 (실패)
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // 두 번째 폴링 (성공)
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockOnUpdate).toHaveBeenCalledTimes(1); // 성공한 호출만
    });

    it('작업 완료 시 폴링을 중지해야 한다', async () => {
      const mockResponse = {
        status: 'completed',
        result: '작업 완료'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      renderHook(() => useJobStatusTracker(mockJobId, mockOnUpdate));

      // 폴링 시작
      act(() => {
        mockWebSocketInstance?.simulateError();
      });

      // 폴링 호출 (완료 상태 반환)
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      const callCount = mockFetch.mock.calls.length;

      // 추가 시간 경과해도 더 이상 호출되지 않아야 함
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockFetch.mock.calls.length).toBe(callCount); // 호출 횟수 동일
    });

    it('작업 실패 시 폴링을 중지해야 한다', async () => {
      const mockResponse = {
        status: 'failed',
        error: '작업 실패'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      renderHook(() => useJobStatusTracker(mockJobId, mockOnUpdate));

      // 폴링 시작
      act(() => {
        mockWebSocketInstance?.simulateError();
      });

      // 폴링 호출 (실패 상태 반환)
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      const callCount = mockFetch.mock.calls.length;

      // 추가 시간 경과해도 더 이상 호출되지 않아야 함
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockFetch.mock.calls.length).toBe(callCount);
    });
  });

  describe('메시지 처리 테스트', () => {
    it('job_complete 메시지 수신 시 1초 후 트래킹을 중지해야 한다', async () => {
      const { result } = renderHook(() =>
        useJobStatusTracker(mockJobId, mockOnUpdate)
      );

      await act(async () => {
        vi.advanceTimersByTime(100); // WebSocket 연결 대기
      });

      expect(result.current.isTracking).toBe(true);

      // job_complete 메시지 전송
      const completeMessage: WebSocketMessage = {
        type: 'job_complete',
        job_id: mockJobId,
        data: { result: '완료됨' },
        timestamp: new Date().toISOString()
      };

      act(() => {
        mockWebSocketInstance?.simulateMessage(completeMessage);
      });

      expect(mockOnUpdate).toHaveBeenCalledWith(completeMessage);

      // 1초 후 트래킹 중지
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockWebSocketInstance?.readyState).toBe(MockWebSocket.CLOSED);
    });

    it('job_error 메시지 수신 시 1초 후 트래킹을 중지해야 한다', async () => {
      const { result } = renderHook(() =>
        useJobStatusTracker(mockJobId, mockOnUpdate)
      );

      await act(async () => {
        vi.advanceTimersByTime(100); // WebSocket 연결 대기
      });

      expect(result.current.isTracking).toBe(true);

      // job_error 메시지 전송
      const errorMessage: WebSocketMessage = {
        type: 'job_error',
        job_id: mockJobId,
        data: { error: '에러 발생' },
        timestamp: new Date().toISOString()
      };

      act(() => {
        mockWebSocketInstance?.simulateMessage(errorMessage);
      });

      expect(mockOnUpdate).toHaveBeenCalledWith(errorMessage);

      // 1초 후 트래킹 중지
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockWebSocketInstance?.readyState).toBe(MockWebSocket.CLOSED);
    });

    it('잘못된 JSON 메시지는 무시해야 한다', async () => {
      renderHook(() => useJobStatusTracker(mockJobId, mockOnUpdate));

      await act(async () => {
        vi.advanceTimersByTime(100); // WebSocket 연결 대기
      });

      // 잘못된 JSON 메시지 시뮬레이션
      act(() => {
        if (mockWebSocketInstance?.onmessage) {
          mockWebSocketInstance.onmessage(
            new MessageEvent('message', { data: 'invalid json' })
          );
        }
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('수동 제어 테스트', () => {
    it('startTracking을 수동 호출할 수 있어야 한다', () => {
      const { result } = renderHook(() =>
        useJobStatusTracker(null, mockOnUpdate)
      );

      expect(result.current.isTracking).toBe(false);

      // jobId가 없으므로 시작되지 않음
      act(() => {
        result.current.startTracking();
      });

      expect(result.current.isTracking).toBe(false);
    });

    it('stopTracking을 수동 호출할 수 있어야 한다', async () => {
      const { result } = renderHook(() =>
        useJobStatusTracker(mockJobId, mockOnUpdate)
      );

      expect(result.current.isTracking).toBe(true);

      act(() => {
        result.current.stopTracking();
      });

      expect(result.current.isTracking).toBe(false);
      expect(mockWebSocketInstance?.readyState).toBe(MockWebSocket.CLOSED);
    });
  });

  describe('JobId 변경 테스트', () => {
    it('jobId가 변경되면 기존 트래킹을 중지하고 새로 시작해야 한다', async () => {
      const { result, rerender } = renderHook(
        ({ jobId }) => useJobStatusTracker(jobId, mockOnUpdate),
        {
          initialProps: { jobId: 'old-job-123' }
        }
      );

      expect(result.current.isTracking).toBe(true);
      expect(global.WebSocket).toHaveBeenCalledWith(
        'ws://localhost:8000/api/v1/ws/research/old-job-123'
      );

      const firstWebSocket = mockWebSocketInstance;

      // jobId 변경
      rerender({ jobId: 'new-job-456' });

      expect(firstWebSocket?.readyState).toBe(MockWebSocket.CLOSED);
      expect(global.WebSocket).toHaveBeenLastCalledWith(
        'ws://localhost:8000/api/v1/ws/research/new-job-456'
      );
    });
  });
});