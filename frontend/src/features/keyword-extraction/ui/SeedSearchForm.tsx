"use client";

import React from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface SeedSearchFormProps {
  state: {
    seedKeyword: string;
    targetCount: number;
    targetAge: string;
    targetGender: string;
    category: string;
    searchIntent: string;
    searchModel: string;
    keywordType: 'single' | 'topic' | 'category';
    isLoading: boolean;
  };
  actions: {
    setSeedKeyword: (v: string) => void;
    setTargetCount: (v: number) => void;
    setTargetAge: (v: string) => void;
    setTargetGender: (v: string) => void;
    setCategory: (v: string) => void;
    setSearchIntent: (v: string) => void;
    setSearchModel: (v: string) => void;
    setKeywordType: (v: 'single' | 'topic' | 'category') => void;
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2 col-span-2 lg:col-span-3">
          <label className="text-xs font-bold text-slate-400">키워드 발굴 형태</label>
          <select 
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
            value={state.keywordType}
            onChange={(e) => actions.setKeywordType(e.target.value as 'single' | 'topic' | 'category')}
          >
            <option value="single">단일 키워드 파생 (구체적/직접적)</option>
            <option value="topic">주제/클러스터 기반 확장 (LSI/위성 주제)</option>
            <option value="category">카테고리 캠페인용 구조화 (하위 분류형)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">타겟 키워드 개수</label>
          <select 
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_0.75rem_center] bg-no-repeat"
            value={state.targetCount}
            onChange={(e) => actions.setTargetCount(Number(e.target.value))}
          >
            <option value={5}>5개 (권장)</option>
            <option value={10}>10개</option>
            <option value={15}>15개</option>
            <option value={20}>20개</option>
            <option value={25}>25개</option>
            <option value={30}>30개</option>
          </select>
        </div>
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
        <div className="space-y-2 col-span-2 lg:col-span-3">
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
        <div className="space-y-2 col-span-2 lg:col-span-3">
          <label className="text-xs font-bold text-slate-400">AI 분석 모델</label>
          <select 
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
            value={state.searchModel || "sonar-pro"}
            onChange={(e) => actions.setSearchModel(e.target.value)}
          >
            <option value="sonar-pro">sonar-pro (기본/빠른 도출 모델)</option>
            <option value="sonar-deep-research">sonar-deep-research (심층 조사 모델)</option>
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
