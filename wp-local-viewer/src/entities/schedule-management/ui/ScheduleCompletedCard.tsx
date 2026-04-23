"use client";

import React from "react";
import { CheckCircle2, PenTool } from "lucide-react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { ScheduleItem } from "./SchedulePendingCard";

type ScheduleCompletedCardProps = {
  item: ScheduleItem;
  onViewResult: (item: ScheduleItem) => void;
};

export const ScheduleCompletedCard = ({
  item,
  onViewResult,
}: ScheduleCompletedCardProps) => {
  const renderStatusBadge = (status: string) => {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        발행완료
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
    <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/5">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-foreground opacity-90 line-clamp-1 flex-1 pr-4">
            {item.title}
          </h4>
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
          onClick={() => onViewResult(item)}
        >
          <PenTool className="w-3 h-3 mr-1" />
          결과 보기
        </Button>
      </div>
    </GlassCard>
  );
};
