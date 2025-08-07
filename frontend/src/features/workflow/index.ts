/**
 * Workflow Feature - 메인 인덱스
 * AI 기반 워크플로우 실행, 상태 관리, 실시간 업데이트 등의 기능을 제공
 */

// === Legacy Hooks (호환성 유지) ===
export { useWorkflow } from './hooks/useWorkflow';
export { useWorkflow as useWorkflowRefactored } from './hooks/useWorkflow.refactored';
export type { WorkflowStatus, WorkflowParams } from './hooks/useWorkflow';

// === New Feature-Based Hooks ===
// API 레이어
export { 
  useWorkflowAPI, 
  type WorkflowAPIParams, 
  type WorkflowAPIResponse 
} from './hooks/useWorkflowAPI';

// 상태 관리 레이어
export { 
  useWorkflowState, 
  type WorkflowState 
} from './hooks/useWorkflowState';

export { 
  useRealtimeStatus, 
  type RealtimeStatusUpdate, 
  type RealtimeConfig 
} from './hooks/useRealtimeStatus';

// 비즈니스 로직 레이어 (권장)
export { 
  useWorkflowOrchestrator, 
  type WorkflowOrchestratorParams 
} from './hooks/useWorkflowOrchestrator';

// === Components ===
export { WorkflowProgress } from './components';

// === Types ===
// 추가 워크플로우 관련 타입들이 있다면 여기에 export