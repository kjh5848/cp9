import React from "react";
import { Calendar, Clock, PenTool, CalendarPlus } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { PublishTargetSection, PublishTarget } from "@/shared/ui/PublishTargetSection";

interface PublishActionStepProps {
  actionType: "NOW" | "SCHEDULE";
  setActionType: (type: "NOW" | "SCHEDULE") => void;
  scheduleDate: string;
  setScheduleDate: (v: string) => void;
  scheduleTime: string;
  setScheduleTime: (v: string) => void;
  publishPreview: {
    totalArticles: number;
    estimatedMinutes: number;
    estimatedCost: string;
  };
  publishTargets: PublishTarget[];
  setPublishTargets: (targets: PublishTarget[]) => void;
}

export function PublishActionStep({
  actionType,
  setActionType,
  scheduleDate,
  setScheduleDate,
  scheduleTime,
  setScheduleTime,
  publishPreview,
  publishTargets,
  setPublishTargets,
}: PublishActionStepProps) {
  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-slate-300">발행 방식</h4>
      {/* 즉시/예약 탭 */}
      <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
        <button
          onClick={() => setActionType("NOW")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors",
            actionType === "NOW" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200",
          )}
        >
          <PenTool className="w-4 h-4" />
          즉시 작성
        </button>
        <button
          onClick={() => setActionType("SCHEDULE")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors",
            actionType === "SCHEDULE" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200",
          )}
        >
          <CalendarPlus className="w-4 h-4" />
          스케줄 예약
        </button>
      </div>

      {/* 예약 일시 설정 */}
      {actionType === "SCHEDULE" && (
        <div className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-sm font-semibold text-slate-300">발행 예정 일시</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">날짜</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-700 text-slate-200 [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">시간</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-700 text-slate-200 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 즉시 발행 시 요약 */}
      {actionType === "NOW" && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-sm text-emerald-200">
            {publishPreview.totalArticles}편의 글을 즉시 생성합니다.
            {publishPreview.totalArticles > 1 && " 모든 글이 동시에 병렬 처리됩니다."}
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">
            예상 소요: ~{publishPreview.estimatedMinutes}분 | 예상 비용: ~${publishPreview.estimatedCost}
          </p>
        </div>
      )}

      {/* 다중 플랫폼 발행 설정 */}
      <div className="pt-2 border-t border-slate-800">
        <PublishTargetSection 
          targets={publishTargets}
          onChange={setPublishTargets}
          hideLoadMySettings={true}
        />
      </div>
    </div>
  );
}
