"use client";

import React from "react";
import { Clock, Edit3, Settings, Trash2 } from "lucide-react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export type ScheduleItem = {
  id: string;
  title: string;
  persona: string;
  date: string | Date;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  isAutopilot: boolean;
  rawItem?: any;
  content?: string;
  resultUrl?: string | null;
};

type SchedulePendingCardProps = {
  item: ScheduleItem;
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
  isSelected?: boolean;
  onToggleSelect?: (id: string, checked: boolean) => void;
};

export const SchedulePendingCard = ({
  item,
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
  isSelected = false,
  onToggleSelect,
}: SchedulePendingCardProps) => {
  const renderStatusBadge = (status: string) => {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        대기중
      </span>
    );
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
    <GlassCard className={`p-4 border transition-colors ${isSelected ? 'border-blue-500/50 bg-blue-500/5' : 'border-border bg-card hover:bg-muted/50'}`}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1 pr-4">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onToggleSelect(item.id, e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer focus:ring-0 focus:ring-offset-0"
              />
            )}
            <h4 className="font-semibold text-foreground line-clamp-1 flex items-center gap-2">
              {item.isAutopilot && (
                <span className="bg-blue-500/10 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/20 font-bold tracking-tight shrink-0">
                  Auto
                </span>
              )}
              {item.title}
            </h4>
          </div>
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
                onClick={() => onExecuteCancel(item)}>삭제</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 border-border text-muted-foreground hover:bg-muted"
                onClick={() => onSetCancelConfirmId(null)}>아니오</Button>
            </div>
          </div>
        ) : editingId === item.id ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <Input type="date" value={editDate} onChange={e => onSetEditDate(e.target.value)}
                className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-200 [color-scheme:dark]" />
              <Input type="time" value={editTime} onChange={e => onSetEditTime(e.target.value)}
                className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-200 w-24 [color-scheme:dark]" />
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
              onClick={() => onSaveEdit(item)}>저장</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs border-border text-muted-foreground hover:bg-muted"
              onClick={() => onStartEdit('', '')}>닫기</Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            {item.isAutopilot && (
              <Button size="sm" variant="outline" className="h-7 text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10 gap-1"
                onClick={() => onOpenAutopilotSettings(item.rawItem)}>
                <Settings className="w-3 h-3" />설정
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-7 text-xs border-border text-muted-foreground hover:bg-muted gap-1"
              onClick={() => onStartEdit(item.id, String(item.date))}>
              <Edit3 className="w-3 h-3" />수정
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 gap-1"
              onClick={() => onSetCancelConfirmId(item.id)}>
              <Trash2 className="w-3 h-3" />취소
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
