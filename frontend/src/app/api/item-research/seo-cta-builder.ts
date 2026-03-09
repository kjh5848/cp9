import fs from 'fs';
import path from 'path';

/**
 * 페르소나 ID → CTA 템플릿 파일명 매핑
 */
const PERSONA_CTA_FILE: Record<string, string> = {
  'IT': 'cta-tech.html',
  'BEAUTY': 'cta-beauty.html',
  'LIVING': 'cta-living.html',
  'HUNTER': 'cta-hunter.html',
  'MASTER_CURATOR_H': 'cta-luxury.html',
};

/**
 * CTA 템플릿에 사용되는 플레이스홀더 치환 데이터
 */
export interface CtaTemplateData {
  productName: string;
  productImage: string;
  buyUrl: string;
  persona: string;
  // Level 2: 전환율 최적화 데이터
  productPrice?: number;
  isRocket?: boolean;
  // Level 3: A/B 테스트 데이터
  itemId?: string;
  projectId?: string;
  // 글 유형별 CTA 레이아웃 분기
  articleType?: 'single' | 'compare' | 'curation';
  // 테마 CTA 설정 (디자인 에디터에서 커스텀한 설정)
  themeCtaConfig?: {
    layout?: 'minimal' | 'card' | 'banner' | 'gradient';
    boxBgColor?: string;
    boxBorderColor?: string;
    headerText?: string;
    footerText?: string;
    midText?: string;
    showShadow?: boolean;
    showProductImage?: boolean;
    priceColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonRadius?: string;
    /** CTA 위치별 on/off */
    showHeaderCta?: boolean;
    showMidCta?: boolean;
    showFooterCta?: boolean;
    /** 하단 CTA 헤드라인 */
    footerHeadline?: string;
    /** 긴급성 문구 표시 여부 */
    showUrgency?: boolean;
    /** 면책 문구 표시 여부 */
    showDisclaimer?: boolean;
  };
}

/**
 * CTA 빌드 결과 — header, mid, footer 세 부분
 */
interface CtaBuildResult {
  headerHtml: string;
  midContentHtml: string;
  footerHtml: string;
}

/**
 * A/B 테스트 변형 정의
 * 각 페르소나별로 CTA 문구 변형을 정의합니다.
 */
const CTA_VARIANTS: Record<string, { id: string; headerText: string; footerText: string; midText: string }[]> = {
  // ── 페르소나별 변형 (single 유형 기본) ──
  'IT': [
    { id: 'tech_v1', headerText: '쿠팡에서 스펙 및 최저가 확인', footerText: '쿠팡 최저가 확인하기', midText: '쿠팡에서 가격 확인하기' },
    { id: 'tech_v2', headerText: '지금 바로 스펙 비교하기', footerText: '최저가로 구매하기', midText: '기술 스펙 비교 후 구매' },
  ],
  'BEAUTY': [
    { id: 'beauty_v1', headerText: '쿠팡에서 최저가 쇼핑하기', footerText: '쿠팡 최저가 확인하기', midText: '쿠팡에서 가격 확인하기' },
    { id: 'beauty_v2', headerText: '나만의 뷰티템 장바구니 담기', footerText: '지금 바로 득템하기', midText: '핫딜 가격 확인하기' },
  ],
  'LIVING': [
    { id: 'living_v1', headerText: '쿠팡에서 최저가 확인하기', footerText: '쿠팡 최저가 바로가기', midText: '쿠팡에서 가격 확인하기' },
    { id: 'living_v2', headerText: '살림 필수템 확인하기', footerText: '가성비 최고가로 구매하기', midText: '실사용 후기 보고 구매하기' },
  ],
  'HUNTER': [
    { id: 'hunter_v1', headerText: '지금 쿠팡 최저가 잡기', footerText: '쿠팡 최저가 바로 구매', midText: '쿠팡에서 가격 확인하기' },
    { id: 'hunter_v2', headerText: '이 가격에 살 수 있을 때 잡기', footerText: '할인가 바로 구매하기', midText: '최저가 비교 후 구매하기' },
  ],
  'MASTER_CURATOR_H': [
    { id: 'luxury_v1', headerText: '쿠팡에서 프리미엄 가격 확인', footerText: '쿠팡에서 지금 확인하기', midText: '쿠팡에서 가격 확인하기' },
    { id: 'luxury_v2', headerText: '큐레이터 추천가 확인하기', footerText: '프리미엄 딜 확인하기', midText: '엄선된 가격 확인하기' },
  ],
  // ── 글 유형별 변형 (compare / curation) ──
  'compare': [
    { id: 'compare_v1', headerText: '쿠팡에서 비교 최저가 확인', footerText: '비교 결과 1위 상품 구매하기', midText: '비교 분석 후 최저가 확인' },
    { id: 'compare_v2', headerText: '스펙 비교 결과 확인하기', footerText: '최종 추천 상품 바로 구매', midText: '전문가 비교 결과 보기' },
  ],
  'curation': [
    { id: 'curation_v1', headerText: '쿠팡에서 추천 상품 확인하기', footerText: '전체 추천 리스트 보기', midText: '큐레이터 추천 가격 확인' },
    { id: 'curation_v2', headerText: '에디터 추천 상품 보기', footerText: '엄선된 추천 목록 확인', midText: '엄선 아이템 가격 보기' },
  ],
};

/**
 * 현재 요청에 대한 CTA 변형을 랜덤으로 선택합니다.
 * articleType이 compare/curation인 경우 해당 유형의 변형을 우선 사용합니다.
 */
function selectVariant(persona: string, articleType?: string): { id: string; headerText: string; footerText: string; midText: string } {
  // 글 유형 전용 변형이 있으면 우선 사용
  const variantKey = (articleType && articleType !== 'single' && CTA_VARIANTS[articleType])
    ? articleType
    : persona;
  const variants = CTA_VARIANTS[variantKey] || [
    { id: 'default_v1', headerText: '쿠팡에서 최저가 확인하기', footerText: '쿠팡 최저가 바로가기', midText: '쿠팡에서 가격 확인하기' },
  ];
  // 랜덤 로테이션: 변형 중 하나를 무작위 선택
  const index = Math.floor(Math.random() * variants.length);
  return variants[index];
}

/**
 * 구매 URL에 UTM 파라미터를 자동 추가합니다.
 */
function addUtmParams(url: string, persona: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', 'cp9');
    urlObj.searchParams.set('utm_medium', 'cta');
    urlObj.searchParams.set('utm_campaign', persona.toLowerCase());
    return urlObj.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}utm_source=cp9&utm_medium=cta&utm_campaign=${persona.toLowerCase()}`;
  }
}

/**
 * 가격을 한국 원화 형식으로 포맷합니다.
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

/**
 * 시간 기반 긴급성 문구를 생성합니다.
 */
function getUrgencyText(): string {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return '<span style="text-align:center;">야간 한정 특가가 곧 종료됩니다</span>';
  if (hour >= 6 && hour < 12) return '<span style="text-align:center;">오전 타임세일 진행 중</span>';
  if (hour >= 12 && hour < 18) return '<span style="text-align:center;">오늘의 특가, 재고 소진 시 종료</span>';
  return '<span style="text-align:center;">금일 마감 임박! 내일 가격이 변동될 수 있습니다</span>';
}

/**
 * 페르소나별 사회적 증거 문구를 생성합니다.
 */
function getSocialProofText(persona: string): string {
  const map: Record<string, string> = {
    'IT': '기술 블로거 92%가 추천한 제품',
    'BEAUTY': '뷰티 인플루언서 사이에서 화제인 아이템',
    'LIVING': '주부 커뮤니티 만족도 TOP 제품',
    'HUNTER': '가격 비교 사이트 최저가 기록 상품',
    'MASTER_CURATOR_H': '전문가 패널 만장일치 추천',
  };
  return map[persona] || '구매자 만족도가 높은 추천 상품';
}

/**
 * 가격 정보 HTML 블록을 생성합니다.
 */
function buildPriceBlock(price: number, isRocket: boolean): string {
  const rocketBadge = isRocket ? '<span class="cp9-cta__rocket-badge">로켓배송</span>' : '';
  return `\n<div class="cp9-cta__price-block">\n  <span class="cp9-cta__current-price">${formatPrice(price)}</span>\n  ${rocketBadge}\n</div>`;
}

// 클릭 추적 로직 삭제됨

/**
 * 본문 중간 삽입용 CTA HTML을 생성합니다.
 */
function buildMidContentCta(data: CtaTemplateData, buyUrlWithUtm: string, variant: { id: string; midText: string }): string {
  const tc = data.themeCtaConfig;
  const socialProof = getSocialProofText(data.persona);
  const priceColor = tc?.priceColor || '#e53935';
  const btnColor = tc?.buttonColor || '#2563eb';
  const btnText = tc?.buttonTextColor || '#fff';
  const btnRadius = tc?.buttonRadius || '12px';
  const midLabel = tc?.midText || variant.midText;
  const priceInfo = data.productPrice
    ? `<span style="font-weight:700;color:${priceColor};font-size:16px;">${formatPrice(data.productPrice)}</span>`
    : '';
  const btnStyle = `display:inline-block;background:${btnColor};color:${btnText};padding:10px 24px;border-radius:${btnRadius};font-weight:600;font-size:13px;text-decoration:none;`;

  return `
<div class="cp9-cta cp9-cta--mid" style="text-align:center;padding:20px 0;margin:20px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
  <p style="text-align:center;font-size:12px;color:#94a3b8;margin:0 0 8px;">${socialProof}</p>
  ${priceInfo ? `<p style="text-align:center;margin:0 0 12px;">${priceInfo}</p>` : ''}
  <a href="${buyUrlWithUtm}" target="_blank" rel="noopener sponsored" class="cp9-cta__button cp9-cta__button--mid" style="${btnStyle}">
    ${midLabel}
  </a>
</div>
`;
}

/**
 * CTA 템플릿 파일을 읽어와 플레이스홀더를 치환하고 CTA HTML을 반환합니다.
 *
 * Level 2: 전환율 최적화
 */
export function buildCtaHtml(data: CtaTemplateData): CtaBuildResult {
  const articleType = data.articleType || 'single';
  const variant = selectVariant(data.persona, articleType);
  const buyUrlWithUtm = addUtmParams(data.buyUrl, data.persona);

  // 커스텀 디자인(Theme) 설정이 있을 경우, 기존 정적 템플릿을 무시하고 100% 반영되는 동적 빌더 사용
  const hasCustomTheme = !!data.themeCtaConfig && Object.keys(data.themeCtaConfig).length > 0;
  if (hasCustomTheme) {
    return buildDynamicCta(data, buyUrlWithUtm, variant);
  }

  // 커스텀 테마가 없을 경우 기존처럼 페르소나/유형별 템플릿 로드 시도
  const ARTICLE_TYPE_CTA_FILE: Record<string, string> = {
    'compare': 'cta-compare.html',
    'curation': 'cta-curation.html',
  };
  const templateFile = ARTICLE_TYPE_CTA_FILE[articleType] || PERSONA_CTA_FILE[data.persona] || 'cta-default.html';
  const templatePath = path.join(
    process.cwd(), '..', '.agents', 'skills', 'seo-pipeline', 'references', 'cta-templates', templateFile
  );

  let rawTemplate = '';
  try {
    if (fs.existsSync(templatePath)) {
      rawTemplate = fs.readFileSync(templatePath, 'utf-8');
    } else {
      const defaultPath = path.join(
        process.cwd(), '..', '.agents', 'skills', 'seo-pipeline', 'references', 'cta-templates', 'cta-default.html'
      );
      if (fs.existsSync(defaultPath)) {
        rawTemplate = fs.readFileSync(defaultPath, 'utf-8');
      }
    }
  } catch (err) {
    console.warn(`[CTA Builder] 템플릿 읽기 실패: ${templateFile}`, err);
  }

  if (!rawTemplate) {
    console.warn('[CTA Builder] 템플릿 없음, 동적 CTA 사용');
    return buildDynamicCta(data, buyUrlWithUtm, variant);
  }

  // 동적 블록 생성
  const priceBlock = data.productPrice ? buildPriceBlock(data.productPrice, !!data.isRocket) : '';
  const urgencyBanner = `<p class="cp9-cta__urgency" style="text-align:center;">${getUrgencyText()}</p>`;

  // 플레이스홀더 치환
  let html = rawTemplate
    .replace(/\{\{PRODUCT_IMAGE\}\}/g, data.productImage)
    .replace(/\{\{PRODUCT_NAME\}\}/g, data.productName)
    .replace(/\{\{BUY_URL\}\}/g, buyUrlWithUtm)
    .replace(/\{\{PRICE_BLOCK\}\}/g, priceBlock)
    .replace(/\{\{URGENCY_BANNER\}\}/g, urgencyBanner)
    .replace(/\{\{SOCIAL_PROOF\}\}/g, getSocialProofText(data.persona));

  // A/B 변형 문구 적용
  let headerDone = false;
  let footerDone = false;
  html = html.replace(/class="cp9-cta__button([^"]*)">/g, (match, classes) => {
    if (!headerDone && !classes.includes('--large')) {
      headerDone = true;
      return `class="cp9-cta__button${classes}">`;
    }
    if (!footerDone && classes.includes('--large')) {
      footerDone = true;
      return `class="cp9-cta__button${classes}">`;
    }
    return match;
  });

  // header/footer 분리 (정규식 대신 주석 기준 split 사용 - 내부 중첩 div 닫힘 보장)
  const parts = html.split(/<!-- ── 하단/);
  const headerPart = parts[0];
  const footerPart = parts.length > 1 ? `<!-- ── 하단${parts[1]}` : '';

  // 중간 CTA 생성
  const midContentHtml = buildMidContentCta(data, buyUrlWithUtm, variant);

  // CTA 위치별 on/off 적용
  const showHeader = data.themeCtaConfig?.showHeaderCta !== false;
  const showMid = data.themeCtaConfig?.showMidCta !== false;
  const showFooter = data.themeCtaConfig?.showFooterCta !== false;

  return {
    headerHtml: showHeader ? headerPart : '',
    midContentHtml: showMid ? midContentHtml : '',
    footerHtml: showFooter ? footerPart : '',
  };
}

/**
 * ThemeCTAConfig 등을 기반으로 HTML을 즉석 생성하는 동적 CTA (기존 폴백 CTA 대체)
 */
function buildDynamicCta(
  data: CtaTemplateData,
  buyUrlWithUtm: string,
  variant: { id: string; headerText: string; footerText: string; midText: string }
): CtaBuildResult {
  const tc = data.themeCtaConfig;
  const layout = tc?.layout || 'card';
  const boxBg = tc?.boxBgColor || '#f8fafc';
  const boxBorder = tc?.boxBorderColor || '#e2e8f0';
  const btnColor = tc?.buttonColor || '#2563eb';
  const btnText = tc?.buttonTextColor || '#fff';
  const btnRadius = tc?.buttonRadius || '12px';
  const priceColor = tc?.priceColor || '#e53935';
  const showShadow = tc?.showShadow !== false;
  const showImage = tc?.showProductImage !== false;

  // 헤더/푸터 문구: 테마 설정 우선, 없으면 variant 사용
  const headerLabel = tc?.headerText || variant.headerText;
  const footerLabel = tc?.footerText || variant.footerText;

  const priceInfo = data.productPrice
    ? `<p style="text-align:center;font-size:18px;font-weight:700;color:${priceColor};margin:4px 0 12px;">${formatPrice(data.productPrice)}</p>`
    : '';

  // 레이아웃별 스타일
  const boxStyle = (() => {
    const shadow = showShadow ? 'box-shadow:0 4px 16px rgba(0,0,0,0.10);' : '';
    switch (layout) {
      case 'minimal':
        return `text-align:center;padding:16px 0;`;
      case 'banner':
        return `text-align:center;padding:24px 20px;background:${boxBg};border:none;border-left:6px solid ${btnColor};border-radius:8px;${shadow}`;
      case 'gradient':
        return `text-align:center;padding:24px 20px;background:linear-gradient(135deg, ${boxBg}, ${btnColor});border-radius:16px;${shadow}`;
      case 'card':
      default:
        return `text-align:center;padding:20px;background:${boxBg};border:1px solid ${boxBorder};border-radius:16px;${shadow}`;
    }
  })();

  const imageHtml = showImage && data.productImage && layout !== 'minimal'
    ? `<img src="${data.productImage}" alt="${data.productName}" style="max-width:160px;height:auto;border-radius:12px;margin:0 auto 12px;display:block;border:1px solid #eee;background:#fff;padding:8px;" />`
    : '';

  const btnStyle = `display:inline-block;background:${btnColor};color:${btnText};padding:12px 32px;border-radius:${btnRadius};font-weight:600;font-size:14px;text-decoration:none;`;
  const gradientBtnStyle = layout === 'gradient'
    ? `display:inline-block;background:rgba(255,255,255,0.95);color:${btnColor};padding:12px 32px;border-radius:${btnRadius};font-weight:600;font-size:14px;text-decoration:none;`
    : btnStyle;

  const showHeader = tc?.showHeaderCta !== false;
  const showMid = tc?.showMidCta !== false;
  const showFooter = tc?.showFooterCta !== false;

  const headerHtml = showHeader ? `
<div class="cp9-cta cp9-cta--header" style="${boxStyle}margin:24px 0;">
  ${imageHtml}
  <p style="text-align:center;font-size:13px;color:#64748b;margin:0 0 4px;">${data.productName}</p>
  ${priceInfo}
  <a href="${buyUrlWithUtm}" target="_blank" rel="noopener sponsored" class="cp9-cta__button" style="${layout === 'gradient' ? gradientBtnStyle : btnStyle}">
    ${headerLabel}
  </a>
</div>
` : '';

  const midContentHtml = showMid ? buildMidContentCta(data, buyUrlWithUtm, variant) : '';

  // 하단 CTA 헤드라인 + 긴급성 문구
  const footerHeadlineText = tc?.footerHeadline || '지금 바로 구매하세요!';
  const showUrgency = tc?.showUrgency !== false;
  const urgencyLine = showUrgency
    ? `<p style="text-align:center;font-size:12px;color:${layout === 'gradient' ? 'rgba(255,255,255,0.7)' : '#94a3b8'};margin:0 0 12px;">${getUrgencyText()}</p>`
    : '';

  const footerHtml = showFooter ? `
<div class="cp9-cta cp9-cta--footer" style="${boxStyle}margin:24px 0;">
  <p style="text-align:center;font-size:16px;font-weight:700;color:${layout === 'gradient' ? '#fff' : '#1e293b'};margin:0 0 8px;">${footerHeadlineText}</p>
  ${urgencyLine}
  <a href="${buyUrlWithUtm}" target="_blank" rel="noopener sponsored" class="cp9-cta__button cp9-cta__button--large" style="${layout === 'gradient' ? gradientBtnStyle : btnStyle}">
    ${footerLabel}
  </a>
</div>
` : '';

  return { headerHtml, midContentHtml, footerHtml };
}

/**
 * Multiple CTA System: CtaBlockConfig를 기반으로 단일 CTA HTML 블록을 생성합니다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildCtaBlockHtml(data: CtaTemplateData, blockConfig: any): string {
  const design = blockConfig.design;
  const layout = design.layout || 'card';
  const boxBg = design.boxBgColor || '#f8fafc';
  const boxBorder = design.boxBorderColor || '#e2e8f0';
  const btnColor = design.buttonColor || '#2563eb';
  const btnText = design.buttonTextColor || '#ffffff';
  const btnRadius = design.buttonRadius || '12px';
  const priceColor = design.priceColor || '#e53935';
  const showShadow = design.showShadow !== false;
  const showImage = design.showProductImage !== false;

  const buyUrlWithUtm = addUtmParams(data.buyUrl, data.persona);

  const priceInfo = data.productPrice
    ? `<p style="text-align:center;font-size:18px;font-weight:700;color:${priceColor};margin:4px 0 12px;">${formatPrice(data.productPrice)}</p>`
    : '';

  // 레이아웃별 스타일
  const boxStyle = (() => {
    const shadow = showShadow ? 'box-shadow:0 4px 16px rgba(0,0,0,0.10);' : '';
    switch (layout) {
      case 'minimal':
        return `text-align:center;padding:16px 0;margin:24px 0;`;
      case 'banner':
        return `text-align:center;padding:24px 20px;background:${boxBg};border:none;border-left:6px solid ${btnColor};border-radius:8px;${shadow}margin:24px 0;`;
      case 'gradient':
        return `text-align:center;padding:24px 20px;background:linear-gradient(135deg, ${boxBg}, ${btnColor});border-radius:16px;${shadow}margin:24px 0;`;
      case 'card':
      default:
        return `text-align:center;padding:20px;background:${boxBg};border:1px solid ${boxBorder};border-radius:16px;${shadow}margin:24px 0;`;
    }
  })();

  const imageHtml = showImage && data.productImage && layout !== 'minimal'
    ? `<img src="${data.productImage}" alt="${data.productName}" style="max-width:160px;height:auto;border-radius:12px;margin:0 auto 12px;display:block;border:1px solid #eee;background:#fff;padding:8px;" />`
    : '';

  const btnStyle = `display:inline-block;background:${btnColor};color:${btnText};padding:12px 32px;border-radius:${btnRadius};font-weight:600;font-size:14px;text-decoration:none;`;
  const gradientBtnStyle = layout === 'gradient'
    ? `display:inline-block;background:rgba(255,255,255,0.95);color:${btnColor};padding:12px 32px;border-radius:${btnRadius};font-weight:600;font-size:14px;text-decoration:none;`
    : btnStyle;

  const headlineHtml = design.headline
    ? `<p style="text-align:center;font-size:16px;font-weight:700;color:${layout === 'gradient' ? '#fff' : '#1e293b'};margin:0 0 8px;">${design.headline}</p>`
    : '';

  const showUrgency = design.showUrgency !== false;
  const urgencyLine = showUrgency
    ? `<p style="text-align:center;font-size:12px;color:${layout === 'gradient' ? 'rgba(255,255,255,0.7)' : '#94a3b8'};margin:0 0 12px;">${getUrgencyText()}</p>`
    : '';

  return `
<div class="cp9-cta cp9-cta-block" style="${boxStyle}">
  ${headlineHtml}
  ${imageHtml}
  <p style="text-align:center;font-size:13px;color:${layout === 'gradient' ? 'rgba(255,255,255,0.9)' : '#64748b'};margin:0 0 4px;">${data.productName}</p>
  ${priceInfo}
  ${urgencyLine}
  <a href="${buyUrlWithUtm}" target="_blank" rel="noopener sponsored" class="cp9-cta__button" style="${layout === 'gradient' ? gradientBtnStyle : btnStyle}">
    ${design.text}
  </a>
</div>
`;
}
