import ResearchPageClient from "@/features/research/components/ResearchPageClient";
import { SimpleLoadingSpinner } from "@/shared/components/advanced-ui/loading-spinner";
import { Suspense } from "react";

export default function ResearchPage() {
     return (
          <Suspense fallback={<SimpleLoadingSpinner message="Research Page Loading..." />}>
               <ResearchPageClient />
          </Suspense>
     );
}
