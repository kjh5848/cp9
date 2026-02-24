"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useResearchViewModel } from "@/features/research-analysis/model/useResearchViewModel";
import { ResearchCard } from "@/entities/research/ui/ResearchCard";
import { ResearchEditForm } from "@/features/research-analysis/ui/ResearchEditForm";
import { ResearchPack } from "@/entities/research/model/types";
import { Button } from "@/shared/ui/button";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Search, Loader2, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * [Widgets Layer]
 * 리서치 결과를 검색하고 관리(수정, SEO 생성)하는 통합 관리 위젯입니다.
 */
export const ResearchManagement = () => {
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState(searchParams.get("projectId") || "");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const { 
    researchList, 
    loading, 
    error, 
    fetchResearch, 
    updateResearch, 
    generateSEO 
  } = useResearchViewModel();

  useEffect(() => {
    const urlPid = searchParams.get("projectId");
    if (urlPid) {
      fetchResearch(urlPid);
    }
  }, [searchParams, fetchResearch]);

  const handleSearch = () => {
    if (!projectId.trim()) return;
    fetchResearch(projectId.trim());
  };

  const handleGenerateAll = () => {
    if (!projectId.trim()) return;
    generateSEO({ projectId: projectId.trim(), force: false });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-8">
      {/* 검색 헤더 */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            리서치 프로젝트 조회
          </h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="프로젝트 ID를 입력하세요"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              검색
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* 액션 바 */}
      {researchList.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            총 <span className="text-white font-bold">{researchList.length}</span>개의 분석 결과가 발견되었습니다.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateAll}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <FileText className="w-4 h-4 mr-2 text-emerald-400" />
              전체 SEO 글 생성
            </Button>
          </div>
        </div>
      )}

      {/* 에러 및 로딩 상태 */}
      {error && (
        <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </GlassCard>
      )}

      {/* 리스트 영역 */}
      <div className="space-y-6">
        {researchList.map((item) => (
          <div key={item.itemId}>
            {editingItemId === item.itemId ? (
              <ResearchEditForm
                initialPack={item.pack}
                onSave={(newPack) => {
                  updateResearch(projectId, item.itemId, newPack);
                  setEditingItemId(null);
                }}
                onCancel={() => setEditingItemId(null)}
              />
            ) : (
              <ResearchCard
                research={item}
                onEditClick={() => setEditingItemId(item.itemId)}
                onGenerateSEO={(itemId) => generateSEO({ projectId, itemIds: [itemId], force: false })}
                hasDraft={false} // 추후 상태 연동
              />
            )}
          </div>
        ))}

        {!loading && researchList.length === 0 && projectId && !error && (
          <div className="text-center py-20">
            <p className="text-slate-500">조회된 리서치 데이터가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
