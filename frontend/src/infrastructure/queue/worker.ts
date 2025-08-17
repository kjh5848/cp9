/**
 * 큐 워커 시스템
 * LangGraph 작업 큐 관리 및 처리
 */

// TODO: langgraph 타입 구현 필요
// import { QueueJob } from '@/features/langgraph/types';

// 임시 타입 정의
interface QueueJob {
  id: string;
  type: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority?: 'low' | 'normal' | 'high';
  retries?: number;
  maxRetries?: number;
  scheduledAt?: number;
  createdAt: Date;
  updatedAt?: Date;
  result?: any;
  error?: string;
}

/**
 * 큐 작업 상태
 */
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * 큐 작업 결과
 */
export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  retries: number;
}

/**
 * 큐 설정
 */
export interface QueueConfig {
  redisUrl: string;
  queueName: string;
  maxConcurrency: number;
  retryDelays: number[];
  jobTimeout: number;
  cleanupInterval: number;
}

/**
 * 큐 워커
 */
export class QueueWorker {
  private config: QueueConfig;
  private redis: any; // Redis 클라이언트
  private isRunning: boolean = false;
  private activeJobs: Map<string, Promise<void>> = new Map();

  constructor(config: QueueConfig) {
    this.config = config;
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
      this.redis = supabase.rpc('redis_connect');
    }
    
    return this.redis;
  }

  /**
   * 작업 추가
   */
  async addJob(job: Omit<QueueJob, 'id' | 'createdAt'>): Promise<string> {
    const redis = await this.getRedisClient();
    const jobId = this.generateJobId();
    
    const fullJob: QueueJob = {
      ...job,
      id: jobId,
      createdAt: new Date(),
    };

    const jobKey = `${this.config.queueName}:job:${jobId}`;
    const queueKey = `${this.config.queueName}:queue`;

    // 작업 저장
    await redis.setex(jobKey, this.config.jobTimeout, JSON.stringify(fullJob));
    
    // 큐에 추가 (우선순위 기반)
    const priority = this.getPriorityScore(job.priority || 'normal');
    await redis.zadd(queueKey, priority, jobId);

    return jobId;
  }

  /**
   * 작업 조회
   */
  async getJob(jobId: string): Promise<QueueJob | null> {
    const redis = await this.getRedisClient();
    const jobKey = `${this.config.queueName}:job:${jobId}`;
    
    const jobData = await redis.get(jobKey);
    return jobData ? JSON.parse(jobData) : null;
  }

  /**
   * 작업 상태 업데이트
   */
  async updateJobStatus(jobId: string, status: JobStatus, result?: JobResult): Promise<void> {
    const redis = await this.getRedisClient();
    const jobKey = `${this.config.queueName}:job:${jobId}`;
    const statusKey = `${this.config.queueName}:status:${jobId}`;
    
    const job = await this.getJob(jobId);
    if (!job) return;

    // 상태 업데이트
    const statusData = {
      status,
      updatedAt: Date.now(),
      result,
    };

    await redis.setex(statusKey, this.config.jobTimeout, JSON.stringify(statusData));

    // 실패한 작업 재시도
    if (status === 'failed' && (job.retries || 0) < (job.maxRetries || 3)) {
      await this.retryJob(jobId);
    }
  }

  /**
   * 작업 재시도
   */
  private async retryJob(jobId: string): Promise<void> {
    const redis = await this.getRedisClient();
    const job = await this.getJob(jobId);
    if (!job) return;

    const delay = this.config.retryDelays[job.retries || 0] || this.config.retryDelays[this.config.retryDelays.length - 1];
    const retryTime = Date.now() + delay;

    const retryJob: QueueJob = {
      ...job,
      retries: (job.retries || 0) + 1,
      scheduledAt: retryTime,
    };

    const retryKey = `${this.config.queueName}:retry:${jobId}`;
    const retryQueueKey = `${this.config.queueName}:retry_queue`;

    // 재시도 작업 저장
    await redis.setex(retryKey, delay + 60000, JSON.stringify(retryJob));
    await redis.zadd(retryQueueKey, retryTime, jobId);
  }

  /**
   * 큐에서 작업 가져오기
   */
  async getNextJob(): Promise<QueueJob | null> {
    const redis = await this.getRedisClient();
    const queueKey = `${this.config.queueName}:queue`;
    const retryQueueKey = `${this.config.queueName}:retry_queue`;

    // 재시도 큐에서 만료된 작업 확인
    const now = Date.now();
    const expiredRetries = await redis.zrangebyscore(retryQueueKey, 0, now);
    
    for (const jobId of expiredRetries) {
      const retryKey = `${this.config.queueName}:retry:${jobId}`;
      const retryJobData = await redis.get(retryKey);
      
      if (retryJobData) {
        const retryJob: QueueJob = JSON.parse(retryJobData);
        await redis.zrem(retryQueueKey, jobId);
        await redis.del(retryKey);
        await redis.zadd(queueKey, this.getPriorityScore(retryJob.priority || 'normal'), jobId);
      }
    }

    // 큐에서 가장 높은 우선순위 작업 가져오기
    const jobIds = await redis.zrevrange(queueKey, 0, 0);
    if (jobIds.length === 0) return null;

    const jobId = jobIds[0];
    const job = await this.getJob(jobId);
    
    if (job) {
      // 큐에서 제거
      await redis.zrem(queueKey, jobId);
      return job;
    }

    return null;
  }

  /**
   * 워커 시작
   */
  async start(processor: (job: QueueJob) => Promise<JobResult>): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('큐 워커 시작됨');

    while (this.isRunning) {
      try {
        // 동시 실행 작업 수 제한 확인
        if (this.activeJobs.size >= this.config.maxConcurrency) {
          await this.sleep(1000);
          continue;
        }

        const job = await this.getNextJob();
        if (!job) {
          await this.sleep(1000);
          continue;
        }

        // 작업 실행
        const jobPromise = this.executeJob(job, processor);
        this.activeJobs.set(job.id, jobPromise);

        // 작업 완료 후 정리
        jobPromise.finally(() => {
          this.activeJobs.delete(job.id);
        });

      } catch (error) {
        console.error('큐 워커 오류:', error);
        await this.sleep(5000);
      }
    }
  }

  /**
   * 워커 중지
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // 실행 중인 작업 완료 대기
    const activeJobPromises = Array.from(this.activeJobs.values());
    if (activeJobPromises.length > 0) {
      await Promise.allSettled(activeJobPromises);
    }
    
    console.log('큐 워커 중지됨');
  }

  /**
   * 작업 실행
   */
  private async executeJob(job: QueueJob, processor: (job: QueueJob) => Promise<JobResult>): Promise<void> {
    const startTime = Date.now();

    try {
      // 상태를 running으로 업데이트
      await this.updateJobStatus(job.id, 'running');

      // 작업 처리
      const result = await processor(job);
      const executionTime = Date.now() - startTime;

      // 결과 업데이트
      const finalResult: JobResult = {
        ...result,
        executionTime,
        retries: job.retries || 0,
      };

      await this.updateJobStatus(job.id, 'completed', finalResult);

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      const result: JobResult = {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        executionTime,
        retries: job.retries || 0,
      };

      await this.updateJobStatus(job.id, 'failed', result);
    }
  }

  /**
   * 큐 통계 조회
   */
  async getStats(): Promise<{
    pending: number;
    running: number;
    completed: number;
    failed: number;
    retry: number;
  }> {
    const redis = await this.getRedisClient();
    const queueKey = `${this.config.queueName}:queue`;
    const retryQueueKey = `${this.config.queueName}:retry_queue`;
    const statusPattern = `${this.config.queueName}:status:*`;

    const [pending, retry, statusKeys] = await Promise.all([
      redis.zcard(queueKey),
      redis.zcard(retryQueueKey),
      redis.keys(statusPattern),
    ]);

    const statuses = await Promise.all(
      statusKeys.map(async (key: string) => {
        const statusData = await redis.get(key);
        return statusData ? JSON.parse(statusData).status : null;
      })
    );

    const stats = {
      pending,
      running: statuses.filter(s => s === 'running').length,
      completed: statuses.filter(s => s === 'completed').length,
      failed: statuses.filter(s => s === 'failed').length,
      retry,
    };

    return stats;
  }

  /**
   * 큐 정리
   */
  async cleanup(): Promise<void> {
    const redis = await this.getRedisClient();
    const now = Date.now();
    const cutoff = now - (this.config.jobTimeout * 1000);

    // 만료된 상태 데이터 정리
    const statusPattern = `${this.config.queueName}:status:*`;
    const statusKeys = await redis.keys(statusPattern);

    for (const key of statusKeys) {
      const statusData = await redis.get(key);
      if (statusData) {
        const status = JSON.parse(statusData);
        if (status.updatedAt < cutoff) {
          await redis.del(key);
        }
      }
    }
  }

  /**
   * 우선순위 점수 계산
   */
  private getPriorityScore(priority: 'low' | 'normal' | 'high'): number {
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
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 지연 함수
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 큐 워커 인스턴스 생성
 */
export function createQueueWorker(config: QueueConfig): QueueWorker {
  return new QueueWorker(config);
} 