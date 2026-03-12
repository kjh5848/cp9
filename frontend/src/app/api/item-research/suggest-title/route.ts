import { NextRequest, NextResponse } from 'next/server';
import { createTextModel, PERSONA_DISPLAY_NAME } from '../pipeline/config';
import { getLangfuse } from '@/infrastructure/clients/langfuse';
import { getSeoSkillTemplate } from '../seo-skill-parser';
import { PERSONA_TEMPLATE_FILE } from '../pipeline/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleType, items, persona, textModel, titleModel, titleExamples, titleExclusions } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '상품 목록이 비어있습니다.' }, { status: 400 });
    }

    const finalPersonaName = persona === 'MASTER_CURATOR_H'
      ? '마스터 큐레이터 H'
      : PERSONA_DISPLAY_NAME[persona] || persona;

    // ── Langfuse 트레이싱 ──
    const langfuse = getLangfuse();
    const trace = langfuse?.trace({
      name: 'suggest-title-api',
      metadata: { persona, textModel, articleType, itemCount: items.length },
    });

    // ── 페르소나 가이드라인 ──
    const templateFile = PERSONA_TEMPLATE_FILE[persona] || PERSONA_TEMPLATE_FILE['IT'];
    const personaTemplate = await getSeoSkillTemplate(templateFile);

    const currentYear = new Date().getFullYear();

    // ── 시스템 프롬프트 ──
    const systemPrompt = `
너는 대한민국 최고의 SEO 블로그 전문 작가이자 '${finalPersonaName}'이다.
아래의 [블로그 작성 가이드라인]을 숙지하고, 사용자가 제시한 상품(들)을 주제로 **클릭을 유도하는 매력적인 블로그 제목(H1)**을 5개 제안하라.
제목은 검색 의도(Intent)를 파악하고 후킹(Hooking) 요소를 넣어 매력적으로 작성하라.
제목 외에 다른 부가적인 말은 절대 하지 말고, 오직 추천 제목만 JSON 배열(Array) 형식의 문자열로 응답하라.

[⚡ 중요: 연도 표기 규칙]
현재 연도는 ${currentYear}년이다. 제목에 연도가 들어갈 경우 반드시 "${currentYear}년"을 사용해야 하며, 2024년 등 과거 연도는 절대 사용하지 말 것.

[블로그 작성 가이드라인]
${personaTemplate}
    `.trim();

    // ── 상품 리스트 구성 ──
    const itemsList = items.map((item: any, i: number) => 
      `${i + 1}. ${item.productName} (${item.productPrice.toLocaleString()}원)`
    ).join('\n');

    // ── 유형에 따른 사용자 프롬프트 ──
    let userPrompt = '';
    if (articleType === 'single') {
      userPrompt = `
아래 [대상 상품]에 대해 리뷰, 심층 분석, 성과 테스트 등의 의도를 담은 매력적인 블로그 제목 후보 5개를 제안해라.
반드시 JSON 배열 형식 형태의 텍스트(예: ["제목1", "제목2", ...])로만 출력할 것.

[대상 상품]: ${items[0].productName}
      `.trim();
    } else if (articleType === 'compare') {
      userPrompt = `
아래 [비교 대상 상품들]을 서로 스펙과 장단점을 심층 비교하는 매력적인 블로그 제목 후보 5개를 제안해라. (예: A vs B 승자는?)
반드시 JSON 배열 형식 형태의 텍스트(예: ["제목1", "제목2", ...])로만 출력할 것.

[비교 대상 상품들]:
${itemsList}
      `.trim();
    } else if (articleType === 'curation') {
      userPrompt = `
아래 ${items.length}개의 [큐레이션 대상 상품들]을 추천 리스트 형태로 소개하는 매력적인 블로그 제목 후보 5개를 제안해라. (예: ${new Date().getFullYear()}년 가성비 추천 TOP ${items.length})
반드시 JSON 배열 형식 형태의 텍스트(예: ["제목1", "제목2", ...])로만 출력할 것.

[큐레이션 대상 상품들]:
${itemsList}
      `.trim();
    }

    userPrompt += `\n\n[필수 사항]\n위 조건에 맞는 블로그 제목 후보를 하나도 빠짐없이 **정확히 5개** 생성하세요.\n요청한 개수(5개)보다 적게 주거나 많이 주면 절대 안 됩니다. 반드시 5개의 배열 객체를 꽉 채워서 응답하세요.`;

    if (titleExamples?.trim()) {
      userPrompt += `\n\n[참고할 제목 스타일 예제 (Positive)]:\n${titleExamples}\n위 예제의 톤앤매너와 스타일을 참고하여 이와 비슷한 느낌으로 작성하세요.`;
    }
    if (titleExclusions?.trim()) {
      userPrompt += `\n\n[절대 사용 금지 포맷/단어 (Negative)]:\n${titleExclusions}\n위 포맷이나 단어는 어떠한 경우에도 제목에 포함하지 마세요.`;
    }

    const targetModel = titleModel || textModel || 'gpt-4o';

    const generation = trace?.generation({
      name: 'generate-suggested-titles',
      model: targetModel,
      input: { items: itemsList, articleType },
    });

    console.log(`💡 [Suggest-Title] ${targetModel}를 사용하여 제목 추천 생성 중... (${articleType})`);

    const modelInstance = createTextModel(targetModel);
    const aiResponse = await modelInstance.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    const resultText = aiResponse.content.toString();
    
    generation?.end({ output: resultText });
    await langfuse?.flushAsync();

    // ── 결과 파싱 (마크다운 포맷 제거 등 예외 처리) ──
    let parsedTitles: string[] = [];
    try {
      // JSON 파싱 전 포맷 정리 (` ```json ... ``` ` 제거 등)
      const cleanedText = resultText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      parsedTitles = JSON.parse(cleanedText);
      if (!Array.isArray(parsedTitles)) {
        throw new Error('응답이 배열 형식이 아닙니다.');
      }
      
      // 강제로 콜론(:) 제거
      parsedTitles = parsedTitles.map((t: string) => t.replace(/:/g, ' ').replace(/\s+/g, ' ').trim());
    } catch (e) {
      console.warn('AI JSON 응답 파싱 실패. 원본 응답:\n', resultText);
      // 만약 배열이 아니라 그냥 줄바꿈으로 주거나 숫자로 번호를 매겨 줬을 때 억지로 짜르기
      parsedTitles = resultText
        .split('\n')
        .map(t => t.replace(/^[0-9]+\.\s*/, '').replace(/^-\s*/, '').replace(/^"|"$/g, '').trim())
        .filter(t => t.length > 0)
        .slice(0, 5);
    }

    return NextResponse.json({ titles: parsedTitles, success: true });
    
  } catch (error: any) {
    console.error('Suggest title error:', error);
    return NextResponse.json({ error: error.message || '제목 생성에 실패했습니다.' }, { status: 500 });
  }
}
