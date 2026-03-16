import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { ChatOpenAI } from '@langchain/openai';
import { getNextRunAtKST } from '@/features/autopilot/lib/scheduler';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes Max for Vercel Cron

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Optional basic auth for cron, skip for local
    // if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    const campaigns = await prisma.categoryCampaign.findMany();
    let generatedCount = 0;
    const results = [];

    for (const campaign of campaigns) {
      // 1. 현재 대기중인 큐 카운트 확인
      const pendingCount = await prisma.autopilotQueue.count({
        where: {
          campaignId: campaign.id,
          status: { in: ['WAITING_APPROVAL', 'PENDING', 'PROCESSING'] }
        }
      });

      // 큐가 부족하면 (임계치 예: 3개 미만) 새로 batchSize만큼 생성
      if (pendingCount <= 3) {
        console.log(`[Cron] 캠페인 ${campaign.categoryName} 큐 보충 필요. (현재: ${pendingCount})`);
        
        // 유저의 API 키 가져오기
        const user = await prisma.user.findUnique({
          where: { id: campaign.userId ?? undefined },
          select: { perplexityApiKey: true, openAiApiKey: true }
        });

        const apiKey = user?.perplexityApiKey || user?.openAiApiKey;
        if (!apiKey) {
          console.warn(`[Cron] 캠페인 ${campaign.categoryName} 생성 취소: 유저 API 키 없음`);
          continue; // 키가 없으면 이 캠페인은 건너뜀
        }

        const suggestModel = new ChatOpenAI({
          apiKey: apiKey,
          modelName: user?.perplexityApiKey ? 'sonar-pro' : 'gpt-4o', 
          configuration: user?.perplexityApiKey ? { baseURL: 'https://api.perplexity.ai' } : undefined,
          maxRetries: 1,
          temperature: 0.8,
        });

        const now = new Date();
        const month = now.getMonth() + 1;
        const countToGenerate = campaign.batchSize || 15;

        const CHUNK_SIZE = 5;
        const iterations = Math.ceil(countToGenerate / CHUNK_SIZE);
        const allKeywords: Array<{ keyword: string, articleType: string }> = [];

        const targetConfig = {
          age: campaign.targetAge,
          gender: campaign.targetGender,
          price: campaign.targetPrice,
          industry: campaign.targetIndustry,
        };

        for (let i = 0; i < iterations; i++) {
          const currentChunkSize = (i === iterations - 1 && countToGenerate % CHUNK_SIZE !== 0)
            ? countToGenerate % CHUNK_SIZE
            : CHUNK_SIZE;
          const prompt = buildSuggestPrompt(campaign.categoryName, month, currentChunkSize, targetConfig);
          try {
            const res = await suggestModel.invoke(prompt);
            const rawText = res.content.toString();
            const chunkKeywords = parseKeywords(rawText).slice(0, currentChunkSize);
            allKeywords.push(...chunkKeywords);
          } catch (aiError) {
            console.error(`[Cron] 캠페인 ${campaign.categoryName} AI 생성 에러 (Chunk ${i}):`, aiError);
          }
        }

        // 중복 제거 및 최종 개수 맞춤
        const uniqueMap = new Map();
        for (const k of allKeywords) {
          if (!uniqueMap.has(k.keyword)) uniqueMap.set(k.keyword, k);
        }
        const finalKeywords = Array.from(uniqueMap.values()).slice(0, countToGenerate);

        if (finalKeywords.length > 0) {
          const createData = finalKeywords.map((k, idx) => {
            const intervalMinutes = campaign.intervalHours ? campaign.intervalHours * 60 : 0;
            // index(idx)를 통해 간격 누적
            const nextRunAt = getNextRunAtKST(
              intervalMinutes,
              campaign.activeTimeStart,
              campaign.activeTimeEnd,
              idx,
              now
            );

            return {
              keyword: k.keyword,
              status: campaign.isAutoApprove ? 'PENDING' : 'WAITING_APPROVAL',
              campaignId: campaign.id,
              personaId: campaign.personaId,
              themeId: campaign.themeId,
              articleType: k.articleType || 'single',
              intervalHours: campaign.intervalHours,
              publishTimes: campaign.publishTimes,
              publishDays: campaign.publishDays,
              jitterMinutes: campaign.jitterMinutes,
              dailyCap: campaign.dailyCap,
              activeTimeStart: campaign.activeTimeStart,
              activeTimeEnd: campaign.activeTimeEnd,
              targetAge: campaign.targetAge,
              targetGender: campaign.targetGender,
              targetPrice: campaign.targetPrice,
              targetIndustry: campaign.targetIndustry,
              publishTargets: campaign.publishTargets,
              // 기타 기본 설정
              textModel: 'gpt-4o',
              imageModel: 'dall-e-3',
              nextRunAt,
            };
          });

          await prisma.autopilotQueue.createMany({
            data: createData
          });

          generatedCount += createData.length;
          results.push({ campaignId: campaign.id, category: campaign.categoryName, generated: createData.length });
        }
      }
    }

    return NextResponse.json({ success: true, processedCampaigns: campaigns.length, generatedCount, results });
  } catch (error) {
    console.error('[cron/campaigns] 에러:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildSuggestPrompt(category: string, month: number, count: number, target: any): string {
  const targetStr = [
    target.age ? `타겟 연령: ${target.age}` : '',
    target.gender ? `타겟 성별: ${target.gender}` : '',
    target.price ? `가격대: ${target.price}` : '',
    target.industry ? `주요 업종/관심사: ${target.industry}` : '',
  ].filter(Boolean).join(', ');

  const targetNote = targetStr ? `\n특별 타겟팅 조건: [ ${targetStr} ] - 이 조건을 반드시 반영하여 타겟 맞춤형 키워드를 도출하세요.` : '';

  return `당신은 대한민국 전문 SEO 마케터입니다.
현재 ${month}월입니다. 시즌 특성과 트렌드를 반영하여 "${category}" 카테고리에 해당하는 수익성 높은 블로그용 상품 키워드를 정확히 ${count}개 추천해주세요.${targetNote}

추천 기준:
1. 검색 의도가 분명한 롱테일 키워드 (예: "다이슨 에어랩 비교", "20대 여성 선물 추천")
2. 고단가/고수익 상품 위주
3. 겹치지 않는 다양한 키워드 구성

반드시 아래 JSON 형식으로만 응답하세요. 다른 설명은 출력하지 마세요:
[
  {
    "keyword": "키워드",
    "articleType": "single | compare | curation"
  }
]
`;
}

function parseKeywords(rawText: string): Array<{ keyword: string, articleType: string }> {
  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.filter((i: any) => i && typeof i.keyword === 'string')
        .map((i: any) => ({
          keyword: i.keyword,
          articleType: ['single', 'compare', 'curation'].includes(i.articleType) ? i.articleType : 'single'
        }));
    }
  } catch (e) {
    console.warn('[cron/campaigns] JSON 파싱 실패');
  }
  return [];
}

