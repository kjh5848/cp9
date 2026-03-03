"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { Calendar as CalendarIcon, Clock, PenTool, CheckCircle2, Loader2, AlertCircle, Trash2, Edit3 } from "lucide-react";
import { DraftDetailModal } from "@/features/research-analysis/ui/DraftDetailModal";
import { useResearchViewModel } from "@/features/research-analysis/model/useResearchViewModel";
import { Input } from "@/shared/ui/input";
import { toast } from "react-hot-toast";

/**
 * [Widgets Layer]
 * 스케줄링 목록(예약된 포스팅, 완료된 포스팅 등)을 글로벌로 관리하고 확인하는 보드입니다.
 */
export const ScheduleBoard = () => {
  const { researchList, loading, error, fetchResearch } = useResearchViewModel();

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  // DB에서 가져온 데이터로 목록 분리
  const scheduledItems = researchList.filter(item => item.pack.status === 'SCHEDULED').map(item => ({
    id: `${item.projectId}_${item.itemId}`,
    title: item.pack.title || '제목 없음',
    persona: item.pack.seoConfig?.persona || 'IT',
    date: item.pack.scheduledAt || item.updatedAt,
    status: 'PENDING',
    rawItem: item
  }));

  const completedItems = researchList.filter(item => item.pack.status === 'PUBLISHED' || item.pack.content).map(item => ({
    id: `${item.projectId}_${item.itemId}`,
    title: item.pack.title || '제목 없음',
    persona: item.pack.seoConfig?.persona || 'IT',
    date: item.pack.scheduledAt || item.updatedAt,
    status: 'COMPLETED',
    content: item.pack.content || ''
  }));

  const [previewItem, setPreviewItem] = useState<{ isOpen: boolean; title: string; markdown: string }>({
    isOpen: false,
    title: "",
    markdown: "",
  });

  // 수정 모드 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  // 취소 확인 상태 (confirm 대신 state 사용)
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  // 스케줄 취소 실행
  const executeCancelSchedule = async (projectId: string, itemId: string) => {
    try {
      const res = await fetch(`/api/research?projectId=${encodeURIComponent(projectId)}&itemId=${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        toast.success('스케줄이 취소되었습니다.');
        setCancelConfirmId(null);
        fetchResearch();
      } else {
        toast.error(`취소 실패: ${result.error}`);
      }
    } catch {
      toast.error('스케줄 취소 중 오류가 발생했습니다.');
    }
  };

  // 수정 모드 진입
  const handleStartEdit = (id: string, currentDate: string) => {
    setEditingId(id);
    const d = new Date(currentDate);
    setEditDate(d.toISOString().split('T')[0]);
    setEditTime(d.toTimeString().slice(0, 5));
  };

  // 수정 저장
  const handleSaveEdit = async (rawItem: any) => {
    if (!editDate || !editTime) {
      toast.error('날짜와 시간을 입력해주세요.');
      return;
    }
    const newScheduledAt = new Date(`${editDate}T${editTime}:00`).toISOString();
    const updatedPack = { ...rawItem.pack, scheduledAt: newScheduledAt };
    try {
      const res = await fetch('/api/research', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: rawItem.projectId, itemId: rawItem.itemId, pack: updatedPack }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('스케줄이 수정되었습니다.');
        setEditingId(null);
        fetchResearch();
      } else {
        toast.error(`수정 실패: ${result.error}`);
      }
    } catch {
      toast.error('스케줄 수정 중 오류가 발생했습니다.');
    }
  };

  const generateMockMarkdown = (title: string, persona: string) => {
    return `
# ${title} 완전 해부 리뷰

최근 많은 분들이 관심을 가지고 계신 **${title}** 제품을 직접 분석해보았습니다.
과연 소문만큼 좋은지, 가성비 측면에서는 어떤지 꼼꼼하게 따져볼게요.

> **💡 핵심 요약**
> * 가심비와 스펙을 모두 잡은 모델
> * 특히 디자인 적인 측면에서 훌륭함

## 1. 디자인 및 첫인상

우선 외관부터 살펴볼까요? 
마감 처리가 매우 깔끔하고, 어디에 두어도 인테리어를 해치지 않는 모던한 느낌을 줍니다.
특히 다음 세 가지 요소가 맘에 들었어요:
- **매트한 질감**의 고급스러움
- **직관적인 조작부** (누구나 쉽게 접근 가능)
- 컴팩트한 사이즈로 뛰어난 공간 활용도

## 2. 장단점 비교

어떤 제품이든 완벽할 수는 없겠죠? 객관적인 시선에서 바라본 장단점입니다.

### 장점 (Pros)
1. **압도적인 성능**: 동급 대비 처리 속도가 빠릅니다.
2. **연결성**: 다양한 스마트 기기와의 매끄러운 연동이 돋보입니다.

### 단점 (Cons)
1. **가격 장벽**: 초기 진입 비용이 다소 부담스러울 수 있습니다.
2. **무게**: 예상보다 약간 묵직한 편입니다.

---

## 3. 총평

결론적으로, ${title}은(는) **충분히 투자할 가치가 있는 제품**입니다. 
당장의 예산이 허락한다면, 삶의 질을 확 올려줄 최고의 선택이 될 수 있을 거라고 생각합니다.  
*(해당 리뷰는 ${persona} 페르소나 스타일을 예시로 적용한 것입니다.)*
    `;
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'PENDING') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">대기중</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">발행완료</span>;
  };

  const renderPersonaBadge = (persona: string) => {
    const map: Record<string, string> = {
      "IT": "💻 IT전문가",
      "LIVING": "🏠 살림고수",
      "BEAUTY": "✨ 뷰티쇼퍼",
      "HUNTER": "🔥 가성비헌터"
    };
    return (
      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
        {map[persona] || persona}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-8 px-4 md:px-8">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-500" />
            발행 스케줄 관리
          </h2>
          <p className="text-muted-foreground">
            예약된 SEO 포스트 발행 일정을 한눈에 확인하고 관리합니다.
          </p>
        </div>
        <Button onClick={() => fetchResearch()} variant="outline" className="gap-2" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "새로고침"}
        </Button>
      </div>

      {error && (
        <GlassCard className="p-4 border-red-500/20 bg-red-500/5 mb-4">
          <div className="flex items-center gap-3 text-red-500 text-sm font-semibold">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </GlassCard>
      )}

      {/* 보드 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 대기중 (예약) 목록 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              발행 대기중
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {scheduledItems.length}
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            {scheduledItems.map(item => (
              <GlassCard key={item.id} className="p-4 border-border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-foreground line-clamp-1 flex-1 pr-4">{item.title}</h4>
                    {renderStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {renderPersonaBadge(item.persona)}
                    <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {new Date(item.date).toLocaleString('ko-KR', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-border">
                  {cancelConfirmId === item.id ? (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <span className="text-xs text-red-400">정말 취소하시겠습니까?</span>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 border-red-500/30 text-red-400 hover:bg-red-500/20"
                          onClick={() => executeCancelSchedule(item.rawItem.projectId, item.rawItem.itemId)}>삭제</Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 border-border text-muted-foreground hover:bg-muted"
                          onClick={() => setCancelConfirmId(null)}>아니오</Button>
                      </div>
                    </div>
                  ) : editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                          className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-200" />
                        <Input type="time" value={editTime} onChange={e => setEditTime(e.target.value)}
                          className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-200 w-24" />
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                        onClick={() => handleSaveEdit(item.rawItem)}>저장</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-border text-muted-foreground hover:bg-muted"
                        onClick={() => setEditingId(null)}>닫기</Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs border-border text-muted-foreground hover:bg-muted gap-1"
                        onClick={() => handleStartEdit(item.id, item.date)}>
                        <Edit3 className="w-3 h-3" />수정
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 gap-1"
                        onClick={() => setCancelConfirmId(item.id)}>
                        <Trash2 className="w-3 h-3" />취소
                      </Button>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
            {scheduledItems.length === 0 && (
              <div className="py-10 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border">
                예정된 스케줄이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 완료 목록 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              발행 완료
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {completedItems.length}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {completedItems.map(item => (
              <GlassCard key={item.id} className="p-4 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-foreground opacity-90 line-clamp-1 flex-1 pr-4">{item.title}</h4>
                    {renderStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {renderPersonaBadge(item.persona)}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {new Date(item.date).toLocaleString('ko-KR', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-3 border-t border-emerald-500/10">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                    onClick={() => {
                        setPreviewItem({
                        isOpen: true,
                        title: item.title,
                        markdown: item.content || '생성된 본문이 없습니다.'
                      });
                    }}
                  >
                    <PenTool className="w-3 h-3 mr-1" />
                    결과 보기
                  </Button>
                </div>
              </GlassCard>
            ))}
            {completedItems.length === 0 && (
              <div className="py-10 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border">
                발행 완료된 스케줄이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <DraftDetailModal
        isOpen={previewItem.isOpen}
        onClose={() => setPreviewItem((prev: typeof previewItem) => ({ ...prev, isOpen: false }))}
        title={previewItem.title}
        markdown={previewItem.markdown}
      />
    </div>
  );
};
