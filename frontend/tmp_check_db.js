const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      coupangAccessKey: true,
      coupangSecretKey: true
    }
  });
  console.log("Users and Keys:");
  users.forEach(u => {
    console.log(`- ${u.email}: Access[${u.coupangAccessKey ? u.coupangAccessKey.length : 0} chars] Secret[${u.coupangSecretKey ? u.coupangSecretKey.length : 0} chars]`);
    console.log(`  Access Starts: ${u.coupangAccessKey ? u.coupangAccessKey.substring(0, 5) : 'N/A'}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
