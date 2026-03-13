"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { Calendar as CalendarIcon, Clock, PenTool, CheckCircle2, Loader2, AlertCircle, Trash2, Edit3, LayoutGrid, CalendarDays, Play, Square, Settings, LayoutList, Search, X } from "lucide-react";
import { DraftDetailModal } from "@/features/research-analysis/ui/DraftDetailModal";
import { useResearchViewModel } from "@/features/research-analysis/model/useResearchViewModel";
import { BigCalendarView, type ScheduleEvent } from "./BigCalendarView";
import { ScheduleBoardView } from "./ScheduleBoardView";
import { ScheduleListView } from "./ScheduleListView";
import { toast } from "react-hot-toast";
import { cn } from "@/shared/lib/utils";

/**
 * [Widgets Layer]
 * 스케줄링 목록(예약된 포스팅, 완료된 포스팅 등)을 글로벌로 관리하고 확인하는 보드입니다.
 */
import { useScheduleManagementViewModel } from '@/features/schedule-management/model/useScheduleManagementViewModel';
import { AutopilotConfigModal } from '@/features/autopilot/ui/AutopilotConfigModal';

export const ScheduleManagement = () => {
  const {
    loading,
    error,
    displayScheduledItems,
    displayCompletedItems,
    overdueItems,
    allCategories,
    
    // 뷰 옵션 상태
    viewMode, setViewMode,
    previewItem, setPreviewItem,
    autopilotModal, setAutopilotModal,
    showAutopilotOnly, setShowAutopilotOnly,
    statusFilter, setStatusFilter,
    personaFilter, setPersonaFilter,
    searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter,
    startDateFilter, setStartDateFilter,
    endDateFilter, setEndDateFilter,
    queueRunning, setQueueRunning,
    queueProgress,
    
    // 편집 및 취소 상태
    editingId, setEditingId,
    editDate, setEditDate,
    editTime, setEditTime,
    cancelConfirmId, setCancelConfirmId,

    // 액션 핸들러
    fetchResearch,
    fetchAutopilotQueue,
    runPublishQueue,
    executeCancelSchedule,
    handleStartEdit,
    handleSaveEdit,
    deleteFromQueue,
    bulkDeleteFromQueue,
    rescheduleQueue,
    scheduledItems,
    completedItems
  } = useScheduleManagementViewModel();

  // react-big-calendar용 이벤트 변환 (시간대별 표시)
  const calendarEvents: ScheduleEvent[] = [
    ...displayScheduledItems.map(item => {
      const d = new Date(item.date);
      const endDate = new Date(d.getTime() + 30 * 60 * 1000); // 30분 블록
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
      const endDate = new Date(d.getTime() + 30 * 60 * 1000); // 30분 블록
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
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
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
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">오토파일럿 전용</span>
            </label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 bg-slate-900/50 border border-slate-800 rounded-lg px-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">모든 상태</option>
              <option value="PENDING">대기중</option>
              <option value="COMPLETED">완료됨</option>
              <option value="FAILED">실패</option>
            </select>
            <select 
              value={personaFilter} 
              onChange={(e) => setPersonaFilter(e.target.value)}
              className="h-9 bg-slate-900/50 border border-slate-800 rounded-lg px-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">모든 페르소나</option>
              <option value="IT">IT전문가</option>
              <option value="LIVING">살림고수</option>
              <option value="BEAUTY">뷰티쇼퍼</option>
              <option value="HUNTER">가성비헌터</option>
            </select>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 max-w-[150px] bg-slate-900/50 border border-slate-800 rounded-lg px-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors truncate"
            >
              <option value="ALL">상품 카테고리 전체</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 rounded-lg h-9 px-2 text-slate-200">
              <span className="text-sm text-muted-foreground mr-1">날짜:</span>
              <input 
                type="date" 
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-slate-200 w-28 [color-scheme:dark]"
              />
              <span className="text-muted-foreground">~</span>
              <input 
                type="date" 
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-slate-200 w-28 [color-scheme:dark]"
              />
              {(startDateFilter || endDateFilter) && (
                <button 
                  onClick={() => { setStartDateFilter(""); setEndDateFilter(""); }}
                  className="ml-1 text-slate-400 hover:text-white"
                  title="날짜 초기화"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit ml-auto">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'list'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutList className="w-4 h-4" />리스트
              </button>
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
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="키워드 또는 스케줄 제목 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-muted-foreground"
              />
            </div>
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
          onExecuteBulkCancel={async (ids) => {
            const success = await bulkDeleteFromQueue(ids);
            if (success) {
              toast.success(`${ids.length}개의 스케줄이 성공적으로 삭제되었습니다.`);
              fetchAutopilotQueue();
            } else {
              toast.error("일괄 삭제에 실패했습니다.");
            }
          }}
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

      {/* 리스트 뷰 */}
      {viewMode === 'list' && (
        <ScheduleListView
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
          onExecuteBulkCancel={async (ids) => {
            const success = await bulkDeleteFromQueue(ids);
            if (success) {
              toast.success(`${ids.length}개의 스케줄이 성공적으로 삭제되었습니다.`);
              fetchAutopilotQueue();
            } else {
              toast.error("일괄 삭제에 실패했습니다.");
            }
          }}
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
        onDelete={async (id) => {
          const success = await deleteFromQueue(id);
          if (success) {
            toast.success("스케줄이 성공적으로 삭제되었습니다.");
            setAutopilotModal(prev => ({ ...prev, isOpen: false }));
          } else {
            toast.error("스케줄 삭제에 실패했습니다.");
          }
        }}
        onReschedule={async (id, newDate) => {
          const success = await rescheduleQueue(id, newDate);
          if (success) {
            toast.success("발행 시간이 성공적으로 변경되었습니다.");
            setAutopilotModal(prev => ({ ...prev, isOpen: false }));
          } else {
            toast.error("발행 시간 변경에 실패했습니다.");
          }
        }}
      />
    </div>
  );
};
