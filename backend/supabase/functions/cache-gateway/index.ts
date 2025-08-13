// @ts-ignore: Deno 모듈 import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
<<<<<<< HEAD
// @ts-ignore: Supabase 모듈 import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
=======

import { createRedisClient, generateCacheKey, generateJobId } from "../_shared/redis.ts";
import { createEdgeFunctionHandler, safeJsonParse } from "../_shared/server.ts";
import { ok, fail } from "../_shared/response.ts";
>>>>>>> f18ff8d74d034f2f67395e7ef7f802d65ecf7746

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

<<<<<<< HEAD
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
=======
// Redis 클라이언트는 공통 모듈에서 import
>>>>>>> f18ff8d74d034f2f67395e7ef7f802d65ecf7746

/**
 * 큐에 작업 추가
 */
async function addToQueue(productIds: string[], threadId: string): Promise<string> {
<<<<<<< HEAD
  // @ts-ignore: Deno 환경 변수
  const queueName = Deno.env.get("LANGGRAPH_QUEUE_NAME") || "langgraph-queue";
  const redis = getRedisClient();
  
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
=======
  const queueName = Deno.env.get("LANGGRAPH_QUEUE_NAME") || "langgraph-queue";
  const redis = createRedisClient();
  
  const jobId = generateJobId();
>>>>>>> f18ff8d74d034f2f67395e7ef7f802d65ecf7746
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
<<<<<<< HEAD
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
=======
 * 캐시에서 데이터 조회
 */
async function getFromCache(productId: string): Promise<any | null> {
  const redis = createRedisClient();
  const cacheKey = generateCacheKey("product", productId);
>>>>>>> f18ff8d74d034f2f67395e7ef7f802d65ecf7746
  
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
<<<<<<< HEAD
  const redis = getRedisClient();
  const cacheKey = generateCacheKey(productId);
=======
  const redis = createRedisClient();
  const cacheKey = generateCacheKey("product", productId);
>>>>>>> f18ff8d74d034f2f67395e7ef7f802d65ecf7746
  
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
<<<<<<< HEAD
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
=======
  const body = await safeJsonParse<CacheGatewayRequest>(req);
  
  if (!body) {
    return fail("요청 데이터를 파싱할 수 없습니다.", "INVALID_JSON", 400);
  }

  const { productIds, threadId, forceRefresh = false } = body;

  if (!productIds || productIds.length === 0) {
    return fail("productIds가 필요합니다.", "VALIDATION_ERROR", 400);
  }

  if (!threadId) {
    return fail("threadId가 필요합니다.", "VALIDATION_ERROR", 400);
  }

  const redis = createRedisClient();
>>>>>>> f18ff8d74d034f2f67395e7ef7f802d65ecf7746
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

<<<<<<< HEAD
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
=======
  // 모든 데이터가 캐시에 있는 경우
  if (missingIds.length === 0) {
    return ok({
      cachedData: cachedResults,
      message: "모든 데이터가 캐시에서 조회되었습니다.",
    });
  }

  // 캐시되지 않은 데이터가 있는 경우 큐에 작업 추가
  const jobId = await addToQueue(missingIds, threadId);

  return ok({
    cachedData: cachedResults.length > 0 ? cachedResults : undefined,
    jobId,
    message: `캐시 미스: ${missingIds.length}개 상품이 큐에 추가되었습니다.`,
  });
>>>>>>> f18ff8d74d034f2f67395e7ef7f802d65ecf7746
}

/**
 * 메인 핸들러
 */
<<<<<<< HEAD
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
=======
serve(createEdgeFunctionHandler(handleCacheGateway));
>>>>>>> f18ff8d74d034f2f67395e7ef7f802d65ecf7746
