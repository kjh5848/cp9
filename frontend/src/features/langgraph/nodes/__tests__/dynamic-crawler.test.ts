import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dynamicCrawlerNode, dynamicCrawlerCondition, testDynamicCrawlerNode } from '../dynamic-crawler';
import { LangGraphState } from '../../types';

// Playwright 모킹
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        setUserAgent: vi.fn(),
        goto: vi.fn(),
        waitForTimeout: vi.fn(),
        $: vi.fn(),
        $$: vi.fn(),
        close: vi.fn(),
        textContent: vi.fn(),
        getAttribute: vi.fn()
      }),
      close: vi.fn()
    })
  }
}));

describe('dynamicCrawlerNode', () => {
  let mockState: LangGraphState;

  beforeEach(() => {
    mockState = {
      input: {
        urls: [],
        productIds: ['123456', '789012'],
        keyword: '테스트 상품'
      },
      scrapedData: { 
        productInfo: [], 
        enrichedData: [] 
      },
      seoContent: { 
        title: '', 
        content: '', 
        keywords: [], 
        summary: '' 
      },
      wordpressPost: { 
        status: 'draft' 
      },
      metadata: {
        threadId: 'test-thread-123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentNode: 'dynamicCrawler',
        completedNodes: ['extractIds', 'staticCrawler']
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 기능', () => {
    it('상품 ID 목록을 받아서 크롤링을 수행한다', async () => {
      const result = await dynamicCrawlerNode(mockState);

      expect(result).toBeDefined();
      expect(result.scrapedData).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.currentNode).toBe('dynamicCrawler');
      expect(result.metadata?.completedNodes).toContain('dynamicCrawler');
    });

    it('크롤링된 상품 정보를 scrapedData에 저장한다', async () => {
      const result = await dynamicCrawlerNode(mockState);

      expect(result.scrapedData?.productInfo).toBeDefined();
      expect(Array.isArray(result.scrapedData?.productInfo)).toBe(true);
    });

    it('메타데이터를 업데이트한다', async () => {
      const result = await dynamicCrawlerNode(mockState);

      expect(result.metadata?.updatedAt).toBeGreaterThan(mockState.metadata.updatedAt);
      expect(result.metadata?.completedNodes).toContain('dynamicCrawler');
    });
  });

  describe('오류 처리', () => {
    it('개별 상품 크롤링 실패 시 전체 프로세스를 중단하지 않는다', async () => {
      // 모킹된 페이지에서 오류 발생 시뮬레이션
      const mockPage = {
        setUserAgent: vi.fn(),
        goto: vi.fn().mockRejectedValue(new Error('페이지 로드 실패')),
        waitForTimeout: vi.fn(),
        close: vi.fn()
      };

      const mockBrowser = {
        newPage: vi.fn().mockResolvedValue(mockPage),
        close: vi.fn()
      };

      const { chromium } = await import('playwright');
      vi.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      const result = await dynamicCrawlerNode(mockState);

      expect(result).toBeDefined();
      expect(result.scrapedData?.productInfo).toEqual([]);
    });

    it('브라우저 초기화 실패 시 적절한 오류를 던진다', async () => {
      const { chromium } = await import('playwright');
      vi.mocked(chromium.launch).mockRejectedValue(new Error('브라우저 시작 실패'));

      await expect(dynamicCrawlerNode(mockState)).rejects.toThrow('동적 크롤링 실패');
    });
  });

  describe('리소스 정리', () => {
    it('브라우저와 페이지를 적절히 정리한다', async () => {
      const mockPage = {
        setUserAgent: vi.fn(),
        goto: vi.fn(),
        waitForTimeout: vi.fn(),
        close: vi.fn()
      };

      const mockBrowser = {
        newPage: vi.fn().mockResolvedValue(mockPage),
        close: vi.fn()
      };

      const { chromium } = await import('playwright');
      vi.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      await dynamicCrawlerNode(mockState);

      expect(mockPage.close).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});

describe('dynamicCrawlerCondition', () => {
  it('상품 정보가 성공적으로 크롤링되면 seoAgent로 진행한다', () => {
    const state: LangGraphState = {
      input: { urls: [], productIds: ['123'], keyword: '테스트' },
      scrapedData: {
        productInfo: [
          {
            productId: '123',
            productName: '테스트 상품',
            productPrice: 10000,
            productImage: 'test.jpg',
            productUrl: 'https://test.com',
            isRocket: false,
            isFreeShipping: false,
            categoryName: '테스트',
            rating: 4.5,
            reviewCount: 100,
            description: '테스트 설명',
            specifications: {}
          }
        ],
        enrichedData: []
      },
      seoContent: { title: '', content: '', keywords: [], summary: '' },
      wordpressPost: { status: 'draft' },
      metadata: {
        threadId: 'test',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentNode: 'dynamicCrawler',
        completedNodes: []
      }
    };

    const nextNode = dynamicCrawlerCondition(state);
    expect(nextNode).toBe('seoAgent');
  });

  it('상품 정보 크롤링이 실패하면 fallbackLLM으로 폴백한다', () => {
    const state: LangGraphState = {
      input: { urls: [], productIds: ['123'], keyword: '테스트' },
      scrapedData: {
        productInfo: [],
        enrichedData: []
      },
      seoContent: { title: '', content: '', keywords: [], summary: '' },
      wordpressPost: { status: 'draft' },
      metadata: {
        threadId: 'test',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentNode: 'dynamicCrawler',
        completedNodes: []
      }
    };

    const nextNode = dynamicCrawlerCondition(state);
    expect(nextNode).toBe('fallbackLLM');
  });
});

describe('testDynamicCrawlerNode', () => {
  it('테스트 함수가 정상적으로 실행된다', async () => {
    const result = await testDynamicCrawlerNode();

    expect(result).toBeDefined();
    expect(result.scrapedData).toBeDefined();
    expect(result.metadata).toBeDefined();
  });

  it('테스트 실패 시 적절한 오류를 던진다', async () => {
    // 브라우저 시작 실패 시뮬레이션
    const { chromium } = await import('playwright');
    vi.mocked(chromium.launch).mockRejectedValue(new Error('테스트 브라우저 실패'));

    await expect(testDynamicCrawlerNode()).rejects.toThrow();
  });
});

describe('Playwright 크롤링 기능', () => {
  let testState: LangGraphState;

  beforeEach(() => {
    testState = {
      input: {
        urls: [],
        productIds: ['123456', '789012'],
        keyword: '테스트 상품'
      },
      scrapedData: { 
        productInfo: [], 
        enrichedData: [] 
      },
      seoContent: { 
        title: '', 
        content: '', 
        keywords: [], 
        summary: '' 
      },
      wordpressPost: { 
        status: 'draft' 
      },
      metadata: {
        threadId: 'test-thread-123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentNode: 'dynamicCrawler',
        completedNodes: ['extractIds', 'staticCrawler']
      }
    };
  });

  it('사용자 에이전트를 설정한다', async () => {
    const mockPage = {
      setUserAgent: vi.fn(),
      goto: vi.fn(),
      waitForTimeout: vi.fn(),
      close: vi.fn()
    };

    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn()
    };

    const { chromium } = await import('playwright');
    vi.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

    await dynamicCrawlerNode(testState);

    expect(mockPage.setUserAgent).toHaveBeenCalledWith(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
  });

  it('페이지 로드 시 적절한 옵션을 사용한다', async () => {
    const mockPage = {
      setUserAgent: vi.fn(),
      goto: vi.fn(),
      waitForTimeout: vi.fn(),
      close: vi.fn()
    };

    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn()
    };

    const { chromium } = await import('playwright');
    vi.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

    await dynamicCrawlerNode(testState);

    expect(mockPage.goto).toHaveBeenCalledWith(
      expect.stringContaining('https://www.coupang.com/vp/products/'),
      {
        waitUntil: 'networkidle',
        timeout: 30000
      }
    );
    expect(mockPage.waitForTimeout).toHaveBeenCalledWith(2000);
  });
}); 