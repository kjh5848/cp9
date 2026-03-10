import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { openAiSdk } from '@/infrastructure/clients/openai';

export const maxDuration = 120; // Maximum timeout for long OpenAI requests

export async function POST(req: Request) {
  try {
    const { personaId, topic, count = 30 } = await req.json();

    if (!topic || !personaId) {
      return NextResponse.json({ error: 'Missing topic or personaId' }, { status: 400 });
    }

    const persona = await prisma.persona.findUnique({
      where: { id: personaId }
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    const systemPrompt = `당신은 최고의 SEO 전문가이자 블로그 콘텐츠 기획자입니다.
대상이 되는 블로거의 페르소나와 작성하려는 메인 주제(데이터셋)를 기반으로, 
다음 조건에 맞춰 실질적인 트래픽을 유도할 수 있는 고부가가치 롱테일 및 숏테일 키워드를 정확히 ${count}개 리서치하여 반환하세요.

[블로거 페르소나 정보]
- 이름: ${persona.name}
- 역할 및 프롬프트: ${persona.systemPrompt}
- 톤앤매너: ${persona.toneDescription}

[작성 주제 (데이터셋)]
"${topic}"

[요구사항]
1. 위 주제와 페르소나에 부합하는 세부 키워드를 추출합니다.
2. 각 키워드는 사람들이 쿠팡이나 네이버 등에서 상품을 찾을 때 실제로 입력할 법한 구체적이고 구매 의도가 담긴 롱테일/숏테일 키워드여야 합니다. (예: "30대 직장인 무선 이어폰 추천", "가성비 노이즈 캔슬링 헤드폰 비교")
`;

    const response = await openAiSdk.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '키워드를 추출해주세요.' }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'keyword_research_result',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    keyword: {
                      type: 'string',
                      description: '추출된 구체적인 검색 키워드'
                    },
                    intent: {
                      type: 'string',
                      description: '해당 키워드를 검색하는 사용자의 의도나 작성해야 할 글의 방향성 요약'
                    },
                    type: {
                      type: 'string',
                      enum: ['long-tail', 'short-tail'],
                      description: '해당 키워드가 롱테일인지 숏테일인지 구분'
                    }
                  },
                  required: ['keyword', 'intent', 'type'],
                  additionalProperties: false
                }
              }
            },
            required: ['keywords'],
            additionalProperties: false
          }
        }
      },
      temperature: 0.7,
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content returned from OpenAI');
    }

    const parsedContent = JSON.parse(response.choices[0].message.content);
    
    return NextResponse.json({ 
      success: true, 
      count: parsedContent.keywords?.length || 0, 
      data: parsedContent.keywords 
    });

  } catch (error: any) {
    console.error('AI Research Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
