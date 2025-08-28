/**
 * Perplexity API 연결 및 SEO 글 생성 테스트 API
 */

import { NextRequest, NextResponse } from 'next/server';

interface TestRequest {
  keyword?: string;
  testMode?: 'connection' | 'seo_generation' | 'full_workflow';
  products?: Array<{
    productName: string;
    productPrice: number;
    rating: number;
    reviewCount: number;
    isRocket: boolean;
    isFreeShipping: boolean;
    description: string;
  }>;
}

/**
 * Perplexity API 테스트 엔드포인트
 */
export async function POST(req: NextRequest) {
  try {
    const body: TestRequest = await req.json();
    
    console.log('🔵 [Perplexity 테스트] 요청 시작:', {
      testMode: body.testMode || 'full_workflow',
      keyword: body.keyword || '무선 이어폰',
      timestamp: new Date().toISOString()
    });

    // Supabase Edge Function URL
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-workflow`;
    
    if (!edgeFunctionUrl.includes('http')) {
      return NextResponse.json(
        { success: false, error: '서버 설정 오류: Supabase URL이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    const testData = {
      action: 'test',  // 테스트 모드로 실행
      keyword: body.keyword || '무선 이어폰',
      config: {
        enablePerplexity: true,
        enableWordPress: false,  // WordPress는 비활성화
        maxProducts: 3
      }
    };

    console.log('🔵 [Perplexity 테스트] Edge Function 호출 시작:', {
      url: edgeFunctionUrl,
      testData,
      timestamp: new Date().toISOString()
    });

    // Edge Function 호출
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testData),
    });

    console.log('🔵 [Perplexity 테스트] Edge Function 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 [Perplexity 테스트] Edge Function 오류:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `테스트 실행 실패: ${response.status} ${response.statusText}`,
          details: errorText,
          logs: [
            `❌ Edge Function 호출 실패: ${response.status}`,
            `📝 응답 내용: ${errorText.substring(0, 200)}...`,
            `🕒 실행 시간: ${new Date().toISOString()}`
          ]
        },
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    const result = await response.json();
    
    console.log('✅ [Perplexity 테스트] 성공:', {
      success: result.success,
      hasData: !!result.data,
      message: result.message,
      timestamp: new Date().toISOString()
    });

    // 로그 정보 추가
    const logs = [
      `✅ AI 워크플로우 테스트 성공`,
      `📊 처리된 상품 수: ${result.data?.workflow?.aiProductResearch?.enrichedData?.length || 0}개`,
      `🤖 SEO 콘텐츠 생성: ${result.data?.workflow?.seoAgent?.title ? '성공' : '실패'}`,
      `📝 생성된 글 길이: ${result.data?.workflow?.seoAgent?.content?.length || 0}자`,
      `⏱️ 총 실행 시간: ${result.data?.metadata?.executionTime || 0}ms`,
      `🕒 완료 시간: ${new Date().toISOString()}`
    ];

    // Perplexity API 관련 정보 추가
    if (result.data?.workflow?.seoAgent) {
      const seoAgent = result.data.workflow.seoAgent;
      logs.push(
        `🎯 생성된 제목: ${seoAgent.title}`,
        `🔑 키워드 수: ${seoAgent.keywords?.length || 0}개`,
        `📄 요약: ${seoAgent.summary?.substring(0, 100)}...`
      );
    }

    return NextResponse.json({
      ...result,
      testInfo: {
        testMode: body.testMode || 'full_workflow',
        keyword: body.keyword || '무선 이어폰',
        executedAt: new Date().toISOString(),
        logs
      }
    }, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (error) {
    console.error('🔴 [Perplexity 테스트] API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: 'Perplexity API 테스트 중 오류가 발생했습니다.',
        logs: [
          `❌ 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
          `🕒 실패 시간: ${new Date().toISOString()}`
        ]
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}

/**
 * 테스트 상태 조회
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testType = searchParams.get('type') || 'status';
  
  return NextResponse.json({
    success: true,
    message: 'Perplexity API 테스트 엔드포인트가 정상적으로 동작 중입니다.',
    testEndpoint: '/api/test-perplexity',
    availableTests: [
      'connection - Perplexity API 연결 테스트',
      'seo_generation - SEO 글 생성 테스트', 
      'full_workflow - 전체 워크플로우 테스트'
    ],
    timestamp: new Date().toISOString()
  }, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}