import React from "react";
import { ResearchManagement } from "@/widgets/research-management/ui/ResearchManagement";

/**
 * [Research Page]
 * 리서치 관리 위젯을 배치하는 페이지입니다.
 * URL의 projectId 파라미터와 연동됩니다.
 */
export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 relative flex flex-col justify-center items-center z-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">글 목록 (Article List)</h1>
            <p className="text-slate-400">작성된 블로그 포스팅 및 리서치 결과를 확인합니다.</p>
          </div>
        </header>

        <ResearchManagement />
      </div>
    </div>
  );
}