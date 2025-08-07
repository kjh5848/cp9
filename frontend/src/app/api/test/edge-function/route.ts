import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge Function 테스트 API
 * Supabase Edge Function들을 프록시를 통해 호출합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const { functionName, data } = await request.json();

    if (!functionName) {
      return NextResponse.json(
        { error: 'functionName이 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase 프로젝트 URL과 anon key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase 환경 변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // Edge Function 호출
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(data || {}),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Edge Function 호출 실패',
          details: result,
          status: response.status 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      functionName,
    });

  } catch (error) {
    console.error('Edge Function 테스트 오류:', error);
    
    return NextResponse.json(
      { 
        error: '서버 오류',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
