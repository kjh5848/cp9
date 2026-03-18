const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const research = await prisma.research.findUnique({
    where: {
      projectId_itemId: {
        projectId: 'proj_mmvj6zcn_wu73r6x',
        itemId: '8776089176'
      }
    }
  });

  if (research) {
    const pack = JSON.parse(research.pack);
    
    console.log("== RAW 2000 CHARS OF FRAGMENT ==");
    const fragments = pack.articleFragments || [];
    const fullText = fragments.join("\n");
    console.log(fullText.substring(0, 2000));
  }
}
main();
