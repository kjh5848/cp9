/**
 * Cache Gateway Edge Function
 * Redis 캐시 검사 및 큐 작업 등록
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CacheGatewayRequest {
  productIds: string[];
  threadId: string;
  forceRefresh?: boolean;
}

interface CacheGatewayResponse {
  success: boolean;
  cachedData?: any;
  jobId?: string;
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
  // 여기서는 Supabase의 Redis 확장을 사용한다고 가정
  return {
    get: async (key: string) => {
      // Redis GET 구현
      return null;
    },
    setex: async (key: string, ttl: number, value: string) => {
      // Redis SETEX 구현
    },
    exists: async (key: string) => {
      // Redis EXISTS 구현
      return 0;
    }
  };
}

/**
 * 큐에 작업 추가
 */
async function addToQueue(productIds: string[], threadId: string): Promise<string> {
  const queueName = Deno.env.get("LANGGRAPH_QUEUE_NAME") || "langgraph-queue";
  const redis = getRedisClient();
  
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const job = {
    id: jobId,
    type: 'scrape',
    data: { productIds, threadId },
    priority: 'normal',
    retries: 0,
    maxRetries: 3,
    createdAt: Date.now(),
  };

  const jobKey = `${queueName}:job:${jobId}`;
  const queueKey = `${queueName}:queue`;

  // 작업 저장
  await redis.setex(jobKey, 3600, JSON.stringify(job));
  
  // 큐에 추가 (우선순위 기반)
  // await redis.zadd(queueKey, 2, jobId); // normal priority

  return jobId;
}

/**
 * 캐시 키 생성
 */
function generateCacheKey(productId: string): string {
  return `langgraph:product:${productId}`;
}

/**
 * 캐시에서 데이터 조회
 */
async function getFromCache(productId: string): Promise<any | null> {
  const redis = getRedisClient();
  const cacheKey = generateCacheKey(productId);
  
  const cachedData = await redis.get(cacheKey);
  if (!cachedData) {
    return null;
  }

  try {
    const parsed = JSON.parse(cachedData);
    return parsed.data;
  } catch (error) {
    console.error('캐시 데이터 파싱 오류:', error);
    return null;
  }
}

/**
 * 캐시에 데이터 저장
 */
async function saveToCache(productId: string, data: any, ttl: number = 86400): Promise<void> {
  const redis = getRedisClient();
  const cacheKey = generateCacheKey(productId);
  
  const cacheData = JSON.stringify({
    data,
    timestamp: Date.now(),
    ttl,
  });

  await redis.setex(cacheKey, ttl, cacheData);
}

/**
 * Cache Gateway 핸들러
 */
async function handleCacheGateway(req: Request): Promise<Response> {
  try {
    const { productIds, threadId, forceRefresh = false }: CacheGatewayRequest = await req.json();

    if (!productIds || productIds.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "productIds가 필요합니다.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!threadId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "threadId가 필요합니다.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const redis = getRedisClient();
    const cachedResults: any[] = [];
    const missingIds: string[] = [];

    // 각 productId에 대해 캐시 확인
    for (const productId of productIds) {
      if (forceRefresh) {
        missingIds.push(productId);
        continue;
      }

      const cachedData = await getFromCache(productId);
      if (cachedData) {
        cachedResults.push(cachedData);
      } else {
        missingIds.push(productId);
      }
    }

    // 모든 데이터가 캐시에 있는 경우
    if (missingIds.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          cachedData: cachedResults,
          message: "모든 데이터가 캐시에서 조회되었습니다.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 캐시되지 않은 데이터가 있는 경우 큐에 작업 추가
    const jobId = await addToQueue(missingIds, threadId);

    const response: CacheGatewayResponse = {
      success: true,
      cachedData: cachedResults.length > 0 ? cachedResults : undefined,
      jobId,
      message: `캐시 미스: ${missingIds.length}개 상품이 큐에 추가되었습니다.`,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Cache Gateway 오류:', error);
    
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
    const response = await handleCacheGateway(req);
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