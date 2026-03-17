const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.autopilotQueue.deleteMany({});
  console.log("Deleted queue items:", result.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
