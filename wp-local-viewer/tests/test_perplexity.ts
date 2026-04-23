import { ChatOpenAI } from "@langchain/openai";

const perplexityKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY || 'placeholder';

const perplexityModel = new ChatOpenAI({
  apiKey: perplexityKey, // <-- changed from openAIApiKey
  modelName: "sonar-pro",
  configuration: { baseURL: "https://api.perplexity.ai" },
  maxRetries: 1,
});

async function main() {
  try {
    const res = await perplexityModel.invoke("안녕하세요. 테스트입니다.");
    console.log("Success:", res.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
