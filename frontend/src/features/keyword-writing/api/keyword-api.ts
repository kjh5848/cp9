/**
 * [Features/KeywordWriting] 키워드 기반 글 작성 API 클라이언트
 * 키워드 추천, 제목 생성, 상품명 기반 키워드 추출 API를 호출하는 프론트엔드 함수들입니다.
 */

/** 키워드 추천 결과 타입 */
export interface SuggestedKeyword {
  keyword: string;
  category: string;
  estimatedVolume: string;
  articleType: string;
  reason: string;
}

/** 제목 후보 타입 */
export interface TitleCandidate {
  title: string;
  subtitle: string;
  targetAudience: string;
  searchIntent: string;
}

/** 키워드 추출 결과 타입 (모드 B) */
export interface KeywordExtractResult {
  mainKeyword: string;
  relatedKeywords: string[];
  inferredArticleType: string;
  titles: TitleCandidate[];
  productCount: number;
}

/**
 * 카테고리/키워드 기반 SEO 키워드 추천 API 호출
 */
export async function suggestKeywords(params: {
  category?: string;
  baseKeyword?: string;
  count?: number;
  interests?: string[];
  excludeKeywords?: string[];
}): Promise<{ keywords: SuggestedKeyword[]; season: string }> {
  const response = await fetch('/api/keyword-suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('키워드 추천에 실패했습니다.');
  }

  return response.json();
}

/**
 * 키워드 기반 SEO 제목 후보 생성 API 호출
 */
export async function generateTitles(params: {
  keyword: string;
  persona?: string;
  articleType?: string;
}): Promise<{ titles: TitleCandidate[]; keyword: string }> {
  const response = await fetch('/api/keyword-titles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('제목 생성에 실패했습니다.');
  }

  return response.json();
}

/**
 * 상품명 기반 키워드 + 제목 자동 추출 (모드 B 전용)
 */
export async function extractKeywords(params: {
  productNames: string[];
  articleType?: string;
}): Promise<KeywordExtractResult> {
  const response = await fetch('/api/keyword-extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('키워드 추출에 실패했습니다.');
  }

  return response.json();
}
