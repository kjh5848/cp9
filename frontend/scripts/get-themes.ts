import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const themes = await prisma.articleTheme.findMany();
  themes.forEach(t => {
    if (t.name.includes('블루')) {
      console.log('--- THEME ---');
      console.log(t.name);
      console.log(t.config);
    }
  });
}
main();
