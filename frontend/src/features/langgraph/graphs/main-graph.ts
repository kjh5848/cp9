'use server';

// import { StateGraph, END } from '@langchain/langgraph';
import { LangGraphState, LangGraphNode } from '../types';

// 노드들 import
import { extractIdsNode, extractIdsCondition } from '../nodes/extract-ids';
import { staticCrawlerNode, staticCrawlerCondition } from '../nodes/static-crawler';
import { dynamicCrawlerNode, dynamicCrawlerCondition } from '../nodes/dynamic-crawler';
import { fallbackLLMNode, fallbackLLMCondition } from '../nodes/fallback-llm';
import { seoAgentNode, seoAgentCondition } from '../nodes/seo-agent';
import { wordpressPublisherNode, wordpressPublisherCondition } from '../nodes/wordpress-publisher';

/**
 * LangGraph 메인 그래프 생성
 * 전체 자동화 플로우를 정의하는 그래프
 * 
 * @returns StateGraph 인스턴스
 */
export function createMainGraph(): any {
  // TODO: LangGraph JS API 호환성 문제 해결 후 구현
  console.log('[createMainGraph] LangGraph JS API 호환성 문제로 인해 임시 구현');
  
  return {
    // 임시 그래프 객체
    nodes: ['extractIds', 'staticCrawler', 'dynCrawler', 'fallbackLLM', 'seoAgent', 'wordpressPublisher'],
    execute: async (state: LangGraphState) => {
      // 순차적으로 노드 실행
      const result1 = await extractIdsNode(state);
      const result2 = await staticCrawlerNode(result1 as LangGraphState);
      const result3 = await seoAgentNode(result2 as LangGraphState);
      const result4 = await wordpressPublisherNode(result3 as LangGraphState);
      return result4;
    }
  };
}

/**
 * 그래프 실행 함수
 * 
 * @param initialState - 초기 상태
 * @returns 실행 결과
 */
export async function executeMainGraph(initialState: LangGraphState): Promise<LangGraphState> {
  try {
    console.log('[executeMainGraph] 메인 그래프 실행 시작');
    
    const graph = createMainGraph();
    const result = await graph.execute(initialState);
    
    console.log('[executeMainGraph] 메인 그래프 실행 완료');
    return result as LangGraphState;
  } catch (error) {
    console.error('[executeMainGraph] 그래프 실행 실패:', error);
    throw error;
  }
}

/**
 * 그래프 실행 (체크포인트 지원)
 * 
 * @param initialState - 초기 상태
 * @param checkpointId - 체크포인트 ID (선택사항)
 * @returns 실행 결과
 */
export async function executeMainGraphWithCheckpoint(
  initialState: LangGraphState,
  checkpointId?: string
): Promise<LangGraphState> {
  try {
    console.log('[executeMainGraphWithCheckpoint] 체크포인트 지원 그래프 실행 시작');
    
    const graph = createMainGraph();
    
    // 체크포인트 설정 (Redis 사용)
    if (checkpointId) {
      // TODO: Redis 체크포인트 설정
      console.log(`[executeMainGraphWithCheckpoint] 체크포인트 ${checkpointId} 사용`);
    }
    
    const app = graph.compile();
    
    // 그래프 실행
    const result = await app.invoke(initialState);
    
    console.log('[executeMainGraphWithCheckpoint] 체크포인트 지원 그래프 실행 완료');
    return result;
  } catch (error) {
    console.error('[executeMainGraphWithCheckpoint] 그래프 실행 실패:', error);
    throw error;
  }
}

/**
 * 특정 노드부터 실행하는 함수
 * 
 * @param startNode - 시작 노드
 * @param state - 상태
 * @returns 실행 결과
 */
export async function executeFromNode(
  startNode: LangGraphNode,
  state: LangGraphState
): Promise<LangGraphState> {
  try {
    console.log(`[executeFromNode] 노드 ${startNode}부터 실행 시작`);
    
    const graph = createMainGraph();
    const app = graph.compile();
    
    // 특정 노드부터 실행
    const result = await app.invoke(state, { configurable: { thread_id: state.metadata.threadId } });
    
    console.log(`[executeFromNode] 노드 ${startNode}부터 실행 완료`);
    return result;
  } catch (error) {
    console.error(`[executeFromNode] 노드 ${startNode}부터 실행 실패:`, error);
    throw error;
  }
}

/**
 * 그래프 상태 모니터링 함수
 * 
 * @param threadId - 스레드 ID
 * @returns 현재 상태
 */
export async function getGraphStatus(threadId: string): Promise<{
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentNode: string;
  completedNodes: string[];
  progress: number;
}> {
  try {
    // TODO: Redis에서 스레드 상태 조회
    console.log(`[getGraphStatus] 스레드 ${threadId} 상태 조회`);
    
    // 임시 구현
    return {
      status: 'running',
      currentNode: 'extractIds',
      completedNodes: [],
      progress: 0
    };
  } catch (error) {
    console.error('[getGraphStatus] 상태 조회 실패:', error);
    throw error;
  }
}

/**
 * 그래프 일시정지 함수
 * 
 * @param threadId - 스레드 ID
 * @returns 일시정지 성공 여부
 */
export async function pauseGraph(threadId: string): Promise<boolean> {
  try {
    // TODO: Redis에서 스레드 일시정지
    console.log(`[pauseGraph] 스레드 ${threadId} 일시정지`);
    return true;
  } catch (error) {
    console.error('[pauseGraph] 일시정지 실패:', error);
    return false;
  }
}

/**
 * 그래프 재개 함수
 * 
 * @param threadId - 스레드 ID
 * @returns 재개 성공 여부
 */
export async function resumeGraph(threadId: string): Promise<boolean> {
  try {
    // TODO: Redis에서 스레드 재개
    console.log(`[resumeGraph] 스레드 ${threadId} 재개`);
    return true;
  } catch (error) {
    console.error('[resumeGraph] 재개 실패:', error);
    return false;
  }
}

/**
 * 그래프 취소 함수
 * 
 * @param threadId - 스레드 ID
 * @returns 취소 성공 여부
 */
export async function cancelGraph(threadId: string): Promise<boolean> {
  try {
    // TODO: Redis에서 스레드 취소
    console.log(`[cancelGraph] 스레드 ${threadId} 취소`);
    return true;
  } catch (error) {
    console.error('[cancelGraph] 취소 실패:', error);
    return false;
  }
}

/**
 * 메인 그래프 테스트 함수
 */
export async function testMainGraph(): Promise<LangGraphState> {
  const initialState: LangGraphState = {
    input: {
      urls: [
        'https://www.coupang.com/vp/products/123456?itemId=789012',
        'https://link.coupang.com/re/AFFSDP?pageKey=456789&itemId=123456'
      ],
      productIds: [],
      keyword: '노트북'
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
      threadId: 'test-thread-' + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentNode: 'extractIds',
      completedNodes: []
    }
  };

  try {
    console.log('[testMainGraph] 메인 그래프 테스트 시작');
    const result = await executeMainGraph(initialState);
    console.log('[testMainGraph] 메인 그래프 테스트 완료:', result);
    return result;
  } catch (error) {
    console.error('[testMainGraph] 메인 그래프 테스트 실패:', error);
    throw error;
  }
}

/**
 * 그래프 플로우 다이어그램 생성
 */
export function generateFlowDiagram(): string {
  return `
graph TD
    A[딥링크 입력] --> B[extractIds]
    B --> C{상품 ID 추출 성공?}
    C -->|Yes| D[staticCrawler]
    C -->|No| END
    D --> E{정적 크롤링 성공?}
    E -->|Yes| F[seoAgent]
    E -->|No| G[dynCrawler]
    G --> H{동적 크롤링 성공?}
    H -->|Yes| F
    H -->|No| I[fallbackLLM]
    I --> J{LLM 보강 성공?}
    J -->|Yes| F
    J -->|No| END
    F --> K{SEO 콘텐츠 생성 성공?}
    K -->|Yes| L[wordpressPublisher]
    K -->|No| END
    L --> M{포스트 발행 성공?}
    M -->|Yes| END
    M -->|No| END
  `;
}

/**
 * 그래프 설정 검증 함수
 */
export function validateGraphConfig(): boolean {
  const requiredEnvVars = [
    'PERPLEXITY_API_KEY',
    'WORDPRESS_API_URL',
    'WORDPRESS_USERNAME',
    'WORDPRESS_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('[validateGraphConfig] 누락된 환경변수:', missingVars);
    return false;
  }

  console.log('[validateGraphConfig] 그래프 설정 검증 완료');
  return true;
} 