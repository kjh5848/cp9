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
