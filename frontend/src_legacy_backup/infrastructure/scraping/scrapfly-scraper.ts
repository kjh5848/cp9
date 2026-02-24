/**
 * Scrapfly를 이용한 쿠팡 상품 크롤링 서비스
 * 안티봇 우회, 세션 관리, JavaScript 렌더링 지원
 */

import { ScrapflyClient, ScrapeConfig } from 'scrapfly-sdk';
import { ScrapedProductInfo, ScrapingConfig, ScrapingResult } from '@/shared/types/enrichment';

/**
 * Scrapfly 설정 타입
 */
export interface ScrapflyConfig extends ScrapingConfig {
  /** Scrapfly API 키 */
  apiKey: string;
  /** 세션 이름 (쿠키 유지용) */
  sessionName?: string;
  /** JavaScript 렌더링 사용 여부 */
  useJavaScript?: boolean;
  /** 프록시 지역 설정 */
  country?: string;
  /** ASP (Anti-Scraping Protection) 우회 여부 */
  bypassAsp?: boolean;
}

/**
 * Scrapfly 기반 쿠팡 크롤러
 */
export class ScrapflyCoupangScraper {
  private client: ScrapflyClient;
  private config: ScrapflyConfig;

  constructor(config: Partial<ScrapflyConfig> = {}) {
    this.config = {
      apiKey: process.env.SCRAPFLY_KEY || '',
      timeout: 15000,
      retryCount: 3,
      usePlaywright: false,
      sessionName: 'coupang_session',
      useJavaScript: true,
      country: 'KR',
      bypassAsp: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error('SCRAPFLY_KEY 환경 변수가 설정되지 않았습니다.');
    }

    // Scrapfly 클라이언트 초기화
    this.client = new ScrapflyClient({ key: this.config.apiKey });
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

      // 딥링크인 경우 리다이렉트 추적
      if (deepLink.includes('coupa.ng')) {
        const response = await fetch(deepLink, {
          method: 'HEAD',
          redirect: 'manual',
        });

        const finalUrl = response.headers.get('location') || deepLink;
        
        // 상품 ID 추출
        const productIdMatch = finalUrl.match(/\/vp\/products\/(\d+)/);
        if (!productIdMatch) {
          throw new Error('상품 ID를 추출할 수 없습니다.');
        }

        const productId = productIdMatch[1];
        return { productId, productUrl: finalUrl };
      }

      // 일반 URL인 경우 그대로 사용하고 임시 ID 생성
      const urlObj = new URL(deepLink);
      const tempId = urlObj.pathname.replace(/\D/g, '') || Date.now().toString();
      
      return { productId: tempId, productUrl: deepLink };
    } catch (error) {
      throw new Error(`딥링크 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * Scrapfly로 페이지 크롤링
   */
  private async scrapeWithScrapfly(url: string): Promise<ScrapedProductInfo | null> {
    try {
      const scrapeConfig = new ScrapeConfig({
        url,
        country: this.config.country,
        render_js: this.config.useJavaScript,
        asp: this.config.bypassAsp,
        session: this.config.sessionName,
        timeout: Math.floor(this.config.timeout / 1000), // 초 단위로 변환
        tags: ["coupang", "project:cp9"],
        format: "clean_html",
        headers: {
          'User-Agent': this.config.userAgent || '',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      console.log('Scrapfly 요청:', { url, config: scrapeConfig });
      
      const result = await this.client.scrape(scrapeConfig);
      const html = result.result.content;

      if (!html) {
        console.error('Scrapfly에서 HTML 콘텐츠를 받지 못함');
        return null;
      }

      // HTML 파싱을 위해 cheerio 사용
      const { load } = await import('cheerio');
      const $ = load(html);

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

      console.log('Scrapfly 크롤링 결과:', {
        title: title?.substring(0, 50),
        image: image?.substring(0, 100),
        price,
        reviews,
        rating,
      });

      // 필수 필드 검증
      if (!title || !image || price === 0) {
        console.warn('필수 필드 누락:', { title: !!title, image: !!image, price });
        return null;
      }

      return {
        productId: '', // URL에서 추출된 ID로 나중에 설정
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
      console.error('Scrapfly 크롤링 실패:', error);
      return null;
    }
  }

  /**
   * 상품 정보 크롤링 (메인 메서드)
   */
  async scrapeProduct(deepLink: string): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      console.log('Scrapfly 크롤링 시작:', deepLink);

      // 1. 딥링크에서 상품 정보 추출
      const { productId, productUrl } = await this.extractProductInfo(deepLink);
      console.log('상품 정보 추출 완료:', { productId, productUrl });

      // 2. Scrapfly로 크롤링
      const scrapedInfo = await this.scrapeWithScrapfly(productUrl);

      if (!scrapedInfo) {
        throw new Error('Scrapfly에서 상품 정보를 추출할 수 없습니다.');
      }

      // 3. 상품 ID 설정
      scrapedInfo.productId = productId;

      const duration = Date.now() - startTime;
      console.log(`Scrapfly 크롤링 완료: ${duration}ms`);

      return {
        status: 'success',
        data: scrapedInfo,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('Scrapfly 크롤링 오류:', error);
      
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

  /**
   * 세션 정보 조회
   */
  async getSessionInfo(): Promise<any> {
    try {
      // Scrapfly 세션 상태 확인 (구현 예정)
      return { sessionName: this.config.sessionName, status: 'active' };
    } catch (error) {
      console.error('세션 정보 조회 실패:', error);
      return null;
    }
  }

  /**
   * 세션 초기화
   */
  async clearSession(): Promise<boolean> {
    try {
      // 새로운 세션명으로 변경
      this.config.sessionName = `coupang_session_${Date.now()}`;
      console.log('세션 초기화 완료:', this.config.sessionName);
      return true;
    } catch (error) {
      console.error('세션 초기화 실패:', error);
      return false;
    }
  }
}

/**
 * 기본 Scrapfly 크롤러 인스턴스
 */
export const scrapflyCoupangScraper = new ScrapflyCoupangScraper({
  timeout: 15000,
  retryCount: 3,
  useJavaScript: true,
  bypassAsp: true,
  country: 'KR',
});