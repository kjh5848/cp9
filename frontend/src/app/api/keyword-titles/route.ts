/**
 * [API Route] POST /api/keyword-titles
 * 키워드 기반 SEO 최적화 제목 후보 생성 API
 * GPT를 활용하여 주어진 키워드에 맞는 블로그 제목 후보를 N개(기본 5, 최대 30) 생성합니다.
 */
import { NextResponse } from 'next/server'
import { createTextModel } from '../item-research/pipeline/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { keyword, persona, articleType, textModel: requestedModel, count: requestedCount, excludeTitles, titleExamples, titleExclusions } = body as {
      keyword: string
      persona?: string
      articleType?: string
      textModel?: string
      count?: number
      excludeTitles?: string[]
      titleExamples?: string
      titleExclusions?: string
    }

    const count = Math.min(Math.max(requestedCount || 5, 1), 30) // 1~30개 제한

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: '키워드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 제목 생성용 모델 (빠른 응답을 위해 경량 모델 사용)
    const modelName = requestedModel || 'claude-sonnet-4-5'
    const model = createTextModel(modelName)

    const currentYear = new Date().getFullYear()

    const systemPrompt = `
당신은 대한민국 최고의 SEO 블로그 제목 전문가입니다.
현재 연도는 ${currentYear}년입니다. 과거 연도(예: 2023년, 2024년 등)를 절대 사용하지 말고, 반드시 올해인 ${currentYear}년을 기준으로 제목을 작성하세요.
검색 엔진 최적화, 클릭률(CTR) 극대화, 독자 호기심 자극에 뛰어난 블로그 제목을 만들어야 합니다.

[제목 작성 원칙]
1. 구체적인 숫자/최신 연도 활용 (예: "${currentYear}년", "TOP 5", "3가지")
2. 검색 의도(Intent)를 정확히 반영
3. 감정적 트리거 사용 (예: "후회 없는", "솔직 비교", "완벽 가이드")
4. 30~50자 내외로 간결하게
5. 메인 키워드를 제목 앞부분에 자연스럽게 배치
6. 이모지/아이콘 절대 사용 금지
7. [중요] 제목에 콜론(:) 기호 밎 "OO추천:" 같은 표현을 절대 사용하지 마세요. (예: "다이슨 청소기 추천: 한달 후기" -> "다이슨 청소기 한달 직접 써본 솔직 후기")
8. [중요] AI가 작성한 것 같은 딱딱한 문어체를 피하고, 실제 사람이 쓴 듯한 자연스러운 구어체와 친근한 블로그 말투를 사용하세요.

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

    const excludeText = excludeTitles && excludeTitles.length > 0 
      ? `\n[제외할 제목 목록]\n다음 제목들과 의미상 중복되거나 유사한 제목은 절대 제안하지 마세요:\n- ${excludeTitles.join('\n- ')}\n` 
      : ''

    const userPrompt = `
[메인 키워드]: ${keyword}
[글 유형]: ${articleType || '자유 (가장 적합한 유형으로 추천)'}
[페르소나]: ${persona || '범용'}
${excludeText}
${titleExamples?.trim() ? `[참고할 제목 스타일 예제 (Positive)]:\n${titleExamples}\n위 예제의 톤앤매너와 스타일을 참고하여 이와 비슷한 느낌으로 작성하세요.\n` : ''}
${titleExclusions?.trim() ? `[절대 사용 금지 포맷/단어 (Negative)]:\n${titleExclusions}\n위 포맷이나 단어는 어떠한 경우에도 제목에 포함하지 마세요.\n` : ''}
위 키워드로 SEO에 최적화된 블로그 제목 후보를 정확히 ${count}개 생성하세요.
각 제목은 서로 다른 앵글(관점/접근법)을 가져야 합니다.
`

    const aiResponse = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    const rawText = aiResponse.content.toString()
    const titles = parseTitles(rawText, count)

    return NextResponse.json({ titles, keyword, model: modelName, count })
  } catch (error) {
    console.error('[keyword-titles] 에러:', error)
    return NextResponse.json(
      { error: '제목 생성에 실패했습니다.', titles: [] },
      { status: 500 }
    )
  }
}

/** AI 응답에서 제목 JSON 파싱 */
function parseTitles(rawText: string, count: number = 5): Array<{
  title: string
  subtitle: string
  targetAudience: string
  searchIntent: string
}> {
  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return Array.isArray(parsed) ? parsed.slice(0, count) : []
    }
    return []
  } catch {
    console.warn('[keyword-titles] JSON 파싱 실패')
    return []
  }
}
