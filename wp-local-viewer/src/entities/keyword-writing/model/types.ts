/**
 * [Entities/KeywordWriting] 키워드 글쓰기 도메인 타입 및 상수 정의
 * 순수 도메인 모델로, 외부 부수 효과(API, 상태관리) 없이 타입과 상수만 정의합니다.
 */

/** 글쓰기 모드 */
export type WritingMode = "keyword_first" | "product_first";

/** 글 설정 인터페이스 */
export interface WritingSettings {
  persona: string;
  tone: string;
  articleType: string;
  textModel: string;
  imageModel: string;
  charLimit: string;
}

/** 생성 결과 */
export interface GenerationResult {
  projectId: string;
  itemId: string;
}

/* ──────────────────────────── 상수 ──────────────────────────── */

/** 카테고리 목록 */
export const CATEGORIES = [
  { id: "all", label: "전체", icon: "🔍" },
  { id: "kitchen", label: "주방 가전", icon: "🍳" },
  { id: "home_theater", label: "홈 엔터테인먼트", icon: "📺" },
  { id: "tech", label: "IT / 워크스페이스", icon: "💻" },
  { id: "lifestyle", label: "라이프스타일", icon: "🏠" },
  { id: "gift", label: "선물 큐레이션", icon: "🎁" },
] as const;

/** 페르소나 옵션 */
export const PERSONA_OPTIONS = [
  { value: "IT", label: "IT/테크 전문가", desc: "성능, 벤치마크, 스펙 중심" },
  { value: "BEAUTY", label: "패션/뷰티 트렌드", desc: "비주얼, 트렌드, 소셜" },
  { value: "LIVING", label: "살림/인테리어 고수", desc: "실용성, 가성비" },
  { value: "HUNTER", label: "가성비/할인 헌터", desc: "할인, 한정 특가" },
  { value: "MASTER_CURATOR_H", label: "마스터 큐레이터 H", desc: "하이엔드 럭셔리" },
] as const;

/** 톤앤매너 옵션 */
export const TONE_OPTIONS = [
  { value: "professional", label: "전문적" },
  { value: "friendly", label: "친근한" },
  { value: "humorous", label: "유머러스" },
  { value: "informative", label: "정보 위주" },
] as const;

/** 글 유형 옵션 */
export const ARTICLE_TYPE_OPTIONS = [
  { value: "auto", label: "AI 자동 판별", desc: "키워드 의도에 맞게 에이전트가 선택", minItems: 0, maxItems: 50 },
  { value: "single", label: "딥다이브 리뷰", desc: "하나의 주제를 깊이 파헤치기", minItems: 0, maxItems: 100 },
  { value: "compare", label: "비교 분석", desc: "여러 제품/옵션을 객관적 비교", minItems: 2, maxItems: 5 },
  { value: "curation", label: "큐레이션 리스트", desc: "다수 추천 리스트형", minItems: 3, maxItems: 50 },
] as const;

/** 목표 글자수 옵션 */
export const CHAR_LIMIT_OPTIONS = [
  { value: "3000", label: "3,000자", desc: "간결한 리뷰" },
  { value: "5000", label: "5,000자", desc: "표준 SEO 포스팅" },
  { value: "7000", label: "7,000자", desc: "심층 분석" },
  { value: "10000", label: "10,000자", desc: "하이엔드 딥다이브" },
] as const;
