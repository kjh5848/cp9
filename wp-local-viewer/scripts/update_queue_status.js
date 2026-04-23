import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Autopilot Queue Migration...');

  // 1. Find all items in WAITING_APPROVAL status
  const waitingItems = await prisma.autopilotQueue.findMany({
    where: {
      status: 'WAITING_APPROVAL'
    }
  });

  console.log(`Found ${waitingItems.length} items in WAITING_APPROVAL status.`);

  if (waitingItems.length === 0) {
    console.log('No migration needed. Exiting...');
    return;
  }

  // 2. Update status to PENDING
  const updateResult = await prisma.autopilotQueue.updateMany({
    where: {
      status: 'WAITING_APPROVAL'
    },
    data: {
      status: 'PENDING'
    }
  });

  console.log(`Successfully updated ${updateResult.count} items to PENDING status.`);
  console.log('Migration completed.');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
