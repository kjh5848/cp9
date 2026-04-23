"use client";

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
        <h3 className="text-foreground font-bold">포스팅 및 리서치 정보 편집</h3>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="border-border hover:bg-muted"
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

      <div className="space-y-6">
        {/* 1. 블로그 본문 편집 영역 (최상단) */}
        <div className="space-y-2 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
          <label className="text-sm font-bold text-blue-400 flex items-center gap-2">
            <Check className="w-4 h-4" />
            작성된 블로그 본문 (마크다운)
          </label>
          <textarea
            className="w-full h-80 bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono leading-relaxed"
            value={pack.content || ""}
            onChange={(e) => handleChange("content", e.target.value)}
            placeholder="AI가 생성한 글이 여기에 표시됩니다. 마크다운으로 직접 편집 가능합니다."
          />
        </div>

        <hr className="border-border/50" />

        {/* 2. 상품 기초 정보 영역 */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">상품 리서치 메타데이터</h4>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">제품 제목</label>
            <input
              type="text"
              className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={pack.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">가격 (KRW)</label>
              <input
                type="number"
                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={pack.priceKRW || ""}
                onChange={(e) => handleChange("priceKRW", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">로켓배송 여부</label>
              <select
                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={pack.isRocket === null ? "" : pack.isRocket ? "true" : "false"}
                onChange={(e) => handleChange("isRocket", e.target.value === "" ? null : e.target.value === "true")}
              >
                <option value="" className="bg-card">선택 안함</option>
                <option value="true" className="bg-card">로켓배송 가능</option>
                <option value="false" className="bg-card">일반배송</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-purple-400 uppercase">리서치 원문 (Search Raw)</label>
            <textarea
              className="w-full h-40 bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none font-sans"
              value={pack.researchRaw || ""}
              onChange={(e) => handleChange("researchRaw", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-500 uppercase">장점 (줄바꿈 구분)</label>
              <textarea
                className="w-full h-24 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
                value={pack.pros?.join("\n") || ""}
                onChange={(e) => handleListChange("pros", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-rose-500 uppercase">단점 (줄바꿈 구분)</label>
              <textarea
                className="w-full h-24 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-rose-500/50 resize-none"
                value={pack.cons?.join("\n") || ""}
                onChange={(e) => handleListChange("cons", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
