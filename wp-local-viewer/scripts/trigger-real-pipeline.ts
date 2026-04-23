import { PrismaClient } from '@prisma/client';
import { runSeoPipeline } from '../src/app/api/item-research/pipeline/run-pipeline';
import { ItemResearchRequest } from '../src/app/api/item-research/pipeline/types';

const prisma = new PrismaClient();

async function main() {
  const timestamp = Date.now();
  const commonConfig = {
    persona: 'IT',
    textModel: 'gpt-4o',
    imageModel: 'dall-e-3',
    tone: 'Professional',
    charLimit: 2000,
    publishTarget: 'WORDPRESS' as const,
  };

  const req1: ItemResearchRequest = {
    projectId: `TEST_SINGLE_${timestamp}`,
    itemId: 'SINGLE_1',
    itemName: '로지텍 MX Master 3S 최고급 무선 마우스',
    productData: {
      productName: '로지텍 MX Master 3S',
      productUrl: 'https://coupang.com/vp/products/11111',
      productImage: 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/11/04/10/8/d6d7cf61-12c8-47bc-ad7e-61beaf6d9fd3.png',
      productPrice: 139000,
      isRocket: true,
      categoryName: '무선 마우스',
      isFreeShipping: true
    },
    seoConfig: { ...commonConfig, articleType: 'single' }
  };

  const req2: ItemResearchRequest = {
    projectId: `TEST_COMPARE_${timestamp}`,
    itemId: 'COMPARE_1',
    itemName: '사무용 최고급 무선 마우스 3종',
    items: [
      {
        productName: '로지텍 MX Master 3S',
        productUrl: 'https://coupang.com/vp/products/111',
        productPrice: 139000,
        productImage: 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/11/04/10/8/d6d7cf61-12c8-47bc-ad7e-61beaf6d9fd3.png',
        isRocket: true,
        categoryName: '무선 마우스',
        isFreeShipping: true,
        productId: '111'
      },
      {
        productName: '레이저 프로 클릭',
        productUrl: 'https://coupang.com/vp/products/222',
        productPrice: 125000,
        productImage: 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/11/04/10/8/d6d7cf61-12c8-47bc-ad7e-61beaf6d9fd3.png',
        isRocket: false,
        categoryName: '무선 마우스',
        isFreeShipping: true,
        productId: '222'
      },
      {
        productName: '마이크로소프트 서피스 프리시전',
        productUrl: 'https://coupang.com/vp/products/333',
        productPrice: 119000,
        productImage: 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/11/04/10/8/d6d7cf61-12c8-47bc-ad7e-61beaf6d9fd3.png',
        isRocket: true,
        categoryName: '무선 마우스',
        isFreeShipping: true,
        productId: '333'
      }
    ],
    seoConfig: { ...commonConfig, articleType: 'compare' }
  };

  const req3: ItemResearchRequest = {
    projectId: `TEST_CURATION_${timestamp}`,
    itemId: 'CURATION_1',
    itemName: '사무용 무선 마우스 베스트셀러 10종 큐레이션',
    items: Array.from({ length: 10 }).map((_, i) => ({
      productName: `사무용 잇템 ${i+1}`,
      productUrl: `https://coupang.com/vp/products/999${i}`,
      productPrice: 100000 + (i * 5000),
      productImage: 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/11/04/10/8/d6d7cf61-12c8-47bc-ad7e-61beaf6d9fd3.png',
      isRocket: i % 2 === 0,
      categoryName: '무선 마우스',
      isFreeShipping: true,
      productId: `999${i}`
    })),
    seoConfig: { ...commonConfig, articleType: 'curation' }
  };

  console.log("=== Triggering Single (Deep Dive) Pipeline ===");
  await runSeoPipeline(req1, { ...commonConfig, articleType: 'single' } as any);
  console.log("Single done");

  console.log("\n=== Triggering Compare Pipeline ===");
  await runSeoPipeline(req2, { ...commonConfig, articleType: 'compare' } as any);
  console.log("Compare done");

  console.log("\n=== Triggering Curation Pipeline ===");
  await runSeoPipeline(req3, { ...commonConfig, articleType: 'curation' } as any);
  console.log("Curation done");

  console.log("\n✅ All real generation complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
