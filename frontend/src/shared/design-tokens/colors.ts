/**
 * 색상 디자인 토큰
 * Awwwards 트렌드를 반영한 모던 색상 팔레트
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 메인 브랜드 컬러
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Secondary Colors
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe', 
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',  // 보조 브랜드 컬러
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065'
  },

  // Neutral Colors (Dark Theme Optimized)
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',  // 메인 배경
    900: '#111827',  // 다크 배경
    950: '#0a0f1a'   // 최고 대비
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
    900: '#14532d'
  },

  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#d97706',
    900: '#92400e'
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#dc2626', 
    900: '#991b1b'
  },

  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },

  // Gradients (Awwwards Style)
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    hero: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
    gallery: 'linear-gradient(45deg, #ff6b6b, #ffa500, #4ecdc4)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    card: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.1) 100%)'
  },

  // Special Effects
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)', 
    dark: 'rgba(0, 0, 0, 0.1)',
    backdrop: 'backdrop-blur-md'
  },

  // Shadow Colors
  shadows: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
    xl: 'rgba(0, 0, 0, 0.25)',
    colored: {
      primary: 'rgba(59, 130, 246, 0.25)',
      secondary: 'rgba(139, 92, 246, 0.25)'
    }
  }
} as const;

// 타입 추론을 위한 헬퍼
export type ColorToken = keyof typeof colors;
export type ColorScale = keyof typeof colors.primary;

// CSS 변수로 변환하는 헬퍼
export const getCSSVariable = (token: string) => `var(--color-${token.replace(/\./g, '-')})`;