"use client";

import React, { useState } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { Calendar as CalendarIcon, LayoutGrid, CalendarDays, Loader2, AlertCircle, Trash2, ExternalLink } from "lucide-react";
import { BigCalendarView, type ScheduleEvent } from "@/widgets/schedule-management/ui/BigCalendarView";
import { AutopilotQueueItem } from "../../../entities/autopilot/model/types";
import { cn } from "@/shared/lib/utils";

interface AutopilotScheduleBoardProps {
  queue: AutopilotQueueItem[];
  isLoading?: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

export function AutopilotScheduleBoard({ queue, isLoading, onRefresh, onDelete }: AutopilotScheduleBoardProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'board'>('calendar');

  // 큐 아이템을 캘린더 이벤트로 변환
  const calendarEvents: ScheduleEvent[] = queue.map(item => {
    const d = new Date(item.nextRunAt || item.createdAt);
    const endDate = new Date(d.getTime() + 60 * 60 * 1000); // 1시간 블록으로 표시
    return {
      id: item.id,
      title: item.keyword,
      start: d,
      end: endDate,
      allDay: false,
      status: item.status as "PENDING" | "COMPLETED" | "FAILED",
      persona: item.persona?.name || '기본 페르소나',
      rawItem: item,
    };
  });

  const scheduledItems = queue.filter(item => item.status === 'PENDING' || item.status === 'PROCESSING');
  const completedItems = queue.filter(item => item.status === 'COMPLETED' || item.status === 'EXPIRED');
  const failedItems = queue.filter(item => item.status === 'FAILED');

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">대기중</span>;
      case 'PROCESSING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">처리중</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">완료됨</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">실패</span>;
      case 'EXPIRED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">만료됨</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full mt-12 pt-8 border-t border-border">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-blue-500" />
              오토파일럿 컨트롤 타워 (스케줄 보드)
            </h2>
            <p className="text-sm text-muted-foreground">
              예약된 포스팅 일정을 캘린더와 칸반 뷰로 관리합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onRefresh} variant="outline" className="gap-2 h-9" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "새로고침"}
            </Button>
          </div>
        </div>
        
        {/* View Toggle */}
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
            <CalendarDays className="w-4 h-4" /> 캘린더
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
            <LayoutGrid className="w-4 h-4" /> 칸반 보드
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <BigCalendarView
          events={calendarEvents}
          onEventClick={(event) => {
            // Optional: open detail modal
          }}
        />
      ) : null}

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: PENDING / PROCESSING */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                대기 중 ({scheduledItems.length})
              </h3>
            </div>
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {scheduledItems.map(item => (
                <GlassCard key={item.id} className="p-4 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1 pr-2">{item.keyword}</h4>
                      {renderStatusBadge(item.status)}
                    </div>
                    <div className="flex text-xs text-muted-foreground">
                      {item.persona?.name || '기본 페르소나'}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className="text-xs text-slate-400">
                        {new Date(item.nextRunAt || item.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                      <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Column 2: COMPLETED */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                완료됨 ({completedItems.length})
              </h3>
            </div>
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {completedItems.map(item => (
                <GlassCard key={item.id} className="p-4 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1 pr-2">{item.keyword}</h4>
                      {renderStatusBadge(item.status)}
                    </div>
                    <div className="flex text-xs text-muted-foreground">
                      {item.persona?.name || '기본 페르소나'}
                    </div>
                    <div className="flex flex-col mt-2 pt-2 border-t border-border/50 gap-2">
                      {item.resultUrl ? (
                        <a
                          href={item.resultUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          게시글 보기
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500">URL 없음</span>
                      )}
                      {(item.currentRuns !== undefined && item.currentRuns > 0) && (
                        <span className="text-[10px] text-slate-400">
                          발행 {item.currentRuns}{item.maxRuns ? ` / ${item.maxRuns}` : ''}회
                        </span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Column 3: FAILED */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                실패/오류 ({failedItems.length})
              </h3>
            </div>
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {failedItems.map(item => (
                <GlassCard key={item.id} className="p-4 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1 pr-2">{item.keyword}</h4>
                      {renderStatusBadge(item.status)}
                    </div>
                    <div className="flex text-xs text-muted-foreground">
                      {item.persona?.name || '기본 페르소나'}
                    </div>
                    <div className="flex flex-col mt-2 pt-2 border-t border-border/50 gap-2">
                      <span className="text-[10px] text-red-400 line-clamp-2">
                        {item.errorMessage || '원인 불명'}
                      </span>
                      <div className="flex justify-end">
                        <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
