"use client";

import React from "react";
import { ScheduleItem, SchedulePendingCard } from "@/entities/schedule-management/ui/SchedulePendingCard";
import { ScheduleCompletedCard } from "@/entities/schedule-management/ui/ScheduleCompletedCard";

type ScheduleBoardViewProps = {
  displayScheduledItems: ScheduleItem[];
  displayCompletedItems: ScheduleItem[];
  cancelConfirmId: string | null;
  editingId: string | null;
  editDate: string;
  editTime: string;
  onSetCancelConfirmId: (id: string | null) => void;
  onExecuteCancel: (item: ScheduleItem) => void;
  onStartEdit: (id: string, date: string) => void;
  onSetEditDate: (val: string) => void;
  onSetEditTime: (val: string) => void;
  onSaveEdit: (item: ScheduleItem) => void;
  onOpenAutopilotSettings: (rawItem: any) => void;
  onViewResult: (item: ScheduleItem) => void;
};

export const ScheduleBoardView = ({
  displayScheduledItems,
  displayCompletedItems,
  cancelConfirmId,
  editingId,
  editDate,
  editTime,
  onSetCancelConfirmId,
  onExecuteCancel,
  onStartEdit,
  onSetEditDate,
  onSetEditTime,
  onSaveEdit,
  onOpenAutopilotSettings,
  onViewResult,
}: ScheduleBoardViewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 대기중 (예약) 목록 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            발행 대기중
          </h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {displayScheduledItems.length}
          </span>
        </div>
        
        <div className="flex flex-col gap-4">
          {displayScheduledItems.map(item => (
            <SchedulePendingCard
              key={item.id}
              item={item}
              cancelConfirmId={cancelConfirmId}
              editingId={editingId}
              editDate={editDate}
              editTime={editTime}
              onSetCancelConfirmId={onSetCancelConfirmId}
              onExecuteCancel={onExecuteCancel}
              onStartEdit={onStartEdit}
              onSetEditDate={onSetEditDate}
              onSetEditTime={onSetEditTime}
              onSaveEdit={onSaveEdit}
              onOpenAutopilotSettings={onOpenAutopilotSettings}
            />
          ))}
          {displayScheduledItems.length === 0 && (
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
            {displayCompletedItems.length}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {displayCompletedItems.map(item => (
            <ScheduleCompletedCard
              key={item.id}
              item={item}
              onViewResult={onViewResult}
            />
          ))}
          {displayCompletedItems.length === 0 && (
            <div className="py-10 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border">
              발행 완료된 스케줄이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
