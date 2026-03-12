import { PrismaClient } from '@prisma/client'
import { ChatOpenAI } from '@langchain/openai'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

const perplexityKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY || 'placeholder'
const suggestModel = new ChatOpenAI({
  apiKey: perplexityKey,
  modelName: 'sonar-pro',
  configuration: { baseURL: 'https://api.perplexity.ai' },
  maxRetries: 1,
  temperature: 0.8,
})

function buildSuggestPrompt(category: string, month: number, count: number): string {
  return `당신은 대한민국 전문 SEO 마케터입니다.
현재 ${month}월입니다. 시즌 특성과 트렌드를 반영하여 "${category}" 카테고리에 해당하는 수익성 높은 블로그용 상품 키워드를 정확히 ${count}개 추천해주세요.

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
`
}

function parseKeywords(rawText: string): Array<{ keyword: string, articleType: string }> {
  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed.filter((i: any) => i && typeof i.keyword === 'string')
        .map((i: any) => ({
          keyword: i.keyword,
          articleType: ['single', 'compare', 'curation'].includes(i.articleType) ? i.articleType : 'single'
        }))
    }
  } catch (e) {
    console.warn('[cron/campaigns] JSON 파싱 실패')
  }
  return []
}

async function main() {
  try {
    const campaigns = await prisma.categoryCampaign.findMany()
    let generatedCount = 0
    const results = []

    for (const campaign of campaigns) {
      const pendingCount = await prisma.autopilotQueue.count({
        where: {
          campaignId: campaign.id,
          status: { in: ['WAITING_APPROVAL', 'PENDING', 'PROCESSING'] }
        }
      })

      if (pendingCount <= 3) {
        console.log(`[Cron] 캠페인 ${campaign.categoryName} 큐 보충 필요. (현재: ${pendingCount})`)
        const countToGenerate = campaign.batchSize || 15
        const prompt = buildSuggestPrompt(campaign.categoryName, new Date().getMonth() + 1, countToGenerate)
        
        console.log("Invoking Perplexity...")
        const res = await suggestModel.invoke(prompt)
        const rawText = res.content.toString()
        console.log("Received AI Response")
        const keywords = parseKeywords(rawText).slice(0, countToGenerate)

        if (keywords.length > 0) {
          const createData = keywords.map(k => ({
            keyword: k.keyword,
            status: campaign.isAutoApprove ? 'PENDING' : 'WAITING_APPROVAL',
            campaignId: campaign.id,
            personaId: campaign.personaId,
            themeId: campaign.themeId,
            articleType: k.articleType || 'single',
            intervalHours: campaign.intervalHours,
            activeTimeStart: campaign.activeTimeStart,
            activeTimeEnd: campaign.activeTimeEnd,
            textModel: 'gpt-4o',
            imageModel: 'dall-e-3',
          }))

          console.log(`Inserting ${createData.length} mock queues...`)
          await prisma.autopilotQueue.createMany({ data: createData as any })
          generatedCount += createData.length
          results.push({ campaignId: campaign.id, category: campaign.categoryName, generated: createData.length })
        }
      }
    }
    console.log("Cron Success:", { processedCampaigns: campaigns.length, generatedCount, results })
  } catch (err) {
    console.error("Cron Error:", err)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
