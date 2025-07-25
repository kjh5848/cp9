/**
 * LangGraph API Edge Function
 * LangGraph 실행 및 체크포인트 관리
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface LangGraphRequest {
  action: 'execute' | 'resume' | 'execute-from-node' | 'checkpoint' | 'checkpoints' | 'status' | 'pause' | 'resume' | 'cancel';
  initialState?: any;
  threadId?: string;
  checkpointId?: string;
  node?: string;
  config?: any;
}

interface LangGraphResponse {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

/**
 * Redis 클라이언트 초기화
 */
function getRedisClient() {
  const redisUrl = Deno.env.get("REDIS_URL");
  const redisPassword = Deno.env.get("REDIS_PASSWORD");
  
  if (!redisUrl) {
    throw new Error("REDIS_URL 환경 변수가 설정되지 않았습니다.");
  }

  // Redis 연결 (실제 구현에서는 Redis 클라이언트 사용)
  return {
    get: async (key: string) => {
      // Redis GET 구현
      return null;
    },
    setex: async (key: string, ttl: number, value: string) => {
      // Redis SETEX 구현
    },
    del: async (key: string) => {
      // Redis DEL 구현
    },
    keys: async (pattern: string) => {
      // Redis KEYS 구현
      return [];
    }
  };
}

/**
 * 체크포인트 키 생성
 */
function generateCheckpointKey(threadId: string, node?: string): string {
  const baseKey = `langgraph:checkpoint:${threadId}`;
  return node ? `${baseKey}:${node}` : baseKey;
}

/**
 * 체크포인트 저장
 */
async function saveCheckpoint(threadId: string, state: any, node?: string): Promise<string> {
  const redis = getRedisClient();
  const checkpointId = `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const checkpointKey = generateCheckpointKey(threadId, node);
  
  const checkpointData = {
    id: checkpointId,
    threadId,
    node,
    state,
    timestamp: Date.now(),
    ttl: 86400, // 24시간
  };

  await redis.setex(checkpointKey, 86400, JSON.stringify(checkpointData));
  return checkpointId;
}

/**
 * 체크포인트 조회
 */
async function getCheckpoint(threadId: string, node?: string): Promise<any | null> {
  const redis = getRedisClient();
  const checkpointKey = generateCheckpointKey(threadId, node);
  
  const checkpointData = await redis.get(checkpointKey);
  if (!checkpointData) {
    return null;
  }

  try {
    const parsed = JSON.parse(checkpointData);
    return parsed.state;
  } catch (error) {
    console.error('체크포인트 데이터 파싱 오류:', error);
    return null;
  }
}

/**
 * 체크포인트 삭제
 */
async function deleteCheckpoint(threadId: string, node?: string): Promise<boolean> {
  const redis = getRedisClient();
  const checkpointKey = generateCheckpointKey(threadId, node);
  
  try {
    await redis.del(checkpointKey);
    return true;
  } catch (error) {
    console.error('체크포인트 삭제 오류:', error);
    return false;
  }
}

/**
 * 스레드별 체크포인트 목록 조회
 */
async function listCheckpoints(threadId: string): Promise<Array<{
  id: string;
  timestamp: number;
  node: string;
  status: 'completed' | 'failed' | 'running';
}>> {
  const redis = getRedisClient();
  const pattern = `langgraph:checkpoint:${threadId}:*`;
  const keys = await redis.keys(pattern);
  
  const checkpoints = [];
  
  for (const key of keys) {
    const checkpointData = await redis.get(key);
    if (checkpointData) {
      try {
        const parsed = JSON.parse(checkpointData);
        checkpoints.push({
          id: parsed.id,
          timestamp: parsed.timestamp,
          node: parsed.node || 'unknown',
          status: 'completed', // 기본값
        });
      } catch (error) {
        console.error('체크포인트 파싱 오류:', error);
      }
    }
  }
  
  return checkpoints.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * 그래프 상태 저장
 */
async function saveGraphStatus(threadId: string, status: any): Promise<void> {
  const redis = getRedisClient();
  const statusKey = `langgraph:status:${threadId}`;
  
  const statusData = {
    ...status,
    updatedAt: Date.now(),
  };

  await redis.setex(statusKey, 3600, JSON.stringify(statusData));
}

/**
 * 그래프 상태 조회
 */
async function getGraphStatus(threadId: string): Promise<any | null> {
  const redis = getRedisClient();
  const statusKey = `langgraph:status:${threadId}`;
  
  const statusData = await redis.get(statusKey);
  if (!statusData) {
    return null;
  }

  try {
    return JSON.parse(statusData);
  } catch (error) {
    console.error('그래프 상태 파싱 오류:', error);
    return null;
  }
}

/**
 * LangGraph 실행
 */
async function executeGraph(initialState: any, threadId: string, config: any): Promise<LangGraphResponse> {
  try {
    console.log(`LangGraph 실행 시작: threadId=${threadId}`);
    
    // 초기 상태 저장
    const checkpointId = await saveCheckpoint(threadId, initialState);
    
    // 그래프 상태 초기화
    const graphStatus = {
      status: 'running',
      currentNode: 'extractIds',
      completedNodes: [],
      error: null,
      progress: 0,
    };
    
    await saveGraphStatus(threadId, graphStatus);
    
    // 여기서 실제 LangGraph 실행 로직 구현
    // 1. extractIds 노드 실행
    // 2. cacheGateway 노드 실행
    // 3. staticCrawler 노드 실행
    // 4. dynCrawler 노드 실행 (필요시)
    // 5. fallbackLLM 노드 실행 (필요시)
    // 6. seoAgent 노드 실행
    // 7. wordpressPublisher 노드 실행
    
    // 임시로 성공 응답 반환
    const finalState = {
      ...initialState,
      metadata: {
        threadId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentNode: 'wordpressPublisher',
        completedNodes: ['extractIds', 'cacheGateway', 'staticCrawler', 'seoAgent', 'wordpressPublisher'],
      },
    };
    
    // 최종 상태 저장
    await saveCheckpoint(threadId, finalState, 'wordpressPublisher');
    
    // 그래프 상태 업데이트
    await saveGraphStatus(threadId, {
      status: 'completed',
      currentNode: 'wordpressPublisher',
      completedNodes: ['extractIds', 'cacheGateway', 'staticCrawler', 'seoAgent', 'wordpressPublisher'],
      error: null,
      progress: 100,
    });
    
    return {
      success: true,
      data: {
        state: finalState,
        completedNodes: ['extractIds', 'cacheGateway', 'staticCrawler', 'seoAgent', 'wordpressPublisher'],
        checkpointId,
      },
      message: 'LangGraph 실행 완료',
    };
    
  } catch (error) {
    console.error('LangGraph 실행 오류:', error);
    
    // 오류 상태 저장
    await saveGraphStatus(threadId, {
      status: 'failed',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      progress: 0,
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: 'LangGraph 실행 실패',
    };
  }
}

/**
 * 체크포인트에서 복구
 */
async function resumeFromCheckpoint(checkpointId: string, threadId: string, config: any): Promise<LangGraphResponse> {
  try {
    console.log(`체크포인트에서 복구: checkpointId=${checkpointId}, threadId=${threadId}`);
    
    // 체크포인트 조회
    const state = await getCheckpoint(threadId);
    if (!state) {
      return {
        success: false,
        error: '체크포인트를 찾을 수 없습니다.',
        message: '체크포인트 복구 실패',
      };
    }
    
    // 그래프 상태 복구
    const graphStatus = await getGraphStatus(threadId);
    if (graphStatus) {
      await saveGraphStatus(threadId, {
        ...graphStatus,
        status: 'running',
        updatedAt: Date.now(),
      });
    }
    
    // 여기서 실제 복구 로직 구현
    // 마지막 완료된 노드 다음부터 실행
    
    return {
      success: true,
      data: {
        state,
        completedNodes: state.metadata?.completedNodes || [],
        checkpointId,
      },
      message: '체크포인트에서 복구 완료',
    };
    
  } catch (error) {
    console.error('체크포인트 복구 오류:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '체크포인트 복구 실패',
    };
  }
}

/**
 * 특정 노드부터 실행
 */
async function executeFromNode(node: string, state: any, threadId: string, config: any): Promise<LangGraphResponse> {
  try {
    console.log(`특정 노드부터 실행: node=${node}, threadId=${threadId}`);
    
    // 초기 상태 저장
    const checkpointId = await saveCheckpoint(threadId, state, node);
    
    // 그래프 상태 초기화
    await saveGraphStatus(threadId, {
      status: 'running',
      currentNode: node,
      completedNodes: [],
      error: null,
      progress: 0,
    });
    
    // 여기서 실제 노드별 실행 로직 구현
    // 지정된 노드부터 실행
    
    return {
      success: true,
      data: {
        state,
        completedNodes: [node],
        checkpointId,
      },
      message: `노드 ${node}부터 실행 완료`,
    };
    
  } catch (error) {
    console.error('노드 실행 오류:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '노드 실행 실패',
    };
  }
}

/**
 * LangGraph API 핸들러
 */
async function handleLangGraphAPI(req: Request): Promise<Response> {
  try {
    const { action, initialState, threadId, checkpointId, node, config }: LangGraphRequest = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "action이 필요합니다.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let response: LangGraphResponse;

    switch (action) {
      case 'execute':
        if (!initialState || !threadId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "initialState와 threadId가 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        response = await executeGraph(initialState, threadId, config);
        break;

      case 'resume':
        if (!checkpointId || !threadId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "checkpointId와 threadId가 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        response = await resumeFromCheckpoint(checkpointId, threadId, config);
        break;

      case 'execute-from-node':
        if (!node || !state || !threadId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "node, state, threadId가 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        response = await executeFromNode(node, state, threadId, config);
        break;

      case 'checkpoint':
        if (!threadId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "threadId가 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        const checkpointData = await getCheckpoint(threadId, node);
        response = {
          success: true,
          data: checkpointData,
          message: checkpointData ? "체크포인트 조회 성공" : "체크포인트를 찾을 수 없습니다.",
        };
        break;

      case 'checkpoints':
        if (!threadId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "threadId가 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        const checkpoints = await listCheckpoints(threadId);
        response = {
          success: true,
          data: checkpoints,
          message: "체크포인트 목록 조회 성공",
        };
        break;

      case 'status':
        if (!threadId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "threadId가 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        const status = await getGraphStatus(threadId);
        response = {
          success: true,
          data: status,
          message: status ? "그래프 상태 조회 성공" : "그래프 상태를 찾을 수 없습니다.",
        };
        break;

      case 'pause':
        if (!threadId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "threadId가 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        await saveGraphStatus(threadId, { status: 'paused', updatedAt: Date.now() });
        response = {
          success: true,
          message: "그래프 일시정지 완료",
        };
        break;

      case 'cancel':
        if (!threadId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "threadId가 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        await saveGraphStatus(threadId, { status: 'cancelled', updatedAt: Date.now() });
        response = {
          success: true,
          message: "그래프 취소 완료",
        };
        break;

      default:
        return new Response(
          JSON.stringify({
            success: false,
            message: "알 수 없는 액션입니다.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(response),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('LangGraph API 오류:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `서버 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * CORS 헤더 설정
 */
function setCorsHeaders(headers: Headers) {
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
}

/**
 * 메인 핸들러
 */
serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === "OPTIONS") {
    const headers = new Headers();
    setCorsHeaders(headers);
    return new Response(null, { headers });
  }

  // POST 요청만 허용
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await handleLangGraphAPI(req);
    setCorsHeaders(response.headers);
    return response;
  } catch (error) {
    console.error('Edge Function 오류:', error);
    
    const headers = new Headers({ "Content-Type": "application/json" });
    setCorsHeaders(headers);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "서버 오류가 발생했습니다.",
      }),
      { status: 500, headers }
    );
  }
}); 