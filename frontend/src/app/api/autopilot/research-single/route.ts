import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { perplexityModel } from '@/infrastructure/clients/perplexity';

export const maxDuration = 120; // Maximum timeout for long OpenAI/Perplexity requests

export async function POST(req: Request) {
  try {
    const { personaId, keyword } = await req.json();

    if (!keyword || !personaId) {
      return NextResponse.json({ error: 'Missing keyword or personaId' }, { status: 400 });
    }

    const persona = await prisma.persona.findUnique({
      where: { id: personaId }
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    const systemPrompt = `당신은 대한민국 최고 수준의 데이터 기반 SEO 마케터이자 커머스 전문가입니다.
사용자의 [초기 단일 키워드]를 실시간 웹 트렌드와 빙/구글 검색 결과를 통해 심층 분석하여, 완벽한 "오토파일럿 블로그 발행 메타데이터"를 한 개만 JSON 형태로 반환하는 것입니다.

[블로거 페르소나 정보]
- 이름: ${persona.name}
- 역할 및 프롬프트: ${persona.systemPrompt}

[초기 단일 키워드]
"${keyword}"

💡 필수 과제 (반드시 실시간 검색을 선행할 것)
1. 최근 한 달간 한국 시장에서 사람들이 이 키워드와 관련하여 진짜 빈번하게 치는 구체적 검색어(트렌드/모델명 포함)를 파악하세요.
2. 구글, 네이버 상위 노출 블로그들의 어그로성 제목 구조와 그들이 비교/추천하는 아이템 개수(BEST 3 등)를 분석 및 벤치마킹하세요.

[단일 키워드 메타데이터 구성 규칙]
- trafficKeyword: 서술어 금지. 일반 소비자가 검색창에 타이핑하는 2~4단어의 명사형 롱테일 키워드. (원본 키워드를 파생/구체화)
- coupangSearchTerm: 위 트래픽 키워드의 의도를 담되, 쿠팡 검색 시 검색결과가 나오도록 군더더기를 뺀 핵심 명사.
- recommendedItemCount: 리뷰글에 소개할 추천 상품 개수 (정수 1~5).
- intent: 대상 타겟 고객층과 검색 의도 요약.

[Output Format (Strict JSON Only)]
반드시 아래 JSON 구조로만 응답하세요. 백틱(\`\`\`)이나 추가 설명 텍스트 없이 순수 JSON만 반환해야 합니다.

{
  "singleResearchMeta": {
    "trafficKeyword": "유입용 명사형 롱테일 키워드",
    "coupangSearchTerm": "쿠팡 소싱용 핵심 명사",
    "recommendedItemCount": 3,
    "intent": "검색 의도 요약"
  }
}
`;

    const response = await perplexityModel.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `[${keyword}]에 대한 기획 메타데이터를 정확한 JSON 형식으로 응답해주세요.` }
    ]);
    
    const rawContent = response.content.toString();
    
    // JSON 파싱 (마크다운 코드블록 등 제거)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    let parsed: any;
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(rawContent);
    }

    return NextResponse.json({ result: parsed.singleResearchMeta || null });

  } catch (error) {
    console.error('[research-single] 에러:', error);
    return NextResponse.json({ error: 'Failed to research keyword' }, { status: 500 });
  }
}
