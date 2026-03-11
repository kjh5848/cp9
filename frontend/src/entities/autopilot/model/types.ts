export interface AutopilotQueueItem {
  id: string;
  keyword: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
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

  // Phase 4: 반복 횟수 제한
  maxRuns?: number | null;
  currentRuns?: number;
  expiresAt?: string | null;
}

export interface CreateAutopilotQueuePayload {
  keyword: string;
  personaId?: string;
  personaName?: string;
  themeId?: string;
  
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
  startDate?: string;

  // Phase 4: 반복 횟수 제한
  maxRuns?: number;
  expiresAt?: string;
}

export interface AiResearchKeyword {
  keyword: string;
  intent: string;
  type?: 'long-tail' | 'short-tail';
}

/** AI 키워드 기반 제목 제안 결과 */
export interface SuggestedTitle {
  title: string;
  subtitle: string;
  targetAudience: string;
  searchIntent: string;
  articleType?: string; // 추가된 속성: 개별 글 유형 지정
}
