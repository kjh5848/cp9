/**
 * Phase 2: LLM SEO 본문 생성
 * 프롬프트 빌더 + LLM 호출을 담당합니다.
 */
import { getSeoSkillTemplate } from '../seo-skill-parser'
import { PERSONA_TEMPLATE_FILE, createTextModel, getFallbackModel } from './config'
import type { PipelineContext } from './types'

/**
 * 시스템 프롬프트를 생성합니다.
 * 페르소나 역할 + 블로그 템플릿 가이드라인을 결합합니다.
 */
async function buildSystemPrompt(ctx: PipelineContext): Promise<string> {
  // 기본 템플릿 파일 로드 (IT 폴백 사용)
  const templateFile = PERSONA_TEMPLATE_FILE[ctx.persona] || PERSONA_TEMPLATE_FILE['IT'];
  const personaTemplate = await getSeoSkillTemplate(templateFile);

  // DB에서 가져온 커스텀 페르소나가 있는 경우 우선 사용
  if (ctx.personaSystemPrompt || ctx.personaToneDesc) {
    const sysPrompt = ctx.personaSystemPrompt || `당신은 대한민국 최고의 SEO 블로그 전문 작가이자 '${ctx.finalPersonaName}'입니다.`;
    const toneDesc = ctx.personaToneDesc || '';
    const negativePrompt = ctx.personaNegativePrompt ? `\n[절대 피해야 할 내용/단어 (Negative Prompt)]\n${ctx.personaNegativePrompt}` : '';

    return `
${sysPrompt}
아래의 [블로그 작성 가이드라인] 및 [톤앤매너]를 완벽히 숙지하고 포스팅하라.

[블로그 작성 가이드라인]
${personaTemplate}

[톤앤매너 및 스타일 가이드]
${toneDesc}
${negativePrompt}

[공통 절대 규칙]
1. 글은 반드시 H1(#) 제목으로 시작하라.
2. 가이드라인의 [필수 섹션 목차]를 반드시 순서대로 모두 포함하라.
3. 이모지와 아이콘을 제목 포함 글의 어느 위치에도 절대 삽입하지 마라. 위반 시 실패로 간주한다.
4. 마크다운 테이블은 반드시 올바른 문법으로 작성하라.
5. 구매 유도 CTA 링크는 지침에 따라 전략적으로 분산 배치하라.
6. 반드시 아래 [대상 상품]만을 주제로 작성하라.
7. [블록별 정렬 규칙 - 반드시 준수]:
   - 본문 단락(p): 양쪽 정렬(justify). 각 <p> 태그에 style="text-align:justify" 를 적용 가능하도록 자연스러운 문장으로 작성하라.
   - 제목(h1, h2, h3, h4): 왼쪽 정렬(left). 기본값이므로 별도 지정 불필요.
   - CTA 영역 (구매 링크, 추천 문구): 중앙 정렬(center). "쿠팡에서 최저가 확인하기" 등 CTA 문구는 독립된 문단으로 작성하라.
   - 이미지/캡션: 중앙 정렬(center).
   - 테이블: 왼쪽 정렬(left).
`;
  }

  // 커스텀 페르소나가 없는 경우 (기존 레거시 파일 기반 폴백)
  return `
너는 대한민국 최고의 SEO 블로그 전문 작가이자 '${ctx.finalPersonaName}'이다.
아래의 [블로그 작성 가이드라인]을 완벽히 숙지하고, 이후 지시하는 상품에 대해 마크다운 포맷의 블로그 포스팅을 작성하라.

[블로그 작성 가이드라인]
${personaTemplate}

[공통 절대 규칙]
1. 글은 반드시 H1(#) 제목으로 시작하라.
2. 가이드라인의 [필수 섹션 목차]를 반드시 순서대로 모두 포함하라.
3. 이모지와 아이콘을 제목 포함 글의 어느 위치에도 절대 삽입하지 마라. 위반 시 실패로 간주한다.
4. 마크다운 테이블은 반드시 올바른 문법으로 작성하라.
5. 목표 글자수를 채운 후에도 [자유 확장 영역]의 주제를 활용해 창의적으로 분량을 확보하라.
6. 구매 유도 CTA 링크는 지침에 따라 전략적으로 분산 배치하라.
7. 반드시 아래 [대상 상품] 하나만을 주제로 작성하라. 다른 제품이나 카테고리 트렌드 기사로 변질되는 것을 절대 금지한다.
8. [블록별 정렬 규칙 - 반드시 준수]:
   - 본문 단락(p): 양쪽 정렬(justify). 각 <p> 태그에 style="text-align:justify" 를 적용 가능하도록 자연스러운 문장으로 작성하라.
   - 제목(h1, h2, h3, h4): 왼쪽 정렬(left). 기본값이므로 별도 지정 불필요.
   - CTA 영역 (구매 링크, 추천 문구): 중앙 정렬(center). "쿠팡에서 최저가 확인하기" 등 CTA 문구는 독립된 문단으로 작성하라.
   - 이미지/캡션: 중앙 정렬(center).
   - 테이블: 왼쪽 정렬(left).
`;
}

/**
 * 사용자 프롬프트를 생성합니다.
 * articleType에 따라 개별/비교/큐레이션 프롬프트를 분기합니다.
 */
function buildUserPrompt(ctx: PipelineContext, researchData: string): string {
  const { articleType } = ctx;
  // 키워드 모드: 상품 데이터 없이 키워드+제목 기반 프롬프트
  if (ctx.body.keywordMode) return buildKeywordPrompt(ctx, researchData);
  if (articleType === 'compare') return buildComparePrompt(ctx, researchData);
  if (articleType === 'curation') return buildCurationPrompt(ctx, researchData);
  return buildSinglePrompt(ctx, researchData);
}

/** 개별 발행 프롬프트 (기존 로직) */
function buildSinglePrompt(ctx: PipelineContext, researchData: string): string {
  const coupangUrl = ctx.body.productData?.productUrl
    || `https://www.coupang.com/vp/products/${ctx.body.itemId}`;
  const { charLimit } = ctx;
  return `
## 핵심 지시 (반드시 준수)
이 글은 반드시 아래 [대상 상품] 하나에 대한 깊이 있는 리뷰/분석 글이어야 한다.
다른 상품들을 단순히 나열하거나 카테고리 트렌드 기사로 작성하는 것을 절대 금지한다.

[대상 상품]: ${ctx.body.itemName}
[쿠팡 구매 링크]: ${coupangUrl}

[최신 리서치 (Perplexity 검색 결과)]:
${researchData}

[목표 글자수]: 공백 포함 한국어 글자(Character) 기준으로 최소 ${charLimit}자 이상 작성.
※ 글자(Character)는 토큰(Token)이 아닙니다. 한글 한 글자 = 1자입니다. 이 분량은 반드시 최우선으로 준수해야 한다.

[작성 구조 지침 - 목차 구성]:
- 위 리서치 데이터를 바탕으로, 독자의 시선을 사로잡고 구매 욕구를 자극할 수 있는 최적의 **블로그 목차를 기획**하여 작성하라.
- **최우선 전개 논리 [PAS 공식]**: 이 글은 반드시 PAS(Problem-Agitation-Solution) 프레임워크를 기반으로 작성되어야 한다. 
  1) **Problem (문제 제기)**: 독자가 겪고 있는 불편함이나 고민을 콕 집어 공감을 유도한다.
  2) **Agitation (고통 심화)**: 그 문제를 방치했을 때의 스트레스나 손해를 부각시켜 긴장감을 조성한다.
  3) **Solution (해결책 제시)**: 이 대상 상품이 그 모든 문제를 어떻게 완벽히 해결해주는지 상세히 증명한다.
- 서론 이후의 본문 구조는 위 PAS 로직, 페르소나 특성, 리서치 정보를 바탕으로 AI가 가장 설득력 있는 형태로 자유롭게 기획하라.

[강제 지침]:
- 각 섹션의 제목(h2, h3)은 자연스러운 블로그 소제목으로 작성하라. "도입부:", "섹션 1:" 같은 라벨은 절대 사용 금지.
- 전체 한국어 글자수가 목표 분량에 도달하도록 각 섹션을 매우 깊이 있게 작성하라. (단순 반복 금지)
- Perplexity 리서치 데이터의 최신 정보를 최우선으로 활용할 것.
- **[중요 - 인트로 및 분산 CTA 배치]**: 
  - 서론부에서 독자의 아픈 곳(Problem)을 짚고 해결책(Solution)을 처음 언급하는 시점에 첫 추천 CTA를 선제 배치할 것.
  - 인트로 CTA 외에도, 구매 의향이 높아지는 본문 핵심 기능 소개 후, 그리고 결론부에 최소 **3곳 이상** 분산 배치하라.
- **[CTA 삽입 포맷 - 매크로 사용]**: 구매 링크가 들어가야 할 최적의 위치(새로운 문단)에 정확히 \`[[[CTA_BUTTON:\${coupangUrl}]]]\` 이라는 텍스트 매크로만 단독으로 삽입하라. (대괄호 3개 필수, 콜론 뒤에 URL 삽입) 다른 HTML이나 부가적인 앞뒤 설명 텍스트를 절대 붙이지 마라.
- **[금지어 및 기호 규칙 - 필수 준수]**:
  - '결론', '결론적으로' 이라는 단어는 어떠한 경우에도 절대 사용금지.
  - 제목, 소제목, 본문 등 글의 모든 부분에서 콜론(:) 기호 사용 절대 금지. (단, URL 주소나 매크로에는 예외적으로 허용)
- **[🇰🇷 Humanizer: 자연스러운 한국어 지침 - 필수 준수]**:
  1. [쉼표 자제] '하지만,', '그리고,' 등 접속사 뒤나 문장 중간에 불필요한 영어식 쉼표를 찍지 마라.
  2. [AI 어휘 금지] '중요하다', '핵심적이다', '효과적이다', '지속가능한', '혁신적', '알아보겠습니다' 등의 기계적인 구문 및 한자어를 절대 피하라.
  3. [문장 구조 변주] 3박자 리스트 나열을 피하고 문장 길이를 다양하게 섞어 리듬감을 주어라. '~들' 같은 복수형 남발을 금지한다.
- **[절대 이모지/아이콘 사용 금지]**: 어떠한 종류의 이모지도 글 전체에 절대 사용하지 마라.
- 마크다운 취소선(~~텍스트~~)은 절대 사용하지 마라.
${ctx.imageModel === 'none' ? '- **[중요]** 내부 이미지 생성 기능이 꺼져 있으므로, 글 내부에 `[이미지 제안: ...]` 형태의 텍스트를 절대 생성하지 마라.' : '- **[중요 필수]** 주제가 전환되는 주요 섹션(H2, H3)마다 본문 사이에 반드시 `[이미지 제안: 검색어/상황 묘사]` 형태의 텍스트를 삽입하라.'}

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

[작성 구조 지침 - 목차 구성]:
- 위 리서치 데이터를 바탕으로, 독자가 각 제품의 차이를 쉽게 이해하고 선택할 수 있는 **최적의 비교 매트릭스 흐름을 기획**하라.
- **최우선 전개 논리 [PAS 또는 QUEST 공식]**: 
  독자의 고민과 선택의 어려움을 공감/자극하고, 이 비교 분석이 명확한 해결책(Solution)이 됨을 입증하는 심리학적 흐름으로 구성하라.
- 서론 이후의 본문 구조는 AI가 가장 설득력 있는 형태로 자유롭게 기획하되, 독자가 차이점을 쉽게 이해하고 타겟별 최적의 선택을 할 수 있도록 유도하라.

[강제 지침]:
- 모든 상품을 공정하게 다루되, 명확한 비교 결론과 추천 대상을 제시하라.
- **[중요 - 인트로 및 개별 상품 CTA 분산 배치]**: 
  - 서론부 흥미 유발 직후, 가장 강력히 추천하는 1위(탑 픽) 모델에 대한 선제적 CTA 장착.
  - 각 상품에 대한 상세 설명(스펙/장단점)이 끝나는 영역마다 개별 상품을 위한 CTA 삽입.
- **[CTA 삽입 포맷 - 매크로 사용]**: 각 위치에서 정확히 단독 줄에 \`[[[CTA_BUTTON:해당상품의 쿠팡 구매링크 URL]]]\` 매크로만 삽입하라. (예: \`[[[CTA_BUTTON:https://www.coupang.com/...]]]\`) 다른 부가적인 HTML은 일체 사용하지 마라.
- **[금지어 및 기호 규칙 - 필수 준수]**:
  - '결론', '결론적으로' 이라는 단어는 어떠한 경우에도 절대 사용금지.
  - 제목, 소제목, 본문 등 글의 모든 부분에서 콜론(:) 기호 사용 절대 금지. (단, URL 주소나 매크로에는 예외적으로 허용)
- **[🇰🇷 Humanizer: 자연스러운 한국어 지침 - 필수 준수]**:
  1. [쉼표 자제] 불필요한 영어식 쉼표 배치를 피하고 한국어 호흡에 맞게 작성하라.
  2. [AI 어휘 금지] '핵심적이다', '효과적이다', '지속가능한', '놀라운' 등의 과장되거나 기계적인 번역투 어휘 사용 금지.
  3. [구조 다양화] 불필요한 대명사(이것, 저것)와 지관형사 사용을 줄이고, 나열식 3박자 문장을 피하라.
- **[절대 이모지/아이콘 사용 금지]**: 어떠한 이모지나 기호도 절대 삽입하지 마라.
- 마크다운 취소선(~~텍스트~~)은 절대 사용하지 마라.
${ctx.imageModel === 'none' ? '- **[중요]** 글 내부에 `[이미지 제안: ...]` 형태의 텍스트를 절대 생성하지 마라.' : '- **[중요 필수]** 주제가 전환되는 주요 섹션(H2, H3)마다 본문 사이에 반드시 `[이미지 제안: 상품명/형태 묘사]` 형태의 텍스트를 삽입하라.'}

위 지침에 따라 지금 바로 마크다운 비교 분석 블로그 포스팅 전문을 작성하라.
`;
}

/** 큐레이션 글 프롬프트 (3~50개 아이템 → 간략 소개형) */
function buildCurationPrompt(ctx: PipelineContext, researchData: string): string {
  const items = ctx.body.items || [];
  const itemCount = items.length;
  const { charLimit } = ctx;

  // 큐레이션에서는 charLimit이 '아이템당 목표 분량'을 의미함
  const perItemChars = charLimit || 300;
  const totalCharLimit = (perItemChars * itemCount) + 1000; // 도입/결론 분량 추가

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

[목표 글자수]: 공백 포함 한국어 글자(Character) 기준으로 총 ${totalCharLimit}자 이상 작성.
[아이템당 권장 글자수]: 약 ${perItemChars}자

[작성 구조 지침 - 목차 구성]:
- 위 리서치 데이터를 바탕으로, 독자가 스크롤을 내리며 각 아이템의 가치를 빠르게 파악할 수 있는 **최적의 큐레이션 목차를 기획**하라.
- **최우선 전개 논리 [QUEST 공식]**: 
  1) **Qualify**: 특정 대상을 한정 짓거나 호기심을 유발하며 시작
  2) **Understand**: 독자의 니즈를 완벽하게 공감하며 시작
  3) **Educate**: 추천 아이템들이 왜 정답에 가까운지 정보성으로 나열
  4) **Stimulate**: 이 기회를 놓쳐서는 안되는 이유 부각
  5) **Transition**: 최종 결정 및 행동 유도 기조
- 본문은 위 공식을 베이스로 각 상품의 매력을 배가시키며 AI가 자유롭고 일관성 있게 기획하라.

[강제 지침]:
- 각 상품 소개는 최소 \${perItemChars}자 이상 확보하여 상세히 분석할 것.
- **[중요 - 인트로 및 각 상품 CTA 개별 배치]**: 서론부에서 1위 상품에 대해 선제 안내를 하고, 소개되는 각 상품 설명 및 리서치가 끝나는 하단마다 해당 상품을 위한 CTA를 매번 삽입하라.
- **[CTA 삽입 포맷 - 매크로 사용]**: 각 위치에서 정확히 단독 줄에 \`[[[CTA_BUTTON:해당상품의 쿠팡 구매링크 URL]]]\` 매크로만 삽입하라. (예: \`[[[CTA_BUTTON:https://www.coupang.com/...]]]\`) 다른 부가적인 HTML은 일체 사용하지 마라.
- **[금지어 및 기호 규칙 - 필수 준수]**:
  - '결론', '결론적으로' 이라는 단어는 어떠한 경우에도 절대 사용금지.
  - 제목, 소제목, 본문 등 글의 모든 부분에서 콜론(:) 기호 사용 절대 금지. (단, URL 주소나 매크로에는 예외적으로 허용)
- **[🇰🇷 Humanizer: 자연스러운 한국어 지침 - 필수 준수]**:
  1. [쉼표 자제] 접속사 뒤 불필요한 쉼표 금지.
  2. [자연스러운 어휘] 기계적인 단어('알아보겠습니다', '혁신적', '최적의 선택입니다')를 지양하고 자연스러운 리뷰 톤 사용.
  3. [문장 구조 변주] 짧은 문장과 긴 문장을 섞어 쓰고, 명사화 구문(~함에 있어, ~하는 것입니다)을 피하라.
- 순위나 추천에 대한 명확한 근거(가격, 성능, 인기도 등)를 논리적으로 작성하라.
- **[절대 이모지/아이콘 사용 금지]**: 이모지나 기호는 글 전체 어디에도 사용하지 마라. 
- 마크다운 취소선(~~텍스트~~)은 절대 사용하지 마라.
${ctx.imageModel === 'none' ? '- **[중요]** 글 내부에 `[이미지 제안: ...]` 형태의 텍스트를 절대 생성하지 마라.' : '- **[중요 필수]** 각 상품 소개 섹션마다 본문 사이에 반드시 `[이미지 제안: 상품명/특징 묘사]` 형태의 텍스트를 삽입하라.'}

위 지침에 따라 지금 바로 마크다운 큐레이션 블로그 포스팅 전문을 작성하라.
`;
}

/** 키워드 모드 전용 프롬프트 (상품 데이터 없이 키워드+제목으로 글 작성) */
function buildKeywordPrompt(ctx: PipelineContext, researchData: string): string {
  const { keyword, selectedTitle } = ctx.body.keywordMode!;
  const { charLimit, articleType } = ctx;

  const articleTypeGuide = articleType === 'compare'
    ? '이 글은 여러 제품/옵션을 비교 분석하는 형태로 작성하세요. 스펙 비교 테이블이 반드시 포함되어야 합니다.'
    : articleType === 'curation'
      ? '이 글은 여러 추천 아이템을 리스트 형태로 소개하는 큐레이션 글로 작성하세요.'
      : '이 글은 주제에 대한 심층 분석 및 구매 가이드 형태로 작성하세요.';

  return `
## 핵심 지시 (반드시 준수)
이 글은 아래 [키워드]에 대한 SEO 최적화 블로그 포스팅이다.
반드시 아래의 [확정 제목]을 H1 제목(# )으로 사용하라. 제목을 변경하는 것을 절대 금지한다.

[키워드]: ${keyword}
[확정 제목]: ${selectedTitle}
[글 유형 지침]: ${articleTypeGuide}

[최신 리서치 (Perplexity 검색 결과)]:
${researchData}

[목표 글자수]: 공백 포함 한국어 글자(Character) 기준으로 최소 ${charLimit}자 이상 작성.
※ 글자(Character)는 토큰(Token)이 아닙니다. 한글 한 글자 = 1자입니다.

[작성 구조 지침 - 목차 구성]:
- [글 유형 지침]과 검색된 리서치 데이터를 바탕으로, 독자가 정보를 쉽게 얻고 구매를 결심할 수 있는 **논리적인 블로그 목차를 기획**하라.
- **최우선 전개 논리 [PAS 공식] 또는 [AIDA 공식]**: 독자의 심리를 유도할 수 있는 전문적인 카피라이팅 기법(문제 제기 후 해결책 제시 등)을 도입하여 전체 구조를 짤 것.
- **도입부(인트로)**: 공감할 만한 훅(Hook) 카피 이후, 관련 [이미지 제안: ...]과 함께 쿠팡 살펴보기 커스텀 HTML 버튼을 1회 선제 장착하여 이탈을 억제하라.
- 서론 이후의 본문 구조는 위 설득 공식 및 리서치 데이터를 통해 AI가 목적지향적인 최적의 흐름으로 목차를 생성해 진행하라.

[강제 지침]:
- 제목 및 섹션별로 분량을 넉넉하게 확장하여 최종 목표 한국어 글자수를 반드시 돌파할 것.
- 리서치 데이터에서 파악된 제품명, 특징, 스펙 등을 적극 활용할 것.
- **[중요 - CTA 분산 배치 규칙]**: 서론부 선제 배치, 핵심 전환 포인트, 최종 결론 등 최소 **3곳** 이상에 CTA 삽입 위치 지정.
- **[CTA 삽입 포맷 - 매크로 사용]**: 직접적인 HTML 코딩이나 링크 삽입 대신, 단독 줄에 오로지 \`[[[CTA_BUTTON:추천할쿠팡URL]]]\` 이라는 텍스트 매크로만 작성하라. 콜론 뒤에 연결할 쿠팡 URL(기본: \`https://www.coupang.com\`)을 넣어라.
- **[금지어 및 기호 규칙 - 필수 준수]**:
  - '결론', '결론적으로' 이라는 단어는 어떠한 경우에도 절대 사용금지.
  - 제목, 소제목, 본문 등 글의 모든 부분에서 콜론(:) 기호 사용 절대 금지. (단, URL 주소나 매크로에는 예외적으로 허용)
- **[🇰🇷 Humanizer: 자연스러운 한국어 지침 - 필수 준수]**:
  1. [쉼표 자제] 불필요한 쉼표로 문장 호흡을 방해하지 마라.
  2. [AI 어휘 금지] '핵심적이다', '놀랍게도', '알아보았습니다' 등의 AI 전형적 어휘 금지.
  3. [구조 다양화] 문장 길이에 변주를 주어 리듬감을 살리고, 대명사(이부분, 저부분) 사용을 줄여라.
- **[절대 이모지/아이콘 사용 금지]**: 글 내부 어떤 요소에도 이모지는 허용 불가.
- 마크다운 취소선(~~텍스트~~)은 절대 사용하지 마라.
${ctx.imageModel === 'none' ? '- **[중요]** 글 내부에 `[이미지 제안: ...]` 형태의 텍스트를 절대 생성하지 마라.' : '- **[중요 필수]** 주제가 전환되는 주요 섹션(H2, H3)마다 본문 사이에 반드시 `[이미지 제안: 검색어/상황 묘사]` 형태의 텍스트를 삽입하라.'}

위 지침에 따라 지금 바로 마크다운 블로그 포스팅 전문을 작성하라.
`;
}

/**
 * LLM API를 호출하는 내부 헬퍼 함수
 */
async function callLlm(modelName: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const textInstance = createTextModel(modelName);
  const aiResponse = await textInstance.invoke([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);
  return aiResponse.content.toString();
}

/**
 * LLM을 호출하여 SEO 본문(마크다운)을 생성합니다.
 * 실패 시 폴백 모델로 자동 재시도합니다.
 */
export async function runArticlePhase(ctx: PipelineContext, researchData: string): Promise<{ content: string, title: string | null }> {
  console.log(`✍️ [Phase 2] ${ctx.textModel} SEO 본문 작성 중...`);

  const generation = ctx.trace?.generation({
    name: 'phase2-llm-article',
    model: ctx.textModel,
    input: { note: '프롬프트 생략 (Langfuse에서 확인)' },
  });

  const systemPrompt = await buildSystemPrompt(ctx);
  const userPrompt = buildUserPrompt(ctx, researchData);

  // 1차 시도: 원래 모델
  try {
    const result = await callLlm(ctx.textModel, systemPrompt, userPrompt);
    const titleMatch = result.match(/^#\s+(.+)$/m);
    const extractedTitle = titleMatch ? titleMatch[1].trim() : null;

    console.log(`✅ [Phase 2] LLM 본문 생성 완료 (${result.length}자, 모델: ${ctx.textModel}, 추출된 제목: ${extractedTitle || '없음'})`);
    generation?.end({ output: { length: result.length, title: extractedTitle } });
    return { content: result, title: extractedTitle };
  } catch (primaryErr) {
    console.error(`⚠️ [Phase 2] 1차 모델 실패 (${ctx.textModel}):`, primaryErr);

    // 2차 시도: 폴백 모델로 자동 재시도
    const fallbackModel = getFallbackModel(ctx.textModel);
    if (fallbackModel && fallbackModel !== ctx.textModel) {
      console.log(`🔄 [Phase 2] 폴백 모델로 재시도: ${ctx.textModel} → ${fallbackModel}`);

      const fallbackGen = ctx.trace?.generation({
        name: 'phase2-llm-article-fallback',
        model: fallbackModel,
        input: { note: `폴백 재시도 (원래 모델: ${ctx.textModel})` },
      });

      try {
        const fallbackResult = await callLlm(fallbackModel, systemPrompt, userPrompt);
        const titleMatch = fallbackResult.match(/^#\s+(.+)$/m);
        const extractedTitle = titleMatch ? titleMatch[1].trim() : null;

        console.log(`✅ [Phase 2] 폴백 모델 성공 (${fallbackResult.length}자, 모델: ${fallbackModel}, 추출된 제목: ${extractedTitle || '없음'})`);
        // 컨텍스트의 모델명도 실제 사용된 모델로 갱신
        ctx.textModel = fallbackModel;
        generation?.end({ output: { error: String(primaryErr), fallbackModel }, level: 'WARNING' });
        fallbackGen?.end({ output: { length: fallbackResult.length, title: extractedTitle } });
        return { content: fallbackResult, title: extractedTitle };
      } catch (fallbackErr) {
        console.error(`❌ [Phase 2] 폴백 모델도 실패 (${fallbackModel}):`, fallbackErr);
        generation?.end({ output: { error: String(primaryErr), fallbackError: String(fallbackErr) }, level: 'ERROR' });
        fallbackGen?.end({ output: { error: String(fallbackErr) }, level: 'ERROR' });
        // throw하여 run-pipeline.ts에서 FAILED 상태로 DB 저장
        throw new Error(`모델 API 호출 실패 — 1차: ${ctx.textModel}, 폴백: ${fallbackModel}`);
      }
    }

    // 폴백 모델이 없는 경우
    generation?.end({ output: { error: String(primaryErr) }, level: 'ERROR' });
    throw new Error(`모델 API 호출 실패 (${ctx.textModel})`);
  }
}
