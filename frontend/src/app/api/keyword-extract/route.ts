/**
 * [API Route] POST /api/keyword-extract
 * 상품명 기반 SEO 키워드 + 제목 자동 추출 API (모드 B 전용)
 * 선택된 쿠팡 상품 이름에서 블로그 키워드와 제목 후보를 생성합니다.
 */
import { NextResponse } from 'next/server'
import { createTextModel } from '../item-research/pipeline/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productNames, articleType } = body as {
      productNames: string[]
      articleType?: string
    }

    if (!productNames || productNames.length === 0) {
      return NextResponse.json(
        { error: '상품명을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 빠른 응답을 위해 경량 모델 사용
    const model = createTextModel('claude-sonnet-4-5')

    const productList = productNames
      .map((name, i) => `${i + 1}. ${name}`)
      .join('\n')

    // 글 유형 자동 추론
    const inferredType = productNames.length >= 3
      ? 'curation'
      : productNames.length === 2
        ? 'compare'
        : articleType || 'single'

    const systemPrompt = `
당신은 대한민국 최고의 쿠팡 파트너스 SEO 전문가입니다.
주어진 상품명 목록에서 블로그 SEO에 최적화된 메인 키워드와 제목 후보를 추출합니다.

[규칙]
1. 키워드는 실제 사용자가 검색할 법한 자연스러운 롱테일 키워드
2. 제목은 클릭률(CTR)이 높은 블로그 제목 (30~50자)
3. 이모지/아이콘 절대 사용 금지
4. 메인 키워드를 제목 앞부분에 자연스럽게 배치

반드시 아래 JSON 형식으로만 응답하세요:
{
  "mainKeyword": "추출된 메인 키워드",
  "relatedKeywords": ["관련 키워드1", "관련 키워드2", "관련 키워드3"],
  "inferredArticleType": "single/compare/curation",
  "titles": [
    {
      "title": "제목 텍스트",
      "subtitle": "부제목 한줄",
      "targetAudience": "타겟 독자층",
      "searchIntent": "정보형/비교형/구매형"
    }
  ]
}
`

    const userPrompt = `
[선택된 상품 목록]:
${productList}

[상품 수]: ${productNames.length}개
[추론된 글 유형]: ${inferredType}

위 상품에 대한 블로그 포스팅을 위한:
1. 메인 SEO 키워드 1개
2. 관련 키워드 3개
3. 제목 후보 5개
를 추출하세요.
`

    const aiResponse = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    const rawText = aiResponse.content.toString()
    const result = parseExtractResult(rawText)

    return NextResponse.json({
      ...result,
      productCount: productNames.length,
    })
  } catch (error) {
    console.error('[keyword-extract] 에러:', error)
    return NextResponse.json(
      { error: '키워드 추출에 실패했습니다.' },
      { status: 500 }
    )
  }
}

/** AI 응답 JSON 파싱 */
function parseExtractResult(rawText: string): {
  mainKeyword: string
  relatedKeywords: string[]
  inferredArticleType: string
  titles: Array<{
    title: string
    subtitle: string
    targetAudience: string
    searchIntent: string
  }>
} {
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        mainKeyword: parsed.mainKeyword || '',
        relatedKeywords: parsed.relatedKeywords || [],
        inferredArticleType: parsed.inferredArticleType || 'single',
        titles: parsed.titles || [],
      }
    }
  } catch {
    console.warn('[keyword-extract] JSON 파싱 실패')
  }
  return { mainKeyword: '', relatedKeywords: [], inferredArticleType: 'single', titles: [] }
}
