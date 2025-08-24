/**
 * LangGraph API 클라이언트
 * AI 워크플로우, SEO 생성, Perplexity 연동 등을 담당
 */

import { BaseApiClient } from '../core/BaseApiClient';
import { ApiConfig } from '../core/config';
import type {
  SEOGenerationParams,
  SEOGenerationResponse,
  WorkflowParams,
  WorkflowResponse,
  WorkflowStreamChunk,
  PerplexityQueryParams,
  PerplexityResponse,
  WorkflowStatusResponse,
  BatchWorkflowParams,
  BatchWorkflowResponse,
  ContentTemplate,
  AIModelConfig,
} from '../types/langgraph';

export class LangGraphApiClient extends BaseApiClient {
  constructor() {
    // Next.js API Routes 사용
    super('internal');
  }

  /**
   * SEO 최적화 글 생성
   */
  async generateSEO(params: SEOGenerationParams): Promise<SEOGenerationResponse> {
    console.log('[LangGraphApiClient] SEO 글 생성:', {
      productsCount: params.products.length,
      type: params.type,
      options: params.options
    });

    const response = await this.post<SEOGenerationResponse>(
      ApiConfig.ENDPOINTS.LANGGRAPH.SEO_GENERATION,
      {
        products: params.products,
        type: params.type,
        ...params.options,
      }
    );

    return response.data;
  }

  /**
   * 일반 워크플로우 실행
   */
  async runWorkflow(params: WorkflowParams): Promise<WorkflowResponse> {
    console.log('[LangGraphApiClient] 워크플로우 실행:', {
      type: params.type,
      inputKeys: Object.keys(params.input),
      config: params.config
    });

    const response = await this.post<WorkflowResponse>(
      ApiConfig.ENDPOINTS.LANGGRAPH.WORKFLOW,
      {
        type: params.type,
        input: params.input,
        config: params.config,
      }
    );

    return response.data;
  }

  /**
   * 스트리밍 워크플로우 실행
   */
  async runStreamingWorkflow(params: WorkflowParams): Promise<ReadableStream> {
    console.log('[LangGraphApiClient] 스트리밍 워크플로우 실행:', {
      type: params.type,
      inputKeys: Object.keys(params.input),
      streamOutput: params.config?.streamOutput
    });

    const requestOptions = {
      method: 'POST',
      headers: new Headers(this.defaultHeaders),
      body: JSON.stringify({
        type: params.type,
        input: params.input,
        config: {
          ...params.config,
          streamOutput: true,
        },
      }),
    };

    const response = await fetch(
      `${this.baseUrl}${ApiConfig.ENDPOINTS.LANGGRAPH.WORKFLOW_STREAM}`,
      requestOptions
    );

    return this.handleStreamResponse(response);
  }

  /**
   * 스트리밍 응답을 파싱하는 헬퍼 함수
   */
  async *parseStreamingResponse(stream: ReadableStream): AsyncGenerator<WorkflowStreamChunk> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6);
              if (jsonStr === '[DONE]') return;
              
              const data = JSON.parse(jsonStr) as WorkflowStreamChunk;
              yield data;
            } catch (error) {
              console.warn('[LangGraphApiClient] 스트림 파싱 오류:', error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Perplexity AI 쿼리
   */
  async queryPerplexity(params: PerplexityQueryParams): Promise<PerplexityResponse> {
    console.log('[LangGraphApiClient] Perplexity 쿼리:', {
      query: params.query.substring(0, 100) + '...',
      model: params.model,
      maxTokens: params.max_tokens
    });

    const response = await this.post<PerplexityResponse>(
      ApiConfig.ENDPOINTS.TEST.PERPLEXITY,
      {
        query: params.query,
        model: params.model || 'llama-3.1-sonar-small-128k-online',
        max_tokens: params.max_tokens || 1000,
        temperature: params.temperature || 0.7,
        top_p: params.top_p || 0.9,
        search_domain_filter: params.search_domain_filter,
        return_citations: params.return_citations ?? true,
        search_recency_filter: params.search_recency_filter,
      }
    );

    return response.data;
  }

  /**
   * 워크플로우 상태 조회
   */
  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatusResponse> {
    console.log('[LangGraphApiClient] 워크플로우 상태 조회:', { workflowId });

    const response = await this.get<WorkflowStatusResponse>(
      `${ApiConfig.ENDPOINTS.LANGGRAPH.WORKFLOW}?workflowId=${workflowId}`
    );

    return response.data;
  }

  /**
   * 배치 워크플로우 실행
   */
  async runBatchWorkflows(params: BatchWorkflowParams): Promise<BatchWorkflowResponse> {
    console.log('[LangGraphApiClient] 배치 워크플로우 실행:', {
      workflowCount: params.workflows.length,
      maxConcurrency: params.batchConfig?.maxConcurrency
    });

    const response = await this.post<BatchWorkflowResponse>(
      `${ApiConfig.ENDPOINTS.LANGGRAPH.WORKFLOW}/batch`,
      params
    );

    return response.data;
  }

  /**
   * SEO 최적화된 블로그 포스트 생성
   */
  async generateBlogPost(
    products: Array<{
      name: string;
      price: number;
      category: string;
      url: string;
      image?: string;
    }>,
    options?: {
      title?: string;
      tone?: 'professional' | 'casual' | 'enthusiastic';
      targetKeywords?: string[];
      includeComparison?: boolean;
    }
  ): Promise<SEOGenerationResponse> {
    return this.generateSEO({
      products,
      type: 'product_review',
      options: {
        tone: options?.tone || 'professional',
        length: 'long',
        includeImages: true,
        includePricing: true,
        includeComparison: options?.includeComparison ?? true,
        targetKeywords: options?.targetKeywords,
      },
    });
  }

  /**
   * 상품 비교 글 생성
   */
  async generateProductComparison(
    products: Array<{
      name: string;
      price: number;
      category: string;
      url: string;
      image?: string;
    }>,
    options?: {
      focusPoints?: string[];
      targetKeywords?: string[];
    }
  ): Promise<SEOGenerationResponse> {
    return this.generateSEO({
      products,
      type: 'comparison',
      options: {
        tone: 'informative',
        length: 'medium',
        includeImages: true,
        includePricing: true,
        includeComparison: true,
        targetKeywords: options?.targetKeywords,
        customPrompt: options?.focusPoints 
          ? `특히 다음 항목들을 중점적으로 비교해주세요: ${options.focusPoints.join(', ')}`
          : undefined,
      },
    });
  }

  /**
   * 구매 가이드 생성
   */
  async generateBuyingGuide(
    products: Array<{
      name: string;
      price: number;
      category: string;
      url: string;
      image?: string;
    }>,
    options?: {
      budgetRanges?: string[];
      buyingTips?: string[];
    }
  ): Promise<SEOGenerationResponse> {
    return this.generateSEO({
      products,
      type: 'guide',
      options: {
        tone: 'informative',
        length: 'long',
        includeImages: true,
        includePricing: true,
        includeComparison: false,
        customPrompt: [
          options?.budgetRanges ? `예산대별 추천: ${options.budgetRanges.join(', ')}` : '',
          options?.buyingTips ? `구매 팁: ${options.buyingTips.join(', ')}` : '',
        ].filter(Boolean).join('\n'),
      },
    });
  }

  /**
   * 키워드 기반 상품 리스팅 글 생성
   */
  async generateProductListing(
    products: Array<{
      name: string;
      price: number;
      category: string;
      url: string;
      image?: string;
    }>,
    keyword: string,
    options?: {
      listingCount?: number;
      includeRanking?: boolean;
    }
  ): Promise<SEOGenerationResponse> {
    return this.generateSEO({
      products: products.slice(0, options?.listingCount || 10),
      type: 'listing',
      options: {
        tone: 'professional',
        length: 'medium',
        includeImages: true,
        includePricing: true,
        includeComparison: false,
        targetKeywords: [keyword],
        customPrompt: options?.includeRanking 
          ? `상품들을 순위를 매겨서 소개해주세요. 키워드: ${keyword}`
          : `"${keyword}" 관련 추천 상품 목록을 작성해주세요.`,
      },
    });
  }

  /**
   * AI 모델별 성능 테스트
   */
  async testModelPerformance(
    testQuery: string,
    models: string[] = ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'perplexity']
  ): Promise<Array<{ model: string; response: unknown; executionTime: number }>> {
    console.log('[LangGraphApiClient] AI 모델 성능 테스트:', {
      query: testQuery.substring(0, 50) + '...',
      models
    });

    const testPromises = models.map(async (model) => {
      const startTime = Date.now();
      
      try {
        let response;
        if (model === 'perplexity') {
          response = await this.queryPerplexity({ query: testQuery });
        } else {
          response = await this.runWorkflow({
            type: 'content_creation',
            input: { query: testQuery },
            config: { model: model as 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'claude-3-sonnet' | 'claude-3-haiku' | 'perplexity' }
          });
        }
        
        const executionTime = Date.now() - startTime;
        return { model, response, executionTime };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        return { model, response: { error: error }, executionTime };
      }
    });

    return Promise.all(testPromises);
  }

  /**
   * 콘텐츠 템플릿 적용
   */
  async applyTemplate(
    templateId: string,
    variables: Record<string, unknown>,
    modelConfig?: AIModelConfig
  ): Promise<WorkflowResponse> {
    console.log('[LangGraphApiClient] 템플릿 적용:', {
      templateId,
      variableKeys: Object.keys(variables),
      model: modelConfig?.model
    });

    return this.runWorkflow({
      type: 'content_creation',
      input: {
        templateId,
        variables,
        customInstructions: modelConfig?.systemPrompt,
      },
      config: {
        model: modelConfig?.model || 'gpt-4',
        temperature: modelConfig?.temperature || 0.7,
        maxTokens: modelConfig?.maxTokens || 2000,
      },
    });
  }
}