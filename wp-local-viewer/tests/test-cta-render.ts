import fs from 'fs';
import { buildCtaHtmlSnippet } from '../src/app/api/item-research/pipeline/seo-cta-builder';

const options = {
  productUrl: 'https://www.coupang.com/vp/products/12345678',
  productName: '헤라 옴므 블랙 액티브 2종 세트 (스킨 + 로션)',
  imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  price: 54000,
  isRocket: true,
  copyText: '남성 피부의 완성! 끈적임 없는 완벽한 보습 케어',
};

// 강제로 카운터를 리셋할 수 없으니 3번 연달아 호출해서 A, B, C를 모두 가져옵니다.
const htmlA = buildCtaHtmlSnippet(options);
const htmlB = buildCtaHtmlSnippet(options);
const htmlC = buildCtaHtmlSnippet(options);

const fullHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTA Preview</title>
    <style>
        body {
            background-color: #f1f5f9;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        h2 { margin-top: 60px; color: #334155; font-family: sans-serif; }
    </style>
</head>
<body>
    <h2>🚀 Type A: 프로모션 카드형 (Deep Tech)</h2>
    ${htmlA}

    <h2>🚨 Type B: 긴급성 뱃지형 (Attention)</h2>
    ${htmlB}

    <h2>✍️ Type C: 네이티브 결합형 (Inline Flow)</h2>
    ${htmlC}
</body>
</html>
`;

fs.writeFileSync('preview-cta.html', fullHtml);
console.log('✅ preview-cta.html created.');
