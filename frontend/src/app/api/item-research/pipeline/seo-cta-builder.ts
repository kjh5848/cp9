/**
 * SEO 파이프라인 전용 고품질 CTA 컴포넌트 빌더
 * AI가 생성한 `[[[CTA_BUTTON]]]` 매크로를 이 HTML로 치환합니다.
 */

export interface CtaOptions {
  productUrl: string;
  copyText?: string;
  buttonText?: string;
}

const DEFAULT_COPIES = [
  "🔥 현재 혜택가 마감 임박! 품절 전에 확인하세요",
  "💡 가장 합리적인 선택! 지금 구매하면 혜택이 적용됩니다",
  "🚀 로켓배송으로 내일 당장 받아보세요",
  "⭐ 실사용자 만족도 최고! 후회 없는 선택입니다"
];

function getRandomCopy(): string {
  return DEFAULT_COPIES[Math.floor(Math.random() * DEFAULT_COPIES.length)];
}

export function buildCtaHtmlSnippet(options: CtaOptions): string {
  const { 
    productUrl, 
    copyText = getRandomCopy(), 
    buttonText = "지금 바로 최저가 확인하기"
  } = options;

  return `
<!-- SEO Optimized CTA Component -->
<div class="my-8 flex flex-col items-center justify-center w-full cta-container" style="text-align: center; margin: 2rem 0;">
  <p style="font-size: 15px; font-weight: 700; color: #ef4444; margin-bottom: 12px; letter-spacing: -0.02em;">
    ${copyText}
  </p>
  <a href="${productUrl}" target="_blank" rel="nofollow noopener noreferrer" class="group relative inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 font-bold text-white transition-all duration-300 ease-out bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-[0_8px_30px_rgb(79,70,229,0.2)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.4)] hover:-translate-y-1 hover:from-blue-500 hover:to-indigo-500 overflow-hidden w-full max-w-sm" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem 2rem; background: linear-gradient(to right, #2563eb, #4f46e5); color: white; font-weight: bold; border-radius: 1rem; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 animate-pulse" style="width: 24px; height: 24px;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg><span class="tracking-wide" style="font-size: 1.125rem;">${buttonText}</span></a>
</div>
`;
}
