const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendingCount = await prisma.autopilotQueue.count({
    where: {
      status: { in: ['WAITING_APPROVAL', 'PENDING', 'PROCESSING'] }
    }
  });
  console.log("Current Pending Count in DB:", pendingCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
