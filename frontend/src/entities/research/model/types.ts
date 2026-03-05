/**
 * 리서치 데이터 모델 (Entities Domain Model)
 */

export interface ResearchPack {
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
  thumbnailUrl?: string | null;
  thumbnailPrompt?: string | null;
  productImage?: string | null;   // 쿠팡 상품 원본 이미지
  productUrl?: string | null;     // 쿠팡 상품 링크 (CTA용)
  researchRaw?: string | null;
  content?: string | null;
  contentType?: 'html' | 'markdown'; // 콘텐츠 형식
  status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'PROCESSING' | 'FAILED' | 'WP_PUBLISHED';
  scheduledAt?: string | null;
  categoryName?: string | null;
  isFreeShipping?: boolean | null;
  // 글 생성 메타데이터
  persona?: string;               // 예: 'IT', 'BEAUTY', 'MASTER_CURATOR_H'
  personaName?: string;           // 예: 'IT/테크 전문가 블로거'
  textModel?: string;             // 예: 'gpt-4o', 'claude-sonnet-4-6'
  // 글 유형 메타데이터
  articleType?: 'single' | 'compare' | 'curation';
  relatedItems?: Array<{
    productName: string;
    productPrice: number;
    productUrl: string;
    productImage?: string;
    isRocket?: boolean;
  }>;
  seoConfig?: {
    persona?: string;
    [key: string]: any;
  };
  error?: string | null; // 파이프라인 실패 시 에러 메시지
  // WordPress 발행 결과
  wordpress?: {
    postId: number | null;
    postUrl: string | null;
    wpStatus: string;
    publishedAt: string | null;
    latencyMs?: number;
    error?: string;
  } | null;
  // 적용된 디자인 테마 ID (테마 재적용 시 기록)
  appliedThemeId?: string | null;
}

export interface ResearchItem {
  projectId: string;
  itemId: string;
  pack: ResearchPack;
  updatedAt: string;
}

export interface DraftMeta {
  title: string;
  description: string;
  slug: string;
  tags?: string[];
}

export interface DraftItem {
  projectId: string;
  itemId: string;
  meta: DraftMeta;
  markdown: string;
  version: string;
  updatedAt: string;
}

/**
 * 글쓰기(SEO 생성) 요청 타입
 */
export interface WriteRequest {
  projectId: string;
  itemIds?: string[];
  promptVersion?: string;
  force?: boolean;
  maxWords?: number;
  persona?: string; // 예: 'IT', 'BEAUTY', 'LIVING'
  textModel?: string; // 예: 'gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'
  imageModel?: string; // 예: 'dall-e-3', 'gemini-nano'
  actionType?: 'NOW' | 'SCHEDULE'; // 즉시 실행 또는 예약 등록
  scheduledAt?: string; // 예약 시간 (ISO 형식)
  charLimit?: number; // 목표 글자수
  themeId?: string; // 아티클 디자인 테마 ID
}

/**
 * 글쓰기 응답 타입
 */
export interface WriteResponse {
  success: boolean;
  data?: {
    written: number;
    failed: string[];
  };
  error?: string;
}
