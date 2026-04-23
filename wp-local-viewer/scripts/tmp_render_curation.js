const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../../.agents/skills/seo-pipeline/references/cta-templates/cta-curation-v2.html');
const template = fs.readFileSync(templatePath, 'utf-8');

const result = template
  .replace(/\{\{PRODUCT_IMAGE\}\}/g, 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2023/08/11/17/3/1c8f1fdb-f97e-40af-b9fd-0a71be7b1e4e.jpg')
  .replace(/\{\{PRODUCT_NAME\}\}/g, '프리미엄 노이즈 캔슬링 헤드폰')
  .replace(/\{\{PRICE_BLOCK\}\}/g, '<div style="font-size:26px;font-weight:800;color:#111827;margin:12px 0;">349,000<span style="font-size:16px;color:#6b7280;font-weight:600;">원</span></div>')
  .replace(/\{\{BUY_URL\}\}/g, '#')
  .replace(/\{\{URGENCY_BANNER\}\}/g, '<div style="background:rgba(234,88,12,0.1);color:#c2410c;padding:12px;border-radius:12px;font-size:14px;font-weight:700;margin:16px 0;">🔥 한정 수량 특가 진행 중!</div>')
  .replace(/\{\{SOCIAL_PROOF\}\}/g, '⭐ 평점 4.9 (구매자 리뷰 1,500개 이상)');

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Curation V2 Preview</title>
</head>
<body style="background:#f3f4f6;padding:40px;margin:0;">
    <div style="max-width:800px;margin:0 auto;">
        ${result}
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '../preview-curation-v2.html'), html);
console.log('preview-curation-v2.html created.');
