/**
 * 워크플로우 도메인 타입 정의 (Entities Domain Model)
 */

export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface WorkflowMetadata {
  createdAt: number;
  updatedAt: number;
  executionTime: number;
}

export interface WorkflowState {
  threadId: string | null;
  status: WorkflowStatus;
  currentNode: string | null;
  completedNodes: string[];
  progress: number;
  result: any | null;
  error: string | null;
  message: string | null;
  metadata: WorkflowMetadata | null;
}

/**
 * 실시간 상태 업데이트 통신 타입
 */
export interface RealtimeStatusUpdate {
  threadId: string;
  status: 'running' | 'completed' | 'failed';
  currentNode: string | null;
  completedNodes: string[];
  progress: number;
  result?: any;
  error?: string;
  message?: string;
  timestamp: number;
}

/**
 * 실시간 폴링 설정
 */
export interface RealtimeConfig {
  enabled: boolean;
  pollingInterval: number; // milliseconds
  maxRetries: number;
}
