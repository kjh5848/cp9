"use client";

import React from "react";
import { useKeywordExtraction } from "@/features/keyword-extraction/model/useKeywordExtraction";
import { SeedSearchForm } from "@/features/keyword-extraction/ui/SeedSearchForm";
import { KeywordResultTable } from "@/features/keyword-extraction/ui/KeywordResultTable";

/**
 * [KeywordLabDashboard Widget]
 * 키워드 발굴소 전체 페이지의 레이아웃 위젯입니다.
 */
export const KeywordLabDashboard = () => {
  const { state, actions } = useKeywordExtraction();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-5">
      {/* 1. 좌측 시드(Seed) 검색 폼 */}
      <div className="lg:col-span-1 space-y-6">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
           <h3 className="text-lg font-bold text-white mb-4">탐색 조건 설정</h3>
           <SeedSearchForm state={state} actions={actions} />
        </div>
      </div>

      {/* 2. 우측 다차원 키워드 결과 테이블 */}
      <div className="lg:col-span-3 space-y-6">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md min-h-[500px]">
           <h3 className="text-lg font-bold text-white mb-4">AI 다차원 분석 결과</h3>
           <KeywordResultTable state={state} actions={actions} />
        </div>
      </div>
    </div>
  );
};
