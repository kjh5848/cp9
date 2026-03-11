/**
 * [Infrastructure Layer]
 * Claude (Anthropic) 클라이언트
 * - LangChain ChatAnthropic 팩토리 함수 (호출 시 모델 동적 지정)
 */
import { ChatAnthropic } from "@langchain/anthropic";

const anthropicApiKey = process.env.ANTHROPIC_API_KEY || 'placeholder';

/**
 * Claude 모델 팩토리 함수 - 런타임에 모델을 동적으로 선택
 * @param modelName - 사용할 Claude 모델 ID (예: 'claude-sonnet-4-5', 'claude-opus-4-6')
 */
export function createClaudeModel(modelName: string = 'claude-sonnet-4-5') {
  return new ChatAnthropic({
    anthropicApiKey,
    modelName,
    maxRetries: 1,
  });
}

// 하위 호환성을 위한 기본 인스턴스 (claude-sonnet-4-5 고정)
export const claudeModel = createClaudeModel('claude-sonnet-4-5');
