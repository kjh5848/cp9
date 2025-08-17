/**
 * Redis 캐싱 시스템
 * Supabase Edge Functions에서 사용
 */

import { CacheConfig } from '@/shared/types/enrichment';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  setex(key: string, ttl: number, value: string): Promise<void>;
  del(key: string, ...moreKeys: string[]): Promise<void>;
  exists(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  expire(key: string, seconds: number): Promise<boolean>;
  info(section?: string): Promise<string>;
}

/**
 * Redis 클라이언트 (Supabase Edge Functions용)
 */
export class RedisCache {
  private config: CacheConfig;
  private redis: RedisClient | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 86400, // 24시간
      prefix: 'enrichment:',
      ...config,
    };
  }

  /**
   * Redis 클라이언트 초기화
   */
  private async getRedisClient() {
    if (!this.redis) {
      // Supabase Edge Functions에서 Redis 사용
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Redis 연결 (Supabase의 Redis 확장 사용)
      // TODO: 실제 Redis 클라이언트 구현 필요
      this.redis = {
        get: async (key: string) => null,
        set: async (key: string, value: string, ttl?: number) => {},
        setex: async (key: string, ttl: number, value: string) => {},
        del: async (key: string, ...moreKeys: string[]) => {},
        exists: async (key: string) => false,
        keys: async (pattern: string) => [],
        expire: async (key: string, seconds: number) => false,
        info: async (section?: string) => 'Redis info not available',
      } as RedisClient;
    }
    
    return this.redis;
  }

  /**
   * 캐시 키 생성
   */
  private generateKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  /**
   * 데이터 저장
   */
  async set(key: string, data: any, ttl?: number): Promise<void> {
    try {
      const redis = await this.getRedisClient();
      const cacheKey = this.generateKey(key);
      const cacheData = JSON.stringify({
        data,
        timestamp: Date.now(),
      });

      if (redis) {
        await redis.setex(cacheKey, ttl || this.config.ttl, cacheData);
      }
    } catch (error) {
      console.error('Redis 저장 실패:', error);
      // 캐시 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  /**
   * 데이터 조회
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await this.getRedisClient();
      const cacheKey = this.generateKey(key);
      
      const cachedData = redis ? await redis.get(cacheKey) : null;
      
      if (!cachedData) {
        return null;
      }

      const parsed = JSON.parse(cachedData);
      return parsed.data as T;
    } catch (error) {
      console.error('Redis 조회 실패:', error);
      return null;
    }
  }

  /**
   * 데이터 삭제
   */
  async delete(key: string): Promise<void> {
    try {
      const redis = await this.getRedisClient();
      const cacheKey = this.generateKey(key);
      
      if (redis) {
        await redis.del(cacheKey);
      }
    } catch (error) {
      console.error('Redis 삭제 실패:', error);
    }
  }

  /**
   * 캐시 존재 여부 확인
   */
  async exists(key: string): Promise<boolean> {
    try {
      const redis = await this.getRedisClient();
      const cacheKey = this.generateKey(key);
      
      const result = redis ? await redis.exists(cacheKey) : false;
      return result;
    } catch (error) {
      console.error('Redis 존재 확인 실패:', error);
      return false;
    }
  }

  /**
   * 캐시 만료 시간 설정
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      const redis = await this.getRedisClient();
      const cacheKey = this.generateKey(key);
      
      if (redis) {
        await redis.expire(cacheKey, ttl);
      }
    } catch (error) {
      console.error('Redis 만료 시간 설정 실패:', error);
    }
  }

  /**
   * 패턴으로 키 검색
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const redis = await this.getRedisClient();
      const searchPattern = this.generateKey(pattern);
      
      const keys = redis ? await redis.keys(searchPattern) : [];
      return keys.map((key: string) => key.replace(this.config.prefix, ''));
    } catch (error) {
      console.error('Redis 키 검색 실패:', error);
      return [];
    }
  }

  /**
   * 캐시 통계 정보
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    try {
      const redis = await this.getRedisClient();
      
      const info = redis ? await redis.info('memory') : 'N/A';
      const keys = await this.keys('*');
      
      return {
        totalKeys: keys.length,
        memoryUsage: info || 'N/A',
        hitRate: 0, // 실제 구현에서는 hit/miss 카운터 필요
      };
    } catch (error) {
      console.error('Redis 통계 조회 실패:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'N/A',
        hitRate: 0,
      };
    }
  }

  /**
   * 캐시 전체 삭제 (개발용)
   */
  async clear(): Promise<void> {
    try {
      const redis = await this.getRedisClient();
      const keys = await this.keys('*');
      
      if (keys.length > 0) {
        const cacheKeys = keys.map(key => this.generateKey(key));
        if (redis) {
          for (const key of cacheKeys) {
            await redis.del(key);
          }
        }
      }
    } catch (error) {
      console.error('Redis 전체 삭제 실패:', error);
    }
  }
}

/**
 * 메모리 기반 폴백 캐시 (Redis 사용 불가능한 경우)
 */
export class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 3600, // 1시간 (메모리는 짧게)
      prefix: 'memory:',
      ...config,
    };

    // 주기적으로 만료된 항목 정리
    setInterval(() => this.cleanup(), 60000); // 1분마다
  }

  /**
   * 데이터 저장
   */
  async set(key: string, data: any, ttl?: number): Promise<void> {
    const cacheKey = this.generateKey(key);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
    });
  }

  /**
   * 데이터 조회
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.generateKey(key);
    const item = this.cache.get(cacheKey);
    
    if (!item) {
      return null;
    }

    // 만료 확인
    if (Date.now() - item.timestamp > item.ttl * 1000) {
      this.cache.delete(cacheKey);
      return null;
    }

    return item.data as T;
  }

  /**
   * 데이터 삭제
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.generateKey(key);
    this.cache.delete(cacheKey);
  }

  /**
   * 캐시 존재 여부 확인
   */
  async exists(key: string): Promise<boolean> {
    const cacheKey = this.generateKey(key);
    return this.cache.has(cacheKey);
  }

  /**
   * 만료된 항목 정리
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 캐시 키 생성
   */
  private generateKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }
}

/**
 * 기본 캐시 인스턴스 (Redis 우선, 폴백으로 메모리)
 */
export const cache = process.env.NODE_ENV === 'production' 
  ? new RedisCache()
  : new MemoryCache(); 