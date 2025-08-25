/**
 * 간격 디자인 토큰
 * 일관된 레이아웃과 여백을 위한 스페이싱 시스템
 */

export const spacing = {
  // Base Spacing Scale (0.25rem = 4px 기준)
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  18: '4.5rem',      // 72px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px

  // Responsive Spacing (clamp 활용)
  responsive: {
    xs: 'clamp(0.5rem, 1vw, 1rem)',       // 8-16px
    sm: 'clamp(1rem, 2vw, 1.5rem)',       // 16-24px
    md: 'clamp(1.5rem, 3vw, 2.5rem)',     // 24-40px
    lg: 'clamp(2rem, 4vw, 3.5rem)',       // 32-56px
    xl: 'clamp(3rem, 5vw, 5rem)',         // 48-80px
    '2xl': 'clamp(4rem, 6vw, 7rem)',      // 64-112px
    '3xl': 'clamp(5rem, 8vw, 10rem)',     // 80-160px
    '4xl': 'clamp(7rem, 10vw, 15rem)',    // 112-240px
  },

  // Component Specific Spacing
  component: {
    // Card Spacing
    cardPadding: {
      sm: '1rem',      // 16px
      md: '1.5rem',    // 24px  
      lg: '2rem',      // 32px
      xl: '2.5rem'     // 40px
    },
    cardGap: {
      sm: '1rem',      // 16px
      md: '1.5rem',    // 24px
      lg: '2rem',      // 32px
      xl: '2.5rem'     // 40px
    },

    // Form Spacing
    formGap: {
      sm: '0.75rem',   // 12px
      md: '1rem',      // 16px
      lg: '1.5rem',    // 24px
    },
    inputPadding: {
      sm: '0.5rem 0.75rem',    // 8px 12px
      md: '0.75rem 1rem',      // 12px 16px
      lg: '1rem 1.25rem',      // 16px 20px
    },

    // Button Spacing
    buttonPadding: {
      sm: '0.5rem 1rem',       // 8px 16px
      md: '0.75rem 1.5rem',    // 12px 24px
      lg: '1rem 2rem',         // 16px 32px
      xl: '1.25rem 2.5rem',    // 20px 40px
    },

    // Layout Spacing
    containerPadding: {
      mobile: '1rem',          // 16px
      tablet: '2rem',          // 32px
      desktop: '3rem',         // 48px
    },
    sectionGap: {
      sm: '3rem',              // 48px
      md: '4rem',              // 64px
      lg: '6rem',              // 96px
      xl: '8rem',              // 128px
    },

    // Grid Spacing
    gridGap: {
      sm: '1rem',              // 16px
      md: '1.5rem',            // 24px
      lg: '2rem',              // 32px
      xl: '2.5rem',            // 40px
    }
  },

  // Semantic Spacing
  semantic: {
    // Page Layout
    headerHeight: '4rem',        // 64px
    footerHeight: '6rem',        // 96px
    sidebarWidth: '16rem',       // 256px
    
    // Content
    contentMaxWidth: '80rem',    // 1280px
    textMaxWidth: '65ch',        // 65 characters
    
    // Navigation
    navItemGap: '2rem',          // 32px
    navPadding: '1rem 2rem',     // 16px 32px
    
    // Gallery
    galleryGap: 'clamp(1rem, 3vw, 2rem)',
    galleryItemMinWidth: '300px',
    
    // Modal & Dialog
    modalPadding: '2rem',        // 32px
    dialogMaxWidth: '32rem',     // 512px
  }
} as const;

// Border Radius (간격과 관련된 둥글기)
export const borderRadius = {
  none: '0',
  sm: '0.125rem',      // 2px
  default: '0.25rem',  // 4px
  md: '0.375rem',      // 6px
  lg: '0.5rem',        // 8px
  xl: '0.75rem',       // 12px
  '2xl': '1rem',       // 16px
  '3xl': '1.5rem',     // 24px
  full: '9999px'
} as const;

// Box Shadow (깊이감을 위한 그림자)
export const boxShadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  
  // Colored Shadows (Awwwards Style)
  primary: '0 10px 15px -3px rgba(59, 130, 246, 0.2)',
  secondary: '0 10px 15px -3px rgba(139, 92, 246, 0.2)',
  success: '0 10px 15px -3px rgba(34, 197, 94, 0.2)',
  warning: '0 10px 15px -3px rgba(245, 158, 11, 0.2)',
  error: '0 10px 15px -3px rgba(239, 68, 68, 0.2)',
  
  // Glass Effect
  glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
  glassMorphism: '0 8px 32px rgba(31, 38, 135, 0.37)'
} as const;

// 타입 추론을 위한 헬퍼
export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type BoxShadowToken = keyof typeof boxShadow;

// CSS 변수 생성 헬퍼
export const getSpacingCSS = () => {
  const cssVars: Record<string, string> = {};
  
  // 스페이싱을 CSS 변수로 변환
  Object.entries(spacing).forEach(([key, value]) => {
    if (typeof value === 'string') {
      cssVars[`--spacing-${key}`] = value;
    }
  });

  return cssVars;
};