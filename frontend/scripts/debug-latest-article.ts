import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const latest = await prisma.research.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  if (!latest) {
    console.log("No research found.");
    return;
  }

  const pack = typeof latest.pack === 'string' ? JSON.parse(latest.pack) : latest.pack;
  console.log("=== Latest ItemID ===", latest.itemId);
  console.log("=== Content ===");
  console.log(pack.content.substring(0, 1000));
  
  // Try to find image tags manually
  const content = pack.content;
  const matches = [...content.matchAll(/\[이미지/g)];
  console.log(`\nFound '[이미지' ${matches.length} times in content`);
  
  const ctxMatches = [...content.matchAll(/이미지/g)];
  console.log(`Found '이미지' ${ctxMatches.length} times in content`);
  
  // Also check researchRaw if content is missing
  if (pack.researchRaw) {
      console.log("Has researchRaw:", pack.researchRaw.length > 0);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
