import { NextRequest, NextResponse } from 'next/server';
import { createLangGraphClient } from '@/infrastructure/api/langgraph';

/**
 * dynamicCrawler 노드 테스트 API 엔드포인트
 * infrastructure 레이어를 통해 도메인 로직에 접근
 * 
 * @param request - HTTP 요청 객체
 * @returns 크롤링 결과 응답
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { productIds } = body;

    // 입력 검증
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: '상품 ID 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    // 환경 변수 검증
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log(`[API] dynamicCrawler 테스트 시작: ${productIds.length}개 상품`);

    // infrastructure 레이어를 통해 도메인 로직 실행
    const langGraphClient = createLangGraphClient();
    const initialState = langGraphClient.createTestState(productIds);
    const result = await langGraphClient.executeDynamicCrawler(initialState);

    // 결과 검증
    if (!result.scrapedData?.productInfo) {
      return NextResponse.json(
        { error: '크롤링 결과를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    console.log(`[API] dynamicCrawler 테스트 완료: ${result.scrapedData.productInfo.length}개 상품 수집`);

    // 성공 응답
    return NextResponse.json({
      success: true,
      results: result.scrapedData.productInfo,
      metadata: {
        totalProducts: productIds.length,
        successfulCrawls: result.scrapedData.productInfo.length,
        failedCrawls: productIds.length - result.scrapedData.productInfo.length,
        executionTime: Date.now() - initialState.metadata.createdAt
      }
    });

  } catch (error) {
    console.error('[API] dynamicCrawler 테스트 오류:', error);

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