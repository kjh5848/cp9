import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type ArticleType = "single" | "compare" | "curation";

export interface ArticleTypeOptionWithStatus {
  id: ArticleType;
  icon: React.ReactNode;
  label: string;
  desc: string;
  minItems: number;
  maxItems: number;
  enabled: boolean;
  reason?: string;
}

interface ArticleTypeSelectionStepProps {
  articleType: ArticleType;
  setArticleType: (type: ArticleType) => void;
  articleTypeAvailability: ArticleTypeOptionWithStatus[];
  itemCount: number;
}

/** 큐레이션 아이템 수별 권장 글자수 가이드 */
const CURATION_GUIDE = [
  { min: 3, max: 10, perItem: 300, desc: "상세 소개", label: "TOP 10 추천 — SEO 최적 포맷" },
  { min: 11, max: 20, perItem: 200, desc: "핵심 요약", label: "TOP 20 리스트 — 표준 큐레이션" },
  { min: 21, max: 30, perItem: 150, desc: "간략 소개", label: "대량 추천 — 빠른 탐색용" },
  { min: 31, max: 40, perItem: 120, desc: "한줄 소개", label: "카탈로그형 — 가격/특징 중심" },
  { min: 41, max: 50, perItem: 100, desc: "초간략", label: "대형 리스트 — 이름+가격+한줄평" },
];

/** 아이템 수에 따라 큐레이션 추천 글자수 산정 */
export function getCurationCharLimit(count: number): number {
  const guide = CURATION_GUIDE.find((g) => count >= g.min && count <= g.max);
  if (!guide) return 5000;
  // 도입+결론 약 1000자 + (아이템당 권장 글자수 × 개수)
  return 1000 + guide.perItem * count;
}

/** 현재 아이템 수에 해당하는 큐레이션 가이드 */
export function getCurationGuideForCount(count: number) {
  return CURATION_GUIDE.find((g) => count >= g.min && count <= g.max) ?? CURATION_GUIDE[0];
}

export function ArticleTypeSelectionStep({
  articleType,
  setArticleType,
  articleTypeAvailability,
  itemCount,
}: ArticleTypeSelectionStepProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-300">글 유형 선택</h4>
      <div className="grid grid-cols-1 gap-3">
        {articleTypeAvailability.map((type) => (
          <div
            key={type.id}
            onClick={() => type.enabled && setArticleType(type.id)}
            className={cn(
              "p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3",
              !type.enabled && "opacity-70 cursor-not-allowed",
              type.enabled && articleType === type.id
                ? "bg-blue-600/20 border-blue-500 text-blue-100"
                : type.enabled
                  ? "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500"
                  : "bg-slate-900/50 border-slate-800 text-slate-500",
            )}
          >
            <div className="mt-0.5">{type.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold">{type.label}</span>
                <span className="text-xs text-slate-500">
                  {type.minItems}~{type.maxItems}개
                </span>
              </div>
              <span className="text-sm opacity-80">{type.desc}</span>
              {!type.enabled && type.reason && (
                <span className="block text-xs font-semibold text-red-400 mt-1.5">{type.reason}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 큐레이션 가이드 */}
      {articleType === "curation" && (
        <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300">큐레이션 글자수 가이드</span>
          </div>
          <div className="space-y-1">
            {CURATION_GUIDE.map((guide) => {
              const isCurrent = itemCount >= guide.min && itemCount <= guide.max;
              return (
                <div
                  key={guide.min}
                  className={cn(
                    "flex items-center justify-between text-[11px] px-2 py-1 rounded",
                    isCurrent ? "bg-purple-500/20 text-purple-200 font-semibold" : "text-slate-500",
                  )}
                >
                  <span>{guide.min}~{guide.max}개</span>
                  <span>~{guide.perItem}자/아이템 ({guide.desc})</span>
                  <span>{guide.label.split("—")[0].trim()}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-purple-400/80 mt-2">
            현재 {itemCount}개 선택 → 아이템당 ~{getCurationGuideForCount(itemCount).perItem}자,
            총 ~{getCurationCharLimit(itemCount).toLocaleString()}자 예상
          </p>
        </div>
      )}
    </div>
  );
}
