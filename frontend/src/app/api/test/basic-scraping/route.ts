/**
 * 기본 크롤링 테스트 API (Playwright 사용)
 * GET /api/test/basic-scraping?url={url}
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { 
          error: 'URL 파라미터가 필요합니다.',
          example: '/api/test/basic-scraping?url=https://www.coupang.com/vp/products/123456'
        },
        { status: 400 }
      );
    }

    console.log('기본 크롤링 테스트 시작:', url);

    // 동적으로 기존 크롤러 import
    let coupangScraper: any;
    try {
      const scraperModule = await import('@/infrastructure/scraping/coupang-scraper');
      coupangScraper = scraperModule.coupangScraper;
      console.log('기존 Coupang 스크래퍼 모듈 로딩 성공');
    } catch (importError) {
      console.error('기존 Coupang 스크래퍼 모듈 로딩 실패:', importError);
      return NextResponse.json({
        success: false,
        error: `기존 크롤러 모듈 로딩 실패: ${importError instanceof Error ? importError.message : '알 수 없는 오류'}`,
        metadata: {
          method: 'coupang-scraper',
          timestamp: new Date().toISOString(),
          url: url,
        }
      }, { status: 500 });
    }

    // 기존 크롤러로 크롤링 실행
    const result = await coupangScraper.scrapeProduct(url);
    
    const totalDuration = Date.now() - startTime;

    if (result.status === 'success') {
      return NextResponse.json({
        success: true,
        message: '기본 크롤링 성공',
        data: result.data,
        performance: {
          scraping_duration: result.duration,
          total_duration: totalDuration,
        },
        metadata: {
          method: 'coupang-scraper',
          timestamp: new Date().toISOString(),
          url: url,
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        performance: {
          scraping_duration: result.duration,
          total_duration: totalDuration,
        },
        metadata: {
          method: 'coupang-scraper',
          timestamp: new Date().toISOString(),
          url: url,
        }
      }, { status: 500 });
    }

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('기본 크롤링 테스트 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      performance: {
        total_duration: totalDuration,
      },
      metadata: {
        method: 'coupang-scraper',
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}