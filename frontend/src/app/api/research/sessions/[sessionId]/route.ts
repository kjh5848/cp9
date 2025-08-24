import { NextRequest, NextResponse } from 'next/server';

interface BackendSessionResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    description: string;
    products: unknown[];
    total_products: number;
    created_at: string;
    category_focus: string;
  };
  message?: string;
  error?: string;
}

/**
 * 특정 세션의 리서치 데이터를 가져오는 API 엔드포인트
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    console.log('[research/sessions] 세션 데이터 요청:', { sessionId });

    // 백엔드 Python API 호출
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/research/sessions/${sessionId}`, {
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
        errorText,
        sessionId
      });
      
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false,
            error: '세션을 찾을 수 없습니다.',
            details: `세션 ID ${sessionId}가 존재하지 않습니다.`
          },
          { status: 404 }
        );
      }
      
      throw new Error(`백엔드 API 오류: ${response.status} - ${response.statusText}`);
    }

    const backendData: BackendSessionResponse = await response.json();
    
    if (!backendData.success) {
      throw new Error(backendData.message || '백엔드에서 세션 데이터를 가져오는데 실패했습니다.');
    }

    console.log('[research/sessions] 성공:', {
      sessionId,
      title: backendData.data?.title,
      productsCount: backendData.data?.products?.length || 0
    });

    // 프론트엔드 형식으로 응답 반환
    return NextResponse.json({
      success: true,
      data: backendData.data,
      message: '세션 데이터를 성공적으로 가져왔습니다.'
    });

  } catch (error) {
    console.error('[research/sessions] API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '세션 데이터를 가져오는데 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}