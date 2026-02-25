import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { createGptModel } from '@/infrastructure/clients/openai';
import { createClaudeModel } from '@/infrastructure/clients/claude';
import { createGeminiModel, generateNanoBananaImage } from '@/infrastructure/clients/gemini';
import { perplexityModel } from '@/infrastructure/clients/perplexity';
import { getSeoSkillTemplate } from '../item-research/seo-skill-parser';
import { marked } from 'marked';

// marked 설정: GitHub Flavored Markdown 스타일
marked.setOptions({ gfm: true, breaks: true });

// 페르소나 ID → Perplexity 프롬프트에서 치환할 섹션 키 매핑
const PERSONA_PERPLEXITY_KEY: Record<string, string> = {
  'IT': 'IT (IT/테크 전문가)',
  'BEAUTY': 'BEAUTY (패션/뷰티 트렌드 쇼퍼)',
  'LIVING': 'LIVING (살림/인테리어 고수)',
  'HUNTER': 'HUNTER (가성비/할인 헌터)',
  'MASTER_CURATOR_H': 'Single_Expert (하이엔드/럭셔리 딥다이브 전문가 - 마스터 큐레이터 H 전용)',
};

// 페르소나 ID → 블로그 템플릿 파일명 매핑
const PERSONA_TEMPLATE_FILE: Record<string, string> = {
  'IT': 'persona_it.md',
  'BEAUTY': 'persona_beauty.md',
  'LIVING': 'persona_living.md',
  'HUNTER': 'persona_hunter.md',
  'MASTER_CURATOR_H': 'blog_prompt_template.md',
};

// 페르소나 ID → 역할 한글 이름 매핑
const PERSONA_DISPLAY_NAME: Record<string, string> = {
  'IT': 'IT/테크 전문가 블로거',
  'BEAUTY': '패션/뷰티 트렌드 쇼퍼',
  'LIVING': '살림/인테리어 고수 크리에이터',
  'HUNTER': '가성비/할인 헌터 블로거',
  'MASTER_CURATOR_H': '마스터 큐레이터',
};

/**
 * 선택된 모델 이름에 따라 적절한 LLM 인스턴스를 반환합니다.
 */
function createTextModel(textModel: string) {
  if (textModel.startsWith('claude')) return createClaudeModel(textModel);
  if (textModel.startsWith('gemini')) return createGeminiModel(textModel);
  return createGptModel(textModel);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      itemIds,
      persona = 'IT',
      // 작성자 닉네임 (기본값은 페르소나 표시 이름으로 폴백)
      personaName,
      actionType = 'NOW',
      scheduledAt,
      textModel = 'claude-sonnet-4-6',
      imageModel = 'none',
      charLimit = 2000
    } = body;

    if (!projectId || !itemIds || itemIds.length === 0) {
      return NextResponse.json({ success: false, error: 'projectId and itemIds are required' }, { status: 400 });
    }

    // 최종 닉네임: 입력값 → MASTER_CURATOR_H 기본값 → 페르소나 표시 이름
    const finalPersonaName = personaName?.trim()
      || (persona === 'MASTER_CURATOR_H' ? '마스터 큐레이터 H' : PERSONA_DISPLAY_NAME[persona] || persona);

    let successCount = 0;

    for (const itemId of itemIds) {
      // 1. 기존 리서치 데이터 조회
      const itemData = await prisma.research.findUnique({
        where: { projectId_itemId: { projectId, itemId } },
        select: { pack: true }
      });

      if (!itemData) {
        console.warn(`[WriteAPI] research not found: ${itemId}`);
        continue;
      }

      const pack = JSON.parse(itemData.pack);
      const researchRaw = pack.researchRaw || `[Mock] ${pack.title} 리서치 데이터 부재`;

      // 2. 스케줄 예약 처리
      if (actionType === 'SCHEDULE') {
        console.log(`⏰ [WriteAPI] ${itemId}가 ${scheduledAt}에 예약되었습니다. (Persona: ${persona})`);
        await prisma.research.update({
          where: { projectId_itemId: { projectId, itemId } },
          data: { pack: JSON.stringify({ ...pack, status: 'SCHEDULED', scheduledAt }) }
        });
        successCount++;
        continue;
      }

      // 3. Perplexity 리서치 (전 페르소나 공통)
      console.log(`🔍 [WriteAPI] Perplexity 리서치 시작 - ${pack.title} (Persona: ${persona})`);
      let perplexityData = '';
      try {
        const perplexityPromptStr = await getSeoSkillTemplate('perplexity-prompts.md');
        const perplexityKey = PERSONA_PERPLEXITY_KEY[persona] || PERSONA_PERPLEXITY_KEY['IT'];
        const itemsJson = JSON.stringify([{ name: pack.title, features: '쿠팡 인기 파트너스 상품' }], null, 2);

        const pPrompt = perplexityPromptStr
          .replace('{{persona}}', perplexityKey)
          .replace('{{items_json}}', itemsJson);

        const pRes = await perplexityModel.invoke(pPrompt);
        perplexityData = pRes.content.toString();
        console.log(`✅ [WriteAPI] Perplexity 리서치 완료 (${perplexityData.length}자)`);
      } catch (error) {
        console.error('[WriteAPI] Perplexity fetch Error:', error);
        perplexityData = '최신 데이터 검색 실패. 기존 리서치 데이터 기반으로 작성합니다.';
      }

      // 4. 페르소나별 블로그 템플릿 로드
      const templateFile = PERSONA_TEMPLATE_FILE[persona] || PERSONA_TEMPLATE_FILE['IT'];
      const personaTemplate = await getSeoSkillTemplate(templateFile);

      // 5. System Prompt 구성 - 페르소나 역할 + 템플릿 가이드라인
      const systemPrompt = `
너는 대한민국 최고의 SEO 블로그 전문 작가이자 '${finalPersonaName}'이다.
아래의 [블로그 작성 가이드라인]을 완벽히 숙지하고, 이후 지시하는 상품에 대해 마크다운 포맷의 블로그 포스팅을 작성하라.

[블로그 작성 가이드라인]
${personaTemplate}

[공통 절대 규칙]
1. 글은 반드시 H1(#) 제목으로 시작하라.
2. 가이드라인의 [필수 섹션 목차]를 반드시 순서대로 모두 포함하라.
3. 아이콘(이모지)을 글 본문에 삽입하지 마라. (제목 이모지 제외)
4. 마크다운 테이블은 반드시 올바른 문법으로 작성하라.
5. 목표 글자수를 채운 후에도 [자유 확장 영역]의 주제를 활용해 창의적으로 분량을 확보하라.
6. CTA 2줄은 글 마지막에 반드시 포함하라.
`;

      // 6. User Prompt 구성 - 실제 데이터와 작성 지시
      // 쿠팡 상품 URL: pack에 저장된 값 우선, 없으면 itemId 기반으로 구성
      const coupangUrl = pack.productUrl || `https://www.coupang.com/vp/products/${itemId}`;

      const userPrompt = `
[대상 상품]: ${pack.title}
[쿠팡 구매 링크]: ${coupangUrl}

[최신 리서치 (Perplexity 검색 결과)]:
${perplexityData}

[기존 원본 리서치]:
${researchRaw}

[목표 글자수]: 공백 포함 약 ${charLimit}자 이상.
[강제 지침]:
- 필수 섹션을 모두 채운 뒤, 글자수가 남는다면 [자유 확장 영역]에 명시된 주제로 창의적인 심화 콘텐츠를 추가하여 반드시 ${charLimit}자를 채우세요.
- 단순 반복 절대 금지. 딥다이브 분석, 실사용 팁, 비교 분석 등 깊이 있는 정보로 분량을 확보하세요.
- Perplexity 리서치 데이터의 최신 정보를 최우선으로 활용하세요.
- 글 본문 중 구매를 유도하는 CTA는 반드시 아래 마크다운 링크 형식으로 작성하세요:
  [쿠팡에서 최저가 확인하기](${coupangUrl})

위 지침에 따라 지금 바로 마크다운 블로그 포스팅 전문을 작성하라.
`;

      // 7. 멀티 LLM 본문 생성 (전 페르소나 role 분리 invoke)
      let seoContent = '';
      console.log(`✍️ [WriteAPI] 모델(${textModel}) 작성 시작 (Persona: ${persona})`);
      try {
        const textInstance = createTextModel(textModel);
        const aiResponse = await textInstance.invoke([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);
        const markdownRaw = aiResponse.content.toString();

        // ── 이미지 URL 결정 ──────────────────────────────────────
        let headerImageUrl: string | null = null;
        if (imageModel === 'nano-banana') {
          console.log(`🎨 [WriteAPI] Nano Banana 이미지 생성 중...`);
          headerImageUrl = await generateNanoBananaImage(`${pack.title} professional product studio shot`);
        } else if (imageModel !== 'none') {
          headerImageUrl = pack.thumbnailUrl || pack.productImage || null;
        }

        // ── MD → HTML 변환 (marked) ───────────────────────────────
        console.log(`🔄 [WriteAPI] 마크다운 → HTML 변환 중...`);
        let htmlBody = await marked.parse(markdownRaw);

        // ── 쿠팡 상품 이미지 + 구매 버튼 HTML 블록 생성 ────────────
        const productImageUrl = headerImageUrl || pack.productImage || pack.thumbnailUrl || '';
        const buyUrl = pack.productUrl || `https://www.coupang.com/vp/products/${itemId}`;

        const coupangHeaderHtml = productImageUrl ? `
<div class="coupang-product-block" style="text-align:center; margin: 24px 0;">
  <img src="${productImageUrl}" alt="${pack.title}" style="max-width:100%; border-radius:12px; margin-bottom:16px;" />
  <a href="${buyUrl}" target="_blank" rel="noopener sponsored" 
     style="display:inline-block; background:#E4003B; color:#fff; font-weight:bold; padding:14px 32px; border-radius:8px; text-decoration:none; font-size:1rem;">
    🛒 쿠팡에서 최저가 확인하기
  </a>
  <p style="font-size:0.75rem; color:#888; margin-top:8px;">※ 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.</p>
</div>
` : '';

        const coupangCtaHtml = `
<div class="coupang-cta-block" style="text-align:center; margin: 40px 0; padding: 24px; background:#fff5f7; border-radius:12px; border:1px solid #fdd;">
  <p style="font-weight:bold; font-size:1.1rem; margin-bottom:12px;">지금 바로 구매하세요!</p>
  <a href="${buyUrl}" target="_blank" rel="noopener sponsored"
     style="display:inline-block; background:#E4003B; color:#fff; font-weight:bold; padding:16px 40px; border-radius:8px; text-decoration:none; font-size:1.1rem;">
    🛒 쿠팡 최저가 바로가기
  </a>
  <p style="font-size:0.75rem; color:#888; margin-top:8px;">※ 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.</p>
</div>
`;

        // 최종 HTML: 상품 이미지 블록 + 본문 + CTA 버튼
        seoContent = coupangHeaderHtml + htmlBody + coupangCtaHtml;
        console.log(`✅ [WriteAPI] HTML 변환 완료 (${seoContent.length}자)`);

      } catch (err) {
        console.error(`[WriteAPI] LLM API Error:`, err);
        seoContent = `<h1>작성 실패</h1><p>모델 API 호출 오류로 인해 글 생성을 실패했습니다. (Selected Model: ${textModel})</p>`;
      }

      // 8. DB 업데이트
      const updatedPack = {
        ...pack,
        content: seoContent,
        contentType: 'html',   // 변환된 HTML 콘텐츠임을 명시
        status: 'PUBLISHED',
        scheduledAt: null,
        // 글 생성 메타데이터 저장
        persona,
        personaName: finalPersonaName,
        textModel,
      };

      try {
        await prisma.research.update({
          where: { projectId_itemId: { projectId, itemId } },
          data: { pack: JSON.stringify(updatedPack) }
        });
        successCount++;
        console.log(`✅ [WriteAPI] 블로그 저장 완료 - ${itemId}`);
      } catch (updateError) {
        console.error(`[WriteAPI] Failed to update DB for ${itemId}:`, updateError);
      }
    }

    return NextResponse.json({
      success: true,
      data: { written: successCount, actionType, persona, textModel, imageModel }
    });

  } catch (error) {
    console.error('Write API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
