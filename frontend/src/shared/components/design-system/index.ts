/**
 * Design System - CP9 통합 디자인 시스템
 * 
 * Awwwards 트렌드를 반영한 모던 웹 디자인 시스템
 * 백엔드 표준을 준수하는 체계적인 컴포넌트 라이브러리
 */

// Error System
export * from './ErrorSystem'

// Gallery System
export * from './GallerySystem'

// Design System 전체 export
import * as ErrorSystemExports from './ErrorSystem'
import * as GallerySystemExports from './GallerySystem'

export const DesignSystem = {
  ErrorSystem: ErrorSystemExports,
  GallerySystem: GallerySystemExports
} as const

// TODO: 추가될 시스템들
// export * from './NavigationSystem' 
// export * from './FormSystem'