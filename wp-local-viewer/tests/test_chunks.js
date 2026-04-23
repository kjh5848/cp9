const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ChatOpenAI } = require('@langchain/openai');

async function main() {
  const campaigns = await prisma.categoryCampaign.findMany({ take: 1 });
  if (campaigns.length === 0) return console.log("No campaigns");
  
  const campaign = campaigns[0];
  console.log(`Testing Campaign: ${campaign.categoryName}, batchSize: ${campaign.batchSize}`);
  
  const countToGenerate = campaign.batchSize || 15;
  const CHUNK_SIZE = 5;
  const iterations = Math.ceil(countToGenerate / CHUNK_SIZE);
  
  console.log(`Iterations: ${iterations}, countToGenerate: ${countToGenerate}`);
  
  for (let i = 0; i < iterations; i++) {
    const currentChunkSize = (i === iterations - 1 && countToGenerate % CHUNK_SIZE !== 0)
      ? countToGenerate % CHUNK_SIZE
      : CHUNK_SIZE;
      
    console.log(`Iter ${i}: requesting chunk size ${currentChunkSize}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
