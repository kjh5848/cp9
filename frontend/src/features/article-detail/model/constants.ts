/**
 * [Features/ArticleDetail Layer]
 * 글 상세 페이지에서 사용하는 상수 정의입니다.
 */

/** 재시도 시 선택 가능한 텍스트 모델 목록 */
export const TEXT_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (추천)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (빠름)' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
];

/** 재시도 시 선택 가능한 이미지 모델 목록 */
export const IMAGE_MODELS = [
  { value: 'dall-e-3', label: 'DALL-E 3 ($0.04/장)' },
  { value: 'nano-banana', label: 'Nano Banana (무료)' },
  { value: 'none', label: '이미지 생성 안함' },
];

/** WPCode에 넣을 CP9 전용 CSS (복사 버튼용) */
export const WP_CSS_FOR_COPY = `/* CP9 Styles — WPCode에 붙여넣기 */
/* ── 본문 좌측정렬 (테마 center 오버라이드) ── */
.entry-content p,.entry-content h2,.entry-content h3,.entry-content h4,.entry-content ul,.entry-content ol,.entry-content blockquote,.entry-content figcaption{text-align:left}
.entry-content .wp-block-heading{text-align:left}
/* ── CTA 스타일 ── */
.cp9-cta{max-width:680px;margin:2em auto;padding:28px 24px;border-radius:16px;text-align:center;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif}
.cp9-cta--header{background:linear-gradient(135deg,#f8f9ff,#eef1ff);border:1px solid #d4d9f7;color:#1a1a2e}
.cp9-cta--footer{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff}
.cp9-cta--tech.cp9-cta--header{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;color:#0c4a6e}
.cp9-cta--tech.cp9-cta--footer{background:linear-gradient(135deg,#0c4a6e,#0369a1);color:#fff}
.cp9-cta__image{max-width:260px;height:auto;margin:0 auto 16px;border-radius:12px;display:block;background:#fff;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,.06);border:1px solid #eee}
.cp9-cta__image--footer{max-width:180px}
.cp9-cta__button{display:inline-block;background:#2563eb;color:#fff!important;padding:14px 36px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none!important;margin:10px 0;box-shadow:0 4px 12px rgba(37,99,235,.25)}
.cp9-cta__button:hover{background:#1d4ed8;transform:translateY(-2px);box-shadow:0 6px 20px rgba(37,99,235,.35)}
.cp9-cta__button--large{padding:18px 48px;font-size:18px}
.cp9-cta__button--tech{background:#0284c7;box-shadow:0 4px 12px rgba(2,132,199,.25)}
.cp9-cta__headline{font-size:20px;font-weight:800;margin:0 0 8px}
.cp9-cta__sub-text{font-size:14px;opacity:.85;margin:8px 0;line-height:1.6}
.cp9-cta__disclaimer{font-size:11px;opacity:.5;margin-top:14px}
.cp9-cta__social-proof{font-size:13px;opacity:.75;margin:6px 0}
.cp9-cta__urgency{color:#dc2626;font-size:13px;font-weight:600;margin:6px 0}
.cp9-cta--footer .cp9-cta__urgency{color:#fbbf24}
.cp9-cta__spec-badge,.cp9-cta__compare-badge,.cp9-cta__editor-badge,.cp9-cta__price-badge,.cp9-cta__trend-badge,.cp9-cta__living-badge,.cp9-cta__curator-badge{display:inline-block;background:rgba(37,99,235,.08);color:#2563eb;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:12px}
.cp9-cta--footer .cp9-cta__spec-badge{background:rgba(255,255,255,.15);color:#fff}
.cp9-cta__price-block{margin:12px 0}
.cp9-cta__current-price{font-size:24px;font-weight:800;color:#dc2626}
.cp9-cta--footer .cp9-cta__current-price{color:#fbbf24}
.cp9-cta__rocket-badge{display:inline-block;background:#2563eb;color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px;vertical-align:middle}
.cp9-cta__inline-price{display:block;font-size:18px;font-weight:700;color:#dc2626;margin:4px 0 8px}
.cp9-cta--mid{background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:12px;max-width:680px;margin:1.5em auto}
/* ── 상품 이미지 ── */
.cp9-product-image{text-align:center;margin:2em auto;max-width:420px}
.cp9-product-image img{max-width:100%;height:auto;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #eee}
.cp9-product-image figcaption{font-size:13px;color:#94a3b8;margin-top:8px}
/* ── 테이블 ── */
.entry-content table,.entry-content table th,.entry-content table td{border-collapse:collapse;text-align:left}
.entry-content table th{background:#f1f5f9;color:#334155;font-weight:600;padding:12px 16px;border-bottom:2px solid #e2e8f0}
.entry-content table td{padding:10px 16px;border-bottom:1px solid #f1f5f9}
`;
