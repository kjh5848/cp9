/**
 * 쿠팡 상품 페이지 크롤링 시스템
 * Cheerio 1차 시도 → Playwright 2차 시도 구조
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedProductInfo, ScrapingConfig, ScrapingResult } from '@/shared/types/enrichment';

/**
 * 쿠팡 상품 페이지 크롤러
 */
export class CoupangScraper {
  private config: ScrapingConfig;

  constructor(config: Partial<ScrapingConfig> = {}) {
    this.config = {
      usePlaywright: false,
      timeout: 10000,
      retryCount: 3,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...config,
    };
  }

  /**
   * 딥링크에서 최종 URL과 상품 ID 추출
   */
  async extractProductInfo(deepLink: string): Promise<{ productId: string; productUrl: string }> {
    try {
      // 이미 쿠팡 상품 URL인 경우 바로 처리
      if (deepLink.includes('coupang.com')) {
        const productIdMatch = deepLink.match(/\/vp\/products\/(\d+)/);
        if (productIdMatch) {
          const productId = productIdMatch[1];
          return { productId, productUrl: deepLink };
        }
      }

      // 딥링크인 경우 301/302 리디렉션 추적
      const response = await axios.get(deepLink, {
        maxRedirects: 0,
        validateStatus: (status) => status === 301 || status === 302,
        timeout: this.config.timeout,
      });

      const finalUrl = response.headers.location;
      if (!finalUrl) {
        throw new Error('리디렉션 URL을 찾을 수 없습니다.');
      }

      // 상품 ID 추출
      const productIdMatch = finalUrl.match(/\/vp\/products\/(\d+)/);
      if (!productIdMatch) {
        throw new Error('상품 ID를 추출할 수 없습니다.');
      }

      const productId = productIdMatch[1];
      return { productId, productUrl: finalUrl };
    } catch (error) {
      throw new Error(`딥링크 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * Cheerio를 사용한 1차 크롤링 시도
   */
  private async scrapeWithCheerio(url: string): Promise<ScrapedProductInfo | null> {
    try {
      const response = await axios.get(url, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        },
      });

      const $ = cheerio.load(response.data);

      // 상품명 추출
      const title = $('meta[property="og:title"]').attr('content') ||
                   $('.prod-buy-header__title').text().trim() ||
                   $('h1').first().text().trim();

      // 이미지 추출
      const image = $('meta[property="og:image"]').attr('content') ||
                   $('.prod-image__detail').attr('src') ||
                   $('.prod-image img').first().attr('src');

      // 가격 추출
      const priceText = $('.total-price strong').text().trim() ||
                       $('.price-value').text().trim() ||
                       $('[data-testid="price"]').text().trim();
      const price = this.extractPrice(priceText);

      // 리뷰 수 추출
      const reviewsText = $('.rating-star-num').text().trim() ||
                         $('.prod-rating-count').text().trim();
      const reviews = this.extractNumber(reviewsText);

      // 평점 추출
      const ratingText = $('.rating-star').attr('style') ||
                        $('.prod-rating').text().trim();
      const rating = this.extractRating(ratingText);

      // 카테고리 추출
      const category = $('.breadcrumb a').map((_, el) => $(el).text().trim()).get();

      // 설명 추출
      const description = $('meta[name="description"]').attr('content') ||
                         $('.prod-description').text().trim();

      // 필수 필드 검증
      if (!title || !image || price === 0) {
        return null; // Playwright로 재시도
      }

      return {
        productId: '', // URL에서 추출된 ID 사용
        title,
        image,
        price,
        reviews,
        rating,
        category,
        description: description || '',
        availability: true,
      };
    } catch (error) {
      console.error('Cheerio 크롤링 실패:', error);
      return null;
    }
  }

  /**
   * Playwright를 사용한 2차 크롤링 시도
   */
  private async scrapeWithPlaywright(url: string): Promise<ScrapedProductInfo | null> {
    try {
      // Playwright는 서버 사이드에서만 사용 가능
      if (typeof window !== 'undefined') {
        throw new Error('Playwright는 클라이언트에서 사용할 수 없습니다.');
      }

      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      await page.setUserAgent(this.config.userAgent || '');
      await page.goto(url, { waitUntil: 'networkidle', timeout: this.config.timeout });

      // 상품 정보 추출
      const productInfo = await page.evaluate(() => {
        const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                     document.querySelector('.prod-buy-header__title')?.textContent?.trim() ||
                     document.querySelector('h1')?.textContent?.trim();

        const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                     document.querySelector('.prod-image__detail')?.getAttribute('src') ||
                     document.querySelector('.prod-image img')?.getAttribute('src');

        const priceText = document.querySelector('.total-price strong')?.textContent?.trim() ||
                         document.querySelector('.price-value')?.textContent?.trim() ||
                         document.querySelector('[data-testid="price"]')?.textContent?.trim();

        const reviewsText = document.querySelector('.rating-star-num')?.textContent?.trim() ||
                           document.querySelector('.prod-rating-count')?.textContent?.trim();

        const ratingText = document.querySelector('.rating-star')?.getAttribute('style') ||
                          document.querySelector('.prod-rating')?.textContent?.trim();

        const category = Array.from(document.querySelectorAll('.breadcrumb a'))
          .map(el => el.textContent?.trim())
          .filter(Boolean);

        const description = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                           document.querySelector('.prod-description')?.textContent?.trim();

        return {
          title,
          image,
          priceText,
          reviewsText,
          ratingText,
          category,
          description,
        };
      });

      await browser.close();

      if (!productInfo.title || !productInfo.image) {
        return null;
      }

      return {
        productId: '', // URL에서 추출된 ID 사용
        title: productInfo.title,
        image: productInfo.image,
        price: this.extractPrice(productInfo.priceText || ''),
        reviews: this.extractNumber(productInfo.reviewsText || ''),
        rating: this.extractRating(productInfo.ratingText || ''),
        category: productInfo.category || [],
        description: productInfo.description || '',
        availability: true,
      };
    } catch (error) {
      console.error('Playwright 크롤링 실패:', error);
      return null;
    }
  }

  /**
   * 상품 정보 크롤링 (메인 메서드)
   */
  async scrapeProduct(deepLink: string): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      // 1. 딥링크에서 상품 정보 추출
      const { productId, productUrl } = await this.extractProductInfo(deepLink);

      // 2. Cheerio로 1차 시도
      let scrapedInfo = await this.scrapeWithCheerio(productUrl);

      // 3. Cheerio 실패 시 Playwright로 2차 시도
      if (!scrapedInfo && this.config.usePlaywright) {
        scrapedInfo = await this.scrapeWithPlaywright(productUrl);
      }

      if (!scrapedInfo) {
        throw new Error('상품 정보를 추출할 수 없습니다.');
      }

      // 4. 상품 ID 설정
      scrapedInfo.productId = productId;

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        data: scrapedInfo,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        status: 'error',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        duration,
      };
    }
  }

  /**
   * 가격 텍스트에서 숫자 추출
   */
  private extractPrice(priceText: string): number {
    const match = priceText.match(/[\d,]+/);
    if (!match) return 0;
    return parseInt(match[0].replace(/,/g, ''), 10);
  }

  /**
   * 텍스트에서 숫자 추출
   */
  private extractNumber(text: string): number {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * 평점 추출 (CSS background-position 또는 텍스트에서)
   */
  private extractRating(ratingText: string): number {
    // CSS background-position에서 평점 추출
    const bgMatch = ratingText.match(/background-position:\s*(\d+)%/);
    if (bgMatch) {
      return parseInt(bgMatch[1], 10) / 20; // 0-100%를 0-5점으로 변환
    }

    // 텍스트에서 평점 추출
    const textMatch = ratingText.match(/(\d+\.?\d*)/);
    return textMatch ? parseFloat(textMatch[1]) : 0;
  }
}

/**
 * 기본 크롤러 인스턴스
 */
export const coupangScraper = new CoupangScraper({
  usePlaywright: true,
  timeout: 10000,
  retryCount: 3,
}); 