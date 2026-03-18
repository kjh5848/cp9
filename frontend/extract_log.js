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
    console.log("== IMAGE MODEL ==");
    console.log(pack.imageModel);
    console.log("== PIPELINE BODY ==");
    console.log(pack.body?.imageModel);
  }
}
main();
