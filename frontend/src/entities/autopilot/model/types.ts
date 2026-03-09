export interface AutopilotQueueItem {
  id: string;
  keyword: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  resultUrl?: string | null;
  errorMessage?: string | null;
  personaId?: string | null;
  persona?: {
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutopilotQueuePayload {
  keyword: string;
  personaId?: string;
}
