'use server';

import { StateGraph, END } from '@langchain/langgraph';
import { LangGraphState, LangGraphNode } from '../types';

/**
 * URL에서 쿠팡 상품 ID를 추출하는 노드
 * 
 * @param state - LangGraph 상태 객체
 * @returns 업데이트된 상태 객체
 */
export async function extractIdsNode(state: LangGraphState): Promise<Partial<LangGraphState>> {
  try {
    const { urls } = state.input;
    const productIds: string[] = [];

    // URL에서 상품 ID 추출
    for (const url of urls) {
      const productId = extractProductIdFromUrl(url);
      if (productId) {
        productIds.push(productId);
      }
    }

    console.log(`[extractIds] 추출된 상품 ID: ${productIds.length}개`, productIds);

    return {
      input: {
        ...state.input,
        productIds
      },
      metadata: {
        ...state.metadata,
        currentNode: 'extractIds',
        completedNodes: [...state.metadata.completedNodes, 'extractIds'],
        updatedAt: Date.now()
      }
    };
  } catch (error) {
    console.error('[extractIds] 오류:', error);
    throw new Error(`상품 ID 추출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 쿠팡 URL에서 상품 ID를 추출하는 유틸리티 함수
 * 
 * @param url - 쿠팡 상품 URL
 * @returns 상품 ID 또는 null
 */
export function extractProductIdFromUrl(url: string): string | null {
  try {
    // 쿠팡 URL 패턴들
    const patterns = [
      /\/vp\/products\/(\d+)/,           // /vp/products/123456
      /pageKey=(\d+)/,                   // pageKey=123456
      /products\/(\d+)/,                 // /products/123456
      /itemId=(\d+)/                     // itemId=123456
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('[extractProductIdFromUrl] 오류:', error);
    return null;
  }
}

/**
 * extractIds 노드의 조건부 실행 함수
 * 
 * @param state - LangGraph 상태 객체
 * @returns 다음 노드 이름
 */
export function extractIdsCondition(state: LangGraphState): LangGraphNode | typeof END {
  const { productIds } = state.input;
  
  // 상품 ID가 추출되었으면 다음 노드로 진행
  if (productIds && productIds.length > 0) {
    return 'cacheGateway';
  }
  
  // 상품 ID가 없으면 종료
  console.log('[extractIds] 상품 ID가 추출되지 않아 종료');
  return END;
}

/**
 * extractIds 노드 테스트 함수
 */
export async function testExtractIdsNode() {
  const testUrls = [
    'https://www.coupang.com/vp/products/123456?itemId=789012',
    'https://link.coupang.com/re/AFFSDP?pageKey=456789&itemId=123456',
    'https://www.coupang.com/products/987654'
  ];

  const initialState: LangGraphState = {
    input: {
      urls: testUrls,
      productIds: [],
      keyword: '테스트'
    },
    scrapedData: { productInfo: [], enrichedData: [] },
    seoContent: { title: '', content: '', keywords: [], summary: '' },
    wordpressPost: { status: 'draft' },
    metadata: {
      threadId: 'test-thread-123',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentNode: 'extractIds',
      completedNodes: []
    }
  };

  try {
    const result = await extractIdsNode(initialState);
    console.log('테스트 결과:', result);
    return result;
  } catch (error) {
    console.error('테스트 실패:', error);
    throw error;
  }
} 