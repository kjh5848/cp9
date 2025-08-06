/**
 * Scrapfly 직접 API 테스트
 * GET /api/test/scrapfly-direct?url={url}
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url') || 'https://httpbin.dev/anything';

    console.log('Scrapfly 직접 API 테스트 시작:', url);

    // Scrapfly API 직접 호출
    const scrapflyApiUrl = new URL('https://api.scrapfly.io/scrape');
    scrapflyApiUrl.searchParams.append('key', 'scp-live-0c201f154e234255ab0aed2a750c30f7');
    scrapflyApiUrl.searchParams.append('url', url);
    scrapflyApiUrl.searchParams.append('render_js', 'true');
    scrapflyApiUrl.searchParams.append('asp', 'true');
    scrapflyApiUrl.searchParams.append('country', 'kr');
    scrapflyApiUrl.searchParams.append('format', 'clean_html');
    scrapflyApiUrl.searchParams.append('tags', 'coupang,project:cp9');

    console.log('Scrapfly API URL:', scrapflyApiUrl.toString());

    const response = await fetch(scrapflyApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const totalDuration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Scrapfly API 오류:', response.status, errorText);
      
      return NextResponse.json({
        success: false,
        error: `Scrapfly API 오류: ${response.status} ${response.statusText}`,
        details: errorText,
        performance: { total_duration: totalDuration },
        metadata: {
          method: 'scrapfly-direct',
          timestamp: new Date().toISOString(),
          url: url,
          api_url: scrapflyApiUrl.toString(),
        }
      }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('Scrapfly API 응답 성공:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      dataKeys: Object.keys(data)
    });

    return NextResponse.json({
      success: true,
      message: 'Scrapfly 직접 API 호출 성공',
      data: {
        status_code: data.result?.status_code,
        content_length: data.result?.content?.length || 0,
        content_preview: data.result?.content?.substring(0, 500) || '',
        full_response: data, // 전체 응답 포함
      },
      performance: { 
        total_duration: totalDuration,
        scrapfly_duration: data.result?.duration || 0,
      },
      metadata: {
        method: 'scrapfly-direct',
        timestamp: new Date().toISOString(),
        url: url,
        api_url: scrapflyApiUrl.toString(),
      }
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('Scrapfly 직접 API 테스트 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      performance: { total_duration: totalDuration },
      metadata: {
        method: 'scrapfly-direct',
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}