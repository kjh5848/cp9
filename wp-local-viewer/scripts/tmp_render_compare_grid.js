const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../../.agents/skills/seo-pipeline/references/cta-templates/cta-compare-grid.html');
const template = fs.readFileSync(templatePath, 'utf-8');

const result = template
  .replace(/\{\{PRODUCT_IMAGE\}\}/g, 'https://thumbnail7.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2023/08/11/17/3/1c8f1fdb-f97e-40af-b9fd-0a71be7b1e4e.jpg')
  .replace(/\{\{PRODUCT_NAME\}\}/g, '원격 피트니스 실내 자전거 프로 (2024년형 최신 모델)')
  .replace(/\{\{PRICE_BLOCK\}\}/g, '<div style="font-size:28px;font-weight:800;color:#111827;margin:16px 0;">349,000<span style="font-size:16px;color:#6b7280;font-weight:600;">원</span></div>')
  .replace(/\{\{BUY_URL\}\}/g, '#')
  .replace(/\{\{KEY_FEATURE_TITLE_1\}\}/g, '극강의 소음 억제 기술 적용')
  .replace(/\{\{KEY_FEATURE_DESC_1\}\}/g, '마그네틱 휠 방식으로 층간 소음 걱정 없이 새벽에도 강도 높은 훈련이 가능합니다.')
  .replace(/\{\{KEY_FEATURE_TITLE_2\}\}/g, '스마트 연동 지원')
  .replace(/\{\{KEY_FEATURE_DESC_2\}\}/g, '즈위프트(Zwift), 펠로톤 앱과 실시간 연동되어 몰입감 넘치는 라이딩을 경험하세요.')
  .replace(/\{\{RECOMMEND_TARGET\}\}/g, '원룸, 오피스텔 하우징 거주자 및 퇴근 후 심야 운동을 즐기는 직장인')
  .replace(/\{\{URGENCY_BANNER\}\}/g, '<div style="background:rgba(37,99,235,0.1);color:#1d4ed8;padding:12px;border-radius:12px;font-size:14px;font-weight:700;margin-top:20px;display:inline-block;">🔥 오늘 구매 시 고급 매트 무료 증정</div>');

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compare Grid Preview</title>
</head>
<body style="background:#f3f4f6;padding:40px;margin:0;">
    <div style="max-width:900px;margin:0 auto;">
        ${result}
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '../preview-compare-grid.html'), html);
console.log('preview-compare-grid.html created.');
