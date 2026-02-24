/**
 * [Infrastructure Layer]
 * OpenAI (GPT, DALL-E) 클라이언트
 * - LangChain ChatOpenAI 객체 (GPT 본문 작성용)
 * - 공식 OpenAI SDK 객체 (DALL-E 이미지 생성용)
 */
import { ChatOpenAI } from "@langchain/openai";
import { OpenAI as OpenAIApi } from "openai";

// 브라우저 및 빌드 환경에서의 예외 방지를 위해 환경변수 fallback 적용
const apiKey = process.env.OPENAI_API_KEY || 'placeholder';

// 1. LangChain 용 GPT-4o 인스턴스 (텍스트 생성)
export const gptModel = new ChatOpenAI({
  openAIApiKey: apiKey,
  modelName: "gpt-4o",
  maxRetries: 1,
});

// 2. 순수 OpenAI SDK 인스턴스 (DALL-E 3 이미지 등 특정 기능용)
export const openAiSdk = new OpenAIApi({
  apiKey: apiKey,
});
