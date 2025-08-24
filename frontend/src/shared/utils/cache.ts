/**
 * 클라이언트 사이드 캐시 유틸리티
 * 리서치 데이터 캐싱을 위한 간단한 Map 기반 캐시 매니저
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  /**
   * 캐시에 데이터 저장
   */
  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void { // 기본 5분
    // 캐시 크기 제한 (LRU 방식)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    console.log(`[Cache] 데이터 저장: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * 캐시에서 데이터 조회
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`[Cache] 캐시 미스: ${key}`);
      return null;
    }

    // TTL 확인
    if (Date.now() - entry.timestamp > entry.ttl) {
      console.log(`[Cache] 만료된 캐시 제거: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache] 캐시 힛: ${key}`);
    return entry.data as T;
  }

  /**
   * 특정 키의 캐시 삭제
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      console.log(`[Cache] 캐시 삭제: ${key}`);
    }
    return result;
  }

  /**
   * 패턴에 매칭되는 모든 키의 캐시 삭제
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Cache] 패턴 ${pattern}에 매칭되는 ${deletedCount}개 캐시 삭제`);
    }
    return deletedCount;
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[Cache] 전체 캐시 삭제 (${size}개)`);
  }

  /**
   * 만료된 캐시 항목들 정리
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[Cache] 만료된 ${cleanedCount}개 캐시 정리 완료`);
    }
    return cleanedCount;
  }

  /**
   * 캐시 상태 정보 조회
   */
  getStats(): {
    size: number;
    maxSize: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * 캐시 키 존재 여부 확인 (만료 고려)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // TTL 확인
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// 전역 캐시 인스턴스
export const researchCache = new CacheManager(100); // 최대 100개 캐시

// 주기적 캐시 정리 (10분마다)
if (typeof window !== 'undefined') {
  setInterval(() => {
    researchCache.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * 캐시 키 생성 헬퍼
 */
export const CacheKeys = {
  research: (sessionId: string, ids?: string[]) => 
    `research:${sessionId}:${ids ? ids.sort().join(',') : 'all'}`,
  
  session: (sessionId: string) => 
    `session:${sessionId}`,
    
  sessions: (page = 1, limit = 10) => 
    `sessions:${page}:${limit}`,
    
  jobStatus: (jobId: string) => 
    `job_status:${jobId}`
};

/**
 * 캐시된 함수 호출 헬퍼
 */
export async function cachedCall<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 5 * 60 * 1000
): Promise<T> {
  // 캐시에서 확인
  const cached = researchCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // 캐시 미스 시 새로 요청
  try {
    const data = await fetcher();
    researchCache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error(`[Cache] API 호출 실패 (${key}):`, error);
    throw error;
  }
}

export default researchCache;