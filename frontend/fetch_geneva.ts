import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const perplexityKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY || 'placeholder';

const perplexityModel = new ChatOpenAI({
  apiKey: perplexityKey,
  modelName: "sonar-pro",
  configuration: { baseURL: "https://api.perplexity.ai" },
  maxRetries: 1,
});

async function main() {
  const query = "2025년 기준 제네바 스피커 XL 모델의 주요 스펙, 장단점, 실사용자들의 리뷰 요약, 그리고 일시불 구매 대비 '렌탈'의 장점이 무엇인지 구체적인 데이터와 함께 표 형식으로 정리해주세요.";
  
  try {
    const res = await perplexityModel.invoke(query);
    console.log("=== Perplexity Search Result ===");
    console.log(res.content);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

main();
