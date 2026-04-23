/**
 * [Widgets/KeywordWriting] 키워드 글쓰기 위젯
 * ViewModel(Features)과 Entity UI 컴포넌트를 조합하는 얇은 껍데기 위젯입니다.
 * 비즈니스 로직은 useKeywordWritingViewModel에, 순수 UI는 entities에 위임합니다.
 */
"use client";

import React from "react";
import { FileText, ShoppingCart } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { GlassCard } from "@/shared/ui/GlassCard";
import { SelectedProductList } from "@/shared/ui/SelectedProductList";

import { useKeywordWritingViewModel } from "@/features/keyword-writing";
import { useCoupangDefaults } from "@/shared/api/useCoupangDefaults";
import { KeywordFirstWizard } from "@/features/keyword-writing/ui/KeywordFirstWizard";
import { ProductFirstWizard } from "@/features/keyword-writing/ui/ProductFirstWizard";

export const KeywordWriting = () => {
  const viewModel = useKeywordWritingViewModel();
  const { state: s, actions: a } = viewModel;

  /* ── 기본 추천 상품 데이터 ── */
  const { defaultPlAll, defaultGoldbox, isLoading: isDefaultLoading } = useCoupangDefaults();

  // SelectedProductList에서 쓰이는 커스텀 장바구니 렌더링 함수
  const renderCartBar = (actionButton?: React.ReactNode) => {
    if (s.selectedProducts.length === 0) return null;
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
        <div className="max-w-[1400px] mx-auto">
          <GlassCard className="p-4 border-blue-500/30 bg-gray-900/95 backdrop-blur-xl shadow-2xl space-y-3">
            <SelectedProductList
              products={s.selectedProducts}
              onRemove={a.removeSelectedProduct}
              onClearAll={s.selectedProducts.length > 0 ? a.clearSelectedProducts : undefined}
              className="p-0 border-none bg-transparent shadow-none backdrop-blur-none"
            />
            {actionButton ? (
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                {actionButton}
              </div>
            ) : null}
          </GlassCard>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 py-8 pb-32 relative">
      {/* ── 모드 선택 탭 ── */}
      <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-fit mx-auto gap-1">
        <button
          onClick={() => a.switchMode("keyword_first")}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            s.mode === "keyword_first"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <FileText className="w-4 h-4" /> 키워드 먼저
        </button>
        <button
          onClick={() => a.switchMode("product_first")}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            s.mode === "product_first"
              ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <ShoppingCart className="w-4 h-4" /> 상품 먼저
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          모드 A: 키워드 먼저
        ═══════════════════════════════════════════════════════ */}
      {s.mode === "keyword_first" && (
        <KeywordFirstWizard
          viewModel={viewModel}
          renderCartBar={renderCartBar}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          모드 B: 상품 먼저
        ═══════════════════════════════════════════════════════ */}
      {s.mode === "product_first" && (
        <ProductFirstWizard
          viewModel={viewModel}
          renderCartBar={renderCartBar}
          defaultPlAll={defaultPlAll}
          defaultGoldbox={defaultGoldbox}
          isDefaultLoading={isDefaultLoading}
        />
      )}
    </div>
  );
};