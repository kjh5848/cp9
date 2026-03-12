import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { perplexityModel } from '@/infrastructure/clients/perplexity';
import { AiResearchKeyword } from '@/entities/autopilot/model/types';

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

    // Perplexity API limitation: Better quality with ~5 items per request.
    const CHUNK_SIZE = 5;
    const numRequests = Math.ceil(count / CHUNK_SIZE);
    
    // Create parallel promises
    const promises = Array.from({ length: numRequests }).map(async (_, idx) => {
      // For each request, calculate how many items we need (last chunk might be smaller)
      const isLastChunk = idx === numRequests - 1;
      const itemsToFetch = isLastChunk && count % CHUNK_SIZE !== 0 ? count % CHUNK_SIZE : CHUNK_SIZE;

      const systemPrompt = `당신은 대한민국 최고 수준의 데이터 기반 SEO 마케터이자 커머스 전문가입니다.
사용자의 [초기 주제]를 실시간 웹 트렌드와 빙/구글 검색 결과를 통해 심층 분석하여, 결과적으로 가장 구매 전환율이 높은 ${itemsToFetch}개의 완벽한 "오토파일럿 블로그 발행 세트"를 JSON 형태로 반환하는 것입니다.

[블로거 페르소나 정보]
- 이름: ${persona.name}
- 역할 및 프롬프트: ${persona.systemPrompt}

[초기 주제]
"${topic}"

💡 필수 과제 (반드시 실시간 검색을 선행할 것)
1. 최근 한 달간 한국 시장에서 사람들이 이 주제와 관련하여 진짜 빈번하게 치는 구체적 검색어(트렌드/모델명 포함)를 파악하세요.
2. 구글, 네이버 상위 노출 블로그들의 어그로성 제목 구조와 그들이 비교/추천하는 아이템 개수(BEST 3 등)를 분석 및 벤치마킹하세요.

[5종 세트 구성 규칙]
- trafficKeyword: 서술어 금지. 일반 소비자가 검색창에 타이핑하는 2~4단어의 명사형 롱테일 키워드.
- coupangSearchTerm: 위 트래픽 키워드의 의도를 담되, 쿠팡 검색 시 검색결과가 나오도록 군더더기를 뺀 핵심 명사.
- blogTitle: 클릭률(CTR)이 높도록 도발적이고 매력적인 서술형 제목.
- recommendedItemCount: 리뷰글에 소개할 추천 상품 개수 (정수 1~5).
- intent: 대상 타겟 고객층과 검색 의도 요약.

[Output Format (Strict JSON Only)]
반드시 아래 JSON 구조로만 응답하세요. 백틱(\`\`\`)이나 추가 설명 텍스트 없이 순수 JSON만 반환해야 합니다.

{
  "recommendedSets": [
    {
      "trafficKeyword": "유입용 명사형 롱테일 키워드",
      "coupangSearchTerm": "쿠팡 소싱용 핵심 명사",
      "blogTitle": "클릭을 유발하는 강력한 제목",
      "recommendedItemCount": 3,
      "intent": "검색 의도 요약"
    }
  ]
}
`;

      try {
        const response = await perplexityModel.invoke([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `[${topic}]에 대한 기획 세트 ${itemsToFetch}개를 정확한 JSON 형식으로 배열에 담아 응답해주세요.` }
        ]);
        
        const rawContent = response.content.toString();
        
        // JSON 파싱 (마크다운 코드블록 등 제거)
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed.recommendedSets || [];
        } else {
          try {
             const parsed = JSON.parse(rawContent);
             return parsed.recommendedSets || [];
          } catch(e) {
             console.warn('Failed to parse single Perplexity response:', rawContent);
             return [];
          }
        }
      } catch (err) {
        console.error('Perplexity AI chunk error:', err);
        return [];
      }
    });

    const resultsArray = await Promise.all(promises);
    // Flatten array
    let finalKeywords: AiResearchKeyword[] = resultsArray.flat().filter(item => 
      item && item.trafficKeyword && item.coupangSearchTerm && item.blogTitle
    ).map(item => ({
      trafficKeyword: String(item.trafficKeyword),
      coupangSearchTerm: String(item.coupangSearchTerm),
      blogTitle: String(item.blogTitle),
      recommendedItemCount: Number(item.recommendedItemCount) || 3,
      intent: String(item.intent)
    }));
    
    // Deduplicate by trafficKeyword
    const uniqueKeywords = [];
    const seen = new Set();
    for (const kw of finalKeywords) {
      if (!seen.has(kw.trafficKeyword)) {
        seen.add(kw.trafficKeyword);
        uniqueKeywords.push(kw);
      }
    }
    
    // Ensure we don't exceed the originally requested count (in case extra were generated)
    uniqueKeywords.splice(count);

    return NextResponse.json({ 
      success: true, 
      count: uniqueKeywords.length, 
      data: uniqueKeywords 
    });

  } catch (error: any) {
    console.error('AI Research Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
