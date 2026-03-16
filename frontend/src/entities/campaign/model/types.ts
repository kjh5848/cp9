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
  publishTargets?: string | null;
  createdAt: string;
  persona?: { name: string } | null;
  _count?: {
    queues: number;
  };
}
