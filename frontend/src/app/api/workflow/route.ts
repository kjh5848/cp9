/**
 * 통합 워크플로우 API
 * 모든 비즈니스 로직을 백엔드 Edge Function으로 위임
 */

import { NextRequest, NextResponse } from 'next/server';

interface WorkflowRequest {
  action: 'execute' | 'status' | 'result';
  urls?: string[];
  productIds?: string[];
  keyword?: string;
  threadId?: string;
  config?: {
    enablePerplexity?: boolean;
    enableWordPress?: boolean;
    maxProducts?: number;
  };
}

/**
 * 워크플로우 실행 API
 * 백엔드 ai-workflow Edge Function으로 모든 요청 프록시
 */
export async function POST(req: NextRequest) {
  try {
    const body: WorkflowRequest = await req.json();
    
    // 입력 검증
    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'action이 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase Edge Function URL
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-workflow`;
    
    if (!edgeFunctionUrl.includes('http')) {
      return NextResponse.json(
        { success: false, error: '서버 설정 오류' },
        { status: 500 }
      );
    }

    console.log('[workflow/route] Edge Function 호출:', {
      url: edgeFunctionUrl,
      action: body.action,
      dataSize: JSON.stringify(body).length
    });

    // Edge Function 호출
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[workflow/route] Edge Function 오류:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `워크플로우 실행 실패: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    console.log('[workflow/route] Edge Function 성공:', {
      success: result.success,
      hasData: !!result.data,
      message: result.message
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[workflow/route] API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: '워크플로우 API 호출 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

/**
 * 워크플로우 상태 조회
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    
    if (!threadId) {
      return NextResponse.json(
        { success: false, error: 'threadId가 필요합니다.' },
        { status: 400 }
      );
    }

    // Edge Function으로 상태 조회 요청
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-workflow`;
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'status',
        threadId
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `상태 조회 실패: ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[workflow/route] 상태 조회 오류:', error);
    
    return NextResponse.json(
      { success: false, error: '상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}