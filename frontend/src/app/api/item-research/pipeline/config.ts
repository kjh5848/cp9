/**
 * SEO 파이프라인 설정 — 페르소나 매핑, 상수, 모델 팩토리
 */
import { createGptModel } from '@/infrastructure/clients/openai'
import { createClaudeModel } from '@/infrastructure/clients/claude'
import { createGeminiModel } from '@/infrastructure/clients/gemini'

/** 페르소나 ID → Perplexity 프롬프트에서 치환할 섹션 키 매핑 */
export const PERSONA_PERPLEXITY_KEY: Record<string, string> = {
  'IT': 'IT (IT/테크 전문가)',
  'BEAUTY': 'BEAUTY (패션/뷰티 트렌드 쇼퍼)',
  'LIVING': 'LIVING (살림/인테리어 고수)',
  'HUNTER': 'HUNTER (가성비/할인 헌터)',
  'MASTER_CURATOR_H': 'Single_Expert (하이엔드/럭셔리 딥다이브 전문가 - 마스터 큐레이터 H 전용)',
};

/** 페르소나 ID → 블로그 템플릿 파일명 매핑 */
export const PERSONA_TEMPLATE_FILE: Record<string, string> = {
  'IT': 'persona_it.md',
  'BEAUTY': 'persona_beauty.md',
  'LIVING': 'persona_living.md',
  'HUNTER': 'persona_hunter.md',
  'MASTER_CURATOR_H': 'blog_prompt_template.md',
};

/** 페르소나 ID → 역할 한글 이름 매핑 */
export const PERSONA_DISPLAY_NAME: Record<string, string> = {
  'IT': 'IT/테크 전문가 블로거',
  'BEAUTY': '패션/뷰티 트렌드 쇼퍼',
  'LIVING': '살림/인테리어 고수 크리에이터',
  'HUNTER': '가성비/할인 헌터 블로거',
  'MASTER_CURATOR_H': '마스터 큐레이터',
};

/**
 * 선택된 모델 이름에 따라 적절한 LLM 인스턴스를 반환합니다.
 */
export function createTextModel(textModel: string) {
  if (textModel.startsWith('claude')) return createClaudeModel(textModel);
  if (textModel.startsWith('gemini')) return createGeminiModel(textModel);
  return createGptModel(textModel);
}

/** 하위 모델 → 상위 모델 자동 업그레이드 매핑 */
const MODEL_UPGRADE_MAP: Record<string, string> = {
  'gpt-4o-mini': 'gpt-4o',
  'gpt-3.5-turbo': 'gpt-4o',
  'claude-3-haiku': 'claude-sonnet-4-20250514',
  'gemini-1.5-flash': 'gemini-1.5-pro',
};

/**
 * 비교/큐레이션 글 유형에서 컨텍스트가 클 때 하위 모델을 상위 모델로 자동 업그레이드합니다.
 * 이미 상위 모델이 선택된 경우 그대로 유지합니다.
 */
export function upgradeModelForArticleType(textModel: string, articleType: string): string {
  if (articleType === 'single') return textModel;
  const upgraded = MODEL_UPGRADE_MAP[textModel];
  if (upgraded) {
    console.log(`🔄 [Model Upgrade] ${articleType} 글 유형 → ${textModel} → ${upgraded}`);
    return upgraded;
  }
  return textModel;
}

/**
 * 모델 API 호출 실패 시 대체할 폴백 모델 매핑
 * - GPT 계열 → gpt-4o
 * - Claude 계열 → claude-sonnet-4-20250514
 * - Gemini 계열 → gemini-2.0-flash
 * - 이미 폴백 모델이거나 매핑이 없으면 null 반환
 */
const MODEL_FALLBACK_MAP: Record<string, string> = {
  // GPT 계열 폴백
  'gpt-4o': 'gpt-4o-mini',
  'gpt-4o-mini': 'gpt-4o',
  // Claude 계열 폴백
  'claude-sonnet-4-20250514': 'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20241022': 'claude-sonnet-4-20250514',
  // Gemini 계열 폴백
  'gemini-2.0-flash': 'gemini-1.5-pro',
  'gemini-1.5-pro': 'gemini-2.0-flash',
};

/**
 * 실패한 모델에 대해 폴백 모델을 반환합니다.
 * - 명시적 매핑이 있으면 해당 모델 반환
 * - 매핑이 없으면 모델 프리픽스 기반으로 안전한 기본 모델 반환
 * - 폴백할 수 없으면 null 반환
 */
export function getFallbackModel(failedModel: string): string | null {
  // 명시적 폴백 매핑 확인
  const explicit = MODEL_FALLBACK_MAP[failedModel];
  if (explicit) return explicit;

  // 프리픽스 기반 범용 폴백 (알 수 없는 모델명이어도 계열은 파악 가능)
  if (failedModel.startsWith('gpt')) return 'gpt-4o';
  if (failedModel.startsWith('claude')) return 'claude-sonnet-4-20250514';
  if (failedModel.startsWith('gemini')) return 'gemini-2.0-flash';

  // 어떤 계열인지도 모르면 gpt-4o로 최종 폴백
  return 'gpt-4o';
}

