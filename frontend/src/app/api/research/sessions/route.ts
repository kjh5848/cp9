import { NextRequest, NextResponse } from 'next/server';

interface BackendSessionsResponse {
  success: boolean;
  data?: {
    sessions: unknown[];
    total: number;
  };
  message?: string;
  error?: string;
}

/**
 * 모든 리서치 세션 목록을 가져오는 API 엔드포인트
 * 백엔드 Python API와 통신하여 세션 목록을 반환
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[research/sessions] 세션 목록 요청');

    // URL 파라미터 처리
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // 백엔드 Python API 호출
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/research/sessions?page=${page}&limit=${limit}&sort=${sort}&order=${order}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 인증 헤더가 필요한 경우 추가
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[research/sessions] 백엔드 API 오류:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      throw new Error(`백엔드 API 오류: ${response.status} - ${response.statusText}`);
    }

    const backendData: BackendSessionsResponse = await response.json();
    
    if (!backendData.success) {
      throw new Error(backendData.message || '백엔드에서 세션 목록을 가져오는데 실패했습니다.');
    }

    console.log('[research/sessions] 성공:', {
      sessionsCount: backendData.data?.sessions?.length || 0,
      total: backendData.data?.total || 0
    });

    // 프론트엔드 형식으로 응답 반환
    return NextResponse.json({
      success: true,
      data: backendData.data?.sessions || [],
      total: backendData.data?.total || 0,
      message: '세션 목록을 성공적으로 가져왔습니다.'
    });

  } catch (error) {
    console.error('[research/sessions] API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '세션 목록을 가져오는데 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * 새로운 리서치 세션을 생성하는 API 엔드포인트 (선택사항)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[research/sessions] 새 세션 생성 요청:', body);

    // 백엔드 Python API 호출
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/research/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 인증 헤더가 필요한 경우 추가
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[research/sessions] 백엔드 API 오류:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      throw new Error(`백엔드 API 오류: ${response.status} - ${response.statusText}`);
    }

    const backendData = await response.json();
    
    if (!backendData.success) {
      throw new Error(backendData.message || '세션 생성에 실패했습니다.');
    }

    console.log('[research/sessions] 세션 생성 성공:', {
      sessionId: backendData.data?.id
    });

    return NextResponse.json({
      success: true,
      data: backendData.data,
      message: '새 세션이 성공적으로 생성되었습니다.'
    });

  } catch (error) {
    console.error('[research/sessions] POST API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '세션 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}