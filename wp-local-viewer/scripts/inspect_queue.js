require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.autopilotQueue.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, keyword: true, status: true, articleType: true }
  });
  console.log("Queue Items:", JSON.stringify(items, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
