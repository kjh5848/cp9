import { runHtmlPhase } from './src/app/api/item-research/pipeline/html-phase';
import { runImagePhase } from './src/app/api/item-research/pipeline/image-phase';

async function test() {
  const ctx: any = {
    articleType: 'single',
    imageModel: 'none',
    trace: { span: () => ({ end: () => {} }) },
    body: {
      itemName: 'Test Item',
      productData: { productImage: 'http://fallback.com/img.jpg' }
    }
  };

  const mdRaw = `
# 제목
테스트입니다.
[이미지 제안: 강아지 귀여운 사진]
테스트2입니다.
[이미지 제안: 고양이 자는 사진]
  `;

  const suggestions = ['강아지 귀여운 사진', '고양이 자는 사진'];
  const urlMap = await runImagePhase(ctx, suggestions);
  console.log("Image Map:", urlMap);

  const html = await runHtmlPhase(ctx, mdRaw, urlMap, null);
  console.log("Final HTML Length:", html.length);
  const dogUrl = urlMap['강아지 귀여운 사진'];
  const catUrl = urlMap['고양이 자는 사진'];
  console.log("HTML contains Image 1?", dogUrl ? html.includes(dogUrl) : false);
  console.log("HTML contains Image 2?", catUrl ? html.includes(catUrl) : false);
}

test().catch(console.error);
