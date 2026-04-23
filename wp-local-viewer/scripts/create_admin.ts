import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log("Admin already exists:", existingAdmin.email);
    return;
  }

  const hashedPassword = await bcrypt.hash('admin1234!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cp9.com',
      nickname: '관리자',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log("Admin created successfully:", admin.email, "Password: admin1234!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
