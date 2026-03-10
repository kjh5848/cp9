import { openAiSdk } from '@/infrastructure/clients/openai';

export interface IntentPlannerResult {
  title: string;
  searchIntent: string;
  recommendedArticleType: string;
  requiredItemCount: number;
  suggestedSearchQueries: string[];
}

export interface IntentPlannerInput {
  keyword: string;
  articleType: string;
  personaName: string;
  personaPrompt: string;
}

/**
 * [Stage 1] Intent Planner Agent
 * 사용자의 키워드와 페르소나, 글 유형을 융합하여 블로그 제목과 구체적 쇼핑 검색 의도(Intent)를 기획합니다.
 */
export async function runIntentPlanner(input: IntentPlannerInput): Promise<IntentPlannerResult> {
  const systemPrompt = `당신은 최고 수준의 커머스 전문 블로거이자 실력 있는 프로덕트 매니저(MD)입니다.
사용자가 제안한 [기본 키워드]에 기반하여, 실제 구글이나 네이버에서 검색할 법한 고품질 커머스 글의 '제목(Title)'을 매력적으로 기획하세요.
또한 어떠한 상품들을 쿠팡에서 검색해야 하는지 명확한 검색 의도(searchIntent)와 검색어 조합(suggestedSearchQueries)을 제안합니다.

[유저 컨텍스트]
- 기본 키워드: "${input.keyword}"
- 글 유형(Article Type): "${input.articleType}" (만약 "auto"라면 키워드 의도를 분석하여 single, compare, curation 중 하나를 스스로 선택하세요.)
- 페르소나(Persona): "${input.personaName}"
- 페르소나 설명: "${input.personaPrompt}"

[요청 사항]
1. 위 컨텍스트를 종합하여, 시선을 사로잡는 구체적인 블로그 Title을 작성하세요.
2. 글 유형(Article Type)이 "auto"인 경우 키워드의 검색 의도를 파악하여 가장 적절한 포맷(single, compare, curation)을 'recommendedArticleType'으로 선택하세요. 그 외의 경우 입력된 글 유형을 그대로 기입하세요.
3. 선택된(또는 부여된) 글 유형에 맞춰 필요한 아이템의 개수(requiredItemCount)를 정확히 정수로 설정하세요.
   * single: 무조건 1
   * compare: 무조건 2
   * curation: 3에서 5 사이의 적당한 숫자
4. 어떤 상품들을 쿠팡에서 찾아야 하는지(예: 가격대, 핵심 스펙) 의도(searchIntent)를 상세히 서술하세요.
5. 다음 단계 에이전트가 쿠팡 검색 API에 사용할 검색어(query) 리스트를 'suggestedSearchQueries' 배열에 나열하세요. 개수는 requiredItemCount 만큼, 핵심 키워드(브랜드명+모델명 등) 위주로 작성하세요.`;

  try {
    const response = await openAiSdk.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '기획안을 JSON으로 반환해주세요.' }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'intent_plan_schema',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: '블로그 포스팅 제목'
              },
              searchIntent: {
                type: 'string',
                description: '쿠팡에서 검색해야 할 대상 상품의 특징, 예산, 스펙, 브랜드 등 구체적인 의도'
              },
              recommendedArticleType: {
                type: 'string',
                description: '최종 결정된 글 유형 (single, compare, curation 중 택 1)',
                enum: ['single', 'compare', 'curation']
              },
              requiredItemCount: {
                type: 'number',
                description: '글 유형에 따른 필요 아이템 개수'
              },
              suggestedSearchQueries: {
                type: 'array',
                items: { type: 'string' },
                description: '쿠팡 검색 Tool에 인자로 넣기 적합한 구체적 검색어(키워드) 배열'
              }
            },
            required: ['title', 'searchIntent', 'recommendedArticleType', 'requiredItemCount', 'suggestedSearchQueries'],
            additionalProperties: false
          }
        }
      },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('의도 기획 결과를 받지 못했습니다.');
    }

    return JSON.parse(content) as IntentPlannerResult;
  } catch (error) {
    console.error('[IntentPlanner] Error:', error);
    throw error;
  }
}
