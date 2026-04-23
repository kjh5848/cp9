import fs from 'fs';
import { runHtmlPhase } from '../src/app/api/item-research/pipeline/html-phase';

async function generateMockSeoArticle() {
  console.log('🧪 SEO 아티클 모의 생성 테스트 시작...');

  // 1. LLM이 생성했다고 가정한 완벽한 SEO 마크다운 더미
  const mockMarkdownRaw = `
# 30대 남성 스킨로션 추천, 헤라 옴므 블랙 액티브 2종 세트로 자기관리 끝내기!

최근 30대에 접어들면서 피부가 부쩍 건조해지고 탄력이 떨어지는 걸 느끼시나요? 바쁜 아침, 여러 단계를 바르기 귀찮은 남성분들을 위해 최상의 퀄리티와 편리함을 자랑하는 **'헤라 옴므 블랙 액티브 2종 세트'**를 소개합니다.

[이미지 제안: 아침 햇살이 들어오는 모던한 욕실 세면대 위 수건과 남성 스킨케어]

## 1. 첫인상을 결정짓는 남성 피부, 왜 관리가 중요할까?

남성의 피부는 여성보다 두껍지만 잦은 면도와 스트레스로 인해 오히려 더 쉽게 거칠어지고 손상됩니다. 특히 30대가 되면 수분 유지 능력이 떨어져 푸석푸석해 보이기 십상이죠. 성공적인 대인관계를 위해서라도 맑고 생기 있는 피부 관리는 필수입니다.

## 2. 헤라 옴므 블랙 액티브만의 특별한 점

아모레퍼시픽의 노하우가 담긴 이 제품은 강력한 하이알루론산과 안티에이징 성분을 함유하고 있습니다. 
*   **끈적임 없는 흡수력**: 바르는 즉시 스며들어 불쾌감이 전혀 없습니다.
*   **올인원 효과**: 스킨과 로션 2단계만으로도 피부 깊숙한 곳까지 수분을 채워줍니다.
*   **고급스러운 시트러스 우디 향**: 바를 때마다 기분이 좋아지는 세련된 남성의 향기입니다.

[[[CTA_BUTTON:https://www.coupang.com/vp/products/1111111]]]

[이미지 제안: 검은색 모던한 화장품 용기를 손에 들고 있는 디테일 컷]

## 3. 사용자들의 실제 리뷰 (만족도 최상!)

수많은 구매자분들이 "이것만 씁니다", "선물용으로 샀는데 남편이 너무 좋아하네요"라는 후기를 남겨주셨습니다. 한 번 써본 사람은 다른 제품으로 돌아가기 힘들 정도로 만족감이 높은 인생템입니다.

## 결론: 품절되기 전에 확인해보세요!

헤라 옴므 블랙 액티브 세트는 남성분들을 위한 가장 완벽한 스킨케어 패키지입니다. 본인을 위한 투자로도 좋고, 남자친구나 남편을 위한 선물로도 이보다 좋은 선택은 없습니다. 지금 바로 아래 링크를 통해 혜택을 확인해보세요!

[[[CTA_BUTTON:https://www.coupang.com/vp/products/1111111]]]
  `;

  // 2. 파이프라인 컨텍스트 모의 객체
  const ctx = {
    articleType: 'compare',
    persona: '객관적인 리뷰어',
    body: {
      itemId: '1111111',
      itemName: '헤라 옴므 블랙 액티브 2종 세트',
      productData: {
        productUrl: 'https://www.coupang.com/vp/products/1111111',
        productImage: 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/11/04/10/8/d6d7cf61-12c8-47bc-ad7e-61beaf6d9fd3.png',
        productPrice: 65000,
        isRocket: true,
      },
      items: [
        {
          productName: '헤라 옴므 블랙 액티브 2종 세트',
          productPrice: 65000,
          productImage: 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/11/04/10/8/d6d7cf61-12c8-47bc-ad7e-61beaf6d9fd3.png',
          productUrl: 'https://www.coupang.com/vp/products/1111111',
          categoryName: '남성 스킨케어',
          isRocket: true,
          isFreeShipping: true,
          productId: '1111111'
        },
        {
          productName: '비오템 옴므 아쿠아파워 올인원',
          productPrice: 45000,
          productImage: 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/11/04/10/8/d6d7cf61-12c8-47bc-ad7e-61beaf6d9fd3.png',
          productUrl: 'https://www.coupang.com/vp/products/2222222',
          categoryName: '남성 화장품',
          isRocket: false,
          isFreeShipping: true,
          productId: '2222222'
        }
      ]
    },
    themeConfig: {
      name: '테스트 딥테크 테마',
    }
  } as any;

  // 3. 픽사베이 이미지 생성 모의 결과 맵
  // (실제 쿠팡 상품 이미지는 CTA에 쓰이고, 여기서는 분위기용 스탁 이미지만 쓰입니다)
  const imageUrlMap = {
    '아침 햇살이 들어오는 모던한 욕실 세면대 위 수건과 남성 스킨케어': 'https://cdn.pixabay.com/photo/2020/03/24/20/55/bathroom-4965415_1280.jpg',
    '검은색 모던한 화장품 용기를 손에 들고 있는 디테일 컷': 'https://cdn.pixabay.com/photo/2016/09/10/16/06/beauty-1659395_1280.jpg'
  };

  // 대표 이미지 (섬네일용)
  const mainImageUrl = ctx.body.productData.productImage;

  // 4. HTML 파이프라인 변환 수행
  const finalHtml = await runHtmlPhase(ctx, mockMarkdownRaw, imageUrlMap, mainImageUrl);

  // 5. 보기 좋게 브라우저용 HTML 뼈대 작성 후 파일로 저장
  const fullHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Article Test</title>
    <style>
        body {
            background-color: #f8fafc;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            font-family: 'Pretendard', sans-serif;
            color: #1e293b;
            line-height: 1.6;
        }
        .post-container {
            background: #fff;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
    </style>
</head>
<body>
    <div class="post-container">
    ${finalHtml}
    </div>
</body>
</html>
`;

  fs.writeFileSync('preview-seo-article.html', fullHtml);
  console.log('✅ preview-seo-article.html 파일 생성 완료!');
}

generateMockSeoArticle().catch(console.error);
