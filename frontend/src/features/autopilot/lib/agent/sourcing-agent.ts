import { openAiSdk } from '@/infrastructure/clients/openai';
import { searchCoupangProductsTool, CoupangSearchResult, SourcingConstraints } from './coupang-search-tool';
import { IntentPlannerResult } from './intent-planner';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

const finishCurationSchema = {
  selectedItems: {
    type: "array",
    description: "최종 선택된 쿠팡 상품 객체들의 배열",
    items: {
      type: "object",
      properties: {
        productId: { type: "number" },
        productName: { type: "string" },
        productPrice: { type: "number" },
        productImage: { type: "string" },
        productUrl: { type: "string" },
        reason: { type: "string", description: "이 상품을 선택한 이유 (검색 의도와의 부합성)" }
      },
      required: ["productId", "productName", "productPrice", "productImage", "productUrl", "reason"]
    }
  }
};

/**
 * [Stage 2] Sourcing & Curator Agent
 * Intent Planner가 기획한 내용을 바탕으로 쿠팡 검색 Tool을 활용하여 최적의 상품을 자율적으로 수집합니다.
 */
export async function runSourcingAgent(
  intentData: IntentPlannerResult,
  constraints?: SourcingConstraints,
  accessKey?: string,
  secretKey?: string
): Promise<CoupangSearchResult[]> {
  const constraintsText = constraints ? `
[필수 소싱 제약 조건]
${constraints.minPrice ? `- 최소 가격: ${constraints.minPrice}원 이상\n` : ''}${constraints.maxPrice ? `- 최대 가격: ${constraints.maxPrice}원 이하\n` : ''}${constraints.isRocketOnly ? `- 로켓 배송 상품만 포함할 것 (반드시 로켓 배송인 상품만 골라야 함)\n` : ''}위 제약 조건을 반드시 충족하는 상품만 최종 선별해야 합니다.` : '';

  const systemPrompt = `당신은 최고 수준의 커머스 전문 큐레이터입니다.
이전 단계에서 기획된 [검색 의도(searchIntent)]와 [필요한 아이템 개수(requiredItemCount)]를 바탕으로,
쿠팡 검색 도구(search_coupang_items)를 사용하여 최적의 상품들을 선별해야 합니다.
${constraintsText}

[기획 정보]
- 블로그 제목: "${intentData.title}"
- 검색 의도: "${intentData.searchIntent}"
- 필요한 아이템 개수: ${intentData.requiredItemCount}개
- 추천 검색어: ${JSON.stringify(intentData.suggestedSearchQueries)}

[💡 핵심 소싱 지침 (중요)]
1. 'search_coupang_items' 함수를 호출하여 필요한 상품들을 검색하세요. (한 번에 안 나오면 다른 키워드로 계속 검색 가능)
2. 당신은 직접 링크에 접속하여 상세 정보나 리뷰를 스크래핑할 수 없으므로, 오직 제공된 검색 결과의 '제목(상품명)'과 '가격'만 보고 판단해야 합니다.
3. 터무니없이 가격이 저렴한 상품(예: 케이스, 부품, 낚시성 상품)은 리뷰가 없거나 저품질일 확률이 높으므로 절대 선택하지 마세요.
4. 검색 의도에 부합하면서도, 사람들이 클릭해서 구매를 결정할 만한 현실적이고 '적정한 가격(가성비)'의 훌륭한 본품을 ${intentData.requiredItemCount}개 정확히 골라냅니다.
5. 선별이 모두 끝났다면, 최종적으로 'finish_curation' 함수를 호출하여 당신이 선택한 상품들의 리스트(선택 이유 포함)를 제출하고 작업을 종료하세요.`;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: '기획안에 맞는 최적의 쿠팡 상품을 선별해서 제출해주세요.' }
  ];

  // OpenAI 지원 포맷으로 툴 스키마 변환 (직접 JSON Schema 정의)
  const openAiTools = [
    {
      type: 'function' as const,
      function: {
        name: 'search_coupang_items',
        description: '쿠팡에서 키워드로 상품을 검색합니다. (한 번에 안 나오면 다른 키워드로 계속 검색 가능)',
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "검색 키워드 (예: \"가성비 로봇청소기\")" },
            limit: { type: "number", description: "반환할 최대 아이템 수" }
          },
          required: ["query"]
        }
      }
    },
    {
      type: 'function' as const,
      function: {
        name: 'finish_curation',
        description: '최종적으로 선별된 상품들을 확정하고 작업을 종료합니다.',
        parameters: {
          type: "object",
          properties: {
            selectedItems: {
              type: "array",
              description: "최종 선택된 쿠팡 상품 객체들의 배열",
              items: {
                type: "object",
                properties: {
                  productId: { type: "number" },
                  productName: { type: "string" },
                  productPrice: { type: "number" },
                  productImage: { type: "string" },
                  productUrl: { type: "string" },
                  reason: { type: "string", description: "이 상품을 선택한 이유 (검색 의도와의 부합성)" }
                },
                required: ["productId", "productName", "productPrice", "productImage", "productUrl", "reason"]
              }
            }
          },
          required: ["selectedItems"]
        }
      }
    }
  ];

  const MAX_ITERATIONS = 5; // 무한 루프 방지

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await openAiSdk.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages,
      tools: openAiTools,
      tool_choice: 'auto',
      temperature: 0.5,
    });

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage); // LLM의 응답(또는 툴 호출)을 대화 기록에 추가

    // 함수 호출이 없는 경우 (LLM이 그냥 텍스트로 대답했을 때)
    if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
      // LLM이 텍스트로만 대답하고 끝내버리는 엣지 케이스 방지를 위해 다시 툴 사용 요구
      messages.push({
        role: 'user',
        content: '반드시 finish_curation 도구를 호출하여 최종 선별된 아이템을 제출해야 합니다.'
      });
      continue;
    }

    // 함수 호출 처리
    for (const toolCall of responseMessage.tool_calls) {
      const call = toolCall as any;
      
      if (call.function?.name === 'search_coupang_items') {
        const args = JSON.parse(call.function.arguments);
        console.log(`[SourcingAgent] 툴 호출: search_coupang_items (query: ${args.query})`);
        const searchResults = await searchCoupangProductsTool(args.query, args.limit || 10, constraints, accessKey, secretKey);
        
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(searchResults)
        });
      } 
      else if (call.function?.name === 'finish_curation') {
        const args = JSON.parse(call.function.arguments);
        console.log(`[SourcingAgent] 툴 호출: finish_curation (선택된 아이템 수: ${args.selectedItems.length})`);
        return args.selectedItems as (CoupangSearchResult & { reason: string })[]; // 최종 결과 반환
      }
    }
  }

  throw new Error(`[SourcingAgent] ${MAX_ITERATIONS}번의 턴 내에 최종 아이템을 선별하지 못했습니다.`);
}
