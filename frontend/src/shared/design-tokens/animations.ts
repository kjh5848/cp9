/**
 * 애니메이션 디자인 토큰
 * Awwwards 트렌드를 반영한 부드럽고 세련된 애니메이션 시스템
 */

export const animations = {
  // Easing Functions (Awwwards 스타일)
  easing: {
    // Standard Easing
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Bouncy & Elastic
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    
    // Sharp & Precise
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    
    // Smooth & Natural
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    natural: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    
    // Custom Awwwards Easing
    awwwards: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    hero: 'cubic-bezier(0.16, 1, 0.3, 1)',
    gallery: 'cubic-bezier(0.23, 1, 0.32, 1)'
  },

  // Duration
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',  
    slow: '400ms',
    slower: '600ms',
    slowest: '1000ms',
    
    // Context Specific
    hover: '200ms',
    focus: '150ms',
    enter: '300ms',
    exit: '200ms',
    page: '500ms',
    modal: '300ms',
    tooltip: '150ms'
  },

  // Delays
  delay: {
    none: '0ms',
    xs: '50ms',
    sm: '100ms', 
    md: '200ms',
    lg: '300ms',
    xl: '500ms',
    
    // Stagger Animation Delays
    stagger: {
      fast: '50ms',
      normal: '100ms',
      slow: '150ms'
    }
  },

  // Transform Presets
  transforms: {
    // Scale
    scaleUp: 'scale(1.05)',
    scaleDown: 'scale(0.95)',
    scaleHover: 'scale(1.02)',
    
    // Translate
    slideUp: 'translateY(-8px)',
    slideDown: 'translateY(8px)', 
    slideLeft: 'translateX(-8px)',
    slideRight: 'translateX(8px)',
    
    // Rotate
    rotateClockwise: 'rotate(5deg)',
    rotateCounterClockwise: 'rotate(-5deg)',
    
    // Combined
    liftUp: 'translateY(-8px) scale(1.02)',
    pushDown: 'translateY(2px) scale(0.98)',
    
    // 3D Effects
    perspective: 'perspective(1000px) rotateX(-10deg)',
    flip: 'perspective(1000px) rotateY(180deg)'
  },

  // Keyframe Animations
  keyframes: {
    // Fade Animations
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' }
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' }
    },
    fadeInUp: {
      from: { opacity: '0', transform: 'translateY(20px)' },
      to: { opacity: '1', transform: 'translateY(0)' }
    },
    fadeInDown: {
      from: { opacity: '0', transform: 'translateY(-20px)' },
      to: { opacity: '1', transform: 'translateY(0)' }
    },
    
    // Scale Animations  
    scaleIn: {
      from: { opacity: '0', transform: 'scale(0.95)' },
      to: { opacity: '1', transform: 'scale(1)' }
    },
    scaleOut: {
      from: { opacity: '1', transform: 'scale(1)' },
      to: { opacity: '0', transform: 'scale(0.95)' }
    },
    
    // Slide Animations
    slideInLeft: {
      from: { transform: 'translateX(-100%)' },
      to: { transform: 'translateX(0)' }
    },
    slideInRight: {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' }
    },
    
    // Loading & Spin
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' }
    },
    bounce: {
      '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
      '40%, 43%': { transform: 'translate3d(0,-30px,0)' },
      '70%': { transform: 'translate3d(0,-15px,0)' },
      '90%': { transform: 'translate3d(0,-4px,0)' }
    },
    
    // Awwwards Style Animations
    floatUp: {
      '0%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
      '100%': { transform: 'translateY(0px)' }
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' }
    },
    morphBackground: {
      '0%': { borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' },
      '25%': { borderRadius: '75% 25% 70% 30% / 25% 75% 30% 70%' },
      '50%': { borderRadius: '25% 75% 30% 70% / 75% 25% 70% 30%' },
      '75%': { borderRadius: '70% 30% 25% 75% / 30% 70% 75% 25%' },
      '100%': { borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' }
    }
  },

  // Preset Animations (자주 사용하는 조합)
  presets: {
    // Button Interactions
    buttonHover: {
      transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
    },
    buttonPress: {
      transition: 'all 100ms cubic-bezier(0.4, 0, 0.6, 1)',
      transform: 'translateY(1px) scale(0.98)'
    },
    
    // Card Interactions
    cardHover: {
      transition: 'all 300ms cubic-bezier(0.23, 1, 0.32, 1)',
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
    },
    cardPress: {
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.6, 1)',
      transform: 'translateY(-4px) scale(1.01)'
    },
    
    // Modal & Overlay
    modalEnter: {
      transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      animation: 'fadeIn 300ms ease-out, scaleIn 300ms cubic-bezier(0.16, 1, 0.3, 1)'
    },
    modalExit: {
      transition: 'all 200ms cubic-bezier(0.4, 0, 1, 1)',
      animation: 'fadeOut 200ms ease-in, scaleOut 200ms cubic-bezier(0.4, 0, 1, 1)'
    },
    
    // Page Transitions
    pageEnter: {
      animation: 'fadeInUp 500ms cubic-bezier(0.16, 1, 0.3, 1)'
    },
    pageExit: {
      animation: 'fadeOut 300ms cubic-bezier(0.4, 0, 1, 1)'
    },
    
    // Loading States
    skeleton: {
      animation: 'pulse 2s ease-in-out infinite'
    },
    shimmer: {
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      animation: 'shimmer 2s infinite'
    },
    
    // Gallery & Image
    galleryItemEnter: {
      animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      transition: 'transform 300ms cubic-bezier(0.23, 1, 0.32, 1)'
    },
    imageLoad: {
      transition: 'opacity 400ms ease-out'
    }
  },

  // Stagger Animation Helpers
  stagger: {
    children: (index: number, delay: number = 100) => ({
      animationDelay: `${index * delay}ms`
    }),
    
    fadeInStagger: (index: number) => ({
      animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      animationDelay: `${index * 100}ms`,
      animationFillMode: 'both'
    })
  }
} as const;

// 타입 추론을 위한 헬퍼
export type EasingFunction = keyof typeof animations.easing;
export type AnimationDuration = keyof typeof animations.duration;
export type AnimationPreset = keyof typeof animations.presets;

// CSS 애니메이션 생성 헬퍼
export const createAnimation = (
  keyframe: keyof typeof animations.keyframes,
  duration: AnimationDuration = 'normal',
  easing: EasingFunction = 'easeOut',
  delay: number = 0
) => ({
  animation: `${keyframe} ${animations.duration[duration]} ${animations.easing[easing]} ${delay}ms both`
});

// Transition 생성 헬퍼
export const createTransition = (
  properties: string[] = ['all'],
  duration: AnimationDuration = 'normal', 
  easing: EasingFunction = 'easeOut',
  delay: number = 0
) => ({
  transition: `${properties.join(', ')} ${animations.duration[duration]} ${animations.easing[easing]} ${delay}ms`
});

// Stagger 애니메이션 생성 헬퍼
export const createStaggerAnimation = (
  keyframe: keyof typeof animations.keyframes,
  itemIndex: number,
  staggerDelay: number = 100,
  duration: AnimationDuration = 'normal'
) => ({
  animation: `${keyframe} ${animations.duration[duration]} ${animations.easing.easeOut} ${itemIndex * staggerDelay}ms both`
});