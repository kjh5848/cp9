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

  // Phase 3 Configuration Fields
  articleType?: string;
  textModel?: string;
  imageModel?: string;
  charLimit?: number;

  sortCriteria?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  isRocketOnly?: boolean;

  intervalHours?: number | null;
  activeTimeStart?: number | null;
  activeTimeEnd?: number | null;
  nextRunAt?: string | null;
}

export interface CreateAutopilotQueuePayload {
  keyword: string;
  personaId?: string;
  
  // Phase 3 Configuration Fields
  articleType?: string;
  textModel?: string;
  imageModel?: string;
  charLimit?: number;

  sortCriteria?: string;
  minPrice?: number;
  maxPrice?: number;
  isRocketOnly?: boolean;

  intervalHours?: number;
  activeTimeStart?: number;
  activeTimeEnd?: number;
}

export interface AiResearchKeyword {
  keyword: string;
  intent: string;
  type?: 'long-tail' | 'short-tail';
}
