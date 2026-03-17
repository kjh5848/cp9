import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const campaigns = await prisma.categoryCampaign.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Campaigns:', JSON.stringify(campaigns, null, 2));

  const queues = await prisma.autopilotQueue.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      nextRunAt: true,
      intervalHours: true,
      activeTimeStart: true,
      activeTimeEnd: true,
      publishTimes: true,
    }
  });
  console.log('Queues:', JSON.stringify(queues, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
