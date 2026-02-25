/**
 * [Infrastructure Layer]
 * OpenAI (GPT, DALL-E) 클라이언트
 * - LangChain ChatOpenAI 팩토리 함수 (호출 시 모델 동적 지정)
 * - 공식 OpenAI SDK 객체 (DALL-E 이미지 생성용)
 */
import { ChatOpenAI } from "@langchain/openai";
import { OpenAI as OpenAIApi } from "openai";

// 브라우저 및 빌드 환경에서의 예외 방지를 위해 환경변수 fallback 적용
const apiKey = process.env.OPENAI_API_KEY || 'placeholder';

/**
 * GPT 모델 팩토리 함수 - 런타임에 모델을 동적으로 선택
 * @param modelName - 사용할 GPT 모델 ID (예: 'gpt-4o', 'gpt-4o-mini')
 */
export function createGptModel(modelName: string = 'gpt-4o') {
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName,
    maxTokens: 8192, // 10,000자 이상 생성을 위해 높게 설정
    maxRetries: 1,
  });
}

// 하위 호환성을 위한 기본 인스턴스 (gpt-4o 고정)
export const gptModel = createGptModel('gpt-4o');

// 2. 순수 OpenAI SDK 인스턴스 (DALL-E 3 이미지 등 특정 기능용)
export const openAiSdk = new OpenAIApi({
  apiKey: apiKey,
});
