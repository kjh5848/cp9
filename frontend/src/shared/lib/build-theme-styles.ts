/**
 * [Shared/Lib Layer]
 * 테마 설정 JSON을 CSS <style> 태그로 변환하는 공통 유틸리티.
 * html-phase.ts와 /api/design/apply 양쪽에서 사용됩니다.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildThemeStyles(themeConfig: Record<string, any>): string {
  const h = themeConfig.heading || {};
  const b = themeConfig.bold || {};
  const bq = themeConfig.blockquote || {};
  const li = themeConfig.list || {};
  const tb = themeConfig.table || {};
  const cta = themeConfig.cta || {};
  const art = themeConfig.article || {};

  const css = `
/* CP9 아티클 테마 CSS */
.entry-content, .post-content, article {
  font-family: ${art.fontFamily || "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"};
  line-height: ${art.lineHeight || '1.8'};
  color: ${art.textColor || '#334155'};
  ${art.bgColor && art.bgColor !== 'transparent' ? `background-color: ${art.bgColor};` : ''}
}

/* 블록별 기본 정렬 */
.entry-content p, .post-content p, article p {
  text-align: justify;
}
.entry-content h1, .entry-content h2, .entry-content h3, .entry-content h4,
.post-content h1, .post-content h2, .post-content h3, .post-content h4,
article h1, article h2, article h3, article h4 {
  text-align: left;
}
.entry-content figure, .entry-content figcaption,
.post-content figure, .post-content figcaption,
article figure, article figcaption {
  text-align: center;
}

/* 대제목 H2 */
.entry-content h2, .post-content h2, article h2 {
  color: ${h.h2Color || '#1a1a2e'};
  font-size: ${h.h2FontSize || '24px'};
  font-weight: 700;
  border-left: 4px solid ${h.h2BorderColor || '#2563eb'};
  padding-left: 12px;
  margin: 32px 0 16px;
  line-height: 1.4;
}

/* 소제목 H3 */
.entry-content h3, .post-content h3, article h3 {
  color: ${h.h3Color || '#1e293b'};
  font-size: ${h.h3FontSize || '20px'};
  font-weight: 600;
  border-bottom: 2px solid ${h.h3BorderColor || '#3b82f6'};
  padding-bottom: 8px;
  margin: 28px 0 12px;
  line-height: 1.4;
}

/* 볼드 강조 */
.entry-content strong, .post-content strong, article strong {
  color: ${b.color || '#1e293b'};
  font-weight: 700;
}

/* 인용구 */
.entry-content blockquote, .post-content blockquote, article blockquote {
  border-left: 4px solid ${bq.borderColor || '#2563eb'} !important;
  background-color: ${bq.bgColor || '#eff6ff'};
  color: ${bq.textColor || '#1e40af'};
  padding: 16px 20px;
  border-radius: 0 8px 8px 0;
  margin: 20px 0;
  font-style: italic;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
}

/* 목록 */
.entry-content ul, .post-content ul, article ul {
  padding-left: 20px;
}
.entry-content ul li::marker, .post-content ul li::marker, article ul li::marker {
  color: ${li.markerColor || '#2563eb'};
}
.entry-content ol li::marker, .post-content ol li::marker, article ol li::marker {
  color: ${li.markerColor || '#2563eb'};
  font-weight: 600;
}

/* 테이블 */
.entry-content table, .post-content table, article table {
  border-collapse: collapse;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${tb.borderColor || '#e2e8f0'};
}
.entry-content th, .post-content th, article th {
  background-color: ${tb.headerBg || '#1e293b'};
  color: ${tb.headerColor || '#fff'};
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
}
.entry-content td, .post-content td, article td {
  padding: 10px 14px;
  border-top: 1px solid ${tb.borderColor || '#e2e8f0'};
  font-size: 13px;
}
.entry-content tr:nth-child(even), .post-content tr:nth-child(even), article tr:nth-child(even) {
  background-color: ${tb.stripeBg || '#f8fafc'};
}

/* CTA 버튼 오버라이드 */
.cp9-cta__button {
  background: ${cta.buttonColor || '#2563eb'} !important;
  color: ${cta.buttonTextColor || '#fff'} !important;
  border-radius: ${cta.buttonRadius || '12px'} !important;
}
.cp9-cta__button--large {
  background: ${cta.buttonColor || '#2563eb'} !important;
  color: ${cta.buttonTextColor || '#fff'} !important;
  border-radius: ${cta.buttonRadius || '12px'} !important;
}
.cp9-cta__button--mid {
  background: ${cta.buttonColor || '#2563eb'} !important;
  color: ${cta.buttonTextColor || '#fff'} !important;
  border-radius: ${cta.buttonRadius || '12px'} !important;
}

/* 구분선 */
.entry-content hr, .post-content hr, article hr {
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
  margin: 32px 0;
}

/* 이미지 캡션 */
.entry-content figcaption, .post-content figcaption, article figcaption {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  margin-top: 8px;
}
`.trim();

  return `<style type="text/css">\n${css}\n</style>\n`;
}
