/**
 * [API Route] POST /api/keyword-explore
 * 다차원 키워드 딥 리서치 API
 * Perplexity API를 활용하여 시드 단어를 바탕으로 입체적인 수익형 키워드를 발굴합니다.
 */
import { NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'

const perplexityKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY || 'placeholder'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { seedKeyword, targetCount = 15, targetAge, targetGender, category, searchIntent, searchModel = "sonar-pro", keywordType = "single" } = body as {
      seedKeyword: string;
      targetCount?: number;
      targetAge: string;
      targetGender: string;
      category: string;
      searchIntent: string;
      searchModel?: string;
      keywordType?: "single" | "topic" | "category";
    }

    if (!seedKeyword) {
      return NextResponse.json({ error: '시드 단어를 입력해주세요.' }, { status: 400 })
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    let intentInstructions = "";
    if (searchIntent === "info") {
      intentInstructions = `
[필수 파생 유형 분류]
1. problem-solving (문제해결형 / 정보제공형): 예) "강아지 털 날림 해결용 공기청정기", "(시드 단어) 사용법/원리/해결책"
* 오직 'problem-solving' 유형의 키워드만 추출하세요. 구매 전 정보 탐색 단계의 질문형(Long-tail) 키워드를 포함하세요.
`;
    } else if (searchIntent === "review") {
      intentInstructions = `
[필수 파생 유형 분류]
1. longtail (롱테일 리뷰형): 예) "소음 없는 가성비 (시드단어) 내돈내산 추천"
* 오직 'longtail' 유형의 키워드만 추출하세요. 상업적 의도(Commercial Intent)가 짙은 키워드, 즉 사용자가 실제 구매를 고려하며 후기를 찾는 '구매 직전'의 생생한 키워드를 포함하세요.
`;
    } else if (searchIntent === "compare") {
      intentInstructions = `
[필수 파생 유형 분류]
1. compare (비교견적형): 예) "(브랜드A) vs (브랜드B) 비교", "(시드단어) 장단점 스펙 비교"
* 오직 'compare' 유형의 키워드만 추출하세요. 2개 이상의 제품을 대조하거나 구매 결정을 위해 대안(Alternatives)을 찾는 고관여(High-Intent) 키워드를 포함하세요.
`;
    } else {
      intentInstructions = `
[필수 파생 유형 분류]
1. longtail (롱테일형): 타겟팅이 명확한 틈새 시장 키워드 (예: 소음 없는 가성비 로봇청소기 추천)
2. compare (비교견적형): 대안을 찾거나 결정을 내리려는 키워드 (예: 로보락 S8 vs 에코백스 디봇 비교)
3. problem-solving (문제해결형): 구체적인 페인포인트를 해결하려는 질문형 키워드 (예: 강아지 털 날림 해결용 공기청정기)
* 위 3가지 유형을 전략적으로 배분하여, 경쟁도가 낮으면서도 전환율(Conversion Rate)이 높은 '핵심 수익형 키워드' 위주로 발굴하세요. 예상 검색량(estimatedVolume), 수익성(profitability), 경쟁도(competition)는 시장 상황을 추정하여 '높음', '중간', '낮음' 중 하나로 표기하세요.
`;
    }

    let typeInstructions = "";
    if (keywordType === "single") {
      typeInstructions = `
[키워드 발굴 형태: 단일 키워드 파생 (Single)]
- 입력된 시드 단어를 중심축으로 삼아, 앞뒤로 수식어가 붙거나 더 구체적인 상황을 묘사하는 "직접적인 파생 롱테일 키워드" 위주로 발굴하세요.
- 시드 단어의 의도에서 벗어나지 않고, 직관적으로 연결되는 세부 검색어를 도출하는 데 집중하세요.
`;
    } else if (keywordType === "topic") {
      typeInstructions = `
[키워드 발굴 형태: 주제/클러스터 기반 확장 (Topic)]
- 시드 단어와 직접적으로 같은 단어가 포함되지 않더라도, 해당 '주제망(Topic Cluster)'이나 '연관 의미망(LSI)'에 속하는 위성 주제들을 폭넓게 발굴하세요.
- 사용자가 시드 단어를 검색하기 전이나 후에 검색할 만한 인접 맥락의 키워드를 포함하여 다차원적인 관점을 제시하세요.
`;
    } else if (keywordType === "category") {
      typeInstructions = `
[키워드 발굴 형태: 카테고리 캠페인용 구조화 (Category)]
- 시드 단어가 속한 전체 카테고리(매크로)를 아우를 수 있도록, 대표적인 '하위 분류(Sub-category)' 특성을 띄는 구조화된 마스터 키워드(Master Keywords) 위주로 발굴하세요.
- 각 키워드가 전체 캠페인의 하나의 카테고리 기둥(Pillar) 역할을 수행할 수 있도록, 적당한 검색 볼륨과 대표성을 지닌 키워드들을 선별하세요.
`;
    }

    const prompt = `
당신은 10년 이상의 경력을 가진 대한민국 최고 수준의 SEO 최적화 및 제휴 마케팅(Affiliate Marketing) 전략가이자 데이터 분석가입니다.
현재 ${currentYear}년 ${currentMonth}월입니다. 

당신의 목표는 제시된 [탐색 조건]을 바탕으로, 높은 전환율(High CVR)과 수익(EPC) 창출이 기대되면서도 상대적으로 경쟁도가 낮은(Low Competition) "퍼플 오션(Purple Ocean)" 타겟 키워드 ${targetCount}개를 발굴하는 것입니다.
구글(Google), 네이버(Naver), Perplexity 와 같은 검색 엔진 및 AI 검색 환경에서 사람들이 실제 구매 또는 강한 정보 탐구 의도로 검색하는 생생한 "롱테일(Long-tail)" 키워드를 찾아주세요. 

[탐색 조건]
- 시드 단어: "${seedKeyword}"
- 타겟 연령: ${targetAge}
- 타겟 성별: ${targetGender}
- 관련 카테고리: ${category}
- 타겟 검색 의도: ${searchIntent}

[키워드 발굴 전략 가이드라인]
1. 단순한 단답형 명사 대신, 사용자의 '의도(Intent)'가 담긴 구체적인 2~4어절 이상의 롱테일 키워드를 우선합니다.
2. 제휴 마케팅을 통한 수익화를 고려하여, 잠재 고객의 'Pain Point(불편함)'나 'Desire(욕망)'를 정확히 건드리는 키워드여야 합니다.
3. 경쟁이 너무 치열한 메인 키워드(예: "공기청정기")보다는, 타겟이 세분화된 세부 키워드(예: "원룸 냄새 제거용 미니 공기청정기 추천")를 도출하세요.
4. AI 검색(Perplexity, ChatGPT 등) 환경에서 자주 쓰이는 '대화형/질문형(Conversational search)' 쿼리도 고려하세요.

${typeInstructions}

${intentInstructions}

추천 글 유형(expectedArticleType)은 다음 중 하나여야 합니다:
- 'single' (특정 모델에 대한 심층 리뷰 및 내돈내산 스타일)
- 'compare' (2~3개 제품의 스펙, 가격, 장단점을 명확히 비교)
- 'curation' (특정 상황/타겟에 맞는 Top 5 제품 추천 가이드)

반드시 아래 JSON 배열 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명 없이 오직 JSON 배열만 출력하세요.
[
  {
    "keyword": "발굴된 다이렉트 롱테일 키워드 (예: 30대 직장인 거북목 예방 모니터암 추천)",
    "mainKeyword": "위 롱테일 키워드의 핵심이 되는 단일 주제어 (예: 모니터암)",
    "category": "위 키워드가 속하는 명확한 상품 카테고리 (예: 가전/디지털, 생활용품 등 우리 서비스 맞춤 분류)",
    "type": "longtail" | "compare" | "problem-solving",
    "estimatedVolume": "높음" | "중간" | "낮음",
    "profitability": "높음" | "중간" | "낮음",
    "competition": "높음" | "중간" | "낮음",
    "expectedArticleType": "single" | "compare" | "curation",
    "reason": "해당 키워드가 왜 검색량 대비 수익화에 유리한지(또는 사용자 검색 의도가 무엇인지) 전문적인 시각에서 1~2줄로 요약"
  }
]
`
    const exploreModel = new ChatOpenAI({
      apiKey: perplexityKey,
      modelName: searchModel,
      configuration: { baseURL: 'https://api.perplexity.ai' },
      maxRetries: 1,
      temperature: 0.7,
    });

    const res = await exploreModel.invoke(prompt)
    const rawText = res.content.toString()
    
    let parsedData: any[] = [];
    try {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
         const parsed = JSON.parse(jsonMatch[0]);
         parsedData = parsed.map((item: any) => ({
           keyword: String(item.keyword || "").trim(),
           mainKeyword: String(item.mainKeyword || item.keyword || "").trim(),
           category: String(item.category || "기타").trim(),
           type: item.type || "longtail",
           estimatedVolume: item.estimatedVolume || "중간",
           profitability: item.profitability || "중간",
           competition: item.competition || "중간",
           expectedArticleType: item.expectedArticleType || "single",
           reason: String(item.reason || "").trim()
         }));
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
