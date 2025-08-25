import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import toast from 'react-hot-toast';
import { useProductActions } from '../useProductActions';
import { ProductItem, DeepLinkResponse } from '../../types';

// API Client 모킹
vi.mock('@/infrastructure/api', () => ({
  apiClients: {
    research: {
      createResearchWithCoupangPreview: vi.fn(),
    },
  },
}));

// 모킹 설정
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

const mockClipboard = {
  writeText: vi.fn(),
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

describe('useProductActions', () => {
  // 테스트용 더미 데이터
  const mockProductItems: ProductItem[] = [
    {
      productId: 1,
      productName: '테스트 상품 1',
      productImage: 'https://example.com/image1.jpg',
      productPrice: 10000,
      productUrl: 'https://example.com/product1',
      categoryName: '테스트 카테고리',
      isRocket: true,
      isFreeShipping: true,
    },
    {
      productId: 2,
      productName: '테스트 상품 2',
      productImage: 'https://example.com/image2.jpg',
      productPrice: 20000,
      productUrl: 'https://example.com/product2',
      categoryName: '테스트 카테고리',
      isRocket: false,
      isFreeShipping: false,
    },
  ];

  const mockDeepLinkResponses: DeepLinkResponse[] = [
    {
      url: 'https://deeplink.example.com/product1',
      originalUrl: 'https://example.com/original1',
      deepLink: 'https://deep.example.com/link1',
      title: '딥링크 상품 1',
      price: 15000,
      success: true,
    },
  ];

  const mockSelected = ['1', '2'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('기본 기능 테스트', () => {
    it('초기 상태가 올바르게 설정되어야 한다', () => {
      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      expect(result.current.isActionModalOpen).toBe(false);
      expect(result.current.isSeoLoading).toBe(false);
      expect(result.current.isResearchLoading).toBe(false);
      expect(typeof result.current.handleResearch).toBe('function');
      expect(typeof result.current.handleActionButtonClick).toBe('function');
    });

    it('선택된 상품이 없을 때 액션 버튼 클릭 시 에러 토스트를 표시해야 한다', () => {
      const { result } = renderHook(() =>
        useProductActions(mockProductItems, [])
      );

      act(() => {
        result.current.handleActionButtonClick();
      });

      expect(toast.error).toHaveBeenCalledWith('선택된 상품이 없습니다');
      expect(result.current.isActionModalOpen).toBe(false);
    });

    it('선택된 상품이 있을 때 액션 버튼 클릭 시 모달이 열려야 한다', () => {
      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      act(() => {
        result.current.handleActionButtonClick();
      });

      expect(result.current.isActionModalOpen).toBe(true);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('handleResearch 테스트', () => {
    it('성공적으로 리서치를 시작하고 새 탭을 열어야 한다', async () => {
      const mockResponse = {
        job_id: 'test-job-123',
        session_id: 'test-session-456',
        results: [{ product_name: '테스트 상품 1' }],
        status: 'pending',
        message: '리서치가 시작되었습니다',
        created_at: new Date().toISOString(),
        items_count: 2
      };

      const { apiClients } = await import('@/infrastructure/api');
      vi.mocked(apiClients.research.createResearchWithCoupangPreview).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      await act(async () => {
        await result.current.handleResearch();
      });

      // API 호출 검증
      expect(mockFetch).toHaveBeenCalledWith('/api/research/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              product_name: '테스트 상품 1',
              category: '테스트 카테고리',
              price_exact: 10000,
              currency: 'KRW',
              product_id: 1,
              product_url: 'https://example.com/product1',
              product_image: 'https://example.com/image1.jpg',
              is_rocket: true,
              is_free_shipping: true,
              category_name: '테스트 카테고리',
              seller_or_store: '쿠팡',
            },
            {
              product_name: '테스트 상품 2',
              category: '테스트 카테고리',
              price_exact: 20000,
              currency: 'KRW',
              product_id: 2,
              product_url: 'https://example.com/product2',
              product_image: 'https://example.com/image2.jpg',
              is_rocket: false,
              is_free_shipping: false,
              category_name: '테스트 카테고리',
              seller_or_store: '쿠팡',
            },
          ],
          return_coupang_preview: true,
          priority: 5,
        }),
      });

      // 새 탭 열기 검증
      expect(mockWindowOpen).toHaveBeenCalledWith(
        '/research?session=test-session-456',
        '_blank'
      );

      // 성공 토스트 검증
      expect(toast.success).toHaveBeenCalledWith(
        '리서치가 시작되었습니다! (2개 상품)'
      );
    });

    it('session_id가 없을 때 기본 리서치 페이지를 열어야 한다', async () => {
      const mockResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
          results: [],
        },
        message: '리서치가 시작되었습니다',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      await act(async () => {
        await result.current.handleResearch();
      });

      expect(mockWindowOpen).toHaveBeenCalledWith('/research', '_blank');
    });

    it('API 호출 실패 시 에러를 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error',
      });

      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      await act(async () => {
        await result.current.handleResearch();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('리서치 분석에 실패했습니다')
      );
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('API 응답이 실패 상태일 때 에러를 처리해야 한다', async () => {
      const mockResponse = {
        success: false,
        message: '리서치 처리 중 오류가 발생했습니다',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      await act(async () => {
        await result.current.handleResearch();
      });

      expect(toast.error).toHaveBeenCalledWith(
        '리서치 분석에 실패했습니다: 리서치 처리 중 오류가 발생했습니다'
      );
    });

    it('로딩 상태를 올바르게 관리해야 한다', async () => {
      const mockResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
          session_id: 'test-session-456',
        },
      };

      // 지연된 응답을 시뮬레이션
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => mockResponse,
              });
            }, 100);
          })
      );

      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      // 로딩 시작 전
      expect(result.current.isResearchLoading).toBe(false);

      // 리서치 시작
      const researchPromise = act(async () => {
        await result.current.handleResearch();
      });

      // 로딩 중
      expect(result.current.isResearchLoading).toBe(true);

      // 완료 대기
      await researchPromise;

      // 로딩 완료
      expect(result.current.isResearchLoading).toBe(false);
    });
  });

  describe('데이터 타입 처리 테스트', () => {
    it('ProductItem과 DeepLinkResponse가 혼합된 배열을 처리해야 한다', async () => {
      const mixedData = [...mockProductItems, ...mockDeepLinkResponses];
      const mixedSelected = ['1', 'https://example.com/original1'];

      const mockResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
          session_id: 'test-session-456',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() =>
        useProductActions(mixedData, mixedSelected)
      );

      await act(async () => {
        await result.current.handleResearch();
      });

      // ProductItem만 API 호출에 포함되어야 함
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.items).toHaveLength(1);
      expect(callBody.items[0].product_name).toBe('테스트 상품 1');
    });

    it('선택된 항목이 모두 DeepLinkResponse인 경우 빈 배열로 API를 호출해야 한다', async () => {
      const selected = ['https://example.com/original1'];

      const mockResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
          session_id: 'test-session-456',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() =>
        useProductActions(mockDeepLinkResponses, selected)
      );

      await act(async () => {
        await result.current.handleResearch();
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.items).toHaveLength(0);
    });
  });

  describe('클립보드 복사 기능 테스트', () => {
    it('클립보드 복사가 성공해야 한다', async () => {
      mockClipboard.writeText.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      await act(async () => {
        await result.current.handleCopyToClipboard('테스트 텍스트', '테스트 라벨');
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith('테스트 텍스트');
      expect(toast.success).toHaveBeenCalledWith(
        '테스트 라벨이(가) 클립보드에 복사되었습니다'
      );
    });

    it('클립보드 복사 실패 시 에러 토스트를 표시해야 한다', async () => {
      const mockError = new Error('클립보드 접근 실패');
      mockClipboard.writeText.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      await act(async () => {
        await result.current.handleCopyToClipboard('테스트 텍스트', '테스트 라벨');
      });

      expect(toast.error).toHaveBeenCalledWith('클립보드 접근 실패');
    });
  });

  describe('모달 상태 관리 테스트', () => {
    it('closeActionModal을 호출하면 모달이 닫혀야 한다', () => {
      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      // 모달 열기
      act(() => {
        result.current.handleActionButtonClick();
      });
      expect(result.current.isActionModalOpen).toBe(true);

      // 모달 닫기
      act(() => {
        result.current.closeActionModal();
      });
      expect(result.current.isActionModalOpen).toBe(false);
    });

    it('handleResearch 성공 후 모달이 자동으로 닫혀야 한다', async () => {
      const mockResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
          session_id: 'test-session-456',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() =>
        useProductActions(mockProductItems, mockSelected)
      );

      // 모달 열기
      act(() => {
        result.current.handleActionButtonClick();
      });
      expect(result.current.isActionModalOpen).toBe(true);

      // 리서치 실행
      await act(async () => {
        await result.current.handleResearch();
      });

      // 모달이 자동으로 닫혀야 함
      expect(result.current.isActionModalOpen).toBe(false);
    });
  });
});