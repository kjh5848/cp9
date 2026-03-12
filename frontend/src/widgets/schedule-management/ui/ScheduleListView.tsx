"use client";

import React from "react";
import { ScheduleItem } from "@/entities/schedule-management/ui/SchedulePendingCard";
import { Clock, Settings, Edit3, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type ScheduleListViewProps = {
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

export const ScheduleListView = ({
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
}: ScheduleListViewProps) => {
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
      const autoIds = displayScheduledItems.filter(i => i.isAutopilot).map(i => i.id);
      setSelectedPendingIds(autoIds);
    } else {
      setSelectedPendingIds([]);
    }
  };

  const allItems = [...displayScheduledItems, ...displayCompletedItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderStatusBadge = (status: string) => {
    if (status === 'PENDING') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">대기중</span>;
    }
    if (status === 'FAILED') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">실패</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">완료됨</span>;
  };

  const renderPersonaBadge = (persona: string) => {
    const map: Record<string, string> = {
      "IT": "💻 IT",
      "LIVING": "🏠 살림",
      "BEAUTY": "✨ 뷰티",
      "HUNTER": "🔥 가성비"
    };
    return (
      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md whitespace-nowrap">
        {map[persona] || persona}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {displayScheduledItems.length > 0 && (
        <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border">
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
                className="text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded-md transition-colors"
              >
                일괄 삭제
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
              <tr>
                <th scope="col" className="px-4 py-3 w-12 text-center whitespace-nowrap">선택</th>
                <th scope="col" className="px-4 py-3 w-16 text-center whitespace-nowrap">유형</th>
                <th scope="col" className="px-4 py-3 w-20 text-center whitespace-nowrap">상태</th>
                <th scope="col" className="px-4 py-3 min-w-[200px] whitespace-nowrap">제목</th>
                <th scope="col" className="px-4 py-3 w-24 text-center whitespace-nowrap">페르소나</th>
                <th scope="col" className="px-4 py-3 w-40 text-center whitespace-nowrap">발행(예정) 일시</th>
                <th scope="col" className="px-4 py-3 w-48 text-center whitespace-nowrap">액션</th>
              </tr>
            </thead>
            <tbody>
              {allItems.map((item) => {
                const isPending = item.status === 'PENDING';
                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-center">
                      {isPending && item.isAutopilot && (
                        <input
                          type="checkbox"
                          checked={selectedPendingIds.includes(item.id)}
                          onChange={(e) => handleToggleSelect(item.id, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer focus:ring-0 focus:ring-offset-0"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.isAutopilot ? (
                        <span className="bg-blue-500/10 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/20 font-bold tracking-tight">Auto</span>
                      ) : (
                        <span className="bg-slate-500/10 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-500/20 font-bold tracking-tight">Manual</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="line-clamp-1">{item.title}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderPersonaBadge(item.persona)}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground whitespace-nowrap">
                      {editingId === item.id ? (
                        <div className="flex flex-col gap-1 items-center justify-center">
                          <Input type="date" value={editDate} onChange={e => onSetEditDate(e.target.value)} className="h-6 text-[10px] w-28 px-1 py-0 [color-scheme:dark]" />
                          <Input type="time" value={editTime} onChange={e => onSetEditTime(e.target.value)} className="h-6 text-[10px] w-20 px-1 py-0 [color-scheme:dark]" />
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {new Date(item.date).toLocaleString('ko-KR', { 
                            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cancelConfirmId === item.id ? (
                        <div className="flex items-center justify-center gap-1 border border-destructive/20 bg-destructive/5 rounded px-2 py-1">
                          <span className="text-[10px] text-destructive mr-1">삭제?</span>
                          <Button size="sm" variant="ghost" className="h-5 px-1 text-[10px] text-destructive hover:bg-destructive/20" onClick={() => onExecuteCancel(item)}>예</Button>
                          <Button size="sm" variant="ghost" className="h-5 px-1 text-[10px] text-muted-foreground hover:bg-muted" onClick={() => onSetCancelConfirmId(null)}>아니오</Button>
                        </div>
                      ) : editingId === item.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10" onClick={() => onSaveEdit(item)}>저장</Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-muted-foreground hover:bg-muted" onClick={() => onStartEdit('', '')}>취소</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          {isPending ? (
                            <>
                              {item.isAutopilot && (
                                <Button size="icon" variant="ghost" className="w-6 h-6 hover:bg-blue-500/10 hover:text-blue-500" onClick={() => onOpenAutopilotSettings(item.rawItem)}>
                                  <Settings className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground hover:text-foreground" onClick={() => onStartEdit(item.id, String(item.date))}>
                                <Edit3 className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="w-6 h-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => onSetCancelConfirmId(item.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1 border-border text-muted-foreground hover:bg-muted" onClick={() => onViewResult(item)}>
                              <ExternalLink className="w-3 h-3" /> 보기
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {allItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    등록된 스케줄 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
