"use client";

import React from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface SeedSearchFormProps {
  state: {
    seedKeyword: string;
    targetAge: string;
    targetGender: string;
    category: string;
    searchIntent: string;
    isLoading: boolean;
  };
  actions: {
    setSeedKeyword: (v: string) => void;
    setTargetAge: (v: string) => void;
    setTargetGender: (v: string) => void;
    setCategory: (v: string) => void;
    setSearchIntent: (v: string) => void;
    handleExtract: () => void;
  };
}

export const SeedSearchForm = ({ state, actions }: SeedSearchFormProps) => {
  return (
    <div className="space-y-5">
      {/* 1. 시드 키워드 */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400">시드 및 광범위 주제</label>
        <div className="relative">
          <input
            type="text"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder="예: 가습기, 육아템, 신혼가전"
            value={state.seedKeyword}
            onChange={(e) => actions.setSeedKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && actions.handleExtract()}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* 2. 상세 타겟팅 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">타겟 연령</label>
          <select 
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
            value={state.targetAge}
            onChange={(e) => actions.setTargetAge(e.target.value)}
          >
            <option value="all">전연령</option>
            <option value="20s">20대</option>
            <option value="30s">30대</option>
            <option value="40s">40대</option>
            <option value="50s">50대 이상</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">타겟 성별</label>
          <select 
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
            value={state.targetGender}
            onChange={(e) => actions.setTargetGender(e.target.value)}
          >
            <option value="all">남녀 공통</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
        <div className="space-y-2 col-span-2">
          <label className="text-xs font-bold text-slate-400">타겟 검색 의도</label>
          <select 
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
            value={state.searchIntent}
            onChange={(e) => actions.setSearchIntent(e.target.value)}
          >
            <option value="all">모두 탐색 (추천)</option>
            <option value="info">정보/문제해결형 (How-to)</option>
            <option value="review">후기/리뷰형</option>
            <option value="compare">비교/견적형 (vs)</option>
          </select>
        </div>
      </div>

      {/* 3. 액션 */}
      <Button 
        onClick={actions.handleExtract} 
        disabled={state.isLoading}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 mt-2 shadow-lg shadow-purple-500/20"
      >
        {state.isLoading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 딥 리서치 중...</>
        ) : (
          <><Search className="w-4 h-4 mr-2" /> 다차원 키워드 발굴</>
        )}
      </Button>
    </div>
  );
};
