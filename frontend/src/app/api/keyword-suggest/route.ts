/**
 * [API Route] POST /api/keyword-suggest
 * 카테고리/시즌 기반 키워드 추천 API
 * Perplexity API를 활용하여 현재 시즌에 맞는 고수익 키워드를 추천합니다.
 */
import { NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'

// 키워드 추천 전용 Perplexity 모델 (temperature 0.8로 다양한 결과 보장)
const perplexityKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY || 'placeholder'
const suggestModel = new ChatOpenAI({
  apiKey: perplexityKey,
  modelName: 'sonar-pro',
  configuration: { baseURL: 'https://api.perplexity.ai' },
  maxRetries: 1,
  temperature: 0.8,
})

/** 프론트엔드 카테고리 ID → 한국어 카테고리명 매핑 */
const CATEGORY_NAME_MAP: Record<string, string> = {
  kitchen: '주방 가전 (밥솥, 에어프라이어, 식기세척기, 정수기 등)',
  home_theater: '홈 엔터테인먼트 (TV, 사운드바, 빔프로젝터, 스피커 등)',
  tech: 'IT/워크스페이스 (노트북, 모니터, 키보드, 태블릿 등)',
  lifestyle: '라이프스타일 (청소기, 세탁기, 건조기, 공기청정기 등)',
  gift: '선물 큐레이션 (명품, 향수, 뷰티 디바이스, 시계 등)',
}

/** 기본 키워드 추천 개수 */
const DEFAULT_COUNT = 10
const MIN_COUNT = 3
const MAX_COUNT = 20

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category, baseKeyword, count, interests, excludeKeywords } = body as {
      category?: string
      baseKeyword?: string
      count?: number
      interests?: string[]
      excludeKeywords?: string[]
    }

    // 키워드 개수 제한 (min/max 클램핑)
    const requestedCount = Math.min(MAX_COUNT, Math.max(MIN_COUNT, count || DEFAULT_COUNT))

    // 현재 월 기반 시즌 정보
    const now = new Date()
    const month = now.getMonth() + 1
    const seasonInfo = getSeasonInfo(month)

    // 카테고리 한국어 변환
    const categoryKorean = category ? CATEGORY_NAME_MAP[category] : undefined

    const prompt = buildSuggestPrompt({ category: categoryKorean, baseKeyword, seasonInfo, month, count: requestedCount, interests, excludeKeywords })

    // temperature를 0.8로 설정하여 매번 다양한 결과 생성
    const res = await suggestModel.invoke(prompt)
    const rawText = res.content.toString()

    // JSON 파싱 + 개수 클램핑
    let keywords = parseKeywords(rawText)
    keywords = keywords.slice(0, requestedCount)

    return NextResponse.json({
      keywords,
      season: seasonInfo,
      requestedCount,
      actualCount: keywords.length,
    })
  } catch (error) {
    console.error('[keyword-suggest] 에러:', error)
    return NextResponse.json(
      { error: '키워드 추천에 실패했습니다.', keywords: [], requestedCount: 0, actualCount: 0 },
      { status: 500 }
    )
  }
}

/** 키워드 추천 프롬프트 생성 */
function buildSuggestPrompt(params: {
  category?: string
  baseKeyword?: string
  seasonInfo: string
  month: number
  count: number
  interests?: string[]
  excludeKeywords?: string[]
}): string {
  const { category, baseKeyword, seasonInfo, month, count, interests, excludeKeywords } = params

  const categoryFilter = category
    ? `반드시 "${category}" 카테고리에 해당하는 상품 키워드만 추천하세요.`
    : '모든 카테고리에서 자유롭게 추천하세요.'

  const keywordContext = baseKeyword
    ? `사용자가 입력한 기본 키워드: "${baseKeyword}"\n이 키워드와 관련된 세부 롱테일 키워드를 추천하세요.`
    : ''

  const interestsContext = interests && interests.length > 0
    ? `\n\n[사용자 관심 분야]: ${interests.join(', ')}\n위 관심사를 반영하여 사용자에게 맞춤형 키워드를 추천하세요.`
    : ''

  const excludeContext = excludeKeywords && excludeKeywords.length > 0
    ? `\n\n[제외 키워드 — 이미 추천했으므로 중복 금지]:\n${excludeKeywords.map(k => `- ${k}`).join('\n')}`
    : ''

  return `
당신은 대한민국 쿠팡 파트너스 SEO 전문가입니다.
현재 ${month}월, 시즌 특성: ${seasonInfo}

${categoryFilter}
${keywordContext}
${interestsContext}
${excludeContext}

블로그 SEO에 최적화된 고수익 키워드를 정확히 ${count}개 추천해주세요.

추천 기준:
1. 쿠팡 파트너스 제휴 마케팅에 적합한 구체적인 상품 키워드일 것 (예: "로봇청소기 추천", "에어프라이어 비교")
2. 검색량이 높고 경쟁이 적당한 롱테일 키워드 위주
3. 현재 시즌(${month}월)에 맞는 트렌드 키워드 포함
4. 객단가 50만원 이상의 고단가 상품 키워드 우선
5. 단순 브랜드명이 아닌, 검색 의도가 담긴 키워드 (예: "다이슨" ❌ → "다이슨 에어랩 vs 샤오미 비교" ✅)

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.
정확히 ${count}개의 키워드를 포함해야 합니다:
[
  {
    "keyword": "키워드 문구",
    "category": "카테고리명",
    "estimatedVolume": "높음/중간/낮음",
    "articleType": "single/compare/curation",
    "reason": "추천 이유 한줄"
  }
]
`
}

/** 월별 시즌 정보 */
function getSeasonInfo(month: number): string {
  const seasons: Record<number, string> = {
    1: '신년 목표, 설날 - 갓생 살기 IT 기기, 설날 효도 가전',
    2: '졸업/입학, 발렌타인 - 대학생 노트북, 명품 액세서리',
    3: '이사/혼수 시즌 - 신혼가전, 입주 가전 패키지, 대형 TV',
    4: '봄나들이, 결혼 - 프리미엄 유모차, 미러리스 카메라',
    5: '가정의 달 - 어버이날 명품, 어린이날 고가 완구',
    6: '여름 준비 - 에어컨, 제습기, 무풍 갤러리',
    7: '풀캉스, 캠핑 - 프리미엄 캠핑 냉장고, 빔프로젝터',
    8: '무더위 절정 - 얼음정수기 냉장고, 다이슨 선풍기',
    9: '추석, 가을 결혼 - 추석 VIP 선물, 김치냉장고',
    10: '캠핑 시즌, 가을 감성 - 감성 캠핑 오디오, 가습기',
    11: '블랙프라이데이 - 역대급 가전 세일, 아이폰',
    12: '크리스마스, 연말 - 크리스마스 선물, 명품 향수',
  }
  return seasons[month] || '일반 시즌'
}

/** Perplexity 응답에서 키워드 JSON 파싱 */
function parseKeywords(rawText: string): Array<{
  keyword: string
  category: string
  estimatedVolume: string
  articleType: string
  reason: string
}> {
  try {
    // JSON 블록 추출 시도
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      // 각 항목의 필수 필드 검증
      return parsed.filter((item: Record<string, unknown>) =>
        item && typeof item.keyword === 'string' && item.keyword.trim().length > 0
      ).map((item: Record<string, unknown>) => ({
        keyword: String(item.keyword).trim(),
        category: String(item.category || '기타').trim(),
        estimatedVolume: ['높음', '중간', '낮음'].includes(String(item.estimatedVolume))
          ? String(item.estimatedVolume) : '중간',
        articleType: ['single', 'compare', 'curation'].includes(String(item.articleType))
          ? String(item.articleType) : 'single',
        reason: String(item.reason || '').trim(),
      }))
    }
    return []
  } catch {
    console.warn('[keyword-suggest] JSON 파싱 실패, 텍스트 기반 파싱 시도')
    // 텍스트에서 키워드 추출 (폴백)
    const lines = rawText.split('\n').filter(l => l.trim() && !l.startsWith('{') && !l.startsWith('['))
    return lines.slice(0, 10).map(line => ({
      keyword: line.replace(/^[\d\-\.\*]+\s*/, '').trim(),
      category: '기타',
      estimatedVolume: '중간',
      articleType: 'single' as const,
      reason: ''
    }))
  }
}
