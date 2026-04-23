const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const campaigns = await prisma.categoryCampaign.findMany();
  for (const campaign of campaigns) {
    console.log(`Campaign ${campaign.categoryName}: userId=${campaign.userId}`);
    const user = await prisma.user.findUnique({
          where: { id: campaign.userId ?? undefined },
          select: { perplexityApiKey: true, openAiApiKey: true }
    });
    console.log(`-> user=${user?.id ? 'found' : 'not found'} openai=${!!user?.openAiApiKey} perplexity=${!!user?.perplexityApiKey}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
