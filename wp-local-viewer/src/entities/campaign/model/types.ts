export interface CategoryCampaign {
  id: string;
  categoryName: string;
  personaId: string | null;
  themeId: string | null;
  intervalHours: number;
  activeTimeStart: number | null;
  activeTimeEnd: number | null;
  batchSize: number;
  isAutoApprove: boolean;
  targetAge?: string | null;
  targetGender?: string | null;
  targetPrice?: string | null;
  targetIndustry?: string | null;
  
  // Phase 3 Extensions
  textModel?: string | null;
  imageModel?: string | null;
  articleType?: string | null;
  charLimit?: number | null;
  sortCriteria?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isRocketOnly?: boolean | null;
  
  publishTimes?: string | null;
  publishDays?: string | null;
  jitterMinutes?: number | null;
  dailyCap?: number | null;
  publishTargets?: string | null;

  createdAt: string;
  persona?: { name: string } | null;
  _count?: {
    queues: number;
  };
}
