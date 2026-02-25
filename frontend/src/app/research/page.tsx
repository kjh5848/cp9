"use client";

import React, { Suspense } from "react";
import { ResearchManagement } from "@/widgets/research-management/ui/ResearchManagement";
import { Loader2 } from "lucide-react";

/**
 * [Research Page]
 * 리서치 관리 위젯을 배치하는 페이지입니다.
 * URL의 projectId 파라미터와 연동됩니다.
 */
export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">글 목록 (Article List)</h1>
          <p className="text-slate-400">작성된 블로그 포스팅 및 리서치 결과를 확인합니다.</p>
        </header>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-500">페이지를 로드하는 중입니다...</p>
          </div>
        }>
          <ResearchManagement />
        </Suspense>
      </div>
    </div>
  );
}