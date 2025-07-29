'use server';

import { LangGraphState, LangGraphNode, ProductInfo } from '../types';

/**
 * Playwright를 사용한 동적 크롤링 노드
 * JavaScript가 렌더링된 후의 상품 정보를 크롤링
 * 
 * @param state - LangGraph 상태 객체
 * @returns 업데이트된 상태 객체
 */
export async function dynamicCrawlerNode(state: LangGraphState): Promise<Partial<LangGraphState>> {
  try {
    const { productIds } = state.input;
    const productInfo: ProductInfo[] = [];

    console.log(`[dynamicCrawler] ${productIds.length}개 상품 동적 크롤링 시작`);

    for (const productId of productIds) {
      try {
        const product = await crawlProductWithPlaywright(productId);
        if (product) {
          productInfo.push(product);
        }
      } catch (error) {
        console.error(`[dynamicCrawler] 상품 ${productId} 동적 크롤링 실패:`, error);
        // 개별 상품 실패는 전체 프로세스를 중단하지 않음
      }
    }

    console.log(`[dynamicCrawler] 동적 크롤링 완료: ${productInfo.length}개 상품 정보 수집`);

    return {
      scrapedData: {
        ...state.scrapedData,
        productInfo
      },
      metadata: {
        ...state.metadata,
        currentNode: 'dynamicCrawler',
        completedNodes: [...state.metadata.completedNodes, 'dynamicCrawler'],
        updatedAt: Date.now()
      }
    };
  } catch (error) {
    console.error('[dynamicCrawler] 오류:', error);
    throw new Error(`동적 크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * Playwright를 사용하여 상품 정보를 크롤링하는 함수
 * 
 * @param productId - 상품 ID
 * @returns 상품 정보 또는 null
 */
async function crawlProductWithPlaywright(productId: string): Promise<ProductInfo | null> {
  try {
    // 실제 환경에서는 Playwright 브라우저 인스턴스를 사용해야 함
    // 여기서는 브라우저 자동화를 시뮬레이션
    
    const url = `https://www.coupang.com/vp/products/${productId}`;
    console.log(`[crawlProductWithPlaywright] 상품 ${productId} 크롤링 시작: ${url}`);
    
    // 브라우저 자동화 시뮬레이션 (실제 구현에서는 Playwright 사용)
    const productInfo = await simulatePlaywrightCrawling(url, productId);
    
    return productInfo;
  } catch (error) {
    console.error(`[crawlProductWithPlaywright] 상품 ${productId} 크롤링 실패:`, error);
    return null;
  }
}

/**
 * Playwright 크롤링 시뮬레이션 (실제 구현에서는 Playwright 사용)
 * 
 * @param url - 상품 URL
 * @param productId - 상품 ID
 * @returns 상품 정보
 */
async function simulatePlaywrightCrawling(url: string, productId: string): Promise<ProductInfo> {
  // 실제 구현에서는 다음과 같이 Playwright를 사용해야 함:
  /*
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 사용자 에이전트 설정
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  // 페이지 로드
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // 상품 정보 추출
  const productName = await page.$eval('h1.prod-buy-header__title', el => el.textContent);
  const productPrice = await page.$eval('.total-price', el => el.textContent);
  // ... 기타 정보 추출
  
  await browser.close();
  */
  
  // 시뮬레이션을 위한 지연
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 모의 상품 정보 반환
  return {
    productId,
    productName: `동적 크롤링 상품 ${productId}`,
    productPrice: Math.floor(Math.random() * 1000000) + 100000,
    productImage: `https://example.com/images/${productId}.jpg`,
    productUrl: url,
    isRocket: Math.random() > 0.5,
    isFreeShipping: Math.random() > 0.5,
    categoryName: '가전디지털',
    rating: Math.random() * 5,
    reviewCount: Math.floor(Math.random() * 1000),
    description: `동적 크롤링으로 수집된 상품 ${productId}의 상세 정보입니다.`,
    specifications: {
      '브랜드': '테스트 브랜드',
      '모델': `MODEL-${productId}`,
      '색상': '블랙',
      '무게': '1.5kg'
    }
  };
}

/**
 * 실제 Playwright 크롤링 함수 (구현 예정)
 * 
 * @param url - 상품 URL
 * @param productId - 상품 ID
 * @returns 상품 정보
 */
async function realPlaywrightCrawling(url: string, productId: string): Promise<ProductInfo> {
  // TODO: 실제 Playwright 구현
  // 1. 브라우저 인스턴스 생성
  // 2. 페이지 로드 및 대기
  // 3. 상품 정보 추출
  // 4. 브라우저 정리
  
  throw new Error('실제 Playwright 구현이 필요합니다');
}

/**
 * 상품 정보 추출 함수들 (Playwright용)
 */

/**
 * 상품명 추출 (Playwright)
 */
async function extractProductNameWithPlaywright(page: any): Promise<string> {
  try {
    // 실제 쿠팡 페이지 구조에 맞게 수정 필요
    const selectors = [
      'h1.prod-buy-header__title',
      '.prod-buy-header__title',
      'h1',
      '[data-testid="product-title"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (error) {
        // 다음 셀렉터 시도
        continue;
      }
    }
    
    return '상품명 없음';
  } catch (error) {
    console.error('[extractProductNameWithPlaywright] 오류:', error);
    return '상품명 없음';
  }
}

/**
 * 상품 가격 추출 (Playwright)
 */
async function extractProductPriceWithPlaywright(page: any): Promise<number> {
  try {
    const selectors = [
      '.total-price',
      '.price',
      '.prod-price__total',
      '[data-testid="product-price"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            const price = parseInt(text.replace(/[^\d]/g, ''));
            if (price > 0) {
              return price;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('[extractProductPriceWithPlaywright] 오류:', error);
    return 0;
  }
}

/**
 * 상품 이미지 추출 (Playwright)
 */
async function extractProductImageWithPlaywright(page: any): Promise<string> {
  try {
    const selectors = [
      'img.prod-image__detail',
      '.prod-image img',
      '[data-testid="product-image"] img',
      'img[alt*="상품"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const src = await element.getAttribute('src');
          if (src) {
            return src;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return '';
  } catch (error) {
    console.error('[extractProductImageWithPlaywright] 오류:', error);
    return '';
  }
}

/**
 * 로켓배송 여부 추출 (Playwright)
 */
async function extractRocketDeliveryWithPlaywright(page: any): Promise<boolean> {
  try {
    const selectors = [
      '.rocket-delivery',
      '.rocket',
      '[data-testid="rocket"]',
      '.delivery-rocket'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[extractRocketDeliveryWithPlaywright] 오류:', error);
    return false;
  }
}

/**
 * 무료배송 여부 추출 (Playwright)
 */
async function extractFreeShippingWithPlaywright(page: any): Promise<boolean> {
  try {
    const selectors = [
      '.free-shipping',
      '.shipping-free',
      '[data-testid="free-shipping"]',
      '.delivery-free'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[extractFreeShippingWithPlaywright] 오류:', error);
    return false;
  }
}

/**
 * 카테고리명 추출 (Playwright)
 */
async function extractCategoryNameWithPlaywright(page: any): Promise<string> {
  try {
    const selectors = [
      '.breadcrumb',
      '.category',
      '.prod-category',
      '[data-testid="category"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return '카테고리 없음';
  } catch (error) {
    console.error('[extractCategoryNameWithPlaywright] 오류:', error);
    return '카테고리 없음';
  }
}

/**
 * 평점 추출 (Playwright)
 */
async function extractRatingWithPlaywright(page: any): Promise<number> {
  try {
    const selectors = [
      '.rating',
      '.score',
      '.star-rating',
      '[data-testid="rating"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            const rating = parseFloat(text);
            if (rating >= 0 && rating <= 5) {
              return rating;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('[extractRatingWithPlaywright] 오류:', error);
    return 0;
  }
}

/**
 * 리뷰 수 추출 (Playwright)
 */
async function extractReviewCountWithPlaywright(page: any): Promise<number> {
  try {
    const selectors = [
      '.review-count',
      '.reviews',
      '.count',
      '[data-testid="review-count"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            const count = parseInt(text.replace(/[^\d]/g, ''));
            if (count >= 0) {
              return count;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('[extractReviewCountWithPlaywright] 오류:', error);
    return 0;
  }
}

/**
 * 상품 설명 추출 (Playwright)
 */
async function extractDescriptionWithPlaywright(page: any): Promise<string> {
  try {
    const selectors = [
      '.description',
      '.prod-description',
      '.detail-description',
      '[data-testid="description"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return '';
  } catch (error) {
    console.error('[extractDescriptionWithPlaywright] 오류:', error);
    return '';
  }
}

/**
 * 상품 스펙 추출 (Playwright)
 */
async function extractSpecificationsWithPlaywright(page: any): Promise<Record<string, string>> {
  const specs: Record<string, string> = {};
  
  try {
    const selectors = [
      '.specifications tr',
      '.specs tr',
      '[data-testid="specifications"] tr'
    ];
    
    for (const selector of selectors) {
      try {
        const rows = await page.$$(selector);
        
        for (const row of rows) {
          const keyElement = await row.$('th, .key');
          const valueElement = await row.$('td, .value');
          
          if (keyElement && valueElement) {
            const key = await keyElement.textContent();
            const value = await valueElement.textContent();
            
            if (key && value) {
              specs[key.trim()] = value.trim();
            }
          }
        }
        
        if (Object.keys(specs).length > 0) {
          break;
        }
      } catch (error) {
        continue;
      }
    }
  } catch (error) {
    console.error('[extractSpecificationsWithPlaywright] 오류:', error);
  }
  
  return specs;
}

/**
 * dynamicCrawler 노드의 조건부 실행 함수
 * 
 * @param state - LangGraph 상태 객체
 * @returns 다음 노드 이름
 */
export function dynamicCrawlerCondition(state: LangGraphState): string {
  const { productInfo } = state.scrapedData;
  
  // 상품 정보가 성공적으로 크롤링되었으면 다음 노드로 진행
  if (productInfo && productInfo.length > 0) {
    return 'seoAgent';
  }
  
  // 동적 크롤링도 실패 시 LLM 보강으로 폴백
  console.log('[dynamicCrawler] 동적 크롤링 실패, LLM 보강으로 폴백');
  return 'fallbackLLM';
}

/**
 * dynamicCrawler 노드 테스트 함수
 */
export async function testDynamicCrawlerNode() {
  const initialState: LangGraphState = {
    input: {
      urls: [],
      productIds: ['123456', '789012'],
      keyword: '테스트'
    },
    scrapedData: { productInfo: [], enrichedData: [] },
    seoContent: { title: '', content: '', keywords: [], summary: '' },
    wordpressPost: { status: 'draft' },
    metadata: {
      threadId: 'test-thread-123',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentNode: 'dynamicCrawler',
      completedNodes: ['extractIds', 'staticCrawler']
    }
  };

  try {
    const result = await dynamicCrawlerNode(initialState);
    console.log('테스트 결과:', result);
    return result;
  } catch (error) {
    console.error('테스트 실패:', error);
    throw error;
  }
} 