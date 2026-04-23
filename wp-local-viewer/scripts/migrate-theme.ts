import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB migration for themes...');
  const themes = await prisma.articleTheme.findMany();
  for (const theme of themes) {
    try {
      const config = JSON.parse(theme.config);
      if (!config.advanced) {
        config.advanced = {};
      }
      
      // 기존 테마 무조건 inline으로 변경
      config.advanced.styleMode = 'inline';
      
      await prisma.articleTheme.update({
        where: { id: theme.id },
        data: { config: JSON.stringify(config) }
      });
      console.log(`Updated theme: ${theme.name}`);
    } catch (e) {
      console.error(`Failed to update theme ${theme.name}:`, e);
    }
  }
  console.log('Migration completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
