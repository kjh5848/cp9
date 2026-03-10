"use client";

/**
 * [Entities/KeywordWriting] 최종 확인 카드 컴포넌트
 * 글 생성 전 모든 설정을 요약 표시하고, 생성 결과를 보여주는 순수 UI 컴포넌트입니다.
 */
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ExternalLink,
  Loader2,
  Rocket,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { SelectedProductList } from "@/shared/ui/SelectedProductList";
import { CoupangProductResponse } from "@/shared/types/api";
import { getModelLabel } from "@/shared/config/model-options";
import {
  PERSONA_OPTIONS,
  ARTICLE_TYPE_OPTIONS,
  type GenerationResult,
} from "../model/types";

/** 요약 행 헬퍼 컴포넌트 */
function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0 mt-0.5">{label}</span>
      <span className={cn("text-sm text-right ml-4", highlight ? "font-bold text-blue-400" : "text-foreground")}>{value}</span>
    </div>
  );
}

interface FinalConfirmationProps {
  keyword: string;
  editedTitle: string;
  selectedProducts: CoupangProductResponse[];
  persona: string;
  articleType: string;
  textModel: string;
  imageModel: string;
  charLimit: string;
  isGenerating: boolean;
  generationResult: GenerationResult | null;
  onGenerate: () => void;
  onPrev: () => void;
  router: ReturnType<typeof useRouter>;
}

export function FinalConfirmation({
  keyword, editedTitle, selectedProducts,
  persona, articleType, textModel, imageModel, charLimit,
  isGenerating, generationResult,
  onGenerate, onPrev, router,
}: FinalConfirmationProps) {
  return (
    <>
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-amber-500/20 rounded-lg"><Rocket className="w-5 h-5 text-amber-400" /></div>
          <div><h3 className="text-lg font-bold text-foreground">최종 확인</h3></div>
        </div>
        <div className="space-y-3">
          <Row label="키워드" value={keyword} />
          <Row label="제목" value={editedTitle} highlight />
          <Row label="쿠팡 상품" value={selectedProducts.length > 0 ? `${selectedProducts.length}개 (CTA 자동)` : "없음"} />
          <Row label="페르소나" value={PERSONA_OPTIONS.find(p => p.value === persona)?.label || persona} />
          <Row label="글 유형" value={ARTICLE_TYPE_OPTIONS.find(a => a.value === articleType)?.label || articleType} />
          <Row label="텍스트 모델" value={getModelLabel(textModel)} />
          <Row label="이미지 모델" value={getModelLabel(imageModel)} />
          <Row label="글자수" value={`${parseInt(charLimit).toLocaleString()}자`} />
        </div>
      </GlassCard>

      {/* 선택된 상품 미리보기 */}
      {selectedProducts.length > 0 && (
        <SelectedProductList products={selectedProducts} />
      )}

      {/* 생성 완료 알림 */}
      {generationResult && (
        <GlassCard className="p-5 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <Check className="w-6 h-6 text-emerald-400" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-400">생성 시작됨!</h4>
              <p className="text-xs text-muted-foreground mt-1">글 목록에서 결과를 확인하세요.</p>
            </div>
            <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400" onClick={() => router.push(`/research/${generationResult.itemId}?projectId=${generationResult.projectId}`)}>
              <ExternalLink className="w-3.5 h-3.5 mr-1" />확인
            </Button>
          </div>
        </GlassCard>
      )}

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onPrev}><ChevronLeft className="w-4 h-4 mr-1" />이전</Button>
        <Button onClick={onGenerate} disabled={isGenerating || !!generationResult} className={cn("px-8 h-12 text-white font-bold", generationResult ? "bg-emerald-600 cursor-default" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20")}>
          {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />생성 중...</> : generationResult ? <><Check className="w-4 h-4 mr-2" />완료</> : <><Rocket className="w-4 h-4 mr-2" />글 생성 시작</>}
        </Button>
      </div>
    </>
  );
}
