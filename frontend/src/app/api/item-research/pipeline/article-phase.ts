/**
 * Phase 2: LLM SEO 본문 생성
 * 프롬프트 빌더 + LLM 호출을 담당합니다.
 */
import { getSeoSkillTemplate } from '../seo-skill-parser'
import { PERSONA_TEMPLATE_FILE, createTextModel } from './config'
import type { PipelineContext } from './types'

/**
 * 시스템 프롬프트를 생성합니다.
 * 페르소나 역할 + 블로그 템플릿 가이드라인을 결합합니다.
 */
async function buildSystemPrompt(ctx: PipelineContext): Promise<string> {
  const templateFile = PERSONA_TEMPLATE_FILE[ctx.persona] || PERSONA_TEMPLATE_FILE['IT'];
  const personaTemplate = await getSeoSkillTemplate(templateFile);

  return `
너는 대한민국 최고의 SEO 블로그 전문 작가이자 '${ctx.finalPersonaName}'이다.
아래의 [블로그 작성 가이드라인]을 완벽히 숙지하고, 이후 지시하는 상품에 대해 마크다운 포맷의 블로그 포스팅을 작성하라.

[블로그 작성 가이드라인]
${personaTemplate}

[공통 절대 규칙]
1. 글은 반드시 H1(#) 제목으로 시작하라.
2. 가이드라인의 [필수 섹션 목차]를 반드시 순서대로 모두 포함하라.
3. 이모지와 아이콘을 제목 포함 어디에도 절대 삽입하지 마라. 위반 시 실패로 간주한다.
4. 마크다운 테이블은 반드시 올바른 문법으로 작성하라.
5. 목표 글자수를 채운 후에도 [자유 확장 영역]의 주제를 활용해 창의적으로 분량을 확보하라.
6. CTA 2줄은 글 마지막에 반드시 포함하라.
7. 반드시 아래 [대상 상품] 하나만을 주제로 작성하라. 다른 제품이나 카테고리 트렌드 기사로 변질되는 것을 절대 금지한다.
`;
}

/**
 * 사용자 프롬프트를 생성합니다.
 * articleType에 따라 개별/비교/큐레이션 프롬프트를 분기합니다.
 */
function buildUserPrompt(ctx: PipelineContext, researchData: string): string {
  const { articleType } = ctx;
  if (articleType === 'compare') return buildComparePrompt(ctx, researchData);
  if (articleType === 'curation') return buildCurationPrompt(ctx, researchData);
  return buildSinglePrompt(ctx, researchData);
}

/** 개별 발행 프롬프트 (기존 로직) */
function buildSinglePrompt(ctx: PipelineContext, researchData: string): string {
  const coupangUrl = ctx.body.productData?.productUrl
    || `https://www.coupang.com/vp/products/${ctx.body.itemId}`;
  const { charLimit } = ctx;
  const s1 = Math.round(charLimit * 0.08);
  const s2 = Math.round(charLimit * 0.22);
  const s3 = Math.round(charLimit * 0.28);
  const s4 = Math.round(charLimit * 0.18);
  const s5 = Math.round(charLimit * 0.12);
  const s6 = Math.round(charLimit * 0.12);

  return `
## 핵심 지시 (반드시 준수)
이 글은 반드시 아래 [대상 상품] 하나에 대한 리뷰/분석 글이어야 한다.
다른 상품들을 나열하거나 카테고리 트렌드 기사로 작성하는 것을 절대 금지한다.

[대상 상품]: ${ctx.body.itemName}
[쿠팡 구매 링크]: ${coupangUrl}

[최신 리서치 (Perplexity 검색 결과)]:
${researchData}

[목표 글자수]: 공백 포함 한국어 글자(Character) 기준으로 최소 ${charLimit}자 이상 작성.
※ 글자(Character)는 토큰(Token)이 아닙니다. 한글 한 글자 = 1자입니다. 이 분량 기준은 반드시 가장 최우선으로 준수되어야 합니다.

[작성 구조 지침 - 반드시 준수]:
1. 독자를 사로잡는 권위 있는 도입 (최소 ${s1}자 이상)
2. 제품 구매/사용 전 반드시 체크할 사항과 실생활 활용 가이드 (최소 ${s2}자 이상)
3. 스펙 및 장단점 비교 — 상세한 마크다운 테이블과 장/단점 요점 정리 (최소 ${s3}자 이상)
4. 실제 사용자 후기 분석 — 리서치 데이터 기반 후기 요약 및 패턴 분석 (최소 ${s4}자 이상)
5. 가격 및 구매 가이드 — 현재 가격, 할인 시즌, 최저가 구매 팁 (최소 ${s5}자 이상)
6. 최종 추천 코멘트 — 추천 대상/비추천 대상 명확히 구분 (최소 ${s6}자 이상)
7. CTA: 관련 상품 리뷰로 유도하는 문구

[강제 지침]:
- 각 섹션의 제목(h2, h3)은 자연스러운 블로그 소제목으로 작성하라. "도입부:", "오프닝:", "섹션 1:" 같은 구조적 라벨은 절대 사용하지 마라.
- 각 섹션별 최소 한국어 글자수 기준을 반드시 채우세요. 부족하면 더 깊은 분석과 사례를 추가하세요.
- 단순 반복은 절대 피하고 딥다이브 분석, 활용 팁, 비교 분석, 사용자 관점 등 깊이 있는 정보를 꾸준히 추가하세요.
- 전체 글의 한국어 글자(Character) 수가 ${charLimit}자 미만이면 아직 작성이 끝나지 않은 것입니다. 각 섹션을 더 상세히 확장하고, 추가 주제를 발굴하여 반드시 ${charLimit}자를 채우세요.
- 글 작성 중 중단하거나 요약하지 마세요. 목표 글자수를 달성할 때까지 계속 작성하세요.
- Perplexity 리서치 데이터의 최신 정보를 최우선으로 활용하세요.
- 글 본문 중 구매를 유도하는 CTA는 반드시 아래 마크다운 링크 형식으로 작성하세요:
  [쿠팡에서 최저가 확인하기](${coupangUrl})
- 이모지와 아이콘은 어디에도 사용하지 마라.
- 마크다운 취소선(~~텍스트~~)은 절대 사용하지 마라. 텍스트 비교 시 취소선 대신 일반 텍스트로 "대비", "비교" 등의 표현을 사용하라.

위 지침에 따라 지금 바로 마크다운 블로그 포스팅 전문을 작성하라.
`;
}

/** 비교 분석 글 프롬프트 (2~5개 아이템) */
function buildComparePrompt(ctx: PipelineContext, researchData: string): string {
  const items = ctx.body.items || [];
  const { charLimit } = ctx;
  const itemsList = items.map((item, i) =>
    `${i + 1}. **${item.productName}** — ${item.productPrice.toLocaleString()}원 | [구매 링크](${item.productUrl})`
  ).join('\n');

  return `
## 핵심 지시 (반드시 준수)
이 글은 아래 [비교 대상 상품들]을 하나의 글에서 상세히 비교 분석하는 글이어야 한다.

[비교 대상 상품들]:
${itemsList}

[최신 리서치 (Perplexity 검색 결과)]:
${researchData}

[목표 글자수]: 공백 포함 한국어 글자(Character) 기준으로 최소 ${charLimit}자 이상 작성.

[작성 구조 지침 - 반드시 준수]:
1. **도입부** — 이 비교를 왜 하는지, 독자가 어떤 고민을 갖고 있는지 공감하는 서론
2. **각 상품 개별 소개** — 상품별로 300~500자씩 핵심 특징과 장단점 소개
3. **스펙 비교 테이블** — 마크다운 테이블로 주요 스펙(가격, 배송, 핵심 사양)을 한눈에 비교
4. **항목별 상세 비교** — 가격, 성능, 디자인, 사용 편의성 등 각 항목별로 깊이 있는 비교
5. **장단점 종합 요약** — 각 상품의 장점과 단점을 간결하게 정리
6. **추천 대상별 결론** — "이런 분에게 추천", "가성비를 원한다면", "최고 성능을 원한다면" 등 타겟별 추천
7. **CTA** — 각 상품의 쿠팡 구매 링크 포함

[강제 지침]:
- 모든 상품을 공정하게 다루되, 명확한 비교 결론을 제시하라.
- 각 상품의 쿠팡 구매 링크를 본문 중 자연스럽게 삽입하라.
- 이모지와 아이콘은 어디에도 사용하지 마라.
- 마크다운 취소선(~~텍스트~~)은 절대 사용하지 마라.

위 지침에 따라 지금 바로 마크다운 비교 분석 블로그 포스팅 전문을 작성하라.
`;
}

/** 큐레이션 글 프롬프트 (3~50개 아이템 → 간략 소개형) */
function buildCurationPrompt(ctx: PipelineContext, researchData: string): string {
  const items = ctx.body.items || [];
  const itemCount = items.length;
  const { charLimit } = ctx;

  // 아이템 수별 권장 글자수
  let perItemChars = 300;
  if (itemCount <= 10) perItemChars = 300;
  else if (itemCount <= 20) perItemChars = 200;
  else if (itemCount <= 30) perItemChars = 150;
  else if (itemCount <= 40) perItemChars = 120;
  else perItemChars = 100;

  const itemsList = items.map((item, i) =>
    `${i + 1}. ${item.productName} — ${item.productPrice.toLocaleString()}원 | ${item.isRocket ? '로켓배송' : ''} | [구매](${item.productUrl})`
  ).join('\n');

  return `
## 핵심 지시 (반드시 준수)
이 글은 아래 [큐레이션 대상 상품 ${itemCount}개]를 TOP ${itemCount} 리스트 형식으로 소개하는 큐레이션 글이어야 한다.

[큐레이션 대상 상품들]:
${itemsList}

[최신 리서치 (Perplexity 검색 결과)]:
${researchData}

[목표 글자수]: 공백 포함 한국어 글자(Character) 기준으로 최소 ${charLimit}자 이상 작성.
[아이템당 권장 글자수]: 약 ${perItemChars}자

[작성 구조 지침 - 반드시 준수]:
1. **도입부** (~500자) — 이 큐레이션의 주제와 선정 기준을 간결하게 소개
2. **TOP ${itemCount} 리스트** — 각 상품을 순위별로 소개. 각 상품 소개는 다음 구조:
   - H3 소제목: 순위 + 상품명
   - 가격 및 배송 정보 (한 줄)
   - 핵심 특징 한줄평 (~${perItemChars}자)
   - 쿠팡 구매 링크
3. **마무리** (~500자) — 종합 추천과 선택 가이드

[강제 지침]:
- 각 상품 소개는 ~${perItemChars}자로 간결하게 작성하라. 장황하게 늘리지 마라.
- 모든 상품의 쿠팡 구매 링크를 반드시 포함하라.
- 순위에 대한 명확한 근거를 제시하라 (가격, 성능, 인기도 등).
- 이모지와 아이콘은 어디에도 사용하지 마라.
- 마크다운 취소선(~~텍스트~~)은 절대 사용하지 마라.

위 지침에 따라 지금 바로 마크다운 큐레이션 블로그 포스팅 전문을 작성하라.
`;
}

/**
 * LLM을 호출하여 SEO 본문(마크다운)을 생성합니다.
 */
export async function runArticlePhase(ctx: PipelineContext, researchData: string): Promise<string> {
  console.log(`✍️ [Phase 2] ${ctx.textModel} SEO 본문 작성 중...`);

  const generation = ctx.trace?.generation({
    name: 'phase2-llm-article',
    model: ctx.textModel,
    input: { note: '프롬프트 생략 (Langfuse에서 확인)' },
  });

  const systemPrompt = await buildSystemPrompt(ctx);
  const userPrompt = buildUserPrompt(ctx, researchData);

  try {
    const textInstance = createTextModel(ctx.textModel);
    const aiResponse = await textInstance.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
    const result = aiResponse.content.toString();
    console.log(`✅ [Phase 2] LLM 본문 생성 완료 (${result.length}자, 모델: ${ctx.textModel})`);
    generation?.end({ output: { length: result.length } });
    return result;
  } catch (err) {
    console.error(`[Phase 2] LLM API Error (${ctx.textModel}):`, err);
    generation?.end({ output: { error: String(err) }, level: 'ERROR' });
    return `# 작성 실패\n\n모델 API 호출 오류로 인해 글 생성을 실패했습니다. (Model: ${ctx.textModel})`;
  }
}
