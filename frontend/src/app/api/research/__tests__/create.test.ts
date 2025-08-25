import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, GET } from '../create/route';

// 환경변수 모킹
vi.mock('process', () => ({
  env: {
    BACKEND_API_URL: 'http://localhost:8000',
  },
}));

// fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

// console 모킹 (불필요한 로그 제거)
vi.stubGlobal('console', {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
});

describe('/api/research/create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST - 새로운 API 가이드 형식', () => {
    const mockNewFormatRequest = {
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
    };

    it('쿠팡 즉시 리턴 모드로 성공적으로 요청을 처리해야 한다', async () => {
      const mockBackendResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
          session_id: 'test-session-456',
          results: [
            {
              product_name: '테스트 상품 1',
              price_exact: 10000,
              is_rocket: true,
            },
          ],
        },
        message: '쿠팡 정보가 포함된 리서치가 시작되었습니다.',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(mockNewFormatRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      // 백엔드 API 호출 검증
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/research/products?return_coupang_preview=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: mockNewFormatRequest.items,
            priority: 5,
          }),
        }
      );

      // 응답 검증
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.job_id).toBe('test-job-123');
      expect(data.data.session_id).toBe('test-session-456');
      expect(data.data.results).toHaveLength(1);
      expect(data.data.items_count).toBe(2);
      expect(data.message).toContain('쿠팡 정보가 포함된 리서치가 시작되었습니다');
    });

    it('return_coupang_preview가 false일 때 올바른 URL을 사용해야 한다', async () => {
      const requestWithoutPreview = {
        ...mockNewFormatRequest,
        return_coupang_preview: false,
      };

      const mockBackendResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
          session_id: 'test-session-456',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(requestWithoutPreview),
      });

      await POST(request);

      // 쿠팡 즉시 리턴이 없는 URL로 호출되어야 함
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/research/products',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('session_id가 없을 때 job_id를 session_id로 사용해야 한다', async () => {
      const mockBackendResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
          // session_id가 없는 경우
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(mockNewFormatRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.session_id).toBe('test-job-123');
    });

    it('session_id와 job_id가 모두 없을 때 임시 세션 ID를 생성해야 한다', async () => {
      const mockBackendResponse = {
        success: true,
        data: {
          // job_id와 session_id가 모두 없는 경우
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(mockNewFormatRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.session_id).toMatch(/^temp_\d+$/);
    });

    it('우선순위가 설정되지 않았을 때 기본값 5를 사용해야 한다', async () => {
      const requestWithoutPriority = {
        items: mockNewFormatRequest.items,
        return_coupang_preview: true,
        // priority 없음
      };

      const mockBackendResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(requestWithoutPriority),
      });

      await POST(request);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.priority).toBe(5);
    });

    it('백엔드 API가 실패할 때 에러를 처리해야 한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error Details',
      });

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(mockNewFormatRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('리서치 세션 생성에 실패했습니다.');
      expect(data.details).toContain('백엔드 API 오류: 500');
    });

    it('백엔드 응답이 실패 상태일 때 에러를 처리해야 한다', async () => {
      const mockBackendResponse = {
        success: false,
        message: '백엔드에서 처리 실패',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(mockNewFormatRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.details).toBe('백엔드에서 처리 실패');
    });
  });

  describe('POST - 기존 형식 (하위 호환성)', () => {
    const mockLegacyRequest = {
      products: [
        {
          productId: 1,
          name: '테스트 상품 1',
          price: 10000,
          category: '테스트 카테고리',
          url: 'https://example.com/product1',
          image: 'https://example.com/image1.jpg',
        },
      ],
      type: 'research_only',
      title: '테스트 리서치',
      description: '테스트 설명',
    };

    it('기존 형식으로 성공적으로 요청을 처리해야 한다', async () => {
      const mockBackendResponse = {
        success: true,
        data: {
          session_id: 'legacy-session-123',
          status: 'created',
          products_count: 1,
          created_at: '2024-01-01T00:00:00Z',
        },
        message: '리서치 세션이 생성되었습니다.',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(mockLegacyRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      // 기존 API 엔드포인트 호출 검증
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/research/create',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      // 응답 검증
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session_id).toBe('legacy-session-123');
      expect(data.data.products_count).toBe(1);
    });

    it('빈 상품 배열일 때 400 에러를 반환해야 한다', async () => {
      const emptyRequest = {
        products: [],
      };

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(emptyRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('분석할 상품 정보가 필요합니다.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('products가 없을 때 400 에러를 반환해야 한다', async () => {
      const noProductsRequest = {
        type: 'research_only',
      };

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(noProductsRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('분석할 상품 정보가 필요합니다.');
    });
  });

  describe('POST - 에러 처리', () => {
    it('잘못된 JSON 요청을 처리해야 한다', async () => {
      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('리서치 세션 생성에 실패했습니다.');
    });

    it('fetch 네트워크 에러를 처리해야 한다', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      const mockRequest = {
        items: [
          {
            product_name: '테스트 상품',
            category: '테스트 카테고리',
            price_exact: 10000,
          },
        ],
        return_coupang_preview: true,
      };

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(mockRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.details).toBe('Network Error');
    });
  });

  describe('GET', () => {
    it('GET 요청에 대해 405 에러를 반환해야 한다', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('리서치 세션 생성은 POST 방식만 지원됩니다.');
      expect(data.usage).toBe('POST /api/research/create with products data');
    });
  });

  describe('환경변수 처리', () => {
    it('환경변수가 없을 때 기본 URL을 사용해야 한다', async () => {
      // 환경변수 임시 제거
      vi.stubEnv('BACKEND_API_URL', undefined);

      const mockBackendResponse = {
        success: true,
        data: {
          job_id: 'test-job-123',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      const mockRequest = {
        items: [
          {
            product_name: '테스트 상품',
            category: '테스트 카테고리',
            price_exact: 10000,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/research/create', {
        method: 'POST',
        body: JSON.stringify(mockRequest),
      });

      await POST(request);

      // 기본 URL로 호출되어야 함
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/research/products',
        expect.any(Object)
      );

      // 환경변수 복원
      vi.stubEnv('BACKEND_API_URL', 'http://localhost:8000');
    });
  });
});