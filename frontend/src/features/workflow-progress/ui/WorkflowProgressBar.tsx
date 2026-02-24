import React from "react";
import { WorkflowState } from "@/entities/workflow/model/types";
import { GlassCard } from "@/shared/ui/GlassCard";
import { cn } from "@/shared/lib/utils";
import { Loader2, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";

interface WorkflowProgressBarProps {
  state: WorkflowState;
  className?: string;
}

/**
 * [Features/WorkflowProgress Layer]
 * 워크플로우의 실시간 진행 상태(상태, 진척도, 현재 노드)를 시각화하는 컴포넌트입니다.
 */
export const WorkflowProgressBar = ({ state, className }: WorkflowProgressBarProps) => {
  const { status, progress, currentNode, message, error } = state;

  const getStatusIcon = () => {
    switch (status) {
      case "running": return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default: return <PlayCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "running": return "bg-blue-500";
      case "completed": return "bg-emerald-500";
      case "failed": return "bg-rose-500";
      default: return "bg-slate-700";
    }
  };

  return (
    <GlassCard className={cn("p-5 flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-semibold text-white uppercase tracking-wider">
            Workflow {status}
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">{progress}%</span>
      </div>

      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
        <div 
          className={cn("h-full transition-all duration-500 ease-out", getStatusColor())}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Current Phase</span>
          <span className="text-slate-200 font-medium">{currentNode || "Waiting..."}</span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-1 italic">
          {error || message || "준비 중입니다."}
        </p>
      </div>
    </GlassCard>
  );
};
