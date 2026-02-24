/**
 * Redis 클라이언트 공통 인터페이스
 * 모든 Edge Functions에서 공유하는 Redis 연결 및 작업 관리
 */

// Deno 환경 타입 선언
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

export interface RedisClient {
  get(key: string): Promise<string | null>;
  setex(key: string, ttl: number, value: string): Promise<void>;
  exists(key: string): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<void>;
  zrem(key: string, member: string): Promise<void>;
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
  zrangebyscore(key: string, min: number, max: number): Promise<string[]>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

/**
 * Redis 클라이언트 팩토리
 * @returns Redis 클라이언트 인스턴스
 */
export function createRedisClient(): RedisClient {
  const redisUrl = Deno.env.get("REDIS_URL");
  const redisPassword = Deno.env.get("REDIS_PASSWORD");
  
  if (!redisUrl) {
    throw new Error("REDIS_URL 환경 변수가 설정되지 않았습니다.");
  }

  // Redis 연결 (실제 구현에서는 Redis 클라이언트 라이브러리 사용)
  // 현재는 스텁 구현으로 향후 실제 Redis 클라이언트로 대체 예정
  return {
    async get(key: string): Promise<string | null> {
      // TODO: Redis GET 구현
      console.log(`Redis GET: ${key}`);
      return null;
    },

    async setex(key: string, ttl: number, value: string): Promise<void> {
      // TODO: Redis SETEX 구현
      console.log(`Redis SETEX: ${key} = ${value} (TTL: ${ttl}s)`);
    },

    async exists(key: string): Promise<number> {
      // TODO: Redis EXISTS 구현
      console.log(`Redis EXISTS: ${key}`);
      return 0;
    },

    async zadd(key: string, score: number, member: string): Promise<void> {
      // TODO: Redis ZADD 구현
      console.log(`Redis ZADD: ${key} ${score} ${member}`);
    },

    async zrem(key: string, member: string): Promise<void> {
      // TODO: Redis ZREM 구현
      console.log(`Redis ZREM: ${key} ${member}`);
    },

    async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
      // TODO: Redis ZREVRANGE 구현
      console.log(`Redis ZREVRANGE: ${key} ${start} ${stop}`);
      return [];
    },

    async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
      // TODO: Redis ZRANGEBYSCORE 구현
      console.log(`Redis ZRANGEBYSCORE: ${key} ${min} ${max}`);
      return [];
    },

    async del(key: string): Promise<void> {
      // TODO: Redis DEL 구현
      console.log(`Redis DEL: ${key}`);
    },

    async keys(pattern: string): Promise<string[]> {
      // TODO: Redis KEYS 구현
      console.log(`Redis KEYS: ${pattern}`);
      return [];
    }
  };
}

/**
 * 큐 관련 유틸리티 함수들
 */
export const QUEUE_DEFAULTS = {
  NAME: "langgraph-queue",
  TTL: 3600, // 1시간
  RETRY_DELAYS: [1000, 5000, 15000], // 1초, 5초, 15초
  MAX_RETRIES: 3
} as const;

/**
 * 우선순위 점수 계산
 */
export function getPriorityScore(priority: 'low' | 'normal' | 'high'): number {
  switch (priority) {
    case 'high': return 3;
    case 'normal': return 2;
    case 'low': return 1;
    default: return 2;
  }
}

/**
 * 작업 ID 생성
 */
export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 캐시 키 생성 유틸리티
 */
export function generateCacheKey(namespace: string, id: string): string {
  return `langgraph:${namespace}:${id}`;
}