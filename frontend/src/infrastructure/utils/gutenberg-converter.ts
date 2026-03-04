/**
 * HTML 콘텐츠를 WordPress Gutenberg 블록 포맷으로 변환
 * 
 * WP 테마가 .entry-content에 text-align:center를 강제 적용하므로,
 * 본문 요소에 명시적으로 text-align:left 인라인 스타일을 추가합니다.
 * CTA 영역만 wp:html 블록으로 보존하여 인라인 스타일(중앙정렬)을 유지합니다.
 */

/**
 * AI 가이드 텍스트([이미지 제안: ...] 등) 제거
 */
function removeAiGuideText(html: string): string {
  // [이미지 제안: ...] 형태 제거
  let cleaned = html.replace(/\[이미지\s*제안[:\uff1a]?\s*[^\]]*\]/g, '');
  // [Image suggestion: ...] 영어 형태도 제거
  cleaned = cleaned.replace(/\[Image\s*suggest[^[\]]*\]/gi, '');
  // 빈 <p> 태그 정리
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
  return cleaned;
}

/**
 * HTML 콘텐츠를 Gutenberg 블록 포맷으로 변환
 */
export function convertToGutenbergBlocks(html: string): string {
  // 1단계: AI 가이드 텍스트 제거
  let content = removeAiGuideText(html);

  // 2단계: CTA 블록 추출 및 보호 (인라인 스타일 유지)
  const ctaPlaceholders: Record<string, string> = {};
  let ctaIndex = 0;
  content = content.replace(
    /<div\s+class="cp9-cta[^"]*"[^>]*>[\s\S]*?<\/div>/g,
    (match) => {
      const key = `__CTA_PLACEHOLDER_${ctaIndex++}__`;
      ctaPlaceholders[key] = `<!-- wp:html -->\n${match}\n<!-- /wp:html -->`;
      return key;
    }
  );

  // 3단계: 상품 이미지 블록 변환
  content = content.replace(
    /<figure\s+class="cp9-product-image"[^>]*>([\s\S]*?)<\/figure>/g,
    (_match, inner) => {
      return `<!-- wp:html -->\n<figure class="cp9-product-image" style="text-align:center;margin:2em auto;max-width:420px;">${inner}</figure>\n<!-- /wp:html -->`;
    }
  );

  // 4단계: 각 HTML 요소를 Gutenberg 블록으로 변환
  // ★ 핵심: text-align:left 인라인 스타일을 명시하여 WP 테마의 center 강제를 오버라이드

  // <h2> → wp:heading {"level":2} + 좌측정렬
  content = content.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/g,
    (_match, attrs, inner) => {
      // 이미 style 속성이 있으면 text-align 추가, 없으면 새로 생성
      const styleAttr = attrs.includes('style=')
        ? attrs.replace(/style="/, 'style="text-align:left;')
        : ` style="text-align:left;"${attrs}`;
      return `<!-- wp:heading {"level":2} -->\n<h2 class="wp-block-heading"${styleAttr}>${inner.trim()}</h2>\n<!-- /wp:heading -->`;
    }
  );

  // <h3> → wp:heading {"level":3} + 좌측정렬
  content = content.replace(
    /<h3([^>]*)>([\s\S]*?)<\/h3>/g,
    (_match, attrs, inner) => {
      const styleAttr = attrs.includes('style=')
        ? attrs.replace(/style="/, 'style="text-align:left;')
        : ` style="text-align:left;"${attrs}`;
      return `<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading"${styleAttr}>${inner.trim()}</h3>\n<!-- /wp:heading -->`;
    }
  );

  // <blockquote> → wp:quote
  content = content.replace(
    /<blockquote([^>]*)>([\s\S]*?)<\/blockquote>/g,
    (_match, _attrs, inner) => {
      return `<!-- wp:quote -->\n<blockquote class="wp-block-quote" style="text-align:left;">${inner}</blockquote>\n<!-- /wp:quote -->`;
    }
  );

  // <table> → wp:table + 좌측정렬
  content = content.replace(
    /<table([^>]*)>([\s\S]*?)<\/table>/g,
    (_match, attrs, inner) => {
      return `<!-- wp:table -->\n<figure class="wp-block-table" style="text-align:left;"><table${attrs}>${inner}</table></figure>\n<!-- /wp:table -->`;
    }
  );

  // <hr> → wp:separator
  content = content.replace(
    /<hr\s*\/?>/g,
    '<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->'
  );

  // <ul> → wp:list + 좌측정렬
  content = content.replace(
    /<ul([^>]*)>([\s\S]*?)<\/ul>/g,
    (_match, _attrs, inner) => {
      return `<!-- wp:list -->\n<ul class="wp-block-list" style="text-align:left;">${inner}</ul>\n<!-- /wp:list -->`;
    }
  );

  // <ol> → wp:list {"ordered":true} + 좌측정렬
  content = content.replace(
    /<ol([^>]*)>([\s\S]*?)<\/ol>/g,
    (_match, _attrs, inner) => {
      return `<!-- wp:list {"ordered":true} -->\n<ol class="wp-block-list" style="text-align:left;">${inner}</ol>\n<!-- /wp:list -->`;
    }
  );

  // <p> → wp:paragraph + 좌측정렬 (CTA 내부가 아닌 독립 <p>만)
  content = content.replace(
    /(?<!<!-- wp:)(<p)((?:\s[^>]*)?>)([\s\S]*?)(<\/p>)/g,
    (_match, pOpen, rest, inner, closeTag) => {
      const trimmed = inner.trim();
      if (!trimmed) return '';
      // style 속성이 이미 있으면 text-align 추가, 없으면 새로 생성
      let newAttrs: string;
      if (rest.includes('style=')) {
        newAttrs = rest.replace(/style="/, 'style="text-align:left;');
      } else {
        newAttrs = ` style="text-align:left;"${rest}`;
      }
      return `<!-- wp:paragraph -->\n${pOpen}${newAttrs}${trimmed}${closeTag}\n<!-- /wp:paragraph -->`;
    }
  );

  // 5단계: CTA 플레이스홀더를 원래 콘텐츠로 복원
  for (const [key, value] of Object.entries(ctaPlaceholders)) {
    content = content.replace(key, value);
  }

  // 6단계: 연속 빈 줄 정리
  content = content.replace(/\n{3,}/g, '\n\n');

  return content.trim();
}
