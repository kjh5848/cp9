// @ts-ignore: Deno 모듈 import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createRedisClient, generateCacheKey, generateJobId } from "../_shared/redis.ts";
import { createEdgeFunctionHandler, safeJsonParse } from "../_shared/server.ts";
import { ok, fail } from "../_shared/response.ts";

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

// Redis 클라이언트는 공통 모듈에서 import

/**
 * 큐에 작업 추가
 */
async function addToQueue(productIds: string[], threadId: string): Promise<string> {
  const queueName = Deno.env.get("LANGGRAPH_QUEUE_NAME") || "langgraph-queue";
  const redis = createRedisClient();
  
  const jobId = generateJobId();
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
 * 캐시에서 데이터 조회
 */
async function getFromCache(productId: string): Promise<any | null> {
  const redis = createRedisClient();
  const cacheKey = generateCacheKey("product", productId);
  
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
  const redis = createRedisClient();
  const cacheKey = generateCacheKey("product", productId);
  
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
}

/**
 * 메인 핸들러
 */
serve(createEdgeFunctionHandler(handleCacheGateway));