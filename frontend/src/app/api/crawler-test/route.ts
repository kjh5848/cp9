import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';

/**
 * 크롤링 테스트 API 엔드포인트
 * cheerio와 playwright를 사용한 구글 검색 결과 크롤링
 * 
 * @param request - HTTP 요청 객체
 * @returns 크롤링 결과 응답
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { keyword, type } = body;

    // 입력 검증
    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { error: '검색 키워드가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!type || !['cheerio', 'playwright'].includes(type)) {
      return NextResponse.json(
        { error: '크롤러 타입이 필요합니다 (cheerio 또는 playwright).' },
        { status: 400 }
      );
    }

    console.log(`[API] ${type} 크롤링 테스트 시작: ${keyword}`);

    let results: Array<{title: string; url: string; snippet: string}> = [];

    if (type === 'cheerio') {
      results = await crawlWithCheerio(keyword);
    } else {
      results = await crawlWithPlaywright(keyword);
    }

    console.log(`[API] ${type} 크롤링 테스트 완료: ${results.length}개 결과 수집`);

    // 성공 응답
    return NextResponse.json({
      success: true,
      results,
      metadata: {
        keyword,
        crawlerType: type,
        totalResults: results.length,
        executionTime: Date.now()
      }
    });

  } catch (error) {
    console.error('[API] 크롤링 테스트 오류:', error);

    // 오류 응답
    return NextResponse.json(
      { 
        error: '크롤링 테스트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * Cheerio를 사용한 구글 검색 결과 크롤링
 * 
 * @param keyword - 검색 키워드
 * @returns 검색 결과 배열
 */
async function crawlWithCheerio(keyword: string): Promise<Array<{title: string; url: string; snippet: string}>> {
  try {
    console.log('[Cheerio] 구글 검색 시작:', keyword);
    
    // 나무위키 테스트 페이지 사용
    const searchUrl = `https://namu.wiki/w/${encodeURIComponent(keyword)}`;
    
    const response = await fetch(searchUrl, {
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

    const results: Array<{title: string; url: string; snippet: string}> = [];

    // 디버깅을 위한 HTML 구조 확인
    console.log('[Cheerio] HTML 길이:', html.length);
    console.log('[Cheerio] 페이지 제목:', $('title').text());
    
    // 나무위키 HTML 구조 파싱
    const selectors = [
      '.wiki-heading-content',
      '.wiki-paragraph',
      '.wiki-table',
      'h1',
      'h2',
      'h3'
    ];
    
    let foundResults = false;
    
    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`[Cheerio] 선택자 ${selector}로 ${elements.length}개 요소 발견`);
      
      if (elements.length > 0) {
        elements.each((index, element) => {
          const $element = $(element);
          
          // 나무위키 구조 파싱
          const title = $element.text().trim();
          const url = searchUrl;
          const snippet = $element.text().trim();
          
          if (title && url && url.startsWith('http') && title.length > 10) {
            results.push({
              title: title.substring(0, 100),
              url,
              snippet: snippet.substring(0, 200)
            });
            foundResults = true;
          }
        });
        
        if (foundResults) {
          console.log(`[Cheerio] 선택자 ${selector}로 ${results.length}개 결과 수집 성공`);
          break;
        }
      }
    }
    
    // 결과가 없으면 HTML 일부를 로그로 출력
    if (results.length === 0) {
      console.log('[Cheerio] 검색 결과를 찾을 수 없음. HTML 일부:', html.substring(0, 2000));
    }

    console.log('[Cheerio] 검색 결과 수집 완료:', results.length);
    return results;

  } catch (error) {
    console.error('[Cheerio] 크롤링 실패:', error);
    throw new Error(`Cheerio 크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * Playwright를 사용한 구글 검색 결과 크롤링
 * 
 * @param keyword - 검색 키워드
 * @returns 검색 결과 배열
 */
async function crawlWithPlaywright(keyword: string): Promise<Array<{title: string; url: string; snippet: string}>> {
  let browser;
  
  try {
    console.log('[Playwright] 브라우저 시작');
    
    // 브라우저 시작
    browser = await chromium.launch({
      headless: true,
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
        '--allow-running-insecure-content'
      ]
    });

    const page = await browser.newPage();
    
    // HTTP 헤더 설정
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'DNT': '1',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"'
    });

    // navigator.webdriver 스푸핑
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    console.log('[Playwright] 구글 검색 페이지 로드 시작');
    
    // 나무위키 테스트 페이지 사용
    const searchUrl = `https://namu.wiki/w/${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('[Playwright] 페이지 로드 완료, JavaScript 렌더링 대기');
    
    // JavaScript 렌더링 대기
    await page.waitForTimeout(3000);

    console.log('[Playwright] 검색 결과 추출 시작');
    
    // 페이지 정보 확인
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log('[Playwright] 페이지 제목:', pageTitle);
    console.log('[Playwright] 현재 URL:', pageUrl);
    
    // 검색 결과 추출
    const results = await page.evaluate(() => {
      const searchResults: Array<{title: string; url: string; snippet: string}> = [];
      
                     // 나무위키 HTML 구조 파싱
     const selectors = [
       '.wiki-heading-content',
       '.wiki-paragraph',
       '.wiki-table',
       'h1',
       'h2',
       'h3'
     ];
      
      let foundResults = false;
      
      for (const selector of selectors) {
        const resultElements = document.querySelectorAll(selector);
        console.log(`Playwright: 선택자 ${selector}로 ${resultElements.length}개 요소 발견`);
        
        if (resultElements.length > 0) {
          resultElements.forEach((element) => {
                         // 나무위키 구조 파싱
             const title = element.textContent?.trim() || '';
             const url = window.location.href;
             const snippet = element.textContent?.trim() || '';
            
                         if (title && url && url.startsWith('http') && title.length > 10) {
               searchResults.push({
                 title: title.substring(0, 100),
                 url,
                 snippet: snippet.substring(0, 200)
               });
               foundResults = true;
             }
          });
          
          if (foundResults) {
            console.log(`Playwright: 선택자 ${selector}로 ${searchResults.length}개 결과 수집 성공`);
            break;
          }
        }
      }
      
      // 결과가 없으면 페이지 내용 일부를 로그로 출력
      if (searchResults.length === 0) {
        console.log('Playwright: 검색 결과를 찾을 수 없음. 페이지 내용 일부:', document.body.innerHTML.substring(0, 2000));
      }
      
      return searchResults;
    });

    console.log('[Playwright] 검색 결과 수집 완료:', results.length);
    return results;

  } catch (error) {
    console.error('[Playwright] 크롤링 실패:', error);
    throw new Error(`Playwright 크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('[Playwright] 브라우저 종료');
    }
  }
} 