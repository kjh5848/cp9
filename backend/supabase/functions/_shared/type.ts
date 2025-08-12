
// API 응답 타입
export type ApiSuccess<T> = {
  success: true;
  data: T;
}

export type ApiError = {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// 상품 데이터 타입
export type CandidateItem = {
  id: string;
  url: string;
  title: string;
  priceKRW?: number | null;
  isRocket?: boolean;
  image?: string | null;
  categoryPath?: string[];
}

// 리서치 데이터 타입
export type ResearchPack = {
  itemId: string;
  title?: string;
  priceKRW?: number | null;
  isRocket?: boolean | null;
  features?: string[];
  pros?: string[];
  cons?: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
};

// SEO 초안 타입
export type SeoDraft = {
  itemId: string;
  meta: {
    title: string;
    description: string;
    slug: string;
    tags?: string[];
  };
  markdown: string; // 본문 내용
};

// 큐 작업 타입
export type QueueJob = {
  id: string;
  type: 'scrape' | 'seo' | 'publish';
  data: unknown;
  priority: 'low' | 'normal' | 'high';
  retries: number;
  maxRetries: number;
  createdAt: number;
  scheduledAt?: number;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
}

// 작업 결과 타입
export type JobResult = {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime: number;
  retries: number;
}

// LangGraph 관련 타입
export type CheckpointData = {
  id: string;
  threadId: string;
  node?: string;
  state: unknown;
  timestamp: number;
  ttl: number;
}

export type GraphStatus = {
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  currentNode?: string;
  completedNodes?: string[];
  error?: string | null;
  progress?: number;
  updatedAt: number;
}