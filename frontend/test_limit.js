const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const campaigns = await prisma.categoryCampaign.findMany();
  for (const campaign of campaigns) {
    const pendingCount = await prisma.autopilotQueue.count({
      where: {
        campaignId: campaign.id,
        status: { in: ['WAITING_APPROVAL', 'PENDING', 'PROCESSING'] }
      }
    });
    console.log(`Campaign ${campaign.categoryName}: pendingCount=${pendingCount}, batchSize=${campaign.batchSize}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
