/**
 * Shared Hooks - 공통 훅들
 * 여러 feature에서 공통으로 사용되는 범용 훅들을 제공
 * 
 * 🔄 마이그레이션 노트:
 * 기존 shared 훅들은 각 feature로 이동되었습니다.
 * - Workflow 관련: @/features/workflow
 * - Product 관련: @/features/product  
 * - Search 관련: @/features/search
 * - Auth 관련: @/features/auth
 */

// === UI 상태 전용 훅들 (진짜 공통) ===
export { useModal, type ModalState } from './useModal';
export { useClipboard, type ClipboardState } from './useClipboard';
export { useLoading, type LoadingState } from './useLoading';

// === 유틸리티 훅들 ===
// 필요시 공통 유틸리티 훅들 추가

/**
 * 훅 사용 가이드:
 * 
 * 🔥 API 호출만 필요한 경우:
 * - useWorkflowAPI, useProductAPI, useSEOAPI
 * 
 * 📊 상태 관리만 필요한 경우:
 * - useWorkflowState, useRealtimeStatus
 * 
 * 🎨 UI 상태만 필요한 경우:
 * - useModal, useClipboard, useLoading
 * 
 * 🏗️ 전체 워크플로우가 필요한 경우:
 * - useWorkflowOrchestrator (권장)
 * 
 * 🛍️ 상품 관련 액션이 필요한 경우:
 * - useProductActions (개선된 버전)
 */