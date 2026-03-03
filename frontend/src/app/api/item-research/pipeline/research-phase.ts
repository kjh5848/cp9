/**
 * Phase 1: Perplexity 리서치
 * 상품에 대한 최신 정보를 Perplexity API로 수집합니다.
 */
import { perplexityModel } from '@/infrastructure/clients/perplexity'
import { getSeoSkillTemplate } from '../seo-skill-parser'
import { PERSONA_PERPLEXITY_KEY } from './config'
import type { PipelineContext } from './types'

/**
 * Perplexity API를 통해 상품 리서치 데이터를 수집합니다.
 * @returns 리서치 텍스트 (실패 시 Mock 데이터)
 */
export async function runResearchPhase(ctx: PipelineContext): Promise<string> {
  const span = ctx.trace?.span({ name: 'phase1-perplexity-research' });
  console.log('🔍 [Phase 1] Perplexity 리서치 진행 중...');

  // 프롬프트 템플릿 로드 + 치환
  const perplexityPromptStr = await getSeoSkillTemplate('perplexity-prompts.md');
  const perplexityKey = PERSONA_PERPLEXITY_KEY[ctx.persona] || PERSONA_PERPLEXITY_KEY['IT'];
  const coupangProductUrl = ctx.body.productData?.productUrl
    || `https://www.coupang.com/vp/products/${ctx.body.itemId}`;

  // 비교/큐레이션: 다중 아이템 데이터 사용 / 개별: 단일 아이템
  const itemsForResearch = ctx.body.items && ctx.body.items.length > 0
    ? ctx.body.items.map(item => ({
        name: item.productName,
        url: item.productUrl,
        price: item.productPrice,
        features: `${item.categoryName || '상품'}. ${item.isRocket ? '로켓배송' : ''} ${item.isFreeShipping ? '무료배송' : ''}`.trim(),
      }))
    : [{
        name: ctx.body.itemName,
        url: coupangProductUrl,
        price: ctx.body.productData?.productPrice,
        features: `선택된 특정 상품. 반드시 "${ctx.body.itemName}" 이 제품 하나에 대한 정보만 수집.`
      }];

  const itemsJson = JSON.stringify(itemsForResearch, null, 2);

  const perplexityChainInput = perplexityPromptStr
    .replace('{{persona}}', perplexityKey)
    .replace('{{items_json}}', itemsJson);

  try {
    const perplexityRes = await perplexityModel.invoke(perplexityChainInput);
    const researchData = perplexityRes.content.toString();
    console.log(`✅ [Phase 1] Perplexity 리서치 완료 (${researchData.length}자)`);
    span?.end({ output: { length: researchData.length } });
    return researchData;
  } catch (err) {
    console.warn('⚠️ Perplexity API 호출 실패, Mock 데이터로 대체합니다.', err);
    span?.end({ output: { error: 'Perplexity API 호출 실패' }, level: 'ERROR' });
    return `[Mock 리서치 데이터]\n\n목표 상품: ${ctx.body.itemName}\n페르소나: ${ctx.persona}\n\n이 데이터는 Perplexity API 호출 에러로 인해 대체 생성된 가상 리서치 텍스트입니다.`;
  }
}
