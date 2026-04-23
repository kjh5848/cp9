import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const items = ['SINGLE_1', 'COMPARE_1', 'CURATION_1'];
  
  for (const itemId of items) {
    const research = await prisma.research.findFirst({
      where: { itemId },
      orderBy: { updatedAt: 'desc' }
    });

    if (research) {
      const pack = typeof research.pack === 'string' ? JSON.parse(research.pack) : research.pack;
      const htmlContent = pack.content;
      
      const filePath = path.join(__dirname, `../real-${itemId.toLowerCase()}.html`);
      // Add standard HTML envelope
      const fullHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Real Pipeline - ${itemId}</title>
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css" />
  <style>
    body { font-family: "Pretendard", sans-serif; background-color: #f9fafb; padding: 20px; }
    .prose { max-width: 768px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); line-height: 1.8; color: #374151; }
    .prose img { max-width: 100%; height: auto; border-radius: 8px; margin: 24px 0; }
    .prose h1 { font-size: 2em; margin-bottom: 24px; color: #111827; }
    .prose h2 { font-size: 1.5em; margin-top: 40px; margin-bottom: 16px; color: #1f2937; }
    .prose h3 { font-size: 1.25em; margin-top: 32px; margin-bottom: 12px; color: #374151; }
    .prose p { margin-bottom: 16px; }
    .prose ul, .prose ol { margin-bottom: 16px; padding-left: 24px; }
    .prose li { margin-bottom: 8px; }
    .prose blockquote { border-left: 4px solid #e5e7eb; padding-left: 16px; color: #6b7280; font-style: italic; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="prose">
    ${htmlContent}
  </div>
</body>
</html>`;
      fs.writeFileSync(filePath, fullHtml, 'utf8');
      console.log(`Saved ${filePath}`);
    } else {
      console.log(`No research found for ${itemId}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
