/**
 * [Entities/KeywordWriting] 스텝 인디케이터 컴포넌트
 * 멀티 스텝 진행 상태를 시각적으로 표시하는 순수 UI 컴포넌트입니다.
 */
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface StepIndicatorProps {
  /** 각 스텝의 라벨 배열 */
  labels: string[];
  /** 현재 활성 스텝 인덱스 (0-based) */
  current: number;
}

export function StepIndicator({ labels, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {labels.map((label, i) => (
        <React.Fragment key={i}>
          <div className={cn(
            "flex items-center gap-2 transition-all duration-300",
            i <= current ? "opacity-100" : "opacity-40"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              i < current
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : i === current
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : "bg-muted/50 text-muted-foreground border border-border"
            )}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn(
              "text-xs font-medium hidden sm:inline",
              i === current ? "text-blue-400" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className={cn(
              "flex-1 h-px max-w-[30px] transition-colors",
              i < current ? "bg-emerald-500/30" : "bg-border"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
