/**
 * Phase 1: Perplexity 리서치
 * 상품에 대한 최신 정보를 Perplexity API로 수집합니다.
 * 큐레이션(10+ 아이템) 시 배치 분할하여 안정적으로 수집합니다.
 */
import { perplexityModel } from '@/infrastructure/clients/perplexity'
import { getSeoSkillTemplate } from '../seo-skill-parser'
import { PERSONA_PERPLEXITY_KEY } from './config'
import type { PipelineContext } from './types'

/** 배치당 최대 아이템 수 */
const BATCH_SIZE = 10;

/**
 * 아이템 배열을 지정 크기 배치로 분할합니다.
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Perplexity API를 통해 상품 리서치 데이터를 수집합니다.
 * 큐레이션(10+ 아이템) 시 배치 분할하여 병렬 호출합니다.
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

  // 큐레이션 대량 아이템(10+): 배치 분할 처리
  if (ctx.articleType === 'curation' && itemsForResearch.length > BATCH_SIZE) {
    return runBatchResearch(ctx, perplexityPromptStr, perplexityKey, itemsForResearch, span);
  }

  // 개별/비교/소량 큐레이션: 단건 호출
  return runSingleResearch(ctx, perplexityPromptStr, perplexityKey, itemsForResearch, span);
}

/**
 * 단건 Perplexity 리서치 호출
 */
async function runSingleResearch(
  ctx: PipelineContext,
  promptStr: string,
  perplexityKey: string,
  items: Array<{ name: string; url: string; price?: number; features: string }>,
  span?: any,
): Promise<string> {
  const itemsJson = JSON.stringify(items, null, 2);
  const input = promptStr
    .replace('{{persona}}', perplexityKey)
    .replace('{{items_json}}', itemsJson);

  try {
    const res = await perplexityModel.invoke(input);
    const data = res.content.toString();
    console.log(`✅ [Phase 1] Perplexity 리서치 완료 (${data.length}자, ${items.length}개 아이템)`);
    span?.end({ output: { length: data.length } });
    return data;
  } catch (err) {
    console.warn('⚠️ Perplexity API 호출 실패, Mock 데이터로 대체합니다.', err);
    span?.end({ output: { error: 'Perplexity API 호출 실패' }, level: 'ERROR' });
    return `[Mock 리서치 데이터]\n\n목표 상품: ${ctx.body.itemName}\n페르소나: ${ctx.persona}\n\n이 데이터는 Perplexity API 호출 에러로 인해 대체 생성된 가상 리서치 텍스트입니다.`;
  }
}

/**
 * 큐레이션 대량 아이템 배치 분할 리서치
 * 10개씩 배치로 나누어 순차 호출 후 결과를 병합합니다.
 * (Perplexity API Rate Limit을 고려하여 순차 처리)
 */
async function runBatchResearch(
  ctx: PipelineContext,
  promptStr: string,
  perplexityKey: string,
  items: Array<{ name: string; url: string; price?: number; features: string }>,
  span?: any,
): Promise<string> {
  const batches = chunkArray(items, BATCH_SIZE);
  console.log(`📦 [Phase 1] 큐레이션 배치 분할: ${items.length}개 → ${batches.length}개 배치 (각 ${BATCH_SIZE}개)`);

  const results: string[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`  🔄 배치 ${i + 1}/${batches.length} (${batch.length}개 아이템)...`);

    const itemsJson = JSON.stringify(batch, null, 2);
    const input = promptStr
      .replace('{{persona}}', perplexityKey)
      .replace('{{items_json}}', itemsJson);

    try {
      const res = await perplexityModel.invoke(input);
      results.push(res.content.toString());
      console.log(`  ✅ 배치 ${i + 1} 완료`);
    } catch (err) {
      console.warn(`  ⚠️ 배치 ${i + 1} 실패:`, err);
      // 실패한 배치는 상품명만 기록
      const fallback = batch.map(item => `- ${item.name} (${item.price?.toLocaleString()}원): 리서치 수집 실패`).join('\n');
      results.push(`[배치 ${i + 1} 리서치 실패]\n${fallback}`);
    }

    // Rate limit 방지: 배치 간 1초 딜레이 (마지막 배치 제외)
    if (i < batches.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const combined = results.join('\n\n---\n\n');
  console.log(`✅ [Phase 1] 배치 리서치 전체 완료 (총 ${combined.length}자, ${batches.length}개 배치)`);
  span?.end({ output: { length: combined.length, batches: batches.length } });
  return combined;
}

