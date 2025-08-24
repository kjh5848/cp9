/**
 * WebSocket 관련 타입 정의
 * API 가이드에서 제공하는 WebSocket 메시지 타입들
 */

export type WebSocketMessage = 
  | { type: "job_status"; job_id: string; data: JobStatusData; timestamp: string; }
  | { type: "job_progress"; job_id: string; data: JobProgressData; timestamp: string; }
  | { type: "job_complete"; job_id: string; data: JobCompleteData; timestamp: string; }
  | { type: "job_error"; job_id: string; data: JobErrorData; timestamp: string; };

export interface JobStatusData {
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  total_items: number;
  successful_items: number;
  failed_items: number;
  success_rate: number;
  processing_time_ms: number;
}

export interface JobProgressData {
  current_item: number;
  total_items: number;
  progress_percentage: number;
  current_item_name: string;
}

export interface JobCompleteData {
  status: "completed";
  results_count: number;
  total_processing_time_ms: number;
}

export interface JobErrorData {
  error_code: string;
  error_message: string;
  details?: string;
}

export type JobUpdateHandler = (message: WebSocketMessage) => void;