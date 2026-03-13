/**
 * [API Route] POST /api/keyword-explore
 * 다차원 키워드 딥 리서치 API
 * Perplexity API를 활용하여 시드 단어를 바탕으로 입체적인 수익형 키워드를 발굴합니다.
 */
import { NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'

const perplexityKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY || 'placeholder'
const exploreModel = new ChatOpenAI({
  apiKey: perplexityKey,
  modelName: 'sonar-pro',
  configuration: { baseURL: 'https://api.perplexity.ai' },
  maxRetries: 1,
  temperature: 0.7,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { seedKeyword, targetAge, targetGender, category, searchIntent } = body as {
      seedKeyword: string;
      targetAge: string;
      targetGender: string;
      category: string;
      searchIntent: string;
    }

    if (!seedKeyword) {
      return NextResponse.json({ error: '시드 단어를 입력해주세요.' }, { status: 400 })
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const prompt = `
당신은 대한민국 최고 수준의 제휴 마케팅 및 SEO 키워드 분석 전문가입니다.
현재 ${currentYear}년 ${currentMonth}월입니다. 

사용자가 제시한 시드 단어를 중심축으로 하여, 블로그/마케팅에 최적화된 "다차원 타겟 키워드 15개"를 발굴해야 합니다.
최근 네이버, 쿠팡 등에서 사람들이 많이 검색하는 실제 롱테일, 비교형, 문제해결형 키워드를 추출해주세요.

[탐색 조건]
- 시드 단어: "${seedKeyword}"
- 타겟 연령: ${targetAge}
- 타겟 성별: ${targetGender}
- 관련 카테고리: ${category}
- 타겟 검색 의도: ${searchIntent}

[필수 파생 유형 분류]
1. longtail (롱테일형): 예) "소음 없는 가성비 로봇청소기 추천"
2. compare (비교견적형): 예) "로보락 S8 vs 에코백스 디봇 비교"
3. problem-solving (문제해결형): 예) "강아지 털 날림 해결용 공기청정기"

검색 의도(searchIntent)가 'all'일 경우 3가지 유형을 골고루 섞어주고, 특정 의도가 명시된 경우 그에 맞게 집중 발굴하세요. 예상 검색량(estimatedVolume), 수익성(profitability), 경쟁도(competition)는 시장 상황을 추정하여 '높음', '중간', '낮음' 중 하나로 표기하세요.

추천 글 유형(expectedArticleType)은 다음 중 하나여야 합니다:
- 'single' (단일 제품 딥 리뷰에 적합)
- 'compare' (2~3개 제품 성향 비교에 적합)
- 'curation' (Top 5 등 다수 추천에 적합)

반드시 아래 JSON 배열 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명 없이 오직 JSON 배열만 출력하세요.
[
  {
    "keyword": "발굴된 다이렉트 키워드",
    "type": "longtail" | "compare" | "problem-solving",
    "estimatedVolume": "높음" | "중간" | "낮음",
    "profitability": "높음" | "중간" | "낮음",
    "competition": "높음" | "중간" | "낮음",
    "expectedArticleType": "single" | "compare" | "curation",
    "reason": "이 키워드를 추천하는 비즈니스적 이유 1줄 요약"
  }
]
`
    const res = await exploreModel.invoke(prompt)
    const rawText = res.content.toString()
    
    let parsedData = [];
    try {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
         parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('[keyword-explore] JSON 파싱 에러', e);
      return NextResponse.json({ error: '데이터를 분석하는 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: parsedData
    })

  } catch (error) {
    console.error('[keyword-explore] 에러:', error)
    return NextResponse.json(
      { error: '키워드 탐색에 실패했습니다.' },
      { status: 500 }
    )
  }
}
