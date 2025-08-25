/**
 * LangGraph API 관련 타입 정의
 * AI 워크플로우, SEO 생성 등의 타입들
 */

/**
 * SEO 생성 요청 파라미터
 */
export interface SEOGenerationParams {
  products: Array<{
    name: string;
    price: number;
    category: string;
    url: string;
    image?: string;
  }>;
  type: 'product_review' | 'comparison' | 'guide' | 'listing';
  options?: {
    tone?: 'professional' | 'casual' | 'enthusiastic' | 'informative';
    length?: 'short' | 'medium' | 'long';
    includeImages?: boolean;
    includePricing?: boolean;
    includeComparison?: boolean;
    targetKeywords?: string[];
    customPrompt?: string;
  };
}

/**
 * SEO 생성 응답 타입
 */
export interface SEOGenerationResponse {
  success: boolean;
  data: {
    content: string;
    metadata: {
      title: string;
      description: string;
      keywords: string[];
      wordCount: number;
      readingTime: number;
      seoScore: number;
    };
    structure: {
      headings: Array<{
        level: number;
        text: string;
        anchor: string;
      }>;
      sections: Array<{
        title: string;
        content: string;
        type: 'intro' | 'product_review' | 'comparison' | 'conclusion' | 'faq';
      }>;
    };
    generationTime: number;
    model: string;
    version: string;
  };
  message?: string;
}

/**
 * 워크플로우 실행 파라미터
 */
export interface WorkflowParams {
  type: 'seo_generation' | 'content_creation' | 'research_analysis' | 'product_comparison';
  input: {
    products?: Array<{
      name: string;
      price: number;
      category: string;
      url: string;
      image?: string;
      description?: string;
    }>;
    keywords?: string[];
    targetAudience?: 'general' | 'technical' | 'beginner' | 'expert';
    contentType?: 'blog_post' | 'product_page' | 'comparison_table' | 'buying_guide';
    customInstructions?: string;
    query?: string; // Perplexity 쿼리용
    templateId?: string; // 템플릿 적용용
    variables?: Record<string, unknown>; // 템플릿 변수용
  };
  config?: {
    model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'claude-3-sonnet' | 'claude-3-haiku' | 'perplexity';
    temperature?: number;
    maxTokens?: number;
    streamOutput?: boolean;
    includeImages?: boolean;
    language?: 'ko' | 'en' | 'ja' | 'zh';
  };
}

/**
 * 워크플로우 실행 응답 타입
 */
export interface WorkflowResponse {
  success: boolean;
  data: {
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: {
      content: string;
      metadata: Record<string, unknown>;
      artifacts: Array<{
        type: 'text' | 'image' | 'table' | 'chart';
        content: string;
        metadata?: Record<string, unknown>;
      }>;
    };
    progress?: {
      currentStep: number;
      totalSteps: number;
      stepName: string;
      percentage: number;
    };
    executionTime?: number;
    startedAt: string;
    completedAt?: string;
  };
  message?: string;
}

/**
 * 스트리밍 워크플로우 청크 타입
 */
export interface WorkflowStreamChunk {
  type: 'progress' | 'content' | 'metadata' | 'complete' | 'error';
  data: {
    workflowId: string;
    content?: string;
    progress?: {
      step: number;
      totalSteps: number;
      stepName: string;
      percentage: number;
    };
    metadata?: Record<string, any>;
    error?: {
      code: string;
      message: string;
      details?: unknown;
    };
  };
  timestamp: string;
}

/**
 * Perplexity AI 쿼리 파라미터
 */
export interface PerplexityQueryParams {
  query: string;
  model?: 'llama-3.1-sonar-small-128k-online' | 'llama-3.1-sonar-large-128k-online' | 'llama-3.1-sonar-huge-128k-online';
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_citations?: boolean;
  search_recency_filter?: 'month' | 'week' | 'day' | 'hour';
}

/**
 * Perplexity AI 응답 타입
 */
export interface PerplexityResponse {
  success: boolean;
  data: {
    id: string;
    model: string;
    content: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    citations?: Array<{
      title: string;
      url: string;
      snippet: string;
      domain: string;
    }>;
    response_time: number;
  };
  message?: string;
}

/**
 * 콘텐츠 생성 템플릿 타입
 */
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'blog_post' | 'product_review' | 'comparison' | 'guide' | 'listing';
  template: {
    structure: Array<{
      section: string;
      prompt: string;
      required: boolean;
    }>;
    defaultParams: {
      tone: string;
      length: string;
      includeImages: boolean;
    };
    seoConfig: {
      titleTemplate: string;
      descriptionTemplate: string;
      keywordDensity: number;
    };
  };
  variables: Array<{
    name: string;
    type: 'text' | 'number' | 'boolean' | 'array' | 'object';
    required: boolean;
    description: string;
    defaultValue?: unknown;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * AI 모델 설정 타입
 */
export interface AIModelConfig {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-sonnet' | 'claude-3-haiku' | 'perplexity';
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  userPromptTemplate?: string;
}

/**
 * 워크플로우 상태 조회 응답
 */
export interface WorkflowStatusResponse {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    currentStep: number;
    totalSteps: number;
    stepName: string;
    percentage: number;
    estimatedTimeRemaining?: number;
  };
  result?: {
    content: string;
    metadata: Record<string, any>;
  };
  startedAt: string;
  completedAt?: string;
  executionTime?: number;
  error?: {
    code: string;
    message: string;
    step: number;
    details?: unknown;
  };
}

/**
 * 배치 워크플로우 실행 파라미터
 */
export interface BatchWorkflowParams {
  workflows: Array<{
    id: string;
    type: string;
    input: Record<string, unknown>;
    config?: Record<string, unknown>;
    priority?: number;
  }>;
  batchConfig?: {
    maxConcurrency?: number;
    retryPolicy?: {
      maxRetries: number;
      retryDelay: number;
    };
    timeoutMinutes?: number;
  };
}

/**
 * 배치 워크플로우 응답 타입
 */
export interface BatchWorkflowResponse {
  success: boolean;
  data: {
    batchId: string;
    totalWorkflows: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    results: Array<{
      workflowId: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      result?: unknown;
      error?: {
        code: string;
        message: string;
      };
      executionTime?: number;
    }>;
    executionSummary: {
      completed: number;
      failed: number;
      totalExecutionTime: number;
      averageExecutionTime: number;
    };
  };
  message?: string;
}

/**
 * SEO 최적화 스코어 타입
 */
export interface SEOScore {
  overall: number; // 0-100
  breakdown: {
    titleOptimization: number;
    metaDescription: number;
    headingStructure: number;
    keywordDensity: number;
    contentLength: number;
    readability: number;
    imageOptimization: number;
    internalLinking: number;
  };
  recommendations: Array<{
    category: string;
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/**
 * 콘텐츠 분석 결과 타입
 */
export interface ContentAnalysis {
  wordCount: number;
  readingTime: number; // 분
  sentenceCount: number;
  paragraphCount: number;
  averageSentenceLength: number;
  fleschScore: number; // 가독성 점수
  keywords: Array<{
    keyword: string;
    frequency: number;
    density: number; // 밀도 %
  }>;
  topics: Array<{
    topic: string;
    relevance: number;
    confidence: number;
  }>;
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    score: number; // -1 to 1
    confidence: number;
  };
}