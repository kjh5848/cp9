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
 * 추출된 여러 개의 이미지 제안에 대해 이미지를 확보하고 URL 매핑을 반환합니다.
 * 검색(Web Search)을 기본으로 시도하고, 실패 시 생성(DALL-E 3, Nano Banana)으로 폴백합니다.
 */
export async function runImagePhase(ctx: PipelineContext, imageSuggestions: string[]): Promise<Record<string, string | null>> {
  const { imageModel, body } = ctx;
  const span = ctx.trace?.span({ name: 'phase3-image-generation', metadata: { imageModel, suggestionCount: imageSuggestions.length } });
  
  const results: Record<string, string | null> = {};
  const fallback = body.productData?.productImage || null;

  // 제안이 없으면 기본 썸네일 하나만 시도
  if (!imageSuggestions || imageSuggestions.length === 0) {
    if (imageModel === 'dall-e-3') {
      results['default'] = await generateDalleImage(ctx, span, fallback, `${body.itemName} promo shot`);
    } else if (imageModel === 'nano-banana') {
      results['default'] = await generateNanoBanana(ctx, span, fallback, `${body.itemName} studio shot`);
    } else if (imageModel === 'stock') {
      results['default'] = await searchStockImage(ctx, span, fallback, `${body.itemName}`);
    } else {
      results['default'] = fallback;
    }
  } else {
    // 중복 방지를 위한 Set 추가
    const usedImages = new Set<string>();
    
    // 다중 이미지 확보 실행 (병렬)
    const promises = imageSuggestions.map(async (suggestion) => {
      let url: string | null = null;
      try {
        if (imageModel === 'web-search' || imageModel === 'none' || imageModel === 'stock') {
          url = await searchStockImage(ctx, span, fallback, suggestion, usedImages);
        } else if (imageModel === 'dall-e-3') {
          url = await generateDalleImage(ctx, span, fallback, suggestion);
        } else if (imageModel === 'nano-banana') {
          url = await generateNanoBanana(ctx, span, fallback, suggestion);
        }
      } catch (err) {
        console.warn(`⚠️ 이미지 확보 실패 (${suggestion})`, err);
      }

      // 지정된 모델이 동작하지 않았거나 실패 시 원본 상품 썸네일로 폴백
      if (!url) {
        url = fallback;
      }
      
      results[suggestion] = url;
    });

    await Promise.all(promises);
  }

  span?.end({ output: { count: Object.keys(results).length } });
  return results;
}

/** DALL-E 3를 통한 이미지 생성 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateDalleImage(ctx: PipelineContext, span: any, fallback: string | null, customPrompt?: string): Promise<string | null> {
  console.log(`🎨 [Phase 3] DALL-E 이미지 생성 중... (${customPrompt || '기본'})`);
  const dallePromptStr = await getSeoSkillTemplate('dalle-prompts.md');
  const targetDesc = customPrompt || `${ctx.body.itemName} / ${ctx.body.productData?.categoryName || '상품'}`;
  const dalleChainInput = `${dallePromptStr}\n\n[블로그 제목/카테고리/요청상황]: ${targetDesc}`;

  // GPT-4o로 DALL-E 프롬프트 생성
  let imagePrompt = '';
  try {
    const dalleRes = await createGptModel('gpt-4o').invoke(dalleChainInput);
    imagePrompt = dalleRes.content.toString();
  } catch (err) {
    console.warn('⚠️ DALL-E 프롬프트 생성 실패, 기본 프롬프트 사용', err);
    imagePrompt = `A high quality, aesthetic promo picture of ${targetDesc}`;
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
async function generateNanoBanana(ctx: PipelineContext, span: any, fallback: string | null, customPrompt?: string): Promise<string | null> {
  console.log(`🎨 [Phase 3] Nano Banana 이미지 생성 중... (${customPrompt || '기본'})`);
  const targetDesc = customPrompt || `${ctx.body.itemName} professional product studio shot`;
  const url = await generateNanoBananaImage(targetDesc);
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

/** Pixabay 무료 스탁 이미지 검색 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function searchStockImage(ctx: PipelineContext, span: any, fallback: string | null, customPrompt?: string, usedImages?: Set<string>): Promise<string | null> {
  console.log(`🖼️ [Phase 3] Pixabay 스탁 이미지 검색 중... (${customPrompt || ctx.body.itemName})`);
  
  const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
  if (!PIXABAY_API_KEY) {
    console.warn('⚠️ PIXABAY_API_KEY가 설정되지 않았습니다. 기본 썸네일로 폴백합니다.');
    return fallback;
  }

  try {
    // 1. LLM을 사용하여 한국어 검색어를 영어 명사형 또는 간단한 구문으로 번역 (Pixabay 검색 최적화)
    let searchQuery = customPrompt || ctx.body.itemName;
    try {
      const transRes = await createGptModel('gpt-4o-mini').invoke(
        `다음 텍스트에서 무료 스탁 이미지 검색 시스템에 입력할 가장 핵심적인 영어 키워드를 1~3단어로 추출하거나 번역해주세요. 특수문자 없이 영어 단어들만 내뱉으세요.\n\n텍스트: ${searchQuery}`
      );
      searchQuery = transRes.content.toString().trim();
      console.log(`📝 [Phase 3] 검색어 변환: ${customPrompt} -> ${searchQuery}`);
    } catch (e) {
      console.warn('검색어 번역 실패, 원본 사용', e);
    }
    
    // axios 동적 import (파일 상단 의존성을 지저분하게 만들지 않기 위해)
    const axios = (await import('axios')).default;
    const qs = (await import('querystring')).default;
    
    const queryStr = qs.stringify({
      key: PIXABAY_API_KEY,
      q: searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      order: 'popular',
      per_page: 20
    });
    
    const response = await axios.get(`https://pixabay.com/api/?${queryStr}`);
    const data = response.data;

    if (data.hits && data.hits.length > 0) {
      // 중복 방지를 위한 필터링 (사용된 이미지가 아닌 것들만 추출)
      const availableHits = usedImages 
        ? data.hits.filter((hit: any) => !usedImages.has(hit.largeImageURL))
        : data.hits;
      
      // 만약 모두 다 써버렸다면 그냥 전체에서 랜덤 (중복 허용)
      const targetHits = availableHits.length > 0 ? availableHits : data.hits;
      
      // 랜덤 선택
      const randomIndex = Math.floor(Math.random() * targetHits.length);
      const selectedImage = targetHits[randomIndex].largeImageURL;
      
      if (usedImages) {
        usedImages.add(selectedImage);
      }

      console.log(`✅ [Phase 3] Pixabay 스탁 이미지 찾음: ${selectedImage}`);
      span?.end({
        output: { type: 'pixabay-stock', saved: false },
        metadata: { cost: 0, note: 'Pixabay API (무료)' },
      });
      return selectedImage;
    } else {
      console.log(`⚠️ [Phase 3] Pixabay 검색 결과 없음: ${searchQuery}`);
    }
  } catch (error) {
    console.error('❌ Pixabay 이미지 검색 중 오류 발생:', error);
  }

  span?.end({
    output: { type: 'pixabay-stock', fallback: true },
    metadata: { cost: 0, note: 'Pixabay 실패, 폴백 사용' },
  });
  return fallback;
}
