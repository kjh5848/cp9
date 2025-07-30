// Server Actions 제거 - API Route에서 사용하기 위해

import { chromium, Browser, Page } from 'playwright';
import { LangGraphState, ProductInfo } from '../types';

/**
 * Playwright를 사용한 동적 크롤링 노드
 * JavaScript가 렌더링된 후의 상품 정보를 크롤링
 * 
 * @param state - LangGraph 상태 객체
 * @returns 업데이트된 상태 객체
 */
export async function dynamicCrawlerNode(state: LangGraphState): Promise<Partial<LangGraphState>> {
  let browser: Browser | null = null;
  
  try {
    const { productIds } = state.input;
    const productInfo: ProductInfo[] = [];

    console.log(`[dynamicCrawler] ${productIds.length}개 상품 동적 크롤링 시작`);

    // 브라우저 인스턴스 생성 (봇 차단 방지 강화)
    browser = await chromium.launch({ 
      headless: true, // 헤드리스 모드로 다시 변경 (서버 환경에서 안정성)
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-http2',
        '--disable-features=VizDisplayCompositor',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    console.log('[dynamicCrawler] 브라우저 인스턴스 생성 완료');

    for (const productId of productIds) {
      try {
        const product = await crawlProductWithPlaywright(browser, productId);
        if (product) {
          productInfo.push(product);
        }
      } catch (error) {
        console.error(`[dynamicCrawler] 상품 ${productId} 동적 크롤링 실패:`, {
          productId,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
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
  } finally {
    // 브라우저 정리
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Playwright를 사용하여 상품 정보를 크롤링하는 함수
 * 
 * @param browser - Playwright 브라우저 인스턴스
 * @param productId - 상품 ID
 * @returns 상품 정보 또는 null
 */
async function crawlProductWithPlaywright(browser: Browser, productId: string): Promise<ProductInfo | null> {
  let page: Page | null = null;
  
  try {
    const url = `https://www.coupang.com/vp/products/${productId}`;
    console.log(`[crawlProductWithPlaywright] 상품 ${productId} 크롤링 시작: ${url}`);
    
    // 새 페이지 생성
    page = await browser.newPage();
    console.log(`[crawlProductWithPlaywright] 새 페이지 생성 완료`);
    
    // 사용자 에이전트 설정 (봇 차단 방지 강화)
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'Referer': 'https://www.coupang.com/',
      'Origin': 'https://www.coupang.com',
      'DNT': '1',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"'
    });
    
    // 봇 감지 방지를 위한 추가 설정
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
    console.log(`[crawlProductWithPlaywright] HTTP 헤더 설정 완료`);
    
    // 페이지 로드 및 대기 (HTTP2 오류 방지)
    console.log(`[crawlProductWithPlaywright] 페이지 로드 시작: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    console.log(`[crawlProductWithPlaywright] 페이지 로드 완료`);
    
    // 추가 대기 (JavaScript 렌더링 완료)
    console.log(`[crawlProductWithPlaywright] JavaScript 렌더링 대기 시작`);
    await page.waitForTimeout(10000); // 대기 시간 증가
    console.log(`[crawlProductWithPlaywright] JavaScript 렌더링 대기 완료`);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`[crawlProductWithPlaywright] 페이지 제목: ${title}`);
    
    // 페이지 URL 확인
    const currentUrl = page.url();
    console.log(`[crawlProductWithPlaywright] 현재 URL: ${currentUrl}`);
    
    // 페이지 내용 확인
    const pageContent = await page.content();
    console.log(`[crawlProductWithPlaywright] 페이지 내용 길이: ${pageContent.length} 문자`);
    
    // 페이지가 로드되었는지 확인
    if (pageContent.length < 1000) {
      console.log(`[crawlProductWithPlaywright] 페이지 내용이 너무 짧습니다. 봇 차단 가능성`);
    }
    
    // 상품 정보 추출
    console.log(`[crawlProductWithPlaywright] 상품 정보 추출 시작`);
    const productInfo = await extractProductInfo(page, productId, url);
    console.log(`[crawlProductWithPlaywright] 상품 정보 추출 완료:`, {
      productId,
      productName: productInfo.productName,
      productPrice: productInfo.productPrice,
      hasImage: !!productInfo.productImage,
      timestamp: new Date().toISOString()
    });
    
    return productInfo;
  } catch (error) {
    const url = `https://www.coupang.com/vp/products/${productId}`;
    console.error(`[crawlProductWithPlaywright] 상품 ${productId} 크롤링 실패:`, {
      productId,
      url,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return null;
  } finally {
    // 페이지 정리
    if (page) {
      await page.close();
    }
  }
}

/**
 * 페이지에서 상품 정보를 추출하는 함수
 * 
 * @param page - Playwright 페이지 객체
 * @param productId - 상품 ID
 * @param url - 상품 URL
 * @returns 상품 정보
 */
async function extractProductInfo(page: Page, productId: string, url: string): Promise<ProductInfo> {
  try {
    // 상품명 추출
    const productName = await extractProductNameWithPlaywright(page);
    
    // 상품 가격 추출
    const productPrice = await extractProductPriceWithPlaywright(page);
    
    // 상품 이미지 추출
    const productImage = await extractProductImageWithPlaywright(page);
    
    // 로켓배송 여부 추출
    const isRocket = await extractRocketDeliveryWithPlaywright(page);
    
    // 무료배송 여부 추출
    const isFreeShipping = await extractFreeShippingWithPlaywright(page);
    
    // 카테고리명 추출
    const categoryName = await extractCategoryNameWithPlaywright(page);
    
    // 평점 추출
    const rating = await extractRatingWithPlaywright(page);
    
    // 리뷰 수 추출
    const reviewCount = await extractReviewCountWithPlaywright(page);
    
    // 상품 설명 추출
    const description = await extractDescriptionWithPlaywright(page);
    
    // 상품 스펙 추출
    const specifications = await extractSpecificationsWithPlaywright(page);
    
    return {
      productId,
      productName,
      productPrice,
      productImage,
      productUrl: url,
      isRocket,
      isFreeShipping,
      categoryName,
      rating,
      reviewCount,
      description,
      specifications
    };
  } catch (error) {
    console.error('[extractProductInfo] 오류:', {
      productId,
      url,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    // 기본값 반환
    return {
      productId,
      productName: `상품 ${productId}`,
      productPrice: 0,
      productImage: '',
      productUrl: url,
      isRocket: false,
      isFreeShipping: false,
      categoryName: '카테고리 없음',
      rating: 0,
      reviewCount: 0,
      description: '',
      specifications: {}
    };
  }
}

/**
 * 상품명 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 상품명
 */
async function extractProductNameWithPlaywright(page: Page): Promise<string> {
  try {
    // 쿠팡 페이지의 실제 셀렉터들
    const selectors = [
      'h1.prod-buy-header__title',
      '.prod-buy-header__title',
      'h1[data-testid="product-title"]',
      'h1.prod-title',
      '.prod-title',
      'h1',
      '[data-testid="product-title"]'
    ];
    
    console.log(`[extractProductNameWithPlaywright] ${selectors.length}개 셀렉터로 상품명 추출 시도`);
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`[extractProductNameWithPlaywright] 성공: ${selector} = "${text.trim()}"`);
            return text.trim();
          } else {
            console.log(`[extractProductNameWithPlaywright] 셀렉터 ${selector}는 존재하지만 텍스트가 없음`);
          }
        } else {
          console.log(`[extractProductNameWithPlaywright] 셀렉터 ${selector}를 찾을 수 없음`);
        }
      } catch (error) {
        console.log(`[extractProductNameWithPlaywright] 셀렉터 ${selector} 실패:`, {
          selector,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          timestamp: new Date().toISOString()
        });
        continue;
      }
    }
    
    console.log(`[extractProductNameWithPlaywright] 모든 셀렉터 실패, 기본값 반환`);
    return '상품명 없음';
  } catch (error) {
    console.error('[extractProductNameWithPlaywright] 오류:', {
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return '상품명 없음';
  }
}

/**
 * 상품 가격 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 상품 가격
 */
async function extractProductPriceWithPlaywright(page: Page): Promise<number> {
  try {
    const selectors = [
      '.total-price',
      '.price',
      '.prod-price__total',
      '[data-testid="product-price"]',
      '.price-value',
      '.current-price'
    ];
    
    console.log(`[extractProductPriceWithPlaywright] ${selectors.length}개 셀렉터로 가격 추출 시도`);
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            // 숫자만 추출 (쉼표, 원, ₩ 제거)
            const price = parseInt(text.replace(/[^\d]/g, ''));
            if (price > 0) {
              console.log(`[extractProductPriceWithPlaywright] 성공: ${selector} = "${text}" → ${price}원`);
              return price;
            } else {
              console.log(`[extractProductPriceWithPlaywright] 셀렉터 ${selector} 텍스트: "${text}" → 유효하지 않은 가격`);
            }
          } else {
            console.log(`[extractProductPriceWithPlaywright] 셀렉터 ${selector} 텍스트가 없음`);
          }
        } else {
          console.log(`[extractProductPriceWithPlaywright] 셀렉터 ${selector}를 찾을 수 없음`);
        }
      } catch (error) {
        console.log(`[extractProductPriceWithPlaywright] 셀렉터 ${selector} 실패:`, {
          selector,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          timestamp: new Date().toISOString()
        });
        continue;
      }
    }
    
    console.log(`[extractProductPriceWithPlaywright] 모든 셀렉터 실패, 기본값 반환`);
    return 0;
  } catch (error) {
    console.error('[extractProductPriceWithPlaywright] 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
    return 0;
  }
}

/**
 * 상품 이미지 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 상품 이미지 URL
 */
async function extractProductImageWithPlaywright(page: Page): Promise<string> {
  try {
    const selectors = [
      'img.prod-image__detail',
      '.prod-image img',
      '[data-testid="product-image"] img',
      'img[alt*="상품"]',
      '.product-image img',
      'img[src*="image.coupangcdn.com"]'
    ];
    
    console.log(`[extractProductImageWithPlaywright] ${selectors.length}개 셀렉터로 이미지 추출 시도`);
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const src = await element.getAttribute('src');
          if (src) {
            console.log(`[extractProductImageWithPlaywright] 성공: ${selector} = "${src}"`);
            return src;
          } else {
            console.log(`[extractProductImageWithPlaywright] 셀렉터 ${selector}는 존재하지만 src가 없음`);
          }
        } else {
          console.log(`[extractProductImageWithPlaywright] 셀렉터 ${selector}를 찾을 수 없음`);
        }
      } catch (error) {
        console.log(`[extractProductImageWithPlaywright] 셀렉터 ${selector} 실패:`, {
          selector,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          timestamp: new Date().toISOString()
        });
        continue;
      }
    }
    
    console.log(`[extractProductImageWithPlaywright] 모든 셀렉터 실패, 기본값 반환`);
    return '';
  } catch (error) {
    console.error('[extractProductImageWithPlaywright] 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
    return '';
  }
}

/**
 * 로켓배송 여부 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 로켓배송 여부
 */
async function extractRocketDeliveryWithPlaywright(page: Page): Promise<boolean> {
  try {
    const selectors = [
      '.rocket-delivery',
      '.rocket',
      '[data-testid="rocket"]',
      '.delivery-rocket',
      '.rocket-badge',
      '[class*="rocket"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          return true;
        }
      } catch (error) {
        console.log(`[extractRocketDeliveryWithPlaywright] 셀렉터 ${selector} 실패:`, error instanceof Error ? error.message : '알 수 없는 오류');
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[extractRocketDeliveryWithPlaywright] 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
    return false;
  }
}

/**
 * 무료배송 여부 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 무료배송 여부
 */
async function extractFreeShippingWithPlaywright(page: Page): Promise<boolean> {
  try {
    const selectors = [
      '.free-shipping',
      '.shipping-free',
      '[data-testid="free-shipping"]',
      '.delivery-free',
      '.free-delivery',
      '[class*="free"][class*="shipping"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          return true;
        }
      } catch (error) {
        console.log(`[extractFreeShippingWithPlaywright] 셀렉터 ${selector} 실패:`, error instanceof Error ? error.message : '알 수 없는 오류');
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[extractFreeShippingWithPlaywright] 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
    return false;
  }
}

/**
 * 카테고리명 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 카테고리명
 */
async function extractCategoryNameWithPlaywright(page: Page): Promise<string> {
  try {
    const selectors = [
      '.breadcrumb',
      '.category',
      '.prod-category',
      '[data-testid="category"]',
      '.breadcrumb-item',
      '.category-path'
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
        console.log(`[extractCategoryNameWithPlaywright] 셀렉터 ${selector} 실패:`, error instanceof Error ? error.message : '알 수 없는 오류');
        continue;
      }
    }
    
    return '카테고리 없음';
  } catch (error) {
    console.error('[extractCategoryNameWithPlaywright] 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
    return '카테고리 없음';
  }
}

/**
 * 평점 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 평점
 */
async function extractRatingWithPlaywright(page: Page): Promise<number> {
  try {
    const selectors = [
      '.rating',
      '.score',
      '.star-rating',
      '[data-testid="rating"]',
      '.review-rating',
      '.rating-score'
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
        console.log(`[extractRatingWithPlaywright] 셀렉터 ${selector} 실패:`, error instanceof Error ? error.message : '알 수 없는 오류');
        continue;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('[extractRatingWithPlaywright] 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
    return 0;
  }
}

/**
 * 리뷰 수 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 리뷰 수
 */
async function extractReviewCountWithPlaywright(page: Page): Promise<number> {
  try {
    const selectors = [
      '.review-count',
      '.reviews',
      '.count',
      '[data-testid="review-count"]',
      '.review-number',
      '.review-total'
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
        console.log(`[extractReviewCountWithPlaywright] 셀렉터 ${selector} 실패:`, error instanceof Error ? error.message : '알 수 없는 오류');
        continue;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('[extractReviewCountWithPlaywright] 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
    return 0;
  }
}

/**
 * 상품 설명 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 상품 설명
 */
async function extractDescriptionWithPlaywright(page: Page): Promise<string> {
  try {
    const selectors = [
      '.description',
      '.prod-description',
      '.detail-description',
      '[data-testid="description"]',
      '.product-description',
      '.prod-detail'
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
        console.log(`[extractDescriptionWithPlaywright] 셀렉터 ${selector} 실패:`, error instanceof Error ? error.message : '알 수 없는 오류');
        continue;
      }
    }
    
    return '';
  } catch (error) {
    console.error('[extractDescriptionWithPlaywright] 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
    return '';
  }
}

/**
 * 상품 스펙 추출 (Playwright)
 * 
 * @param page - Playwright 페이지 객체
 * @returns 상품 스펙 객체
 */
async function extractSpecificationsWithPlaywright(page: Page): Promise<Record<string, string>> {
  const specs: Record<string, string> = {};
  
  try {
    const selectors = [
      '.specifications tr',
      '.specs tr',
      '[data-testid="specifications"] tr',
      '.product-specs tr',
      '.spec-table tr'
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
    console.error('[extractSpecificationsWithPlaywright] 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
  }
  
  return specs;
}

/**
 * dynamicCrawler 노드의 조건부 실행 함수
 * 
 * @param state - LangGraph 상태 객체
 * @returns 다음 노드 이름
 */
export async function dynamicCrawlerCondition(state: LangGraphState): Promise<string> {
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