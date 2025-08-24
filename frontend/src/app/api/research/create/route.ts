/**
 * @deprecated 이 API 라우트는 더 이상 사용되지 않습니다.
 * 대신 백엔드 Python API를 직접 사용하세요: POST /api/v1/research/products
 * 
 * 이 파일은 레거시 호환성을 위해 유지되고 있으며, 향후 제거될 예정입니다.
 * 
 * @see https://localhost:8000/api/v1/research/products
 */

import { NextRequest, NextResponse } from 'next/server';

interface CreateResearchRequest {
  // 기존 형식 (하위호환성)
  products?: {
    productId: number;
    name: string;
    price: number;
    category: string;
    url: string;
    image?: string;
  }[];
  type?: 'research_only' | 'full_analysis';
  title?: string;
  description?: string;
  
  // 새로운 API 가이드 형식
  items?: {
    product_name: string;
    category: string;
    price_exact: number;
    currency?: string;
    product_id?: number;
    product_url?: string;
    product_image?: string;
    is_rocket?: boolean;
    is_free_shipping?: boolean;
    category_name?: string;
    seller_or_store?: string;
  }[];
  return_coupang_preview?: boolean;
  priority?: number;
}

interface BackendCreateResponse {
  success: boolean;
  data?: {
    // 기존 세션 생성 응답
    session_id?: string;
    status?: string;
    products_count?: number;
    created_at?: string;
    
    // 쿠팡 즉시 리턴 응답
    job_id?: string;
    results?: unknown[]; // 쿠팡 데이터
  };
  message?: string;
  error?: string;
}

/**
 * 새로운 리서치 세션을 생성하는 API 엔드포인트
 * 선택된 상품들에 대해 리서치 분석을 수행합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateResearchRequest = await request.json();
    const { products, type, title, description, items, return_coupang_preview, priority } = body;

    // 새로운 API 가이드 형식 처리
    if (items && items.length > 0) {
      console.log('[research/create] 쿠팡 즉시 리턴 리서치 요청:', {
        itemsCount: items.length,
        return_coupang_preview,
        priority
      });

      // API 가이드에 따른 백엔드 호출
      const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
      const apiUrl = return_coupang_preview 
        ? `${backendUrl}/api/v1/research/products?return_coupang_preview=true`
        : `${backendUrl}/api/v1/research/products`;
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          priority: priority || 5
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[research/create] 백엔드 API 오류:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`백엔드 API 오류: ${response.status} - ${response.statusText}`);
      }

      const backendData: BackendCreateResponse = await response.json();
      
      if (!backendData.success) {
        throw new Error(backendData.message || '리서치 요청에 실패했습니다.');
      }

      console.log('[research/create] 쿠팡 즉시 리턴 성공:', {
        job_id: backendData.data?.job_id,
        coupangResults: backendData.data?.results?.length || 0,
        session_id: backendData.data?.session_id
      });

      // 세션 ID가 없으면 임시로 job_id를 세션 ID로 사용
      const sessionId = backendData.data?.session_id || backendData.data?.job_id || `temp_${Date.now()}`;

      return NextResponse.json({
        success: true,
        data: {
          job_id: backendData.data?.job_id,
          status: 'pending',
          results: backendData.data?.results || [],
          session_id: sessionId,
          created_at: new Date().toISOString(),
          items_count: items.length
        },
        message: return_coupang_preview 
          ? `쿠팡 정보가 포함된 리서치가 시작되었습니다. (${items.length}개 상품)`
          : `리서치가 시작되었습니다. (${items.length}개 상품)`
      });
    }

    // 기존 형식 처리 (하위호환성)
    if (!products || products.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '분석할 상품 정보가 필요합니다.' 
        },
        { status: 400 }
      );
    }

    console.log('[research/create] 기존 형식 리서치 생성 요청:', {
      productsCount: products.length,
      type,
      title
    });

    // 백엔드 Python API 호출 (기존 방식)
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/research/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: products.map(product => ({
          product_id: product.productId,
          product_name: product.name,
          price_exact: product.price,
          category: product.category,
          deeplink_or_product_url: product.url,
          product_image: product.image || '',
        })),
        session_config: {
          title,
          description,
          analysis_type: type,
          enable_seo_generation: type === 'full_analysis',
          enable_content_creation: false // 리서치만 수행
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[research/create] 백엔드 API 오류:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      throw new Error(`백엔드 API 오류: ${response.status} - ${response.statusText}`);
    }

    const backendData: BackendCreateResponse = await response.json();
    
    if (!backendData.success) {
      throw new Error(backendData.message || '리서치 세션 생성에 실패했습니다.');
    }

    console.log('[research/create] 리서치 세션 생성 성공:', {
      sessionId: backendData.data?.session_id,
      productsCount: backendData.data?.products_count
    });

    // 프론트엔드 형식으로 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        session_id: backendData.data?.session_id,
        status: backendData.data?.status || 'created',
        products_count: backendData.data?.products_count || products.length,
        created_at: backendData.data?.created_at || new Date().toISOString(),
        title,
        description,
        type
      },
      message: '리서치 세션이 성공적으로 생성되었습니다.'
    });

  } catch (error) {
    console.error('[research/create] API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '리서치 세션 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * GET 방식 요청 처리 (세션 생성은 POST만 지원)
 */
export async function GET() {
  return NextResponse.json(
    { 
      success: false,
      error: '리서치 세션 생성은 POST 방식만 지원됩니다.',
      usage: 'POST /api/research/create with products data'
    },
    { status: 405 }
  );
}