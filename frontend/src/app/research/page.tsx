import ResearchPageClient from "@/features/research/components/ResearchPageClient";
import { SimpleLoadingSpinner } from "@/shared/components/advanced-ui/loading-spinner";
import { Suspense } from "react";

interface ResearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResearchPage({ searchParams }: ResearchPageProps) {
  const params = await searchParams;
  const sessionId = typeof params.session === 'string' ? params.session : undefined;
  
  return (
    <Suspense fallback={<SimpleLoadingSpinner message="Research Page Loading..." />}>
      <ResearchPageClient sessionId={sessionId} />
    </Suspense>
  );
}
