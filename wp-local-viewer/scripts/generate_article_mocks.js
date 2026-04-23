const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../../.agents/skills/seo-pipeline/references/cta-templates/v2-compare-curation');
const defaultDir = path.join(__dirname, '../../.agents/skills/seo-pipeline/references/cta-templates');

const loadTpl = (name, isV2 = true) => fs.readFileSync(path.join(isV2 ? templatesDir : defaultDir, name), 'utf-8');

const tplDefault = loadTpl('cta-default.html', false);
const tplCompareFooter = loadTpl('cta-compare-v2.html');
const tplCompareGrid = loadTpl('cta-compare-grid.html');
const tplSummaryTable = loadTpl('cta-summary-table.html');
const tplCurationFooter = loadTpl('cta-curation-v2.html');
const tplCompact = loadTpl('cta-compact.html');

const getImg = (id, width = 800, height = 500) => `https://picsum.photos/id/${id}/${width}/${height}`;

// 다량의 더미 텍스트 생성기 (SEO 본문 분량 체감용)
// === 최적화 글자수(약 180~200자)를 엄수한 PASONA 공식 인트로 ===
const pasonaIntroText = `
<p>
  <strong>[P]</strong> 떨어지는 생산성과 피로감 때문에 매일 고생하고 계신가요?<br>
  <strong>[A]</strong> 저 역시 오랫동안 같은 고민으로 이것저것 사보며 시간과 돈을 낭비했습니다.<br>
  <strong>[S]</strong> 해결책은 바로 수백 명이 검증한 하이엔드 프리미엄 아이템입니다.<br>
  <strong>[O]</strong> 일상의 퀄리티를 수직 상승시켜줄 핵심 제품들만 엄선해 분석했습니다.<br>
  <strong>[N]</strong> 오늘 한정된 특별 할인 혜택이 곧 종료될 예정입니다.<br>
  <strong>[A]</strong> 재고가 소진되기 전에 지금 바로 최저가를 확인해보세요!
</p>
`;

const longDummyText2 = `
<p>수개월에 걸친 테스트와 꼼꼼한 검증을 거치면서 가장 크게 체감한 부분은 바로 '안정성'입니다. 극한의 환경에서도 본연의 기능을 잃지 않으며, 시간이 지날수록 오히려 사용자의 라이프스타일에 맞게 에이징(Aging)되는 듯한 느낌을 줍니다. 시중에 쏟아지는 수많은 카피캣 제품들이 결코 흉내 낼 수 없는 고유의 철학과 헤리티지가 돋보입니다.</p>
`;

const longDummyText3 = `
<p>더 이상 고민은 배송만 늦출 뿐입니다. 우리는 이미 충분한 정보를 수집했고, 이 글을 끝까지 읽으셨다면 마음속의 결정은 이미 내려졌을지도 모릅니다. 단 돈 몇 만원을 아끼기 위해 몇 주를 검색하고 비교하는 시간의 기회비용을 생각해 보십시오. 지금 바로 결정하고 내일부터 당장 달라진 일상의 퍼포먼스를 경험하시는 것이 가장 현명한 소비입니다.</p>
`;

const getLongText = () => pasonaIntroText + longDummyText2;

const wrapHTML = (title, bodyHtml, isMobile = false) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { background:#f9fafb; margin:0; padding:${isMobile ? '0' : '60px 20px'}; font-family:'Pretendard', sans-serif; } 
        .article-container { 
            max-width: ${isMobile ? '400px' : '860px'}; 
            margin: 0 auto; 
            background: #fff; 
            padding: ${isMobile ? '20px 20px 60px 20px' : '60px 80px'}; 
            border-radius: ${isMobile ? '0' : '20px'}; 
            box-shadow: ${isMobile ? 'none' : '0 10px 40px rgba(0,0,0,0.03)'};
        } 
        h1 { margin-top:20px; font-size:${isMobile ? '28px' : '36px'}; font-weight:800; border-bottom: 3px solid #111; padding-bottom:16px; margin-bottom: 40px; line-height: 1.4;} 
        h2 { font-size:${isMobile ? '22px' : '28px'}; font-weight:800; margin-top: 60px; margin-bottom: 24px; color:#111827;} 
        p { font-size:${isMobile ? '15px' : '17px'}; line-height:1.8; color:#374151; margin-bottom:28px; letter-spacing:-0.5px; word-break:keep-all; }
        .mock-hero { width:100%; height:${isMobile ? '250px' : '500px'}; object-fit:cover; border-radius:${isMobile ? '12px' : '16px'}; margin-bottom:30px; }
        .mock-body-img { width:100%; height:auto; border-radius:${isMobile ? '10px' : '16px'}; margin-bottom:24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .cp9-cta { margin-top: ${isMobile ? '60px' : '80px'} !important; margin-bottom: ${isMobile ? '60px' : '80px'} !important; }
    </style>
</head>
<body><div class="article-container">${bodyHtml}</div></body>
</html>`;

// --- 1. 단일 딥다이브글 (1 item) ---
const singleTplHeader = tplDefault.split('<!-- ── 하단: 최종 CTA 블록 ── -->')[0];
const singleTplFooter = '<!-- ── 하단: 최종 CTA 블록 ── -->' + tplDefault.split('<!-- ── 하단: 최종 CTA 블록 ── -->')[1];

const typeA_HTML = `
<!-- Type A: 프로모션 카드형 -->
<a href="#" target="_blank" rel="nofollow noopener noreferrer" style="display: flex; flex-direction: row; align-items: center; background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 24px; margin: 80px 0; text-decoration: none; color: inherit; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); transition: transform 0.2s ease, box-shadow 0.2s ease; gap: 20px; flex-wrap: wrap; font-family: 'Pretendard', 'Inter', sans-serif;">
  <div style="flex-shrink: 0; border-radius: 14px; overflow: hidden; background: #fafafa; padding: 8px; border: 1px solid rgba(0,0,0,0.03);"><img src="${getImg(21, 300, 300)}" alt="Product" style="width: 130px; height: 130px; object-fit: contain; border-radius: 8px;"></div>
  <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column; align-items: flex-start; width: 100%;">
    <p style="font-size: 13px; font-weight: 700; color: #64748b; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">⭐ BEST PICK</p>
    <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 8px 0; color: #111827; line-height: 1.4; letter-spacing: -0.4px;">로지텍 MX Master 3S 최고급 무선 마우스</h3>
    <div style="font-size: 20px; font-weight: 800; color: #000000; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">139,000원 <span style="font-size: 12px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 4px 8px; border-radius: 6px;">🚀 로켓배송</span></div>
    <div style="display: inline-flex; align-items: center; justify-content: center; background: #000000; color: #ffffff; padding: 14px 28px; border-radius: 9999px; font-weight: 700; font-size: 15px;">쿠팡에서 최저가 확인하기 <span style="margin-left: 8px; font-size: 16px;">↗</span></div>
  </div>
</a>
`;

const typeB_HTML = `
<!-- Type B: 긴급성 뱃지형 -->
<div style="position: relative; margin: 80px 0; background: #09090b; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 32px 24px; text-align: center; font-family: 'Pretendard', 'Inter', sans-serif; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); overflow: hidden;">
  <div style="position: absolute; top: -50px; left: 50%; transform: translateX(-50%); width: 200px; height: 100px; background: linear-gradient(135deg, #FF0080, #7928CA); filter: blur(60px); opacity: 0.3; pointer-events: none;"></div>
  <div style="display: inline-block; background: linear-gradient(135deg, #FF0080, #7928CA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 14px; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px;">🚨 LIMITED OFFER</div>
  <h3 style="font-size: 20px; font-weight: 700; margin: 0 0 24px 0; color: #ffffff;">로지텍 MX Master 3S 최고급 무선 마우스</h3>
  <div style="background: #ffffff; border-radius: 16px; padding: 16px; display: inline-block; margin-bottom: 24px;"><img src="${getImg(21, 300, 300)}" alt="Product" style="max-height: 180px; object-fit: contain; filter: contrast(1.05);"></div>
  <div style="display: flex; align-items: baseline; justify-content: center; gap: 8px; margin-bottom: 24px;"><span style="font-size: 28px; font-weight: 800; color: #ffffff;">139,000원</span><span style="font-size: 15px; font-weight: 700; color: #a5b4fc;">🚀 로켓</span></div>
  <a href="#" target="_blank" rel="nofollow noopener noreferrer" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #FF0080 0%, #7928CA 100%); color: #ffffff; padding: 18px 24px; border-radius: 16px; font-weight: 800; font-size: 16px; text-decoration: none;">가장 먼저 혜택 확보하기를 누르세요</a>
</div>
`;

const typeC_HTML = `
<!-- Type C: 네이티브 결합형 -->
<div style="margin: 80px 0; padding: 24px; background: rgba(248,250,252,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 20px; border: 1px solid rgba(0,0,0,0.04); font-family: 'Pretendard', 'Inter', sans-serif;">
  <div style="display: flex; gap: 12px; margin-bottom: 20px;">
    <div style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #000; color: #fff; border-radius: 50%; font-size: 12px;">💬</div>
    <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6; font-style: italic;">
      <strong>에디터 코멘트:</strong> "생산성 300% 수직 상승! 단언컨대 현존하는 최고의 사무용 마우스"
    </p>
  </div>
  <div style="display: flex; align-items: center; gap: 16px; background: #ffffff; padding: 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03); flex-wrap: wrap;">
    <div style="background: #f8fafc; border-radius: 10px; padding: 6px;"><img src="${getImg(21, 300, 300)}" style="width: 56px; height: 56px; object-fit: contain;"></div>
    <div style="flex: 1; min-width: 150px;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 6px 0; color: #0f172a;">로지텍 MX Master 3S</p>
      <p style="font-size: 15px; font-weight: 800; color: #000000; margin: 0; display: flex; align-items: center; gap: 4px;">139,000원 <span style="color: #3b82f6;">🚀</span></p>
    </div>
    <a href="#" target="_blank" rel="nofollow noopener noreferrer" style="background: transparent; color: #000000; padding: 10px 20px; border-radius: 9999px; font-size: 14px; font-weight: 700; text-decoration: none; flex-shrink: 0; border: 1.5px solid #000000;">상세 정보 ↗</a>
  </div>
</div>
`;

let singleBody = `
    <img src="${getImg(7)}" class="mock-hero" alt="Hero">
    <h1>[단일 딥다이브] 생산성 300배 상승템, 로지텍 MX Master 3S 한 달 솔직 리뷰</h1>
    ${pasonaIntroText}
    
    <h2>1. 첫인상과 디자인 (단일 아이템 강조)</h2>
    <img src="${getImg(20)}" class="mock-body-img" alt="Lifestyle">
    <p>포장을 뜯자마자 느껴지는 매트 블랙의 고급스러움이 남다릅니다. 손에 착 감기는 그립감도 일품이네요. 바로 제품 정보 확인해 보실까요?</p>
    ${singleTplHeader.replace(/\{\{PRODUCT_IMAGE\}\}/g, getImg(21, 300, 300)).replace(/\{\{PRODUCT_NAME\}\}/g, '로지텍 MX Master 3S 최고급 무선 마우스').replace(/\{\{PRICE_BLOCK\}\}/g, '<div style="font-size:16px;font-weight:800;color:#111827;line-height:1.2;">139,000원</div>').replace(/\{\{BUY_URL\}\}/g, '#')}
    
    ${typeA_HTML}
    
    <h2>2. 실제 사용 후기 (기능성 검증)</h2>
    <img src="${getImg(22)}" class="mock-body-img" alt="Lifestyle 2">
    <p>가장 큰 장점은 바로 '무소음 특수 휠'입니다. 사무실에서 엑셀 작업을 하거나 밤늦게 작업할 때 시끄러운 클릭 소리로부터 해방될 수 있습니다.</p>
    ${longDummyText2}
    
    <h2>3. 최종 평가 및 꿀팁</h2>
    ${longDummyText3}
    
    ${typeC_HTML}
    
    ${singleTplFooter.replace(/\{\{PRODUCT_IMAGE\}\}/g, getImg(21, 300, 300)).replace(/\{\{PRODUCT_NAME\}\}/g, '로지텍 MX Master 3S').replace(/\{\{URGENCY_BANNER\}\}/g, '').replace(/\{\{SOCIAL_PROOF\}\}/g, '⭐ 평점 4.9/5 (압도적 리뷰 1만 개+)').replace(/\{\{BUY_URL\}\}/g, '#')}
`;
fs.writeFileSync(path.join(__dirname, '../mock-single.html'), wrapHTML('단일 딥다이브', singleBody));


// --- 2. 비교분석 (Compare Analysis, 3 items) ---
let compareBody = `
    <img src="${getImg(33)}" class="mock-hero" alt="Hero">
    <h1>[비교 분석] 의자계의 샤넬, 프리미엄 하이엔드 의자 TOP 3 전격 비교</h1>
    ${pasonaIntroText}
`;
let tableRows = '';
const compareData = [
  { rank: 1, name: '허먼밀러 에어론 체어', img: getImg(41, 150, 150), featTitle:'압도적 착좌감', feat1:'포스처핏 요추 지지', feat2:'메쉬 소재 통기성 1위', price:'1,840,000' },
  { rank: 2, name: '스틸케이스 립체어', img: getImg(42, 150, 150), featTitle:'신체 맞춤 조절', feat1:'라이브백 유연성', feat2:'부드러운 쿠셔닝', price:'1,490,000' },
  { rank: 3, name: '시디즈 T50 프로', img: getImg(43, 150, 150), featTitle:'국민 가성비', feat1:'각도 조절형 헤드레스트', feat2:'AS 접근성 용이', price:'359,000' }
];
let tableHTML = tplSummaryTable.replace('{{SUMMARY_TITLE}}', '프리미엄 의자 TOP 3 비교 분석표').replace('{{SUMMARY_DESC}}', '가격부터 핵심 스펙까지 바쁘신 분들을 위해 한눈에 정리했습니다.');
let loopStr = tableHTML.match(/<!-- \[\[-- FOREACH_ITEM_START --\]\] -->([\s\S]*?)<!-- \[\[-- FOREACH_ITEM_END --\]\] -->/)[1];
compareData.forEach(d => {
  tableRows += loopStr.replace(/\{\{RANK\}\}/g, d.rank).replace(/\{\{PRODUCT_IMAGE\}\}/g, d.img)
    .replace(/\{\{PRODUCT_NAME\}\}/g, d.name).replace('{{KEY_FEATURE_TITLE}}', d.featTitle)
    .replace('{{KEY_FEATURE_DESC_1}}', d.feat1).replace('{{KEY_FEATURE_DESC_2}}', d.feat2).replace('{{PRICE_VAL}}', d.price).replace('{{BUY_URL}}', '#');
});
tableHTML = tableHTML.replace(/<!-- \[\[-- FOREACH_ITEM_START --\]\] -->[\s\S]*?<!-- \[\[-- FOREACH_ITEM_END --\]\] -->/, tableRows);

compareBody += tableHTML;

compareData.forEach((d, idx) => {
  compareBody += `<h2>${d.rank}위. ${d.name} 심층 분해</h2>`;
  compareBody += `<img src="${getImg(45+d.rank)}" class="mock-body-img" alt="Details">`;
  compareBody += `<p>${d.name}은 어떤 점이 다를까요? 에디터가 짚어낸 핵심 스펙입니다.</p>`;
  compareBody += longDummyText2;
  
  compareBody += tplCompareGrid.replace(/\{\{PRODUCT_NAME\}\}/g, d.name).replace(/\{\{PRODUCT_IMAGE\}\}/g, d.img)
        .replace('{{PRICE_BLOCK}}', `<div style="font-size:26px;font-weight:800;color:#111827;margin-bottom:12px;">${d.price}원</div>`)
        .replace(/\{\{KEY_FEATURE_TITLE_1\}\}/g, '인체공학 설계 요약').replace(/\{\{KEY_FEATURE_DESC_1\}\}/g, d.feat1)
        .replace(/\{\{KEY_FEATURE_TITLE_2\}\}/g, '소재 및 내구성').replace(/\{\{KEY_FEATURE_DESC_2\}\}/g, d.feat2)
        .replace(/\{\{RECOMMEND_TARGET\}\}/g, '하루 8시간 이상 모니터를 보는 직장인 및 프리랜서')
        .replace(/\{\{URGENCY_BANNER\}\}/g, '<div style="background:rgba(37,99,235,0.1);color:#1d4ed8;padding:12px;border-radius:12px;font-size:14px;font-weight:700;margin-top:20px;display:inline-block;">🔥 오늘 한정 무이자 할부 혜택 </div>')
        .replace(/\{\{BUY_URL\}\}/g, '#');
});

const compFooter = tplCompareFooter.split('<!-- ── 하단: 비교 결론 CTA ── -->')[1];
compareBody += `<h2>최종 비교 결론</h2><p>위 3가지 의자의 극강의 모델 중 가장 합리적인 1위 모델을 선택하세요.</p>`;
compareBody += longDummyText3;
compareBody += compFooter.replace(/\{\{PRODUCT_IMAGE\}\}/g, compareData[0].img).replace(/\{\{PRODUCT_NAME\}\}/g, compareData[0].name).replace(/\{\{URGENCY_BANNER\}\}/g, '').replace(/\{\{BUY_URL\}\}/g, '#');

fs.writeFileSync(path.join(__dirname, '../mock-compare.html'), wrapHTML('비교 분석', compareBody));


// --- 3. Curation (10 items) ---
let curationBody = `
    <img src="${getImg(60)}" class="mock-hero" alt="Hero">
    <h1>[에디터 큐레이션] 삶의 질 수직 상승! 필수 자취/신혼 꿀템 BEST 10</h1>
    ${pasonaIntroText}
`;

// Curation Summary Table (10 items)
let curTableRows = '';
let curTableHTML = tplSummaryTable.replace('{{SUMMARY_TITLE}}', '에디터 선정 삶의 질 수직 상승템 BEST 10').replace('{{SUMMARY_DESC}}', '10가지 제품의 핵심 스펙과 가격을 한눈에 비교해보세요.');
let curLoopStr = curTableHTML.match(/<!-- \[\[-- FOREACH_ITEM_START --\]\] -->([\s\S]*?)<!-- \[\[-- FOREACH_ITEM_END --\]\] -->/)[1];

for(let i=1; i<=10; i++) {
  curTableRows += curLoopStr.replace(/\{\{RANK\}\}/g, i).replace(/\{\{PRODUCT_IMAGE\}\}/g, getImg(80+i, 100, 100))
    .replace(/\{\{PRODUCT_NAME\}\}/g, `프리미엄 수직 상승템 ${i}세대`)
    .replace('{{KEY_FEATURE_TITLE}}', `핵심 장점 1위`)
    .replace('{{KEY_FEATURE_DESC_1}}', `어디서도 볼 수 없는 역대급 디자인`)
    .replace('{{KEY_FEATURE_DESC_2}}', `실제 사용 만족도 최상`)
    .replace('{{PRICE_VAL}}', `${(120000 + (i*5000)).toLocaleString()}`)
    .replace('{{BUY_URL}}', '#');
}
curTableHTML = curTableHTML.replace(/<!-- \[\[-- FOREACH_ITEM_START --\]\] -->[\s\S]*?<!-- \[\[-- FOREACH_ITEM_END --\]\] -->/, curTableRows);
curationBody += curTableHTML + '<br><br>';

for(let i=1; i<=10; i++) {
  curationBody += `<h2>${i}. 나만의 힐링을 위한 추천템 (${i}위)</h2>`;
  if(i % 3 === 0 || i === 1) {
      curationBody += `<img src="${getImg(70+i)}" class="mock-body-img" alt="Curation ${i}">`;
  }
  curationBody += `<p>집에서도 카페 못지 않은 퀄리티를 즐기고 싶다면 무조건 장바구니에 담아야 할 핵심 아이템입니다.</p>`;
  curationBody += longDummyText2;
  
  curationBody += tplCompact.replace(/\{\{PRODUCT_IMAGE\}\}/g, getImg(80+i, 200, 200))
    .replace(/\{\{PRODUCT_NAME\}\}/g, `프리미엄 상승템 ${i}세대`)
    .replace(/\{\{BADGE_TEXT\}\}/g, `👑 에디터 추천 ${i}위`)
    .replace(/\{\{SOCIAL_PROOF\}\}/g, `실구매 만족도 99%`)
    .replace(/\{\{KEY_FEATURE_DESC_1\}\}/g, `환상적인 사용 경험 제공`)
    .replace(/\{\{PRICE_BLOCK\}\}/g, `<div style="font-size:18px;font-weight:800;color:#111827;">${(120000 + (i*5000)).toLocaleString()}원</div>`)
    .replace(/\{\{BUY_URL\}\}/g, '#');
}

const curFooter = tplCurationFooter.split('<!-- ── 하단: 큐레이션 결론 CTA ── -->')[1];
curationBody += `<h2>마치며</h2><p>지금까지 소개드린 10가지 제품 하나면 삶의 질이 확 달라집니다.</p>`;
curationBody += longDummyText3;
curationBody += curFooter.replace(/\{\{PRODUCT_IMAGE\}\}/g, getImg(81, 200, 200)).replace(/\{\{PRODUCT_NAME\}\}/g, '프리미엄 힐링템 1위').replace(/\{\{URGENCY_BANNER\}\}/g, '').replace(/\{\{BUY_URL\}\}/g, '#');

fs.writeFileSync(path.join(__dirname, '../mock-curation.html'), wrapHTML('에디터 큐레이션', curationBody, false));
fs.writeFileSync(path.join(__dirname, '../mock-curation-mobile.html'), wrapHTML('모바일 큐레이션', curationBody, true));

console.log('Successfully generated EXTRA LONG mock HTML articles including mobile responsive version.');
