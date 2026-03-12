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
  onExecuteBulkCancel?: (ids: string[]) => void;
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
  onExecuteBulkCancel,
}: ScheduleBoardViewProps) => {
  const [selectedPendingIds, setSelectedPendingIds] = React.useState<string[]>([]);

  const handleToggleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPendingIds(prev => [...prev, id]);
    } else {
      setSelectedPendingIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 오토파일럿 항목만 선택 가능하게 할지? 아니면 전체? 
      // 현재 ViewModel의 bulkDelete는 오토파일럿만 대상으로 하므로, 
      // isAutopilot이 true인 항목만 추출해서 선택하는게 안전합니다.
      const autoIds = displayScheduledItems.filter(i => i.isAutopilot).map(i => i.id);
      setSelectedPendingIds(autoIds);
    } else {
      setSelectedPendingIds([]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 대기중 (예약) 목록 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              발행 대기중
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {displayScheduledItems.length}
            </span>
          </div>
          
          {/* 일괄 삭제 컨트롤 표시 */}
          {displayScheduledItems.length > 0 && (
            <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-lg border border-border">
              <div className="flex items-center gap-2 px-2">
                <input 
                  type="checkbox" 
                  checked={selectedPendingIds.length > 0 && selectedPendingIds.length === displayScheduledItems.filter(i => i.isAutopilot).length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs font-medium text-muted-foreground">전체 선택 (오토파일럿 전용)</span>
              </div>
              
              {selectedPendingIds.length > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {selectedPendingIds.length}개 선택됨
                  </span>
                  <button 
                    onClick={() => {
                      if (window.confirm(`선택한 ${selectedPendingIds.length}개의 스케줄을 정말 삭제하시겠습니까?`)) {
                        onExecuteBulkCancel?.(selectedPendingIds.map(id => id.replace('auto_', '')));
                        setSelectedPendingIds([]);
                      }
                    }}
                    className="text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1 rounded-md transition-colors"
                  >
                    일괄 삭제
                  </button>
                </div>
              )}
            </div>
          )}
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
              isSelected={selectedPendingIds.includes(item.id)}
              onToggleSelect={item.isAutopilot ? handleToggleSelect : undefined}
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
