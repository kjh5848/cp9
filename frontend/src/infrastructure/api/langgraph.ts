/**
 * LangGraph 클라이언트
 * 그래프 실행 및 체크포인트 관리
 */

import { LangGraphState, LangGraphNode, CheckpointSaver } from '@/features/langgraph/types';
import { LangGraphConfig, defaultLangGraphConfig } from '@/features/langgraph/utils/graph-config';
import { dynamicCrawlerNode } from '@/features/langgraph/nodes/dynamic-crawler';

/**
 * LangGraph 실행 결과
 */
export interface LangGraphResult {
  success: boolean;
  data?: LangGraphState;
  error?: string;
  executionTime: number;
  completedNodes: LangGraphNode[];
  checkpointId?: string;
}

/**
 * LangGraph 클라이언트
 */
export class LangGraphClient {
  private config: LangGraphConfig;
  private baseUrl: string;

  constructor(config: Partial<LangGraphConfig> = {}) {
    this.config = { ...defaultLangGraphConfig, ...config };
    this.baseUrl = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || '/api/langgraph';
  }

  /**
   * 그래프 실행
   */
  async executeGraph(
    initialState: Partial<LangGraphState>,
    threadId?: string
  ): Promise<LangGraphResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialState,
          threadId: threadId || this.generateThreadId(),
          config: this.config,
        }),
      });

      if (!response.ok) {
        throw new Error(`LangGraph API 오류: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result.state,
        executionTime,
        completedNodes: result.completedNodes,
        checkpointId: result.checkpointId,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        executionTime,
        completedNodes: [],
      };
    }
  }

  /**
   * 체크포인트에서 복구
   */
  async resumeFromCheckpoint(
    checkpointId: string,
    threadId?: string
  ): Promise<LangGraphResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkpointId,
          threadId,
          config: this.config,
        }),
      });

      if (!response.ok) {
        throw new Error(`LangGraph API 오류: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result.state,
        executionTime,
        completedNodes: result.completedNodes,
        checkpointId: result.checkpointId,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        executionTime,
        completedNodes: [],
      };
    }
  }

  /**
   * 특정 노드부터 실행
   */
  async executeFromNode(
    node: LangGraphNode,
    state: Partial<LangGraphState>,
    threadId?: string
  ): Promise<LangGraphResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/execute-from-node`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          node,
          state,
          threadId: threadId || this.generateThreadId(),
          config: this.config,
        }),
      });

      if (!response.ok) {
        throw new Error(`LangGraph API 오류: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result.state,
        executionTime,
        completedNodes: result.completedNodes,
        checkpointId: result.checkpointId,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        executionTime,
        completedNodes: [],
      };
    }
  }

  /**
   * 체크포인트 조회
   */
  async getCheckpoint(checkpointId: string): Promise<LangGraphState | null> {
    try {
      const response = await fetch(`${this.baseUrl}/checkpoint/${checkpointId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('체크포인트 조회 실패:', error);
      return null;
    }
  }

  /**
   * 체크포인트 삭제
   */
  async deleteCheckpoint(checkpointId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/checkpoint/${checkpointId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('체크포인트 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 스레드별 체크포인트 목록 조회
   */
  async listCheckpoints(threadId: string): Promise<Array<{
    id: string;
    timestamp: number;
    node: LangGraphNode;
    status: 'completed' | 'failed' | 'running';
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/checkpoints/${threadId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('체크포인트 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 그래프 상태 조회
   */
  async getGraphStatus(threadId: string): Promise<{
    status: 'running' | 'completed' | 'failed' | 'paused';
    currentNode?: LangGraphNode;
    completedNodes: LangGraphNode[];
    error?: string;
    progress: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${threadId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`LangGraph API 오류: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('그래프 상태 조회 실패:', error);
      return {
        status: 'failed',
        completedNodes: [],
        progress: 0,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 그래프 일시정지
   */
  async pauseGraph(threadId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/pause/${threadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('그래프 일시정지 실패:', error);
      return false;
    }
  }

  /**
   * 그래프 재개
   */
  async resumeGraph(threadId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/resume/${threadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('그래프 재개 실패:', error);
      return false;
    }
  }

  /**
   * 그래프 취소
   */
  async cancelGraph(threadId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cancel/${threadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('그래프 취소 실패:', error);
      return false;
    }
  }

  /**
   * 스레드 ID 생성
   */
  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<LangGraphConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 현재 설정 조회
   */
  getConfig(): LangGraphConfig {
    return { ...this.config };
  }

  /**
   * dynamicCrawler 노드를 실행하여 상품 정보를 크롤링한다.
   * 
   * @param state - LangGraph 상태 객체
   * @returns 업데이트된 상태 객체
   */
  async executeDynamicCrawler(state: LangGraphState): Promise<Partial<LangGraphState>> {
    try {
      console.log('[LangGraphClient] dynamicCrawler 노드 실행 시작');
      const result = await dynamicCrawlerNode(state);
      console.log('[LangGraphClient] dynamicCrawler 노드 실행 완료');
      return result;
    } catch (error) {
      console.error('[LangGraphClient] dynamicCrawler 노드 실행 실패:', error);
      throw new Error(`LangGraph 클라이언트 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 테스트용 초기 상태를 생성한다.
   * 
   * @param productIds - 상품 ID 배열
   * @param keyword - 키워드
   * @returns 초기 LangGraph 상태
   */
  createTestState(productIds: string[]): LangGraphState {
    return {
      input: {
        urls: [],
        productIds,
        keyword: ''
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
        currentNode: 'dynamicCrawler',
        completedNodes: ['extractIds', 'staticCrawler']
      }
    };
  }
}

/**
 * LangGraph 클라이언트 인스턴스 생성
 */
export function createLangGraphClient(config?: Partial<LangGraphConfig>): LangGraphClient {
  return new LangGraphClient(config);
} 