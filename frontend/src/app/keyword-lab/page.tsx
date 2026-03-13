import React from "react";
import { KeywordLabDashboard } from "@/widgets/keyword-lab/ui/KeywordLabDashboard";

/**
 * [Keyword Lab Page]
 * 시드 단어를 바탕으로 다차원적인 수익형 키워드를 추출 및 제안받는 페이지입니다.
 */
export default function KeywordLabPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 relative flex flex-col justify-center items-center z-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">키워드 발굴소 (Lab)</h1>
            <p className="text-slate-400">광범위한 시드 단어를 입력하면, 연관 롱테일 키워드와 수익성 예측을 다차원으로 분석해드립니다.</p>
          </div>
        </header>

        <KeywordLabDashboard />
      </div>
    </div>
  );
}
