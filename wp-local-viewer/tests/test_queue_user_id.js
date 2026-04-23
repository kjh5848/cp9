import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const queues = await prisma.autopilotQueue.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, keyword: true, userId: true, campaignId: true }
  });
  console.log(queues);
}
main().catch(console.error).finally(() => prisma.$disconnect());
