import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const queues = await prisma.autopilotQueue.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
  });

  for (const q of queues) {
    console.log(`Keyword: ${q.keyword}, Status: ${q.status}, nextRunAt: ${q.nextRunAt}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
