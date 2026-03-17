import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'kjh5848@gmail.com' }, select: { id: true, email: true }});
  console.log("Logged in user:", user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
