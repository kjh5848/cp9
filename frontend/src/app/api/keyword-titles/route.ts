/**
 * [API Route] POST /api/keyword-titles
 * 키워드 기반 SEO 최적화 제목 후보 생성 API
 * GPT를 활용하여 주어진 키워드에 맞는 블로그 제목 후보를 5개 생성합니다.
 */
import { NextResponse } from 'next/server'
import { createTextModel } from '../item-research/pipeline/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { keyword, persona, articleType, textModel: requestedModel } = body as {
      keyword: string
      persona?: string
      articleType?: string
      textModel?: string
    }

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: '키워드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 제목 생성용 모델 (빠른 응답을 위해 경량 모델 사용)
    const modelName = requestedModel || 'gpt-4o-mini'
    const model = createTextModel(modelName)

    const systemPrompt = `
당신은 대한민국 최고의 SEO 블로그 제목 전문가입니다.
검색 엔진 최적화, 클릭률(CTR) 극대화, 독자 호기심 자극에 뛰어난 블로그 제목을 만들어야 합니다.

[제목 작성 원칙]
1. 구체적인 숫자/연도 활용 (예: "\${new Date().getFullYear()}년", "TOP 5", "3가지")
2. 검색 의도(Intent)를 정확히 반영
3. 감정적 트리거 사용 (예: "후회 없는", "솔직 비교", "완벽 가이드")
4. 30~50자 내외로 간결하게
5. 메인 키워드를 제목 앞부분에 자연스럽게 배치
6. 이모지/아이콘 절대 사용 금지

[글 유형별 특성]
- single(딥다이브): 하나의 제품/주제를 깊이 파헤치는 전문 리뷰
- compare(비교): 여러 제품을 객관적으로 비교 분석
- curation(큐레이션): 다수 제품을 빠르게 추천하는 리스트형

반드시 아래 JSON 형식으로만 응답하세요:
[
  {
    "title": "제목 텍스트",
    "subtitle": "부제목 또는 메타 설명 1줄",
    "targetAudience": "이 글의 타겟 독자층",
    "searchIntent": "정보형/비교형/구매형"
  }
]
`

    const userPrompt = `
[메인 키워드]: ${keyword}
[글 유형]: ${articleType || '자유 (가장 적합한 유형으로 추천)'}
[페르소나]: ${persona || '범용'}

위 키워드로 SEO에 최적화된 블로그 제목 후보를 정확히 5개 생성하세요.
각 제목은 서로 다른 앵글(관점/접근법)을 가져야 합니다.
`

    const aiResponse = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    const rawText = aiResponse.content.toString()
    const titles = parseTitles(rawText)

    return NextResponse.json({ titles, keyword, model: modelName })
  } catch (error) {
    console.error('[keyword-titles] 에러:', error)
    return NextResponse.json(
      { error: '제목 생성에 실패했습니다.', titles: [] },
      { status: 500 }
    )
  }
}

/** AI 응답에서 제목 JSON 파싱 */
function parseTitles(rawText: string): Array<{
  title: string
  subtitle: string
  targetAudience: string
  searchIntent: string
}> {
  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return []
  } catch {
    console.warn('[keyword-titles] JSON 파싱 실패')
    return []
  }
}
