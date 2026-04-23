const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const items = await prisma.autopilotQueue.findMany({ orderBy: { createdAt: 'desc' }, take: 2 });
  console.log(JSON.stringify(items, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
