"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { 
  WorkflowState, 
  WorkflowStatus, 
  RealtimeStatusUpdate, 
  RealtimeConfig 
} from "@/entities/workflow/model/types";
import { toast } from "react-hot-toast";

const DEFAULT_CONFIG: RealtimeConfig = {
  enabled: false,
  pollingInterval: 2000,
  maxRetries: 5,
};

const INITIAL_STATE: WorkflowState = {
  threadId: null,
  status: "idle",
  currentNode: null,
  completedNodes: [],
  progress: 0,
  result: null,
  error: null,
  message: null,
  metadata: null,
};

/**
 * [Features/WorkflowProgress Layer]
 * 실시간 워크플로우 진행 상태를 관리하고 폴링으로 동기화하는 ViewModel 훅입니다.
 */
export const useWorkflowViewModel = (config: Partial<RealtimeConfig> = {}) => {
  const [state, setState] = useState<WorkflowState>(INITIAL_STATE);
  const [isConnected, setIsConnected] = useState(false);
  
  const configRef = useRef<RealtimeConfig>({ ...DEFAULT_CONFIG, ...config });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const pollStatus = useCallback(async (threadId: string) => {
    try {
      const response = await fetch(`/api/workflow/stream?threadId=${threadId}`);
      if (!response.ok) throw new Error("Status fetch failed");

      const update: RealtimeStatusUpdate = await response.json();
      
      setIsConnected(true);
      retryCountRef.current = 0;

      setState(prev => ({
        ...prev,
        status: update.status as WorkflowStatus,
        currentNode: update.currentNode,
        completedNodes: update.completedNodes,
        progress: update.progress,
        result: update.result || prev.result,
        error: update.error || null,
        message: update.message || prev.message,
        metadata: prev.metadata ? {
          ...prev.metadata,
          updatedAt: Date.now()
        } : null
      }));

      if (update.status === "completed") {
        toast.success("워크플로우 완료!");
        stopPolling();
      } else if (update.status === "failed") {
        toast.error(`워크플로우 실패: ${update.error}`);
        stopPolling();
      }
    } catch (err) {
      retryCountRef.current++;
      if (retryCountRef.current >= configRef.current.maxRetries) {
        stopPolling();
        setState(prev => ({ ...prev, status: "failed", error: "Connection lost" }));
      }
    }
  }, [stopPolling]);

  const startWorkflow = useCallback(async (startApiUrl: string, payload: any) => {
    setState({ ...INITIAL_STATE, status: "running", message: "워크플로우 시작 중..." });
    
    try {
      const response = await fetch(startApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success && result.data?.threadId) {
        const threadId = result.data.threadId;
        setState(prev => ({
          ...prev,
          threadId,
          metadata: { createdAt: Date.now(), updatedAt: Date.now(), executionTime: 0 }
        }));

        if (configRef.current.enabled) {
          intervalRef.current = setInterval(() => pollStatus(threadId), configRef.current.pollingInterval);
        }
      } else {
        setState(prev => ({ ...prev, status: "failed", error: result.error || "Execution failed" }));
        toast.error("워크플로우 시작 실패");
      }
    } catch (err) {
      setState(prev => ({ ...prev, status: "failed", error: "Network error" }));
      toast.error("네트워크 오류");
    }
  }, [pollStatus]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    state,
    isConnected,
    startWorkflow,
    stopPolling,
    reset: () => setState(INITIAL_STATE)
  };
};
