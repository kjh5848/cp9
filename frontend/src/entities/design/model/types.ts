/**
 * 아티클 디자인 테마 설정 타입 (Entities Domain Model)
 * 글 생성 시 적용될 CSS 스타일 설정값을 정의합니다.
 */

/** 테마 설정 전체 구조 */
export interface ThemeConfig {
  heading: {
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
  cta: {
    buttonColor: string;
    buttonTextColor: string;
    buttonRadius: string;
    /** CTA 레이아웃 프리셋 */
    layout: 'minimal' | 'card' | 'banner' | 'gradient';
    /** CTA 박스 배경색 */
    boxBgColor: string;
    /** CTA 박스 테두리 색상 */
    boxBorderColor: string;
    /** CTA 헤더 텍스트 */
    headerText: string;
    /** CTA 푸터 텍스트 */
    footerText: string;
    /** CTA 중간 텍스트 */
    midText: string;
    /** 박스 그림자 표시 여부 */
    showShadow: boolean;
    /** 상품 이미지 표시 여부 */
    showProductImage: boolean;
    /** 가격 강조 색상 */
    priceColor: string;
  };
  article: {
    bgColor: string;
    fontFamily: string;
    lineHeight: string;
    textColor: string;
  };
  disclaimer: { position: string };
}

/** 저장된 아티클 테마 엔티티 */
export interface ArticleTheme {
  id: string;
  name: string;
  config: string;
  isDefault: boolean;
  updatedAt: string;
}
