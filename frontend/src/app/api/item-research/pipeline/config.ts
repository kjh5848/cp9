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
