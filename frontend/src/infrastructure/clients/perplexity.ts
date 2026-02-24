/**
 * [Infrastructure Layer]
 * Perplexity AI 클라이언트
 * - LangChain ChatOpenAI 객체를 BaseURL(api.perplexity.ai)로 변형하여 활용
 */
import { ChatOpenAI } from "@langchain/openai";

// 환경변수에 따른 Fallback 처리
// OPENAI_API_KEY를 임시 키로 사용할 수 있도록 폴백도 포함
const perplexityKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY || 'placeholder';

// 1. LangChain 용 Perplexity 모델 (Sonar-Pro)
export const perplexityModel = new ChatOpenAI({
  apiKey: perplexityKey,
  modelName: "sonar-pro",
  configuration: { baseURL: "https://api.perplexity.ai" },
  maxRetries: 1,
});
