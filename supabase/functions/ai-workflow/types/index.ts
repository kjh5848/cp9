/**
 * AI 워크플로우 타입 정의 모듈
 * @module Types
 */

/**
 * AI 워크플로우 요청 인터페이스
 */
export interface AIWorkflowRequest {
  action: 'execute' | 'test' | 'status';
  urls?: string[];
  productIds?: string[];
  keyword?: string;
  threadId?: string;
  config?: {
    enablePerplexity?: boolean;
    enableWordPress?: boolean;
    maxProducts?: number;
  };
}

/**
 * 상품 정보 인터페이스
 */
export type ProductInfo = {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryName: string;
  rating: number;
  reviewCount: number;
  description: string;
  specifications: Record<string, string>;
  enrichedFeatures: string[];
  enrichedBenefits: string[];
  enrichedTargetAudience: string;
  enrichedComparison: string;
  enrichedRecommendations: string[];
}

/**
 * AI 조사 결과 인터페이스
 */
export type AIResearchResult = {
  enrichedData: ProductInfo[];
  researchSummary: {
    totalProducts: number;
    keyword: string;
    avgPrice: number;
    avgRating: number;
    rocketDeliveryRate: number;
    researchMethod: string;
  };
}

/**
 * SEO 콘텐츠 인터페이스
 */
export interface SEOContent {
  title: string;
  content: string;
  keywords: string[];
  summary: string;
}

/**
 * WordPress 발행 결과 인터페이스
 */
export interface WordPressResult {
  postId: string;
  postUrl: string;
  status: string;
}

/**
 * AI 워크플로우 응답 인터페이스
 */
export interface AIWorkflowResponse {
  success: boolean;
  data?: {
    threadId: string;
    workflow: {
      coupangProductSearch?: {
        keyword: string;
        totalFound: number;
        selectedProducts: any[];
        selectionMethod: string;
      };
      extractIds: {
        productIds: string[];
        urls: string[];
      };
      aiProductResearch: AIResearchResult;
      seoAgent: SEOContent;
      wordpressPublisher: WordPressResult;
    };
    metadata: {
      createdAt: number;
      updatedAt: number;
      currentNode: string;
      completedNodes: string[];
      executionTime: number;
      workflow?: {
        type: string;
        inputType: string;
        productSelectionMethod: string;
      };
    };
  };
  error?: string;
  message: string;
}