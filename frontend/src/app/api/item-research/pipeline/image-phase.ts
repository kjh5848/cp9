/**
 * Phase 3: 이미지 생성
 * DALL-E 3 또는 Nano Banana를 통해 썸네일 이미지를 생성합니다.
 */
import { createGptModel, openAiSdk } from '@/infrastructure/clients/openai'
import { generateNanoBananaImage } from '@/infrastructure/clients/gemini'
import { getSeoSkillTemplate } from '../seo-skill-parser'
import type { PipelineContext } from './types'
import fs from 'fs/promises'
import path from 'path'

/**
 * 이미지를 생성하고 URL을 반환합니다.
 * DALL-E 3, Nano Banana, 또는 폴백(상품 이미지)을 사용합니다.
 */
export async function runImagePhase(ctx: PipelineContext): Promise<string | null> {
  const { imageModel, body } = ctx;
  // DALL-E 3 가격: $0.04/장(1024x1024), $0.08/장(1024x1792)
  const span = ctx.trace?.span({ name: 'phase3-image-generation', metadata: { imageModel } });
  const fallback = body.productData?.productImage || null;

  if (imageModel === 'dall-e-3') {
    return await generateDalleImage(ctx, span, fallback);
  } else if (imageModel === 'nano-banana') {
    return await generateNanoBanana(ctx, span, fallback);
  } else {
    console.log('⏭️ [Phase 3] 이미지 생성 건너뜀 (imageModel: none)');
    span?.end({ output: { type: 'none' }, metadata: { cost: 0 } });
    return fallback;
  }
}

/** DALL-E 3를 통한 이미지 생성 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateDalleImage(ctx: PipelineContext, span: any, fallback: string | null): Promise<string | null> {
  console.log(`🎨 [Phase 3] DALL-E 이미지 생성 중...`);
  const dallePromptStr = await getSeoSkillTemplate('dalle-prompts.md');
  const dalleChainInput = `${dallePromptStr}\n\n[블로그 제목/카테고리]: ${ctx.body.itemName} / ${ctx.body.productData?.categoryName || '상품'}`;

  // GPT-4o로 DALL-E 프롬프트 생성
  let imagePrompt = '';
  try {
    const dalleRes = await createGptModel('gpt-4o').invoke(dalleChainInput);
    imagePrompt = dalleRes.content.toString();
  } catch (err) {
    console.warn('⚠️ DALL-E 프롬프트 생성 실패, 기본 프롬프트 사용', err);
    imagePrompt = `A high quality, aesthetic promo picture of ${ctx.body.itemName}`;
  }

  // DALL-E 3 이미지 생성
  try {
    const imageResponse = await openAiSdk.images.generate({
      model: 'dall-e-3', prompt: imagePrompt, n: 1, size: '1024x1024'
    });
    const generatedUrl = imageResponse.data?.[0]?.url;
    if (generatedUrl) {
      try {
        // 이미지 다운로드 → 로컬 저장
        const imgRes = await fetch(generatedUrl);
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const fileName = `${ctx.body.itemId}_${Date.now()}.png`;
        const publicDir = path.join(process.cwd(), 'public/uploads/generated-images');
        await fs.mkdir(publicDir, { recursive: true });
        await fs.writeFile(path.join(publicDir, fileName), buffer);
        console.log('✅ [Phase 3] DALL-E 이미지 저장 성공');
        span?.end({
          output: { type: 'dall-e-3', saved: true },
          metadata: { cost: 0.04, costUnit: 'USD', pricePerImage: '$0.04' },
        });
        return `/uploads/generated-images/${fileName}`;
      } catch (downloadError) {
        console.error('❌ DALL-E 로컬 저장 실패 (임시 URL 사용):', downloadError);
        return generatedUrl;
      }
    }
  } catch (dalleError) {
    console.error('❌ DALL-E 이미지 생성 실패:', dalleError);
  }

  span?.end({
    output: { type: 'dall-e-3', fallback: true },
    metadata: { cost: 0, note: 'DALL-E 실패로 폴백 이미지 사용' },
  });
  return fallback;
}

/** Nano Banana를 통한 이미지 생성 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateNanoBanana(ctx: PipelineContext, span: any, fallback: string | null): Promise<string | null> {
  console.log(`🎨 [Phase 3] Nano Banana 이미지 생성 중...`);
  const url = await generateNanoBananaImage(`${ctx.body.itemName} professional product studio shot`);
  if (url) {
    console.log('✅ [Phase 3] Nano Banana 이미지 저장 성공');
    span?.end({
      output: { type: 'nano-banana', saved: true },
      metadata: { cost: 0, note: 'Nano Banana (무료)' },
    });
    return url;
  }
  span?.end({
    output: { type: 'nano-banana', fallback: true },
    metadata: { cost: 0, note: 'Nano Banana 실패, 폴백' },
  });
  return fallback;
}
