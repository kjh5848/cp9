/**
 * LangGraph API Edge Function
 * LangGraph 실행 및 체크포인트 관리
 */

// @ts-ignore: Deno 모듈 import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Supabase 모듈 import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
interface LangGraphRequest {
  action: 'execute' | 'resume' | 'execute-from-node' | 'checkpoint' | 'checkpoints' | 'status' | 'pause' | 'resume' | 'cancel' | 'seo_generation';
  initialState?: unknown;
  threadId?: string;
  checkpointId?: string;
  node?: string;
  config?: unknown;
  state?: unknown;
  query?: string;
  products?: Array<{
    name: string;
    price: number;
    category: string;
    url: string;
    image?: string;
  }>;
  type?: string;
  seo_type?: 'product_review' | 'comparison' | 'guide';
}

interface LangGraphResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message: string;
}

/**
 * Redis 클라이언트 초기화
 */
function getRedisClient() {
  // @ts-ignore: Deno 환경 변수
  const redisUrl = Deno.env.get("REDIS_URL");
  // @ts-ignore: Deno 환경 변수
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
async function saveCheckpoint(threadId: string, state: unknown, node?: string): Promise<string> {
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
async function getCheckpoint(threadId: string, node?: string): Promise<unknown | null> {
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
  
  const checkpoints: Array<{
    id: string;
    timestamp: number;
    node: string;
    status: 'completed' | 'failed' | 'running';
  }> = [];
  
  for (const key of keys) {
    const checkpointData = await redis.get(key);
    if (checkpointData) {
      try {
        const parsed = JSON.parse(checkpointData) as {
          id: string;
          timestamp: number;
          node?: string;
        };
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
async function saveGraphStatus(threadId: string, status: unknown): Promise<void> {
  const redis = getRedisClient();
  const statusKey = `langgraph:status:${threadId}`;
  
  const statusData = {
    ...(status as Record<string, unknown>),
    updatedAt: Date.now(),
  };

  await redis.setex(statusKey, 3600, JSON.stringify(statusData));
}

/**
 * 그래프 상태 조회
 */
async function getGraphStatus(threadId: string): Promise<unknown | null> {
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
async function executeGraph(initialState: unknown, threadId: string, config: unknown): Promise<LangGraphResponse> {
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
      ...(initialState as Record<string, unknown>),
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
async function resumeFromCheckpoint(checkpointId: string, threadId: string, config: unknown): Promise<LangGraphResponse> {
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
        completedNodes: (state as { metadata?: { completedNodes?: string[] } })?.metadata?.completedNodes || [],
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
async function executeFromNode(node: string, state: unknown, threadId: string, config: unknown): Promise<LangGraphResponse> {
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
 * SEO 글 생성
 */
async function generateSeoContent(query: string, products: Array<{
  name: string;
  price: number;
  category: string;
  url: string;
  image?: string;
}>, seoType: 'product_review' | 'comparison' | 'guide'): Promise<LangGraphResponse> {
  try {
    console.log(`SEO 글 생성 시작: type=${seoType}, products=${products.length}개`);
    
    // OpenAI API 키 확인
    // @ts-ignore: Deno 환경 변수
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");
    }

    // 상품 정보 요약
    const productSummary = products.map((product, index) => 
      `${index + 1}. ${product.name} (${product.price.toLocaleString()}원, ${product.category})`
    ).join('\n');

    // SEO 타입별 프롬프트 생성
    const seoPrompts = {
      product_review: `다음 상품들에 대한 상세한 리뷰와 구매 가이드를 작성해주세요. SEO 최적화를 고려하여 키워드를 자연스럽게 포함하고, 구매 결정에 도움이 되는 정보를 제공해주세요.

상품 정보:
${productSummary}

요청: ${query}

다음 형식으로 작성해주세요:
1. 상품 개요 및 특징
2. 각 상품별 상세 분석
3. 장단점 비교
4. 구매 추천 및 팁
5. 결론`,
      
      comparison: `다음 상품들을 비교 분석하여 구매 가이드를 작성해주세요. 각 상품의 특징, 가격 대비 성능, 사용자 만족도 등을 종합적으로 분석해주세요.

상품 정보:
${productSummary}

요청: ${query}

다음 형식으로 작성해주세요:
1. 비교 분석 개요
2. 상품별 특징 분석
3. 가격 대비 성능 비교
4. 사용 시나리오별 추천
5. 최종 구매 추천`,
      
      guide: `다음 상품들에 대한 구매 가이드를 작성해주세요. 초보자도 이해할 수 있도록 상세하고 실용적인 정보를 제공해주세요.

상품 정보:
${productSummary}

요청: ${query}

다음 형식으로 작성해주세요:
1. 구매 가이드 개요
2. 상품 선택 기준
3. 구매 시 주의사항
4. 사용법 및 관리법
5. 구매 후 활용 팁`
    };

    const prompt = seoPrompts[seoType];

    // OpenAI API 호출
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 전문적인 상품 리뷰어이자 SEO 전문가입니다. 한국어로 자연스럽고 유용한 상품 분석 글을 작성해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API 오류: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices[0]?.message?.content || '';

    // SEO 최적화된 결과 생성
    const seoResult = {
      content: generatedContent,
      metadata: {
        type: seoType,
        products: products,
        generatedAt: new Date().toISOString(),
        wordCount: generatedContent.length,
        keywords: products.map(p => p.name).concat(products.map(p => p.category)).filter((v, i, a) => a.indexOf(v) === i)
      }
    };

    return {
      success: true,
      data: seoResult,
      message: 'SEO 글 생성 완료',
    };

  } catch (error) {
    console.error('SEO 글 생성 오류:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: 'SEO 글 생성 실패',
    };
  }
}

/**
 * LangGraph API 핸들러
 */
async function handleLangGraphAPI(req: Request): Promise<Response> {
  try {
    const { action, initialState, threadId, checkpointId, node, config, query, products, seo_type, state }: LangGraphRequest = await req.json();

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

      case 'seo_generation':
        if (!query || !products || !seo_type) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "query, products, seo_type이 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        response = await generateSeoContent(query, products, seo_type);
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