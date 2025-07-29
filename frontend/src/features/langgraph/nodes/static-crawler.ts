'use server';

import { LangGraphState, ProductInfo } from '../types';
import * as cheerio from 'cheerio';

/**
 * 정적 HTML 파싱을 통한 상품 정보 크롤링 노드
 * 
 * @param state - LangGraph 상태 객체
 * @returns 업데이트된 상태 객체
 */
export async function staticCrawlerNode(state: LangGraphState): Promise<Partial<LangGraphState>> {
  try {
    const { productIds } = state.input;
    const productInfo: ProductInfo[] = [];

    console.log(`[staticCrawler] ${productIds.length}개 상품 크롤링 시작`);

    for (const productId of productIds) {
      try {
        const product = await crawlProductInfo(productId);
        if (product) {
          productInfo.push(product);
        }
      } catch (error) {
        console.error(`[staticCrawler] 상품 ${productId} 크롤링 실패:`, error);
        // 개별 상품 실패는 전체 프로세스를 중단하지 않음
      }
    }

    console.log(`[staticCrawler] 크롤링 완료: ${productInfo.length}개 상품 정보 수집`);

    return {
      scrapedData: {
        ...state.scrapedData,
        productInfo
      },
      metadata: {
        ...state.metadata,
        currentNode: 'staticCrawler',
        completedNodes: [...state.metadata.completedNodes, 'staticCrawler'],
        updatedAt: Date.now()
      }
    };
  } catch (error) {
    console.error('[staticCrawler] 오류:', error);
    throw new Error(`정적 크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 개별 상품 정보를 크롤링하는 함수
 * 
 * @param productId - 상품 ID
 * @returns 상품 정보 또는 null
 */
async function crawlProductInfo(productId: string): Promise<ProductInfo | null> {
  try {
    // 쿠팡 API를 사용하여 상품 정보 조회
    const productInfo = await fetchProductFromCoupangAPI(productId);
    
    if (!productInfo) {
      // API 실패 시 웹 크롤링 시도
      return await crawlProductFromWeb(productId);
    }

    return productInfo;
  } catch (error) {
    console.error(`[crawlProductInfo] 상품 ${productId} 크롤링 실패:`, error);
    return null;
  }
}

/**
 * 쿠팡 API를 통해 상품 정보 조회
 */
async function fetchProductFromCoupangAPI(productId: string): Promise<ProductInfo | null> {
  try {
    // 쿠팡 상품 검색 API를 사용하여 상품 정보 조회
    const response = await fetch('/api/products/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: productId,
        limit: 1
      })
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const products = await response.json();
    
    if (products && products.length > 0) {
      const product = products[0];
      return {
        productId,
        productName: product.productName,
        productPrice: product.productPrice,
        productImage: product.productImage,
        productUrl: product.productUrl,
        isRocket: product.isRocket,
        isFreeShipping: product.isFreeShipping,
        categoryName: product.categoryName,
        rating: 0, // API에서 제공하지 않는 정보
        reviewCount: 0, // API에서 제공하지 않는 정보
        description: '', // API에서 제공하지 않는 정보
        specifications: {} // API에서 제공하지 않는 정보
      };
    }

    return null;
  } catch (error) {
    console.error(`[fetchProductFromCoupangAPI] API 조회 실패:`, error);
    return null;
  }
}

/**
 * 웹 크롤링을 통해 상품 정보 조회 (폴백)
 */
async function crawlProductFromWeb(productId: string): Promise<ProductInfo | null> {
  try {
    // 쿠팡 상품 페이지 URL 구성
    const url = `https://www.coupang.com/vp/products/${productId}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 상품 정보 추출 (실제 쿠팡 페이지 구조에 맞게 수정 필요)
    const productInfo: ProductInfo = {
      productId,
      productName: extractProductName($),
      productPrice: extractProductPrice($),
      productImage: extractProductImage($),
      productUrl: url,
      isRocket: extractRocketDelivery($),
      isFreeShipping: extractFreeShipping($),
      categoryName: extractCategoryName($),
      rating: extractRating($),
      reviewCount: extractReviewCount($),
      description: extractDescription($),
      specifications: extractSpecifications($)
    };

    return productInfo;
  } catch (error) {
    console.error(`[crawlProductFromWeb] 웹 크롤링 실패:`, error);
    return null;
  }
}

/**
 * 상품명 추출
 */
function extractProductName($: cheerio.CheerioAPI): string {
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  return $('h1.prod-buy-header__title, .prod-buy-header__title, h1').first().text().trim() || '상품명 없음';
}

/**
 * 상품 가격 추출
 */
function extractProductPrice($: cheerio.CheerioAPI): number {
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  const priceText = $('.total-price, .price, .prod-price__total').first().text().trim();
  const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
  return price;
}

/**
 * 상품 이미지 추출
 */
function extractProductImage($: cheerio.CheerioAPI): string {
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  return $('img.prod-image__detail, .prod-image img, img').first().attr('src') || '';
}

/**
 * 로켓배송 여부 추출
 */
function extractRocketDelivery($: cheerio.CheerioAPI): boolean {
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  return $('.rocket-delivery, .rocket, [data-testid="rocket"]').length > 0;
}

/**
 * 무료배송 여부 추출
 */
function extractFreeShipping($: cheerio.CheerioAPI): boolean {
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  return $('.free-shipping, .shipping-free, [data-testid="free-shipping"]').length > 0;
}

/**
 * 카테고리명 추출
 */
function extractCategoryName($: cheerio.CheerioAPI): string {
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  return $('.breadcrumb, .category, .prod-category').first().text().trim() || '카테고리 없음';
}

/**
 * 평점 추출
 */
function extractRating($: cheerio.CheerioAPI): number {
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  const ratingText = $('.rating, .score, .star-rating').first().text().trim();
  const rating = parseFloat(ratingText) || 0;
  return rating;
}

/**
 * 리뷰 수 추출
 */
function extractReviewCount($: cheerio.CheerioAPI): number {
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  const reviewText = $('.review-count, .reviews, .count').first().text().trim();
  const count = parseInt(reviewText.replace(/[^\d]/g, '')) || 0;
  return count;
}

/**
 * 상품 설명 추출
 */
function extractDescription($: cheerio.CheerioAPI): string {
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  return $('.description, .prod-description, .detail-description').first().text().trim() || '';
}

/**
 * 상품 스펙 추출
 */
function extractSpecifications($: cheerio.CheerioAPI): Record<string, string> {
  const specs: Record<string, string> = {};
  
  // 실제 쿠팡 페이지 구조에 맞게 수정 필요
  $('.specifications tr, .specs tr').each((_, element) => {
    const $row = $(element);
    const key = $row.find('th, .key').text().trim();
    const value = $row.find('td, .value').text().trim();
    
    if (key && value) {
      specs[key] = value;
    }
  });

  return specs;
}

/**
 * staticCrawler 노드의 조건부 실행 함수
 * 
 * @param state - LangGraph 상태 객체
 * @returns 다음 노드 이름
 */
export function staticCrawlerCondition(state: LangGraphState): string {
  const { productInfo } = state.scrapedData;
  
  // 상품 정보가 성공적으로 크롤링되었으면 다음 노드로 진행
  if (productInfo && productInfo.length > 0) {
    return 'seoAgent';
  }
  
  // 크롤링 실패 시 동적 크롤러로 폴백
  console.log('[staticCrawler] 정적 크롤링 실패, 동적 크롤러로 폴백');
  return 'dynCrawler';
}

/**
 * staticCrawler 노드 테스트 함수
 */
export async function testStaticCrawlerNode() {
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
      currentNode: 'staticCrawler',
      completedNodes: ['extractIds']
    }
  };

  try {
    const result = await staticCrawlerNode(initialState);
    console.log('테스트 결과:', result);
    return result;
  } catch (error) {
    console.error('테스트 실패:', error);
    throw error;
  }
} 