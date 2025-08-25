/**
 * CP9 디자인 토큰 시스템
 * Awwwards 트렌드를 반영한 종합 디자인 시스템
 */

export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, boxShadow } from './spacing';
export { animations } from './animations';

// 통합 디자인 토큰
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, boxShadow } from './spacing';
import { animations } from './animations';

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  animations
} as const;

// CSS 변수 생성
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {};

  // 색상 변수
  Object.entries(designTokens.colors.primary).forEach(([key, value]) => {
    cssVars[`--color-primary-${key}`] = value;
  });

  Object.entries(designTokens.colors.neutral).forEach(([key, value]) => {
    cssVars[`--color-neutral-${key}`] = value;
  });

  Object.entries(designTokens.colors.success).forEach(([key, value]) => {
    cssVars[`--color-success-${key}`] = value;
  });

  Object.entries(designTokens.colors.warning).forEach(([key, value]) => {
    cssVars[`--color-warning-${key}`] = value;
  });

  Object.entries(designTokens.colors.error).forEach(([key, value]) => {
    cssVars[`--color-error-${key}`] = value;
  });

  // 간격 변수
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    if (typeof value === 'string') {
      cssVars[`--spacing-${key}`] = value;
    }
  });

  // 타이포그래피 변수
  Object.entries(designTokens.typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value;
  });

  // 둥글기 변수
  Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
    cssVars[`--border-radius-${key}`] = value;
  });

  // 그림자 변수
  Object.entries(designTokens.boxShadow).forEach(([key, value]) => {
    cssVars[`--box-shadow-${key}`] = value;
  });

  // 애니메이션 변수
  Object.entries(designTokens.animations.duration).forEach(([key, value]) => {
    cssVars[`--duration-${key}`] = value;
  });

  Object.entries(designTokens.animations.easing).forEach(([key, value]) => {
    cssVars[`--easing-${key}`] = value;
  });

  return cssVars;
};

// Tailwind CSS 설정용 토큰 변환
export const getTailwindConfig = () => ({
  colors: {
    primary: designTokens.colors.primary,
    secondary: designTokens.colors.secondary,
    neutral: designTokens.colors.neutral,
    success: designTokens.colors.success,
    warning: designTokens.colors.warning,
    error: designTokens.colors.error,
    info: designTokens.colors.info,
  },
  fontSize: designTokens.typography.fontSize,
  fontWeight: designTokens.typography.fontWeight,
  spacing: designTokens.spacing,
  borderRadius: designTokens.borderRadius,
  boxShadow: designTokens.boxShadow,
  transitionDuration: designTokens.animations.duration,
  transitionTimingFunction: designTokens.animations.easing,
});

// 컴포넌트에서 사용할 수 있는 유틸리티 함수들
export const utils = {
  // 색상 유틸리티
  getColor: (color: string, shade: number = 500) => {
    return `var(--color-${color}-${shade})`;
  },

  // 간격 유틸리티
  getSpacing: (size: string | number) => {
    return `var(--spacing-${size})`;
  },

  // 타이포그래피 유틸리티
  getFontSize: (size: string) => {
    return `var(--font-size-${size})`;
  },

  // 애니메이션 유틸리티
  getTransition: (properties: string[] = ['all'], duration: string = 'normal') => {
    return `${properties.join(', ')} var(--duration-${duration}) var(--easing-easeOut)`;
  },

  // 그림자 유틸리티
  getShadow: (size: string) => {
    return `var(--box-shadow-${size})`;
  },

  // 반응형 값 생성
  responsive: (mobile: string, tablet: string, desktop: string) => {
    return `clamp(${mobile}, ${tablet}, ${desktop})`;
  }
};

// 타입 정의
export type DesignTokens = typeof designTokens;
export type ColorToken = keyof typeof designTokens.colors.primary;
export type SpacingToken = keyof typeof designTokens.spacing;
export type FontSizeToken = keyof typeof designTokens.typography.fontSize;