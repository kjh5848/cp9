/**
 * SEO 파이프라인 공통 타입 정의
 * route.ts에서 사용하던 인터페이스와 파이프라인 전체에서 공유하는 컨텍스트 타입을 포함합니다.
 */

// Langfuse 타입 (선택적 트레이싱)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LangfuseTrace = any;

/** API 요청 본문 타입 */
export interface ItemResearchRequest {
  itemName: string
  projectId: string
  itemId: string
  productData?: {
    productName: string
    productPrice: number
    productImage: string
    productUrl: string
    categoryName: string
    isRocket: boolean
    isFreeShipping: boolean
  }
  /** 비교/큐레이션용 다중 아이템 데이터 */
  items?: {
    productName: string
    productPrice: number
    productImage: string
    productUrl: string
    categoryName: string
    isRocket: boolean
    isFreeShipping: boolean
    productId: string
  }[]
  seoConfig?: {
    persona: string
    toneAndManner?: string
    textModel?: string
    imageModel?: string
    actionType?: 'NOW' | 'SCHEDULE'
    scheduledAt?: string
    charLimit?: number
    articleType?: 'single' | 'compare' | 'curation'
    /** 발행 대상: DB만 저장 / WP 즉시 발행 */
    publishTarget?: 'DB_ONLY' | 'WORDPRESS'
  }
}

/** 파이프라인 전체에서 공유하는 컨텍스트 */
export interface PipelineContext {
  body: ItemResearchRequest
  persona: string
  finalPersonaName: string
  tone: string
  textModel: string
  imageModel: string
  charLimit: number
  articleType: string
  publishTarget: string
  trace?: LangfuseTrace
}

/** WordPress 발행 결과 */
export interface WordPressPublishResult {
  postId: number | null
  postUrl: string | null
  wpStatus: string
  publishedAt: string | null
  latencyMs: number
  error?: string
}

/** 파이프라인 최종 결과 */
export interface PipelineResult {
  seoContent: string
  thumbnailUrl: string | null
  researchRaw: string
  wordpress?: WordPressPublishResult | null
}
