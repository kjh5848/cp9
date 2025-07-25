/**
 * Queue Worker Edge Function
 * LangGraph 작업 큐 처리 및 실행
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface QueueJob {
  id: string;
  type: 'scrape' | 'seo' | 'publish';
  data: any;
  priority: 'low' | 'normal' | 'high';
  retries: number;
  maxRetries: number;
  createdAt: number;
  scheduledAt?: number;
}

interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  retries: number;
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
    zadd: async (key: string, score: number, member: string) => {
      // Redis ZADD 구현
    },
    zrem: async (key: string, member: string) => {
      // Redis ZREM 구현
    },
    zrevrange: async (key: string, start: number, stop: number) => {
      // Redis ZREVRANGE 구현
      return [];
    },
    zrangebyscore: async (key: string, min: number, max: number) => {
      // Redis ZRANGEBYSCORE 구현
      return [];
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
 * 큐에서 작업 가져오기
 */
async function getNextJob(): Promise<QueueJob | null> {
  const queueName = Deno.env.get("LANGGRAPH_QUEUE_NAME") || "langgraph-queue";
  const redis = getRedisClient();
  
  const queueKey = `${queueName}:queue`;
  const retryQueueKey = `${queueName}:retry_queue`;

  // 재시도 큐에서 만료된 작업 확인
  const now = Date.now();
  const expiredRetries = await redis.zrangebyscore(retryQueueKey, 0, now);
  
  for (const jobId of expiredRetries) {
    const retryKey = `${queueName}:retry:${jobId}`;
    const retryJobData = await redis.get(retryKey);
    
    if (retryJobData) {
      const retryJob: QueueJob = JSON.parse(retryJobData);
      await redis.zrem(retryQueueKey, jobId);
      await redis.del(retryKey);
      await redis.zadd(queueKey, getPriorityScore(retryJob.priority), jobId);
    }
  }

  // 큐에서 가장 높은 우선순위 작업 가져오기
  const jobIds = await redis.zrevrange(queueKey, 0, 0);
  if (jobIds.length === 0) return null;

  const jobId = jobIds[0];
  const jobKey = `${queueName}:job:${jobId}`;
  const jobData = await redis.get(jobKey);
  
  if (jobData) {
    // 큐에서 제거
    await redis.zrem(queueKey, jobId);
    return JSON.parse(jobData);
  }

  return null;
}

/**
 * 작업 상태 업데이트
 */
async function updateJobStatus(jobId: string, status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled', result?: JobResult): Promise<void> {
  const queueName = Deno.env.get("LANGGRAPH_QUEUE_NAME") || "langgraph-queue";
  const redis = getRedisClient();
  
  const jobKey = `${queueName}:job:${jobId}`;
  const statusKey = `${queueName}:status:${jobId}`;
  
  const jobData = await redis.get(jobKey);
  if (!jobData) return;

  const job: QueueJob = JSON.parse(jobData);

  // 상태 업데이트
  const statusData = {
    status,
    updatedAt: Date.now(),
    result,
  };

  await redis.setex(statusKey, 3600, JSON.stringify(statusData));

  // 실패한 작업 재시도
  if (status === 'failed' && job.retries < job.maxRetries) {
    await retryJob(jobId);
  }
}

/**
 * 작업 재시도
 */
async function retryJob(jobId: string): Promise<void> {
  const queueName = Deno.env.get("LANGGRAPH_QUEUE_NAME") || "langgraph-queue";
  const redis = getRedisClient();
  
  const jobKey = `${queueName}:job:${jobId}`;
  const jobData = await redis.get(jobKey);
  if (!jobData) return;

  const job: QueueJob = JSON.parse(jobData);
  const retryDelays = [1000, 5000, 15000]; // 1초, 5초, 15초
  const delay = retryDelays[job.retries] || retryDelays[retryDelays.length - 1];
  const retryTime = Date.now() + delay;

  const retryJob: QueueJob = {
    ...job,
    retries: job.retries + 1,
    scheduledAt: retryTime,
  };

  const retryKey = `${queueName}:retry:${jobId}`;
  const retryQueueKey = `${queueName}:retry_queue`;

  // 재시도 작업 저장
  await redis.setex(retryKey, delay + 60000, JSON.stringify(retryJob));
  await redis.zadd(retryQueueKey, retryTime, jobId);
}

/**
 * 우선순위 점수 계산
 */
function getPriorityScore(priority: 'low' | 'normal' | 'high'): number {
  switch (priority) {
    case 'high': return 3;
    case 'normal': return 2;
    case 'low': return 1;
    default: return 2;
  }
}

/**
 * 스크래핑 작업 처리
 */
async function processScrapeJob(job: QueueJob): Promise<JobResult> {
  const startTime = Date.now();
  
  try {
    const { productIds, threadId } = job.data;
    
    // 여기서 실제 스크래핑 로직 구현
    // 1. staticCrawler 시도
    // 2. 실패 시 dynCrawler 시도
    // 3. 실패 시 fallbackLLM 시도
    
    console.log(`스크래핑 작업 시작: ${productIds.length}개 상품, threadId: ${threadId}`);
    
    // 임시로 성공 응답 반환
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      data: { scrapedProducts: productIds.length },
      executionTime,
      retries: job.retries,
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      executionTime,
      retries: job.retries,
    };
  }
}

/**
 * SEO 작업 처리
 */
async function processSEOJob(job: QueueJob): Promise<JobResult> {
  const startTime = Date.now();
  
  try {
    const { productInfo, threadId } = job.data;
    
    // 여기서 실제 SEO 콘텐츠 생성 로직 구현
    // 1. Perplexity API 호출
    // 2. SEO 최적화 콘텐츠 생성
    // 3. PASONA 구조 적용
    
    console.log(`SEO 작업 시작: ${productInfo.length}개 상품, threadId: ${threadId}`);
    
    // 임시로 성공 응답 반환
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      data: { seoContent: '생성된 SEO 콘텐츠' },
      executionTime,
      retries: job.retries,
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      executionTime,
      retries: job.retries,
    };
  }
}

/**
 * 발행 작업 처리
 */
async function processPublishJob(job: QueueJob): Promise<JobResult> {
  const startTime = Date.now();
  
  try {
    const { seoContent, threadId } = job.data;
    
    // 여기서 실제 WordPress 발행 로직 구현
    // 1. 중복 체크
    // 2. WordPress API 호출
    // 3. 포스트 생성/수정
    
    console.log(`발행 작업 시작: threadId: ${threadId}`);
    
    // 임시로 성공 응답 반환
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      data: { postId: 'wordpress_post_id', postUrl: 'https://example.com/post' },
      executionTime,
      retries: job.retries,
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      executionTime,
      retries: job.retries,
    };
  }
}

/**
 * 작업 실행
 */
async function executeJob(job: QueueJob): Promise<void> {
  const startTime = Date.now();

  try {
    // 상태를 running으로 업데이트
    await updateJobStatus(job.id, 'running');

    // 작업 타입에 따른 처리
    let result: JobResult;
    
    switch (job.type) {
      case 'scrape':
        result = await processScrapeJob(job);
        break;
      case 'seo':
        result = await processSEOJob(job);
        break;
      case 'publish':
        result = await processPublishJob(job);
        break;
      default:
        throw new Error(`알 수 없는 작업 타입: ${job.type}`);
    }

    const executionTime = Date.now() - startTime;

    // 결과 업데이트
    const finalResult: JobResult = {
      ...result,
      executionTime,
      retries: job.retries,
    };

    await updateJobStatus(job.id, 'completed', finalResult);

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    const result: JobResult = {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      executionTime,
      retries: job.retries,
    };

    await updateJobStatus(job.id, 'failed', result);
  }
}

/**
 * 큐 워커 핸들러
 */
async function handleQueueWorker(req: Request): Promise<Response> {
  try {
    const { action, jobId } = await req.json();

    switch (action) {
      case 'process':
        // 다음 작업 처리
        const job = await getNextJob();
        if (!job) {
          return new Response(
            JSON.stringify({
              success: true,
              message: "처리할 작업이 없습니다.",
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        // 작업 실행
        await executeJob(job);

        return new Response(
          JSON.stringify({
            success: true,
            message: `작업 처리 완료: ${job.id}`,
            jobId: job.id,
          }),
          { headers: { "Content-Type": "application/json" } }
        );

      case 'status':
        // 작업 상태 조회
        if (!jobId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "jobId가 필요합니다.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const queueName = Deno.env.get("LANGGRAPH_QUEUE_NAME") || "langgraph-queue";
        const redis = getRedisClient();
        const statusKey = `${queueName}:status:${jobId}`;
        const statusData = await redis.get(statusKey);

        if (!statusData) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "작업을 찾을 수 없습니다.",
            }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: JSON.parse(statusData),
          }),
          { headers: { "Content-Type": "application/json" } }
        );

      default:
        return new Response(
          JSON.stringify({
            success: false,
            message: "알 수 없는 액션입니다.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error('Queue Worker 오류:', error);
    
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
    const response = await handleQueueWorker(req);
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