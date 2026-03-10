/**
 * Phase 4: 마크다운 → HTML 변환 + CTA 주입 + 후처리
 * marked 라이브러리로 변환 후, CTA/상품이미지/링크 자동 삽입을 수행합니다.
 */
import { marked } from 'marked'
import { buildCtaHtml, buildCtaBlockHtml } from '../seo-cta-builder'
import { buildThemeStyles } from '@/shared/lib/build-theme-styles'
import type { PipelineContext } from './types'

// marked 설정: GitHub Flavored Markdown 스타일
marked.setOptions({ gfm: true, breaks: true });

/**
 * 마크다운 본문을 HTML로 변환하고, CTA/상품이미지/링크를 자동 주입합니다.
 * @returns 최종 SEO HTML 문자열
 */
export async function runHtmlPhase(
  ctx: PipelineContext,
  markdownRaw: string,
  imageUrl: string | null,
): Promise<string> {
  const { articleType } = ctx;
  console.log(`🔄 [Phase 4] 마크다운 → HTML 변환 중... (유형: ${articleType})`);
  let htmlBody = await marked.parse(markdownRaw);

  // ── 후처리 1: 취소선(<del>) 태그 제거 ──
  htmlBody = htmlBody.replace(/<del>(.*?)<\/del>/g, '$1');

  // ── 후처리 1.5: 블록별 인라인 스타일 혹은 클래스 자동 삽입 ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const advancedConfig = (ctx.themeConfig as any)?.advanced || {};
  const styleMode = advancedConfig.styleMode || 'inline';
  const prefix = advancedConfig.classPrefix || 'cp9-';

  if (styleMode === 'inline') {
    // CTA/cp9- 클래스가 없는 일반 <p> 태그에 양쪽 정렬 적용
    htmlBody = htmlBody.replace(
      /<p(?![^>]*class=["'][^"']*cp9-)([^>]*)>/g,
      (match, attrs) => {
        // 이미 text-align 스타일이 있으면 건드리지 않음
        if (match.includes('text-align')) return match;
        if (attrs.includes('style="')) {
          return match.replace('style="', 'style="text-align:justify;');
        }
        return `<p${attrs} style="text-align:justify;">`;
      }
    );
  } else if (styleMode === 'class-only') {
    // 클래스만 출력 모드일 경우 각 HTML 태그에 접두어가 붙은 클래스 주입
    htmlBody = htmlBody.replace(/<h1([^>]*)>/g, `<h1$1 class="${prefix}heading-h1">`);
    htmlBody = htmlBody.replace(/<h2([^>]*)>/g, `<h2$1 class="${prefix}heading-h2">`);
    htmlBody = htmlBody.replace(/<h3([^>]*)>/g, `<h3$1 class="${prefix}heading-h3">`);
    htmlBody = htmlBody.replace(/<p([^>]*)>/g, `<p$1 class="${prefix}paragraph">`);
    htmlBody = htmlBody.replace(/<blockquote([^>]*)>/g, `<blockquote$1 class="${prefix}blockquote">`);
    htmlBody = htmlBody.replace(/<(ul|ol)([^>]*)>/g, `<$1$2 class="${prefix}list">`);
    htmlBody = htmlBody.replace(/<li([^>]*)>/g, `<li$1 class="${prefix}list-item">`);
    htmlBody = htmlBody.replace(/<table([^>]*)>/g, `<table$1 class="${prefix}table">`);
    htmlBody = htmlBody.replace(/<th([^>]*)>/g, `<th$1 class="${prefix}table-th">`);
    htmlBody = htmlBody.replace(/<td([^>]*)>/g, `<td$1 class="${prefix}table-td">`);
    htmlBody = htmlBody.replace(/<(strong|b)([^>]*)>/g, `<$1$2 class="${prefix}bold">`);
  }

  // ── CTA 빌드 및 주입 (레거시 / 다중 블록 시스템 분기) ──
  const buyUrl = ctx.body.productData?.productUrl
    || `https://www.coupang.com/vp/products/${ctx.body.itemId}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const themeConfig = ctx.themeConfig as any;
  const legacyCtaConfig = themeConfig?.cta;
  const ctaBlocks = themeConfig?.ctaBlocks;
  const useNewCtaSystem = themeConfig && 'ctaBlocks' in themeConfig;

  let coupangHeaderHtml = '';
  let coupangCtaHtml = '';

  if (useNewCtaSystem) {
    // [다중 블록 CTA 시스템]
    const ctaData = {
      productName: ctx.body.itemName,
      productImage: ctx.body.productData?.productImage || imageUrl || '',
      buyUrl,
      persona: ctx.persona,
      productPrice: ctx.body.productData?.productPrice || undefined,
      isRocket: ctx.body.productData?.isRocket || false,
      itemId: ctx.body.itemId,
      projectId: ctx.body.projectId || undefined,
      articleType: articleType as 'single' | 'compare' | 'curation',
    };

    if (ctaBlocks && ctaBlocks.length > 0) {
      const injectionResult = injectCtaBlocks(htmlBody, ctaBlocks, ctaData);
      htmlBody = injectionResult.html;
      coupangCtaHtml = injectionResult.footerAppended; // article-end 위치 컴포넌트들
    }

    // single 모드에서 productImageHtml 단독 주입은 그대로 유지
    if (articleType === 'single') {
      const productImageUrl = ctx.body.productData?.productImage;
      const productImageHtml = productImageUrl
        ? `<figure class="cp9-product-image" style="text-align:center;margin:2em auto;max-width:420px;"><img src="${productImageUrl}" alt="${ctx.body.itemName}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #eee;" /><figcaption style="font-size:13px;color:#94a3b8;margin-top:8px;">${ctx.body.itemName}</figcaption></figure>`
        : '';
        
      if (productImageHtml) {
        let productImageInserted = false;
        let sectionCount = 0;
        htmlBody = htmlBody.replace(/<\/h[23]>/g, (match) => {
          sectionCount++;
          if (sectionCount === 2 && !productImageInserted) {
            productImageInserted = true;
            return match + '\n' + productImageHtml;
          }
          return match;
        });
      }
    }

  } else {
    // [레거시 CTA 시스템]
    const result = buildCtaHtml({
      productName: ctx.body.itemName,
      productImage: ctx.body.productData?.productImage || imageUrl || '',
      buyUrl,
      persona: ctx.persona,
      productPrice: ctx.body.productData?.productPrice || undefined,
      isRocket: ctx.body.productData?.isRocket || false,
      itemId: ctx.body.itemId,
      projectId: ctx.body.projectId || undefined,
      articleType: articleType as 'single' | 'compare' | 'curation',
      themeCtaConfig: legacyCtaConfig,
    });
    coupangHeaderHtml = result.headerHtml;
    const midContentHtml = result.midContentHtml;
    coupangCtaHtml = result.footerHtml;

    // 본문 중간 CTA 삽입 + 쿠팡 상품 이미지 삽입
    if (articleType === 'single') {
      const productImageUrl = ctx.body.productData?.productImage;
      const productImageHtml = productImageUrl
        ? `<figure class="cp9-product-image" style="text-align:center;margin:2em auto;max-width:420px;"><img src="${productImageUrl}" alt="${ctx.body.itemName}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #eee;" /><figcaption style="font-size:13px;color:#94a3b8;margin-top:8px;">${ctx.body.itemName}</figcaption></figure>`
        : '';
      let midCtaInserted = false;
      let productImageInserted = false;
      let sectionCount = 0;
      htmlBody = htmlBody.replace(/<\/h[23]>/g, (match) => {
        sectionCount++;
        let injection = match;
        if (sectionCount === 2 && !productImageInserted && productImageHtml) {
          productImageInserted = true;
          injection += '\n' + productImageHtml;
        }
        if (sectionCount === 3 && !midCtaInserted) {
          midCtaInserted = true;
          injection += '\n' + midContentHtml;
        }
        return injection;
      });
    } else {
      let midCtaInserted = false;
      let sectionCount = 0;
      htmlBody = htmlBody.replace(/<\/h[23]>/g, (match) => {
        sectionCount++;
        if (sectionCount === 3 && !midCtaInserted) {
          midCtaInserted = true;
          return match + '\n' + midContentHtml;
        }
        return match;
      });
    }
  }

  // ── 후처리 3: "보러 가기" 패턴에 쿠팡 구매 링크 자동 삽입 ──
  const buyUrlForLink = ctx.body.productData?.productUrl
    || `https://www.coupang.com/vp/products/${ctx.body.itemId}`;
  const ctaLinkStyle = 'color:#0073e6;font-weight:bold;text-decoration:underline;';

  // 3-1: marked가 [텍스트 보러 가기](#) 또는 빈/더미 href 링크를 생성한 경우 → 쿠팡 URL로 교체
  htmlBody = htmlBody.replace(
    /<a\s+href="(#|javascript:void\(0\)|)"([^>]*)>([^<]*보러\s*가기[^<]*)<\/a>/gi,
    `<a href="${buyUrlForLink}" target="_blank" rel="noopener noreferrer nofollow" style="${ctaLinkStyle}">$3 →</a>`
  );

  // 3-2: 대괄호가 HTML에 그대로 남은 경우 [텍스트 보러 가기]
  htmlBody = htmlBody.replace(
    /\[([^\]]*보러\s*가기[^\]]*)\]/g,
    `<a href="${buyUrlForLink}" target="_blank" rel="noopener noreferrer nofollow" style="${ctaLinkStyle}">$1 →</a>`
  );

  // 3-3: <p> 태그 내에 링크 없이 "보러 가기" 텍스트만 있는 경우
  htmlBody = htmlBody.replace(
    /(<p[^>]*>)\s*([^<]*보러\s*가기[^<]*)\s*(<\/p>)/g,
    (match, open, text, close) => {
      if (match.includes('<a ')) return match;
      return `${open}<a href="${buyUrlForLink}" target="_blank" rel="noopener noreferrer nofollow" style="${ctaLinkStyle}">${text.trim()} →</a>${close}`;
    }
  );

  // 3-4: <strong>, <em> 등 인라인 태그 안에 "보러 가기" 텍스트가 있는 경우
  htmlBody = htmlBody.replace(
    /(<(?:strong|em|b|i)[^>]*>)([^<]*보러\s*가기[^<]*)(<\/(?:strong|em|b|i)>)/gi,
    (match) => {
      if (match.includes('<a ')) return match;
      return `<a href="${buyUrlForLink}" target="_blank" rel="noopener noreferrer nofollow" style="${ctaLinkStyle}">${match} →</a>`;
    }
  );

  // ── 후처리 4: AI 이미지 제안 문구 안내 박스 치환 ──
  htmlBody = htmlBody.replace(
    /\[이미지 제안:\s*(.*?)\]/g,
    `<div class="cp9-image-suggestion" style="margin:24px 0;padding:16px 20px;background-color:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;">🎨 AI 이미지 연출 제안 <span style="font-weight:400;font-size:11px;opacity:0.7;">(※ 실제 워드프레스 발행 시 이 박스는 자동 삭제됩니다)</span></p>
      <p style="margin:0;font-size:14px;color:#334155;line-height:1.5;">$1</p>
    </div>`
  );

  // ── 큐레이션: 본문 하단에 상품 카드 그리드 삽입 ──
  let productCardsHtml = '';
  if (articleType === 'curation' && ctx.body.items?.length) {
    productCardsHtml = buildCurationProductCards(ctx.body.items);
  }

  // ── 테마 CSS ──
  const themeStyleTag = ctx.themeConfig ? buildThemeStyles(ctx.themeConfig) : '';

  // ── 커스텀 HTML (상단/하단) ──
  const customHtmlHeader = advancedConfig.customHtmlHeader?.trim() || '';
  const customHtmlFooter = advancedConfig.customHtmlFooter?.trim() || '';

  // ── 글 최하단 쿠팡 파트너스 disclaimer (1회만) ──
  // AI가 자체적으로 본문에 생성했거나, 커스텀 푸터에 들어간 기존 파트너스 문구를 정규식으로 일괄 제거
  const disclaimerRegex = /<p[^>]*>\s*※?\s*(?:이\s*포스팅은\s*)?쿠팡\s*파트너스\s*활동의\s*일환으로,?\s*이에\s*따른\s*일정액의\s*수수료를\s*제공받(?:습니다|을\s*수\s*있습니다)\.?\s*<\/p>/gi;
  htmlBody = htmlBody.replace(disclaimerRegex, '');
  const rawDisclaimerRegex = /※?\s*(?:이\s*포스팅은\s*)?쿠팡\s*파트너스\s*활동의\s*일환으로,?\s*이에\s*따른\s*일정액의\s*수수료를\s*제공받(?:습니다|을\s*수\s*있습니다)\.?/gi;
  htmlBody = htmlBody.replace(rawDisclaimerRegex, '');
  const cleanCustomFooter = customHtmlFooter.replace(rawDisclaimerRegex, '');

  const disclaimerHtml = `<p style="font-size:11px;color:#999;text-align:center;margin:32px 0 8px;">※ 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.</p>`;

  // ── 후처리 5: 메타데이터 명시 (표 형태) ──
  const searchKeyword = ctx.body.keywordMode?.keyword || ctx.body.itemName;
  const articleTypeKr = ctx.articleType === 'compare' ? '비교 분석' : ctx.articleType === 'curation' ? '추천 큐레이션' : '단일 리뷰';
  
  // 오토파일럿 세팅값 추가 행 (존재 시에만 렌더링)
  const ap = ctx.autopilotData;
  let autopilotMetaRows = '';
  if (ap) {
    const rocketLabel = ap.isRocketOnly ? '✅ 로켓배송만' : '전체 (로켓 포함)';
    const priceRange = (ap.minPrice || ap.maxPrice)
      ? `${ap.minPrice ? ap.minPrice.toLocaleString() + '원' : '제한없음'} ~ ${ap.maxPrice ? ap.maxPrice.toLocaleString() + '원' : '제한없음'}`
      : '전체';
    const intervalLabel = ap.intervalHours ? `${ap.intervalHours}시간 마다` : '단발성';
    
    autopilotMetaRows = `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <th style="padding: 12px 20px; color: #64748b; font-weight: 600; background-color: #fcfcfd;">🚀 배송 필터</th>
        <td style="padding: 12px 20px; color: #334155;">${rocketLabel}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <th style="padding: 12px 20px; color: #64748b; font-weight: 600; background-color: #fcfcfd;">💰 가격 범위</th>
        <td style="padding: 12px 20px; color: #334155;">${priceRange}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <th style="padding: 12px 20px; color: #64748b; font-weight: 600; background-color: #fcfcfd;">🔄 발행 주기</th>
        <td style="padding: 12px 20px; color: #334155;">${intervalLabel}</td>
      </tr>`;
  }
  // 테마 이름 메타 행
  const themeMetaRow = ctx.themeConfig
    ? `<tr style="border-bottom: 1px solid #f1f5f9;">
        <th style="padding: 12px 20px; color: #64748b; font-weight: 600; background-color: #fcfcfd;">🎨 디자인 템플릿</th>
        <td style="padding: 12px 20px; color: #334155;">${(ctx.themeConfig as any)?.name || '커스텀 테마'}</td>
      </tr>`
    : '';

  const keywordHtml = searchKeyword ? `
<div style="margin-top: 40px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); max-width: 600px; margin-left: auto; margin-right: auto;">
  <div style="background-color: #f8fafc; padding: 12px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a; text-align: center; font-size: 15px; letter-spacing: -0.3px;">
    🎯 포스팅 생성 정보
  </div>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
    <tbody>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <th style="padding: 12px 20px; width: 35%; color: #64748b; font-weight: 600; background-color: #fcfcfd;">타겟 키워드</th>
        <td style="padding: 12px 20px; color: #334155; font-weight: 500;">${searchKeyword}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <th style="padding: 12px 20px; color: #64748b; font-weight: 600; background-color: #fcfcfd;">작성 페르소나</th>
        <td style="padding: 12px 20px; color: #334155;">${ctx.finalPersonaName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <th style="padding: 12px 20px; color: #64748b; font-weight: 600; background-color: #fcfcfd;">글 형식</th>
        <td style="padding: 12px 20px; color: #334155;">${articleTypeKr}</td>
      </tr>
      <tr${autopilotMetaRows || themeMetaRow ? ' style="border-bottom: 1px solid #f1f5f9;"' : ''}>
        <th style="padding: 12px 20px; color: #64748b; font-weight: 600; background-color: #fcfcfd;">목표 분량</th>
        <td style="padding: 12px 20px; color: #334155;">${ctx.charLimit.toLocaleString()}자 이상</td>
      </tr>${autopilotMetaRows}${themeMetaRow}
    </tbody>
  </table>
</div>
` : '';

  // ── 최종 HTML 조합 ──
  let seoContent = themeStyleTag + customHtmlHeader + coupangHeaderHtml + htmlBody + productCardsHtml + keywordHtml + coupangCtaHtml + disclaimerHtml + cleanCustomFooter;
  
  if (styleMode === 'class-only' && prefix !== 'cp9-') {
    seoContent = seoContent.replace(/class="([^"]*)"/g, (match, classes) => {
      const newClasses = classes.split(' ').map((cls: string) => cls.startsWith('cp9-') ? cls.replace('cp9-', prefix) : cls).join(' ');
      return `class="${newClasses}"`;
    });
  }
  
  console.log(`✅ [Phase 4] HTML 변환 완료 (${seoContent.length}자, 유형: ${articleType}, 페르소나: ${ctx.persona}, 테마: ${ctx.themeConfig ? '적용' : '없음'}, 스타일모드: ${styleMode})`);
  return seoContent;
}

/**
 * 비교/큐레이션 글에서 각 상품명 옆에 쿠팡 구매 링크를 연결하고,
 * 각 상품 섹션(H3) 뒤에 대표 이미지를 자동 삽입합니다.
 */
function injectMultiItemLinks(
  html: string,
  items: Array<{ productName: string; productUrl: string; productImage?: string }>
): string {
  for (const item of items) {
    if (!item.productUrl) continue;
    // 상품명이 본문에 있지만 <a> 태그로 감싸지 않은 경우 자동 링크 추가
    const escapedName = item.productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // H3 태그 안의 상품명에 구매 링크 아이콘 추가 + H3 뒤에 상품 이미지 삽입
    const h3Regex = new RegExp(
      `(<h3[^>]*>)([^<]*?)(${escapedName.slice(0, 30)}[^<]*?)(</h3>)`,
      'gi'
    );
    html = html.replace(h3Regex, (match, open, prefix, name, close) => {
      // 구매 링크 아이콘 추가 (이미 링크가 없는 경우만)
      const linkIcon = match.includes('<a ')
        ? ''
        : ` <a href="${item.productUrl}" target="_blank" rel="noopener sponsored" style="color:#0073e6;font-size:0.85em;">[쿠팡에서 보기]</a>`;
      
      // 상품 대표 이미지 삽입 (H3 태그 바로 뒤)
      const imageHtml = item.productImage
        ? `<figure style="margin:16px 0;text-align:center;"><a href="${item.productUrl}" target="_blank" rel="noopener sponsored"><img src="${item.productImage}" alt="${item.productName}" style="max-width:100%;height:auto;max-height:300px;object-fit:contain;border-radius:12px;border:1px solid #e9ecef;background:#fff;padding:8px;" /></a><figcaption style="font-size:12px;color:#888;margin-top:6px;">${item.productName}</figcaption></figure>`
        : '';
      
      return `${open}${prefix}${name}${linkIcon}${close}${imageHtml}`;
    });
  }
  return html;
}

/**
 * 큐레이션 글 하단에 상품 카드 그리드를 생성합니다.
 * 인라인 스타일 사용으로 블로그 환경에서도 정상 렌더링됩니다.
 */
function buildCurationProductCards(
  items: Array<{ productName: string; productPrice: number; productUrl: string; productImage: string; isRocket?: boolean }>
): string {
  const cards = items.map(item => `
<div class="cp9-curation-card" style="display:inline-block;width:calc(50% - 12px);vertical-align:top;margin:6px;background:#f8f9fa;border-radius:12px;overflow:hidden;border:1px solid #e9ecef;">
  ${item.productImage ? `<a href="${item.productUrl}" target="_blank" rel="noopener sponsored"><img src="${item.productImage}" alt="${item.productName}" style="width:100%;height:160px;object-fit:contain;background:#fff;padding:12px;" /></a>` : ''}
  <div style="padding:12px 14px 14px;">
    <p style="font-size:13px;font-weight:600;color:#333;margin:0 0 6px;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${item.productName}</p>
    <p style="font-size:15px;font-weight:700;color:#e53935;margin:0 0 8px;">${item.productPrice?.toLocaleString()}원${item.isRocket ? ' <span style="font-size:11px;color:#0073e6;font-weight:500;">🚀로켓</span>' : ''}</p>
    <a href="${item.productUrl}" target="_blank" rel="noopener sponsored" style="display:block;text-align:center;background:#0073e6;color:#fff;padding:8px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">가격 확인하기</a>
  </div>
</div>`).join('');

  return `
<div class="cp9-curation-section" style="margin:32px 0;padding:24px 0;border-top:2px solid #e9ecef;">
  <h3 style="font-size:18px;font-weight:700;margin:0 0 16px;color:#333;">📦 추천 상품 한눈에 보기</h3>
  <div style="font-size:0;text-align:center;">
    ${cards}
  </div>
</div>
`;
}

/**
 * ── 다중 CTA 블록 본문 주입 유틸리티 ──
 * CTA 블록들의 placement (위치, 빈도) 정보에 따라 HTML 문자열 내부의 태그를 기준으로 CTA를 치환 삽입합니다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function injectCtaBlocks(html: string, ctaBlocks: any[], buildData: any): { html: string; footerAppended: string } {
  let resultHtml = html;
  let footerAppended = '';
  
  // 1. 플래그가 없는 위치 분류
  const randomPBlocks = ctaBlocks.filter(b => b.placement.position === 'random-p');
  const firstPBlocks = ctaBlocks.filter(b => b.placement.position === 'first-p');
  const lastPBlocks = ctaBlocks.filter(b => b.placement.position === 'last-p');
  const otherBlocks = ctaBlocks.filter(b => !['random-p', 'first-p', 'last-p'].includes(b.placement.position));

  // first-p 삽입
  if (firstPBlocks.length > 0) {
    for (const block of firstPBlocks) {
      const ctaHtml = buildCtaBlockHtml(buildData, block);
      resultHtml = resultHtml.replace(/(<p[^>]*>)/i, ctaHtml + '\n$1');
    }
  }

  // last-p 삽입
  if (lastPBlocks.length > 0) {
    for (const block of lastPBlocks) {
      const ctaHtml = buildCtaBlockHtml(buildData, block);
      const lastIndex = resultHtml.lastIndexOf('</p>');
      if (lastIndex !== -1) {
        resultHtml = resultHtml.substring(0, lastIndex + 4) + '\n' + ctaHtml + resultHtml.substring(lastIndex + 4);
      }
    }
  }

  // random-p 삽입
  if (randomPBlocks.length > 0) {
    const pChunks = resultHtml.split('</p>');
    const numP = pChunks.length - 1;
    
    if (numP > 0) {
      const appends = new Array(numP).fill('');
      
      for (const block of randomPBlocks) {
        const ctaHtml = buildCtaBlockHtml(buildData, block);
        const { frequency } = block.placement;
        const maxCount = frequency === 'all' ? Infinity : parseInt(frequency, 10);
        const countToInject = Math.min(maxCount, numP);
        
        const indicesToInject = new Set<number>();
        let attempts = 0;
        
        while (indicesToInject.size < countToInject && attempts < countToInject * 5) {
          indicesToInject.add(Math.floor(Math.random() * numP));
          attempts++;
        }
        
        for (const idx of indicesToInject) {
          appends[idx] += '\n' + ctaHtml;
        }
      }
      
      resultHtml = '';
      for (let i = 0; i < numP; i++) {
        resultHtml += pChunks[i] + '</p>' + appends[i];
      }
      resultHtml += pChunks[numP];
    }
  }
  
  // 2. 헤더 태그 및 기타 (article-start, article-end 등) 삽입
  for (const block of otherBlocks) {
    const ctaHtml = buildCtaBlockHtml(buildData, block);
    const { position, frequency } = block.placement;
    const maxCount = frequency === 'all' ? Infinity : parseInt(frequency, 10);
    
    if (position === 'article-end') {
      footerAppended += ctaHtml + '\n';
      continue;
    }

    if (position === 'article-start') {
      resultHtml = ctaHtml + '\n' + resultHtml;
      continue;
    }
    
    // Header tags (h1, h2, h3)
    const tagMatch = position.match(/h[123]/);
    const tag = tagMatch ? tagMatch[0] : null;
    if (!tag) continue; // 알 수 없는 position fallback
    
    const isBefore = position.includes('before');
    let headerCount = 0;
    
    if (isBefore) {
      const regex = new RegExp(`(<${tag}[^>]*>)`, 'gi');
      resultHtml = resultHtml.replace(regex, (match) => {
        headerCount++;
        if (headerCount <= maxCount) {
          return ctaHtml + '\n' + match;
        }
        return match;
      });
    } else {
      const regex = new RegExp(`(</${tag}>)`, 'gi');
      resultHtml = resultHtml.replace(regex, (match) => {
        headerCount++;
        if (headerCount <= maxCount) {
          return match + '\n' + ctaHtml;
        }
        return match;
      });
    }
  }
  
  return { html: resultHtml, footerAppended };
}
