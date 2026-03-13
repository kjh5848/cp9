export type QueueStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface QueueData {
  id: string;
  categoryName: string;
  searchIntent?: string;
  status: QueueStatus;
  scheduledFor: string;
  errorMessage?: string;
  user?: {
    nickname: string;
    email: string;
  };
}
