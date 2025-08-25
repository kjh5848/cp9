import { NextRequest, NextResponse } from 'next/server';

interface ResearchResultsRequest {
  sessionId?: string;
  ids?: string[];
}

interface BackendApiResponse {
  success: boolean;
  data?: {
    products: unknown[];
    total_products: number;
    created_at: string;
    category_focus: string;
  };
  message?: string;
  error?: string;
}

/**
 * 리서치 결과를 가져오는 API 엔드포인트
 * 백엔드 Python API와 통신하여 실제 리서치 데이터를 반환
 */
export async function POST(request: NextRequest) {
  try {
    const body: ResearchResultsRequest = await request.json();
    const { sessionId, ids } = body;

    console.log('[research/results] API 호출:', { sessionId, ids });

    // 백엔드 Python API 호출
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/research/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 인증 헤더가 필요한 경우 추가
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        session_id: sessionId,
        product_ids: ids,
        // 추가적인 파라미터가 필요한 경우 여기에 추가
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[research/results] 백엔드 API 오류:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      throw new Error(`백엔드 API 오류: ${response.status} - ${response.statusText}`);
    }

    const backendData: BackendApiResponse = await response.json();
    
    if (!backendData.success) {
      throw new Error(backendData.message || '백엔드에서 데이터를 가져오는데 실패했습니다.');
    }

    console.log('[research/results] 성공:', {
      productsCount: backendData.data?.products?.length || 0,
      totalProducts: backendData.data?.total_products
    });

    // 프론트엔드 형식으로 응답 반환
    return NextResponse.json({
      success: true,
      data: backendData.data,
      message: '리서치 결과를 성공적으로 가져왔습니다.'
    });

  } catch (error) {
    console.error('[research/results] API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '리서치 결과를 가져오는데 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * GET 방식으로도 지원 (쿼리 파라미터 사용)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session') || undefined;
    const ids = searchParams.get('ids')?.split(',') || undefined;

    // POST 핸들러 재사용
    const mockRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, ids })
    });

    return POST(mockRequest as NextRequest);
  } catch (error) {
    console.error('[research/results] GET API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'GET 요청 처리에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}