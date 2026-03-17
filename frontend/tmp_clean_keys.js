const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    if (u.coupangAccessKey || u.coupangSecretKey) {
      // Check if the key is exactly duplicated (e.g., AAAA)
      let cleanAccess = u.coupangAccessKey;
      if (cleanAccess && cleanAccess.length % 2 === 0) {
        const half = cleanAccess.length / 2;
        if (cleanAccess.substring(0, half) === cleanAccess.substring(half)) {
          cleanAccess = cleanAccess.substring(0, half);
        }
      }

      let cleanSecret = u.coupangSecretKey;
      if (cleanSecret && cleanSecret.length % 2 === 0) {
        const half = cleanSecret.length / 2;
        if (cleanSecret.substring(0, half) === cleanSecret.substring(half)) {
          cleanSecret = cleanSecret.substring(0, half);
        }
      }
      
      console.log(`User ${u.email} fixed A: ${cleanAccess} S: ${cleanSecret}`);
      
      if (cleanAccess !== u.coupangAccessKey || cleanSecret !== u.coupangSecretKey) {
         await prisma.user.update({
           where: { id: u.id },
           data: {
             coupangAccessKey: cleanAccess,
             coupangSecretKey: cleanSecret
           }
         });
         console.log(`Updated user ${u.email} keys (removed duplication)`);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
