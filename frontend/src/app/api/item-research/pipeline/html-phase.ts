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
  console.log('🔄 [Phase 4] 마크다운 → HTML 변환 중...');
  let htmlBody = await marked.parse(markdownRaw);

  // ── 후처리 1: 취소선(<del>) 태그 제거 ──
  // LLM이 ~~텍스트~~ 구문을 사용할 경우 일반 텍스트로 변환
  htmlBody = htmlBody.replace(/<del>(.*?)<\/del>/g, '$1');

  // ── CTA 빌드 ──
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
    articleType: ctx.articleType as 'single' | 'compare' | 'curation',
  });

  // ── 후처리 2: 본문 중간 CTA 삽입 + 쿠팡 상품 이미지 삽입 ──
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
    // 2번째 섹션 뒤에 상품 이미지 삽입
    if (sectionCount === 2 && !productImageInserted && productImageHtml) {
      productImageInserted = true;
      injection += productImageHtml;
    }
    // 3번째 섹션 뒤에 중간 CTA 삽입
    if (sectionCount === 3 && !midCtaInserted) {
      midCtaInserted = true;
      injection += midContentHtml;
    }
    return injection;
  });

  // ── 후처리 3: "[...보러 가기]" 패턴에 쿠팡 구매 링크 자동 삽입 ──
  const buyUrlForLink = ctx.body.productData?.productUrl
    || `https://www.coupang.com/vp/products/${ctx.body.itemId}`;
  htmlBody = htmlBody.replace(
    /\[([^\]]*보러\s*가기[^\]]*)\]/g,
    `<a href="${buyUrlForLink}" target="_blank" rel="noopener noreferrer nofollow" style="color:#0073e6;font-weight:bold;text-decoration:underline;">$1 →</a>`
  );
  // "보러가기"가 <p> 태그 안에 단독으로 들어간 경우도 처리
  htmlBody = htmlBody.replace(
    /(<p[^>]*>)\s*([^<]*보러\s*가기[^<]*)\s*(<\/p>)/g,
    (match, open, text, close) => {
      // 이미 <a> 태그가 있으면 건너뛰기
      if (match.includes('<a ')) return match;
      return `${open}<a href="${buyUrlForLink}" target="_blank" rel="noopener noreferrer nofollow" style="color:#0073e6;font-weight:bold;text-decoration:underline;">${text.trim()} →</a>${close}`;
    }
  );

  // ── 최종 HTML 조합 ──
  const seoContent = coupangHeaderHtml + htmlBody + coupangCtaHtml;
  console.log(`✅ [Phase 4] HTML 변환 완료 (${seoContent.length}자, CTA 페르소나: ${ctx.persona}, 중간CTA: ${midCtaInserted})`);
  return seoContent;
}
