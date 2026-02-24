import React, { useState } from "react";
import { ResearchPack } from "@/entities/research/model/types";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ResearchEditFormProps {
  initialPack: ResearchPack;
  onSave: (pack: ResearchPack) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * [Features/ResearchAnalysis Layer]
 * 리서치 데이터(ResearchPack)를 편집하는 폼 컴포넌트입니다.
 */
export const ResearchEditForm = ({ 
  initialPack, 
  onSave, 
  onCancel, 
  className 
}: ResearchEditFormProps) => {
  const [pack, setPack] = useState<ResearchPack>({ ...initialPack });

  const handleChange = (field: keyof ResearchPack, value: any) => {
    setPack(prev => ({ ...prev, [field]: value }));
  };

  const handleListChange = (field: "features" | "pros" | "cons", value: string) => {
    setPack(prev => ({ 
      ...prev, 
      [field]: value.split("\n").filter(v => v.trim()) 
    }));
  };

  return (
    <GlassCard className={cn("p-6 flex flex-col gap-5", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">리서치 분석 정보 편집</h3>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="border-white/10 hover:bg-white/5"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-1" />
            취소
          </Button>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-500"
            onClick={() => onSave(pack)}
          >
            <Check className="w-4 h-4 mr-1" />
            저장
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase">제품 제목</label>
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={pack.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">가격 (KRW)</label>
            <input
              type="number"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={pack.priceKRW || ""}
              onChange={(e) => handleChange("priceKRW", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">로켓배송 여부</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={pack.isRocket === null ? "" : pack.isRocket ? "true" : "false"}
              onChange={(e) => handleChange("isRocket", e.target.value === "" ? null : e.target.value === "true")}
            >
              <option value="" className="bg-slate-900">선택 안함</option>
              <option value="true" className="bg-slate-900">로켓배송 가능</option>
              <option value="false" className="bg-slate-900">일반배송</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase">주요 특징 (줄바꿈으로 구분)</label>
          <textarea
            className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            value={pack.features?.join("\n") || ""}
            onChange={(e) => handleListChange("features", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-400/80 uppercase">장점</label>
            <textarea
              className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
              value={pack.pros?.join("\n") || ""}
              onChange={(e) => handleListChange("pros", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-rose-400/80 uppercase">단점</label>
            <textarea
              className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500/50 resize-none"
              value={pack.cons?.join("\n") || ""}
              onChange={(e) => handleListChange("cons", e.target.value)}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
