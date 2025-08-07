import { NextRequest, NextResponse } from 'next/server';
import { aiProductResearchNode } from '@/features/langgraph/nodes/ai-product-research';

/**
 * AI Product Research 노드 실제 API 테스트
 * 
 * @param request - HTTP 요청 객체
 * @returns 테스트 결과
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, keyword } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: '상품 ID 배열이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('[ai-product-research-test] 테스트 시작:', { productIds, keyword });

    // 테스트용 상태 객체 생성
    const testState = {
      input: {
        urls: [],
        productIds,
        keyword: keyword || '테스트 상품'
      },
      scrapedData: {
        productInfo: [],
        enrichedData: []
      },
      seoContent: {
        title: '',
        content: '',
        keywords: [],
        summary: ''
      },
      wordpressPost: {
        status: 'draft'
      },
      metadata: {
        threadId: `test-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentNode: 'aiProductResearch',
        completedNodes: ['extractIds']
      }
    };

    // 실제 aiProductResearch 노드 실행
    const result = await aiProductResearchNode(testState);

    console.log('[ai-product-research-test] 테스트 완료:', {
      inputProductIds: productIds.length,
      outputEnrichedData: result.scrapedData?.enrichedData?.length || 0,
      hasError: !result.scrapedData?.enrichedData
    });

    return NextResponse.json({
      success: true,
      input: { productIds, keyword },
      output: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ai-product-research-test] 오류:', error);
    
    return NextResponse.json(
      { 
        error: 'AI Product Research 테스트 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET 요청으로 간단한 테스트 실행
 */
export async function GET() {
  try {
    const testProductIds = ['123456', '789012'];
    const testKeyword = '무선 이어폰';

    console.log('[ai-product-research-test] GET 테스트 시작');

    const testState = {
      input: {
        urls: [],
        productIds: testProductIds,
        keyword: testKeyword
      },
      scrapedData: {
        productInfo: [],
        enrichedData: []
      },
      seoContent: {
        title: '',
        content: '',
        keywords: [],
        summary: ''
      },
      wordpressPost: {
        status: 'draft'
      },
      metadata: {
        threadId: `get-test-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentNode: 'aiProductResearch',
        completedNodes: ['extractIds']
      }
    };

    const result = await aiProductResearchNode(testState);

    return NextResponse.json({
      success: true,
      test: {
        productIds: testProductIds,
        keyword: testKeyword
      },
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ai-product-research-test] GET 오류:', error);
    
    return NextResponse.json(
      { 
        error: 'GET 테스트 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
