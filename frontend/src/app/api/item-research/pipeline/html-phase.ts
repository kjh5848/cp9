/**
 * Phase 4: 마크다운 → HTML 변환 + CTA 주입 + 후처리
 * marked 라이브러리로 변환 후, CTA/상품이미지/링크 자동 삽입을 수행합니다.
 */
import { marked } from 'marked'
import { buildCtaHtml } from '../seo-cta-builder'
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

  // ── CTA 빌드 (대표 상품 기준) ──
  const buyUrl = ctx.body.productData?.productUrl
    || `https://www.coupang.com/vp/products/${ctx.body.itemId}`;
  const { headerHtml: coupangHeaderHtml, midContentHtml, footerHtml: coupangCtaHtml } = buildCtaHtml({
    productName: ctx.body.itemName,
    productImage: ctx.body.productData?.productImage || imageUrl || '',
    buyUrl,
    persona: ctx.persona,
    productPrice: ctx.body.productData?.productPrice || undefined,
    isRocket: ctx.body.productData?.isRocket || false,
    itemId: ctx.body.itemId,
    projectId: ctx.body.projectId || undefined,
    articleType: articleType as 'single' | 'compare' | 'curation',
  });

  // ── 비교/큐레이션: 본문 내 각 상품 구매 링크 자동 연결 ──
  if ((articleType === 'compare' || articleType === 'curation') && ctx.body.items?.length) {
    htmlBody = injectMultiItemLinks(htmlBody, ctx.body.items);
  }

  // ── 후처리 2: 본문 중간 CTA 삽입 + 쿠팡 상품 이미지 삽입 ──
  if (articleType === 'single') {
    // 개별 발행: 단일 상품 이미지 + 중간 CTA
    const productImageUrl = ctx.body.productData?.productImage;
    const productImageHtml = productImageUrl
      ? `<figure class="cp9-product-image"><img src="${productImageUrl}" alt="${ctx.body.itemName}" /><figcaption>${ctx.body.itemName}</figcaption></figure>`
      : '';
    let midCtaInserted = false;
    let productImageInserted = false;
    let sectionCount = 0;
    htmlBody = htmlBody.replace(/<\/h[23]>/g, (match) => {
      sectionCount++;
      let injection = match;
      if (sectionCount === 2 && !productImageInserted && productImageHtml) {
        productImageInserted = true;
        injection += productImageHtml;
      }
      if (sectionCount === 3 && !midCtaInserted) {
        midCtaInserted = true;
        injection += midContentHtml;
      }
      return injection;
    });
  } else {
    // 비교/큐레이션: 중간 CTA만 삽입 (3번째 섹션 뒤)
    let midCtaInserted = false;
    let sectionCount = 0;
    htmlBody = htmlBody.replace(/<\/h[23]>/g, (match) => {
      sectionCount++;
      if (sectionCount === 3 && !midCtaInserted) {
        midCtaInserted = true;
        return match + midContentHtml;
      }
      return match;
    });
  }

  // ── 후처리 3: "[...보러 가기]" 패턴에 쿠팡 구매 링크 자동 삽입 ──
  const buyUrlForLink = ctx.body.productData?.productUrl
    || `https://www.coupang.com/vp/products/${ctx.body.itemId}`;
  htmlBody = htmlBody.replace(
    /\[([^\]]*보러\s*가기[^\]]*)\]/g,
    `<a href="${buyUrlForLink}" target="_blank" rel="noopener noreferrer nofollow" style="color:#0073e6;font-weight:bold;text-decoration:underline;">$1 →</a>`
  );
  htmlBody = htmlBody.replace(
    /(<p[^>]*>)\s*([^<]*보러\s*가기[^<]*)\s*(<\/p>)/g,
    (match, open, text, close) => {
      if (match.includes('<a ')) return match;
      return `${open}<a href="${buyUrlForLink}" target="_blank" rel="noopener noreferrer nofollow" style="color:#0073e6;font-weight:bold;text-decoration:underline;">${text.trim()} →</a>${close}`;
    }
  );

  // ── 최종 HTML 조합 ──
  const seoContent = coupangHeaderHtml + htmlBody + coupangCtaHtml;
  console.log(`✅ [Phase 4] HTML 변환 완료 (${seoContent.length}자, 유형: ${articleType}, 페르소나: ${ctx.persona})`);
  return seoContent;
}

/**
 * 비교/큐레이션 글에서 각 상품명 옆에 쿠팡 구매 링크를 연결합니다.
 * LLM이 생성한 마크다운 링크([구매](url))는 marked가 이미 <a> 태그로 변환하지만,
 * 일부 누락된 링크를 보완합니다.
 */
function injectMultiItemLinks(html: string, items: Array<{ productName: string; productUrl: string }>): string {
  for (const item of items) {
    if (!item.productUrl) continue;
    // 상품명이 본문에 있지만 <a> 태그로 감싸지 않은 경우 자동 링크 추가
    const escapedName = item.productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // H3 태그 안의 상품명에 구매 링크 아이콘 추가 (이미 링크가 없는 경우만)
    const h3Regex = new RegExp(
      `(<h3[^>]*>)([^<]*?)(${escapedName.slice(0, 30)}[^<]*?)(</h3>)`,
      'gi'
    );
    html = html.replace(h3Regex, (match, open, prefix, name, close) => {
      if (match.includes('<a ')) return match;
      return `${open}${prefix}${name} <a href="${item.productUrl}" target="_blank" rel="noopener sponsored" style="color:#0073e6;font-size:0.85em;">[쿠팡에서 보기]</a>${close}`;
    });
  }
  return html;
}
