import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const newCamp = await prisma.categoryCampaign.create({
      data: { categoryName: "테스트 카테고리 2", intervalHours: 12, batchSize: 3, isAutoApprove: false }
    })
    console.log("Success:", newCamp)
  } catch (error) {
    console.error("Error creating campaign:", error)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
