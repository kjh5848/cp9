/**
 * 타이포그래피 디자인 토큰
 * Awwwards 트렌드 반영 - clamp() 활용한 반응형 타이포그래피
 */

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'Times New Roman', 'serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'] // 헤더용
  },

  // Font Sizes (반응형 - clamp 활용)
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem)',      // 12-14px
    sm: 'clamp(0.875rem, 0.8rem + 0.3vw, 1rem)',         // 14-16px  
    base: 'clamp(1rem, 0.9rem + 0.4vw, 1.125rem)',       // 16-18px
    lg: 'clamp(1.125rem, 1rem + 0.5vw, 1.25rem)',        // 18-20px
    xl: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)',        // 20-24px
    '2xl': 'clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)',    // 24-30px
    '3xl': 'clamp(1.875rem, 1.6rem + 1vw, 2.25rem)',     // 30-36px
    '4xl': 'clamp(2.25rem, 1.9rem + 1.5vw, 3rem)',       // 36-48px
    '5xl': 'clamp(3rem, 2.5rem + 2vw, 4rem)',            // 48-64px
    '6xl': 'clamp(3.75rem, 3rem + 3vw, 5rem)',           // 60-80px
    '7xl': 'clamp(4.5rem, 3.5rem + 4vw, 6rem)',          // 72-96px
    '8xl': 'clamp(6rem, 4.5rem + 5vw, 8rem)',            // 96-128px
    '9xl': 'clamp(8rem, 6rem + 8vw, 12rem)'              // 128-192px
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375', 
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em', 
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },

  // Text Styles (자주 사용하는 조합)
  textStyles: {
    // Display Text (히어로, 대제목)
    displayLarge: {
      fontSize: 'clamp(4.5rem, 3.5rem + 4vw, 6rem)',
      fontWeight: '800',
      lineHeight: '1',
      letterSpacing: '-0.025em',
      fontFamily: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
    },
    displayMedium: {
      fontSize: 'clamp(3rem, 2.5rem + 2vw, 4rem)',
      fontWeight: '700', 
      lineHeight: '1.1',
      letterSpacing: '-0.025em'
    },
    displaySmall: {
      fontSize: 'clamp(2.25rem, 1.9rem + 1.5vw, 3rem)',
      fontWeight: '600',
      lineHeight: '1.2',
      letterSpacing: '-0.025em'
    },

    // Headline (섹션 제목)
    headlineLarge: {
      fontSize: 'clamp(1.875rem, 1.6rem + 1vw, 2.25rem)',
      fontWeight: '600',
      lineHeight: '1.25',
      letterSpacing: '-0.025em'
    },
    headlineMedium: {
      fontSize: 'clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)',
      fontWeight: '600',
      lineHeight: '1.3'
    },
    headlineSmall: {
      fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)',
      fontWeight: '500',
      lineHeight: '1.375'
    },

    // Title (카드 제목, 소제목)
    titleLarge: {
      fontSize: 'clamp(1.125rem, 1rem + 0.5vw, 1.25rem)',
      fontWeight: '500',
      lineHeight: '1.4'
    },
    titleMedium: {
      fontSize: 'clamp(1rem, 0.9rem + 0.4vw, 1.125rem)',
      fontWeight: '500', 
      lineHeight: '1.5'
    },
    titleSmall: {
      fontSize: 'clamp(0.875rem, 0.8rem + 0.3vw, 1rem)',
      fontWeight: '500',
      lineHeight: '1.5'
    },

    // Body Text (본문)
    bodyLarge: {
      fontSize: 'clamp(1rem, 0.9rem + 0.4vw, 1.125rem)',
      fontWeight: '400',
      lineHeight: '1.5'
    },
    bodyMedium: {
      fontSize: 'clamp(0.875rem, 0.8rem + 0.3vw, 1rem)',
      fontWeight: '400',
      lineHeight: '1.5'
    },
    bodySmall: {
      fontSize: 'clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem)',
      fontWeight: '400',
      lineHeight: '1.5'
    },

    // Label (버튼, 폼 라벨)
    labelLarge: {
      fontSize: 'clamp(0.875rem, 0.8rem + 0.3vw, 1rem)',
      fontWeight: '500',
      lineHeight: '1.5'
    },
    labelMedium: {
      fontSize: 'clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem)',
      fontWeight: '500',
      lineHeight: '1.5'
    },
    labelSmall: {
      fontSize: 'clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem)',
      fontWeight: '500',
      lineHeight: '1.5'
    }
  }
} as const;

// 타입 추론을 위한 헬퍼
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type TextStyle = keyof typeof typography.textStyles;

// CSS 클래스 생성 헬퍼
export const getTextClass = (style: TextStyle) => `text-${style}`;

// CSS 변수 생성 헬퍼
export const getTypographyCSS = () => {
  const cssVars: Record<string, string> = {};
  
  // 폰트 사이즈를 CSS 변수로 변환
  Object.entries(typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value;
  });

  return cssVars;
};