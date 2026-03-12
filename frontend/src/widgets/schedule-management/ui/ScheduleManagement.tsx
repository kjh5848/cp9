"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { Calendar as CalendarIcon, Clock, PenTool, CheckCircle2, Loader2, AlertCircle, Trash2, Edit3, LayoutGrid, CalendarDays, Play, Square, Settings } from "lucide-react";
import { DraftDetailModal } from "@/features/research-analysis/ui/DraftDetailModal";
import { useResearchViewModel } from "@/features/research-analysis/model/useResearchViewModel";
import { BigCalendarView, type ScheduleEvent } from "./BigCalendarView";
import { ScheduleBoardView } from "./ScheduleBoardView";
import { toast } from "react-hot-toast";
import { cn } from "@/shared/lib/utils";

/**
 * [Widgets Layer]
 * 스케줄링 목록(예약된 포스팅, 완료된 포스팅 등)을 글로벌로 관리하고 확인하는 보드입니다.
 */
import { useAutopilotViewModel } from '@/features/autopilot/model/useAutopilotViewModel';
import { AutopilotConfigModal } from '@/features/autopilot/ui/AutopilotConfigModal';

export const ScheduleManagement = () => {
  const { researchList, loading: researchLoading, error: researchError, fetchResearch } = useResearchViewModel();
  const { queue: autopilotQueue, isLoading: autopilotLoading, fetchQueue: fetchAutopilotQueue, deleteFromQueue } = useAutopilotViewModel();

  const loading = researchLoading || autopilotLoading;
  const error = researchError;

  useEffect(() => {
    fetchResearch();
    fetchAutopilotQueue();
  }, [fetchResearch, fetchAutopilotQueue]);

  // DB에서 가져온 데이터로 목록 분리
  const manualScheduled = researchList.filter(item => item.pack.status === 'SCHEDULED').map(item => ({
    id: `${item.projectId}_${item.itemId}`,
    title: item.pack.title || '제목 없음',
    persona: item.pack.seoConfig?.persona || 'IT',
    date: item.pack.scheduledAt || item.updatedAt,
    status: 'PENDING',
    isAutopilot: false,
    rawItem: item as any
  }));

  const autoScheduled = autopilotQueue.filter(item => ['PENDING', 'PROCESSING', 'FAILED'].includes(item.status)).map(item => ({
    id: `auto_${item.id}`,
    title: item.keyword, // "[Autopilot]" prefix 제거 (배지로 대체 예정)
    persona: item.persona?.name || '기본 페르소나',
    date: item.nextRunAt || item.createdAt,
    status: item.status === 'FAILED' ? 'FAILED' : 'PENDING',
    isAutopilot: true,
    rawItem: item as any
  }));

  const scheduledItems = [...manualScheduled, ...autoScheduled].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const manualCompleted = researchList.filter(item => item.pack.status === 'PUBLISHED' || item.pack.content).map(item => ({
    id: `${item.projectId}_${item.itemId}`,
    title: item.pack.title || '제목 없음',
    persona: item.pack.seoConfig?.persona || 'IT',
    date: item.pack.scheduledAt || item.updatedAt,
    status: 'COMPLETED',
    isAutopilot: false,
    content: item.pack.content || ''
  }));

  const autoCompleted = autopilotQueue.filter(item => item.status === 'COMPLETED' || item.status === 'EXPIRED').map(item => ({
    id: `auto_${item.id}`,
    title: item.keyword, // "[Autopilot]" prefix 제거
    persona: item.persona?.name || '기본 페르소나',
    date: item.nextRunAt || item.createdAt,
    status: item.status === 'EXPIRED' ? 'EXPIRED' : 'COMPLETED',
    isAutopilot: true,
    resultUrl: item.resultUrl === 'undefined' ? null : item.resultUrl,
    content: (item.resultUrl && item.resultUrl !== 'undefined') ? '' : '스케줄에 등록된 아이템입니다.'
  }));

  const completedItems = [...manualCompleted, ...autoCompleted].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [previewItem, setPreviewItem] = useState<{ isOpen: boolean; title: string; markdown: string }>({
    isOpen: false,
    title: "",
    markdown: "",
  });

  // 오토파일럿 설정 모달 상태
  const [autopilotModal, setAutopilotModal] = useState<{ isOpen: boolean; item: any }>({
    isOpen: false,
    item: null,
  });

  // 오토파일럿만 보기 필터
  const [showAutopilotOnly, setShowAutopilotOnly] = useState(false);

  // 화면에 표시할 아이템 (필터 적용)
  const displayScheduledItems = showAutopilotOnly ? scheduledItems.filter(i => i.isAutopilot) : scheduledItems;
  const displayCompletedItems = showAutopilotOnly ? completedItems.filter(i => i.isAutopilot) : completedItems;

  // 뷰 모드: 'board' | 'calendar'
  const [viewMode, setViewMode] = useState<'board' | 'calendar'>('calendar');


  // 발행 큐 상태
  const [queueRunning, setQueueRunning] = useState(false);
  const [queueProgress, setQueueProgress] = useState({ current: 0, total: 0 });

  // 발행 큐 실행: 예약 시간이 지났으나 아직 미발행인 글만 순차 실행
  const overdueItems = displayScheduledItems.filter(item =>
    item.status === 'PENDING' && new Date(item.date) < new Date()
  );
  const runPublishQueue = useCallback(async () => {
    if (overdueItems.length === 0) {
      toast.error('밀린 스케줄이 없습니다.');
      return;
    }
    setQueueRunning(true);
    setQueueProgress({ current: 0, total: overdueItems.length });

    for (let i = 0; i < overdueItems.length; i++) {
      const item = overdueItems[i];
      setQueueProgress({ current: i + 1, total: overdueItems.length });
      try {
        const raw = item.rawItem;
        // 스케줄된 아이템의 파이프라인 실행 요청
        const res = await fetch('/api/item-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemName: raw.pack.title || '상품',
            projectId: raw.projectId,
            itemId: raw.itemId,
            productData: {
              productName: raw.pack.title,
              productPrice: raw.pack.priceKRW || 0,
              productImage: raw.pack.productImage || '',
              productUrl: raw.pack.productUrl || '',
              categoryName: raw.pack.categoryName || '',
              isRocket: raw.pack.isRocket || false,
              isFreeShipping: raw.pack.isFreeShipping || false,
            },
            seoConfig: {
              persona: raw.pack.persona || raw.pack.seoConfig?.persona || 'IT',
              toneAndManner: '전문적이면서 친근한',
              textModel: raw.pack.textModel || 'gpt-4o',
              imageModel: 'dall-e-3',
              actionType: 'NOW',
              charLimit: 2000,
              articleType: raw.pack.articleType || 'single',
            },
          }),
        });
        if (res.ok) {
          toast.success(`${i + 1}/${overdueItems.length} 발행 시작: ${item.title.slice(0, 20)}...`);
        } else {
          toast.error(`발행 실패: ${item.title.slice(0, 20)}...`);
        }
      } catch {
        toast.error(`발행 오류: ${item.title.slice(0, 20)}...`);
      }
      // 순차 호출 간 2초 딜레이 (API 부하 방지)
      if (i < overdueItems.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setQueueRunning(false);
    toast.success('밀린 스케줄 실행 완료! 목록을 새로고침합니다.');
    fetchResearch();
  }, [overdueItems, fetchResearch]);

  // react-big-calendar용 이벤트 변환 (시간대별 표시)
  const calendarEvents: ScheduleEvent[] = [
    ...displayScheduledItems.map(item => {
      const d = new Date(item.date);
      const endDate = new Date(d.getTime() + 60 * 60 * 1000); // 1시간 블록
      return {
        id: item.id,
        title: item.isAutopilot ? `[오토파일럿] ${item.title}` : item.title,
        start: d,
        end: endDate,
        allDay: false,
        status: 'PENDING' as const,
        persona: item.persona,
        articleType: item.isAutopilot ? item.rawItem.articleType : item.rawItem.pack.articleType,
        rawItem: item.rawItem,
        isAutopilot: item.isAutopilot,
      };
    }),
    ...displayCompletedItems.map(item => {
      const d = new Date(item.date);
      const endDate = new Date(d.getTime() + 60 * 60 * 1000); // 1시간 블록
      return {
        id: item.id,
        title: item.isAutopilot ? `[오토파일럿] ${item.title}` : item.title,
        start: d,
        end: endDate,
        allDay: false,
        status: 'COMPLETED' as const,
        persona: item.persona,
        content: item.content,
        isAutopilot: item.isAutopilot,
        resultUrl: (item as any).resultUrl === 'undefined' ? null : (item as any).resultUrl,
      };
    }),
  ];

  // 수정 모드 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  // 취소 확인 상태 (confirm 대신 state 사용)
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  // 스케줄 취소 실행
  const executeCancelSchedule = async (item: any) => {
    try {
      if (item.isAutopilot) {
        await deleteFromQueue(item.rawItem.id);
        toast.success('오토파일럿 큐에서 삭제되었습니다.');
        setCancelConfirmId(null);
        fetchAutopilotQueue();
      } else {
        const res = await fetch(`/api/research?projectId=${encodeURIComponent(item.rawItem.projectId)}&itemId=${encodeURIComponent(item.rawItem.itemId)}`, {
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
  const handleSaveEdit = async (item: any) => {
    if (!editDate || !editTime) {
      toast.error('날짜와 시간을 입력해주세요.');
      return;
    }
    const newScheduledAt = new Date(`${editDate}T${editTime}:00`).toISOString();

    if (item.isAutopilot) {
      try {
        const res = await fetch('/api/autopilot/queue', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.rawItem.id, nextRunAt: newScheduledAt }),
        });
        const result = await res.json();
        if (result.success) {
          toast.success('오토파일럿 스케줄이 수정되었습니다.');
          setEditingId(null);
          fetchAutopilotQueue();
        } else {
          toast.error(`수정 실패: ${result.error}`);
        }
      } catch {
        toast.error('오토파일럿 스케줄 수정 중 오류가 발생했습니다.');
      }
    } else {
      const updatedPack = { ...item.rawItem.pack, scheduledAt: newScheduledAt };
      try {
        const res = await fetch('/api/research', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: item.rawItem.projectId, itemId: item.rawItem.itemId, pack: updatedPack }),
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
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-blue-500" />
              발행 스케줄 관리
            </h2>
            <p className="text-muted-foreground">
              예약된 SEO 포스트 발행 일정을 한눈에 확인하고 관리합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* 밀린 스케줄 실행 버튼 (예약 시간 경과 + 미발행 건만 표시) */}
            {overdueItems.length > 0 && (
              <Button
                onClick={queueRunning ? () => setQueueRunning(false) : runPublishQueue}
                variant={queueRunning ? "destructive" : "default"}
                size="sm"
                className={cn("gap-2 h-9 rounded-lg", !queueRunning && "bg-orange-600 hover:bg-orange-500")}
                disabled={loading}
              >
                {queueRunning ? (
                  <><Square className="w-3.5 h-3.5" />중지 ({queueProgress.current}/{queueProgress.total})</>
                ) : (
                  <><Play className="w-3.5 h-3.5" />밀린 스케줄 실행 ({overdueItems.length}건)</>
                )}
              </Button>
            )}
            <Button onClick={() => fetchResearch()} variant="outline" className="gap-2 h-9" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "새로고침"}
            </Button>
          </div>
        </div>
        {/* 뷰 및 토글 옵션 */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors">
            <input 
              type="checkbox" 
              className="hidden" 
              checked={showAutopilotOnly} 
              onChange={(e) => setShowAutopilotOnly(e.target.checked)} 
            />
            <div className={`relative w-8 h-4 rounded-full transition-colors ${showAutopilotOnly ? 'bg-blue-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${showAutopilotOnly ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm font-medium text-slate-300">오토파일럿만 보기</span>
          </label>
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                viewMode === 'calendar'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="w-4 h-4" />캘린더
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                viewMode === 'board'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />보드
            </button>
          </div>
        </div>
      </div>

      {/* 큐 진행률 */}
      {queueRunning && (
        <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-400">발행 큐 실행 중... ({queueProgress.current}/{queueProgress.total})</p>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(queueProgress.current / queueProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {error && (
        <GlassCard className="p-4 border-red-500/20 bg-red-500/5 mb-4">
          <div className="flex items-center gap-3 text-red-500 text-sm font-semibold">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </GlassCard>
      )}

      {/* 캘린더 뷰 */}
      {viewMode === 'calendar' && (
        <BigCalendarView
          events={calendarEvents}
          onEventClick={(event) => {
            // 오토파일럿 완료 이벤트에 유효한 resultUrl이 있으면 새 탭으로 열기
            if (event.isAutopilot && event.resultUrl && event.resultUrl !== 'undefined') {
              window.open(event.resultUrl, '_blank');
            } else if (event.content) {
              setPreviewItem({
                isOpen: true,
                title: event.title as string,
                markdown: event.content || '',
              });
            } else if (event.isAutopilot && event.status === 'PENDING') {
              setAutopilotModal({
                isOpen: true,
                item: event.rawItem,
              });
            }
          }}
        />
      )}

      {/* 보드 뷰 */}
      {viewMode === 'board' && (
        <ScheduleBoardView
          displayScheduledItems={displayScheduledItems as any}
          displayCompletedItems={displayCompletedItems as any}
          cancelConfirmId={cancelConfirmId}
          editingId={editingId}
          editDate={editDate}
          editTime={editTime}
          onSetCancelConfirmId={setCancelConfirmId}
          onExecuteCancel={executeCancelSchedule}
          onStartEdit={handleStartEdit}
          onSetEditDate={setEditDate}
          onSetEditTime={setEditTime}
          onSaveEdit={handleSaveEdit}
          onOpenAutopilotSettings={(item) => setAutopilotModal({ isOpen: true, item })}
          onViewResult={(item) => {
            const url = item.resultUrl;
            if (url && url !== 'undefined') {
              window.open(url, '_blank');
            } else {
              setPreviewItem({
                isOpen: true,
                title: item.title,
                markdown: item.content || '생성된 본문이 없습니다.'
              });
            }
          }}
        />
      )}
      
      <DraftDetailModal
        isOpen={previewItem.isOpen}
        onClose={() => setPreviewItem((prev: typeof previewItem) => ({ ...prev, isOpen: false }))}
        title={previewItem.title}
        markdown={previewItem.markdown}
      />
      
      <AutopilotConfigModal
        isOpen={autopilotModal.isOpen}
        onClose={() => setAutopilotModal(prev => ({ ...prev, isOpen: false }))}
        config={autopilotModal.item}
      />
    </div>
  );
};
