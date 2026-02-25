"use client";

import React, { useState, useEffect } from "react";
import { useResearchViewModel } from "@/features/research-analysis/model/useResearchViewModel";
import { ResearchCard } from "@/entities/research/ui/ResearchCard";
import { ResearchItem } from "@/entities/research/model/types";
import { ResearchEditForm } from "@/features/research-analysis/ui/ResearchEditForm";
import { WriteActionModal } from "@/features/research-analysis/ui/WriteActionModal";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Loader2, AlertCircle, List } from "lucide-react";

/**
 * [Widgets Layer]
 * 리서치 결과를 전체 조회하고 관리(수정, SEO 생성 및 스케줄)하는 통합 관리 위젯입니다.
 */
export const ResearchManagement = () => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [actionModalState, setActionModalState] = useState<{
    isOpen: boolean;
    research: ResearchItem | null;
    defaultAction: 'NOW' | 'SCHEDULE';
  }>({
    isOpen: false,
    research: null,
    defaultAction: 'NOW'
  });
  
  const { 
    researchList, 
    loading, 
    error, 
    fetchResearch, 
    updateResearch, 
    generateSEO 
  } = useResearchViewModel();

  // 컴포넌트 마운트 시 전체 리서치 목록 페칭
  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  // 명칭 변경 및 전체 목록으로 확장 (작성 중인 것도 포함)
  const displayList = [...researchList].sort((a, b) => {
    // 본문이 있는 것을 우선순위로 정렬
    if (a.pack.content && !b.pack.content) return -1;
    if (!a.pack.content && b.pack.content) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <List className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">작성 완료된 글 목록</h2>
          <p className="text-sm text-muted-foreground mt-1">AI가 생성한 고품질 SEO 포스팅과 기초 데이터들을 관리하세요.</p>
        </div>
      </div>

      {/* 로딩 상태 상단 표시 */}
      {loading && researchList.length === 0 && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* 에러 상태 표시 */}
      {error && (
        <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </GlassCard>
      )}

      {/* 전체 건수 안내 */}
      {!loading && !error && displayList.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            총 <span className="text-foreground font-bold">{displayList.length}</span>개의 포스팅이 있습니다.
          </p>
        </div>
      )}

      {/* 리스트 영역 */}
      <div className="space-y-4">
        {displayList.map((item: any) => (
          <div key={`${item.projectId}_${item.itemId}`}>
            {editingItemId === item.itemId ? (
              <ResearchEditForm
                initialPack={item.pack}
                onSave={(newPack) => {
                  updateResearch(item.projectId, item.itemId, newPack);
                  setEditingItemId(null);
                }}
                onCancel={() => setEditingItemId(null)}
              />
            ) : (
              <ResearchCard
                research={item}
                onEditClick={() => setEditingItemId(item.itemId)}
                onGenerateSEO={() => setActionModalState({ isOpen: true, research: item, defaultAction: 'NOW' })}
                onScheduleClick={() => setActionModalState({ isOpen: true, research: item, defaultAction: 'SCHEDULE' })}
                hasDraft={false}
              />
            )}
          </div>
        ))}

        {!loading && displayList.length === 0 && !error && (
          <div className="text-center py-20 bg-muted/50 rounded-2xl border border-border">
            <p className="text-muted-foreground">작성된 글이 없습니다.</p>
          </div>
        )}
      </div>

      {actionModalState.isOpen && actionModalState.research && (
        <WriteActionModal
          isOpen={actionModalState.isOpen}
          onClose={() => setActionModalState(prev => ({ ...prev, isOpen: false }))}
          title={actionModalState.research.pack.title || actionModalState.research.itemId}
          defaultAction={actionModalState.defaultAction}
          onExecute={(params) => {
            generateSEO({ 
              projectId: actionModalState.research!.projectId, 
              itemIds: [actionModalState.research!.itemId], 
              force: false,
              persona: params.persona,
              textModel: params.textModel,
              imageModel: params.imageModel,
              actionType: params.actionType,
              scheduledAt: params.scheduledAt,
              charLimit: params.charLimit
            });
            setActionModalState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </div>
  );
};
