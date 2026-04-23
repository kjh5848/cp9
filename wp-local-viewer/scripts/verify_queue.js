const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.autopilotQueue.count();
  const latest = await prisma.autopilotQueue.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { keyword: true, status: true, campaign: { select: { categoryName: true } } }
  });
  console.log("Total Queue Count:", count);
  console.log("Latest items:", JSON.stringify(latest, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
