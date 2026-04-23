/**
 * 아티클 디자인 테마 설정 타입 (Entities Domain Model)
 * 글 생성 시 적용될 CSS 스타일 설정값을 정의합니다.
 */

/** 
 * CTA 노출 위치 및 빈도 설정
 */
export interface CtaPlacementConfig {
  /** 위치: H1 이전/이후, H2 이전/이후, H3 이전/이후, 첫/마지막/랜덤 P, 최상단/최하단 */
  position: 'article-start' | 'before-h1' | 'after-h1' | 'before-h2' | 'after-h2' | 'before-h3' | 'after-h3' | 'first-p' | 'last-p' | 'random-p' | 'article-end';
  /** 출현 빈도: 모두, 1개, 2개, 3개 (random-p 등의 조건과 함께 사용) */
  frequency: 'all' | '1' | '2' | '3';
}

/** 
 * 개별 CTA 블록 설정 (Multi-CTA System)
 */
export interface CtaBlockConfig {
  id: string;
  name: string;
  placement: CtaPlacementConfig;
  design: {
    layout: 'minimal' | 'card' | 'banner' | 'gradient' | 'outline' | 'shadow' | 'neon' | 'coupon' | 'modern' | 'luxury' | 'custom';
    buttonColor: string;
    buttonTextColor: string;
    buttonRadius: string;
    boxBgColor: string;
    boxBorderColor: string;
    text: string;           // CTA 주 텍스트 (기존 headerText 등 대체)
    headline?: string;      // 상단 헤드라인 (기존 footerHeadline 대체)
    showShadow: boolean;
    showProductImage: boolean;
    priceColor: string;
    showUrgency: boolean;
    customHtml?: string;    // 커스텀 레이아웃용 HTML 코드
  };
}

/** 테마 설정 전체 구조 */
export interface ThemeConfig {
  heading: {
    h1Color: string;
    h1BorderColor: string;
    h1FontSize: string;
    h2Color: string;
    h2BorderColor: string;
    h2FontSize: string;
    h3Color: string;
    h3BorderColor: string;
    h3FontSize: string;
  };
  bold: { color: string };
  blockquote: {
    borderColor: string;
    bgColor: string;
    textColor: string;
  };
  list: { markerColor: string };
  table: {
    headerBg: string;
    headerColor: string;
    stripeBg: string;
    borderColor: string;
  };
  /** 기존 단일 CTA 설정 (하위 호환성을 위해 유지) */
  cta?: {
    buttonColor: string;
    buttonTextColor: string;
    buttonRadius: string;
    layout: 'minimal' | 'card' | 'banner' | 'gradient';
    boxBgColor: string;
    boxBorderColor: string;
    headerText: string;
    footerText: string;
    midText: string;
    showShadow: boolean;
    showProductImage: boolean;
    priceColor: string;
    showHeaderCta: boolean;
    showMidCta: boolean;
    showFooterCta: boolean;
    footerHeadline: string;
    showUrgency: boolean;
    showDisclaimer: boolean;
  };
  /** 새롭게 추가된 다중 CTA 블록 설정 */
  ctaBlocks?: CtaBlockConfig[];
  article: {
    bgColor: string;
    fontFamily: string;
    lineHeight: string;
    textColor: string;
  };
  disclaimer: { position: string };
  /** 고급 설정: 커스텀 CSS/HTML, 스타일 모드 */
  advanced: {
    /** 유저가 직접 입력한 커스텀 CSS 코드 */
    customCss: string;
    /** 글 상단에 삽입할 커스텀 HTML */
    customHtmlHeader: string;
    /** 글 하단에 삽입할 커스텀 HTML */
    customHtmlFooter: string;
    /** 스타일 적용 모드: inline(완성형) / class-only(스킨 활용) / none(텍스트만) */
    styleMode: 'inline' | 'class-only' | 'none';
    /** CSS 클래스 접두어 (class-only 모드에서 사용, 기본: 'cp9-') */
    classPrefix: string;
  };
}

/** 저장된 아티클 테마 엔티티 */
export interface ArticleTheme {
  id: string;
  name: string;
  config: string;
  isDefault: boolean;
  updatedAt: string;
}
