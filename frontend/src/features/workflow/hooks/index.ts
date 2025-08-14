// Legacy hooks
export { useWorkflow } from './useWorkflow';
export type { WorkflowStatus, WorkflowParams } from './useWorkflow';

// New feature-based hooks
export { useWorkflowAPI, type WorkflowAPIParams, type WorkflowAPIResponse } from './useWorkflowAPI';
export { useWorkflowState, type WorkflowState } from './useWorkflowState';
export { useRealtimeStatus, type RealtimeStatusUpdate, type RealtimeConfig } from './useRealtimeStatus';
export { useWorkflowOrchestrator, type WorkflowOrchestratorParams } from './useWorkflowOrchestrator';