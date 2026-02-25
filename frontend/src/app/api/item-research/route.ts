export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/clients/prisma'
import { getSeoSkillTemplate } from './seo-skill-parser'
import { gptModel, openAiSdk } from '@/infrastructure/clients/openai'
import { perplexityModel } from '@/infrastructure/clients/perplexity'
import fs from 'fs/promises'
import path from 'path'

interface ItemResearchRequest {
  itemName: string
  projectId: string
  itemId: string
  productData?: {
    productName: string
    productPrice: number
    productImage: string
    productUrl: string
    categoryName: string
    isRocket: boolean
    isFreeShipping: boolean
  }
  seoConfig?: {
    persona: string
    toneAndManner?: string
    textModel?: string
    imageModel?: string
    actionType?: 'NOW' | 'SCHEDULE'
    scheduledAt?: string
    charLimit?: number
  }
}

interface ItemResearchResponse {
  itemName: string
  projectId: string
  itemId: string
  researchData: any
  success: boolean
}

export async function POST(request: NextRequest) {
  try {
    const requestText = await request.text()
    const body: ItemResearchRequest = JSON.parse(requestText)

    if (!body.itemName || !body.projectId || !body.itemId) {
      return NextResponse.json(
        { error: 'itemName, projectId, and itemId are required' },
        { status: 400 }
      )
    }

    const persona = body.seoConfig?.persona || "Single_Expert"
    const tone = body.seoConfig?.toneAndManner || "Professional"
    const actionType = body.seoConfig?.actionType || "NOW"
    const scheduledAt = body.seoConfig?.scheduledAt || null
    const charLimit = body.seoConfig?.charLimit || 2000

    console.log('🚀 [SEO-Pipeline] 작업을 시작합니다:', {
      itemName: body.itemName,
      persona,
      tone,
      actionType,
      scheduledAt,
      charLimit
    });

    if (actionType === 'SCHEDULE') {
      console.log(`⏰ [SEO-Pipeline] 스케줄 모드로 텍스트 생성 생략 후 스케줄 등록 - ${scheduledAt}`);
      
      const finalResearchPack = {
        itemId: body.itemId,
        title: body.itemName,
        content: null,
        thumbnailPrompt: null,
        thumbnailUrl: null,
        researchRaw: null,
        status: 'SCHEDULED',
        scheduledAt,
      };

      try {
        await prisma.research.upsert({
          where: {
            projectId_itemId: {
              projectId: body.projectId,
              itemId: body.itemId
            }
          },
          update: {
            pack: JSON.stringify(finalResearchPack)
          },
          create: {
            projectId: body.projectId,
            itemId: body.itemId,
            pack: JSON.stringify(finalResearchPack)
          }
        });
      } catch (dbError) {
        console.warn('DB Upsert Error:', dbError);
      }

      return NextResponse.json({
        projectId: body.projectId,
        itemId: body.itemId,
        itemName: body.itemName,
        success: true,
        researchData: {
          content: null,
          thumbnailPrompt: null,
          researchRaw: null
        }
      });
    }

    // 1. LLM 클라이언트 준비 (Infrastructure 분리)
    // 상단에서 import하여 사용합니다.

    // 스킬 프롬프트 로딩
    const perplexityPromptStr = await getSeoSkillTemplate('perplexity-prompts.md');
    const gptPromptStr = await getSeoSkillTemplate('gpt-prompts.md');
    const dallePromptStr = await getSeoSkillTemplate('dalle-prompts.md');

    // 프롬프트 정규표현식 파싱 (간이 구현 - 실제론 섹션별 파싱 로직 권장)
    // 1. Phase 1: Perplexity 리서치 시작
    console.log('🔍 [Phase 1] Perplexity 리서치 진행 중...');
    const itemsJson = JSON.stringify([{
      name: body.itemName,
      price: body.productData?.productPrice,
      url: body.productData?.productUrl,
      features: "쿠팡 인기 파트너스 상품"
    }], null, 2);
    
    const perplexityChainInput = perplexityPromptStr
      .replace('{{persona}}', persona)
      .replace('{{items_json}}', itemsJson);
    let researchData = "";
    try {
      const perplexityRes = await perplexityModel.invoke(perplexityChainInput);
      researchData = perplexityRes.content.toString();
    } catch (err) {
      console.warn("⚠️ Perplexity API 호출 실패, Mock 데이터로 대체합니다.", err);
      researchData = `[Mock 리서치 데이터]\n\n목표 상품: ${body.itemName}\n페르소나: ${persona}\n\n이 데이터는 Perplexity API 키 미설정 혹은 호출 에러로 인해 대체 생성된 가상 리서치 텍스트입니다.`;
    }

    // 2. Phase 2: GPT SEO 블로그 본문 작성
    console.log('✍️ [Phase 2] GPT SEO 본문 작성 중...');
    const gptChainInput = `
      ${gptPromptStr}
      
[설정 톤앤매너]: ${tone}
      
[페르소나]: ${persona}
      
[리서치 데이터]: ${researchData}
      
[목표 글자수]: 공백 포함 최소 ${charLimit}자 이상으로 작성. (분량이 품질입니다. 이 분량 기준은 반드시, 그리고 가장 최우선으로 준수되어야 합니다.)

[작성 구조 지침 - 반드시 준수]:
1. **오프닝**: 독자를 사로잡는 권위 있는 도입부 (500자 이상)
2. **## 💡 제품 구매/사용 전 반드시 체크해야 할 사항**: 실생활 활용 가이드 및 주의사항 (1,500자 이상)
3. **## 📊 스펙 및 장단점 비교**: 상세한 마크다운 테이블과 장/단점 요점 정리 (2,000자 이상)
4. **## 💬 실제 사용자 후기 분석**: 리서치 데이터 기반 후기 요약 및 패턴 분석 (1,500자 이상)
5. **## 🛒 가격 및 구매 가이드**: 현재 가격, 할인 시즌, 최저가 구매 팁 (1,000자 이상)
6. **## 🎯 최종 추천 코멘트**: 추천 대상/비추천 대상 명확히 구분 (1,000자 이상)
7. **CTA**: 관련 상품 리뷰로 유도하는 문구

[강제 지침]:
- 각 섹션 글자수 기준을 반드시 채우세요. 부족하면 더 깊은 분석과 사례를 추가하세요.
- 단순 반복은 절대 피하고 딥다이브 분석, 활용 팁, 비교 분석, 사용자 관점 등 깊이 있는 정보를 꾸준히 추가하세요.
- 전체 글이 ${charLimit}자 미만이면 아직 작성이 끝나지 않은 것입니다. 각 섹션을 더 상세히 확장하세요.

위 리서치 데이터를 바탕으로 완벽한 SEO 마크다운 포스트를 작성하라.
    `;
    let seoContent = "";
    try {
      const gptRes = await gptModel.invoke(gptChainInput);
      seoContent = gptRes.content.toString();
    } catch (err) {
      console.warn("⚠️ GPT API 호출 실패, Mock 데이터로 대체합니다.", err);
      seoContent = `# ${body.itemName} - 추천 가이드\n\n이 글은 GPT API 키 미설정 혹은 호출 에러로 인해 대체 생성된 샘플 SEO 마크다운 포스트입니다.\n\n## 1. 개요\n${persona} 페르소나 및 ${tone} 톤앤매너가 적용되는 구간입니다.\n\n## 2. 결론\n이 상품은 테스트 데이터를 시연하기 위함입니다.`;
    }

    // 3. Phase 3: DALL-E 대표 썸네일 이미지 추출 프롬프트
    console.log('🎨 [Phase 3] DALL-E 썸네일 생성 중...');
    const dalleChainInput = `
      ${dallePromptStr}
      
[블로그 제목/카테고리]: ${body.itemName} / ${body.productData?.categoryName || '상품'}
    `;
    let imagePrompt = "";
    try {
      const dalleRes = await gptModel.invoke(dalleChainInput);
      imagePrompt = dalleRes.content.toString();
    } catch (err) {
      console.warn("⚠️ GPT 프롬프트 추론 실패, Mock 데이터로 대체합니다.", err);
      imagePrompt = `A high quality, aesthetic promo picture of ${body.itemName}`;
    }
    
    // 실제 DALL-E 3 이미지 API 연동
    let actualImageUrl = body.productData?.productImage || null; // 기본적으로 쿠팡 상품 이미지를 사용
    try {
      console.log('🖼️ DALL-E API 호출 시작...', { prompt: imagePrompt.substring(0, 50) + '...' });
      const imageResponse = await openAiSdk.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024"
      });
      const generatedUrl = imageResponse.data?.[0]?.url;
      if (generatedUrl) {
        try {
          // 1. 이미지 데이터 페치
          const imgRes = await fetch(generatedUrl);
          const arrayBuffer = await imgRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // 2. 저장 경로 및 파일명 생성
          const fileName = `${body.itemId}_${Date.now()}.png`;
          const publicDir = path.join(process.cwd(), 'public/uploads/generated-images');
          const fullPath = path.join(publicDir, fileName);
          
          // 3. 디렉토리 존재 확인 (혹시 모르니 다시 한번)
          await fs.mkdir(publicDir, { recursive: true });
          
          // 4. 파일 쓰기
          await fs.writeFile(fullPath, buffer);
          
          // 5. 실제 노출할 URL 설정 (public 폴더 기준 상대 경로)
          actualImageUrl = `/uploads/generated-images/${fileName}`;
          console.log('✅ DALL-E 이미지 로컬 저장 성공:', actualImageUrl);
        } catch (downloadError) {
          console.error('❌ DALL-E 이미지 로컬 저장 실패 (임시 URL 사용):', downloadError);
          actualImageUrl = generatedUrl;
        }
      } else {
        console.warn('⚠️ DALL-E로부터 URL을 받지 못했습니다. 기존 상품 이미지를 유지합니다.');
      }
    } catch (dalleError) {
      console.error('❌ DALL-E 이미지 생성 실패 (기존 이미지 유지):', dalleError);
      // fallback to original productImage if DALL-E fails, which is already set in actualImageUrl
      if (!actualImageUrl) {
        actualImageUrl = "https://via.placeholder.com/1024x1024?text=No+Image+Available";
      }
    }

    console.log('✅ [SEO-Pipeline] 파이프라인 생성 완료!');
    
    // DB 저장 (원래 Edge Function이 하던 역할)
    // 임시로 ResearchItem 테이블에 바로 업데이트/삽입
    const finalResearchPack = {
      itemId: body.itemId,
      title: body.itemName,
      content: seoContent,
      thumbnailPrompt: imagePrompt,
      thumbnailUrl: actualImageUrl,
      // 쿠팡 상품 원본 URL 및 이미지 저장 (write API CTA 연동용)
      productUrl: body.productData?.productUrl || `https://www.coupang.com/vp/products/${body.itemId}`,
      productImage: body.productData?.productImage || null,
      researchRaw: researchData,
      status: 'PUBLISHED',
      scheduledAt: null
    };

    try {
      await prisma.research.upsert({
        where: {
          projectId_itemId: {
            projectId: body.projectId,
            itemId: body.itemId
          }
        },
        update: {
          pack: JSON.stringify(finalResearchPack)
        },
        create: {
          projectId: body.projectId,
          itemId: body.itemId,
          pack: JSON.stringify(finalResearchPack)
        }
      });
    } catch (dbError) {
      console.warn('DB Upsert Error (Prisma):', dbError);
    }

    return NextResponse.json({
      projectId: body.projectId,
      itemId: body.itemId,
      itemName: body.itemName,
      success: true,
      researchData: {
        content: seoContent,
        thumbnailPrompt: imagePrompt,
        researchRaw: researchData
      }
    } as ItemResearchResponse)

  } catch (error) {
    console.error('Item research error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'SEO Pipeline endpoint is active.' })
}
