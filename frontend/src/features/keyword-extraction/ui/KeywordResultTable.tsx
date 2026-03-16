"use client";

import React from "react";
import { CheckSquare, Square, ChevronRight, BarChart3, Presentation, Inbox, ShoppingCart, Check } from "lucide-react";
import { ExtractedKeyword } from "../model/useKeywordExtraction";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { SendToModal } from "./SendToModal";
import { CartViewerModal } from "./CartViewerModal";

interface KeywordResultTableProps {
  state: {
    extractedKeywords: ExtractedKeyword[];
    selectedKeywords: string[];
    cartKeywords: ExtractedKeyword[];
    isLoading: boolean;
  };
  actions: {
    toggleSelection: (kw: string) => void;
    toggleAllSelection: () => void;
    toggleCartSelection: (kw: ExtractedKeyword) => void;
    addAllToCart: () => void;
    handleSendToDestination: (destination: 'keyword-writing' | 'autopilot-single' | 'autopilot-category') => void;
  };
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  longtail: { label: "롱테일(세부)", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  compare: { label: "비교/견적", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  "problem-solving": { label: "문제해결", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
};

const ARTICLE_TYPE_LABELS: Record<string, string> = {
  single: "단일 리뷰",
  compare: "비교 분석",
  curation: "대량 큐레이션"
};

export const KeywordResultTable = ({ state, actions }: KeywordResultTableProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCartViewerOpen, setIsCartViewerOpen] = React.useState(false);
  
  if (state.isLoading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
          <Inbox className="w-12 h-12 text-purple-400 animate-pulse relative z-10" />
        </div>
        <div className="text-center">
          <h4 className="text-white font-bold text-lg mb-1">AI 딥 리서치 중...</h4>
          <p className="text-sm text-slate-400">네이버/쿠팡 트렌드를 다차원으로 분석하고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (state.extractedKeywords.length === 0) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
        <Presentation className="w-12 h-12 text-slate-600 mb-4" />
        <h4 className="text-slate-300 font-bold mb-1">분석 결과가 없습니다</h4>
        <p className="text-sm text-slate-500">좌측 패널에서 시드 단어를 입력하고 발굴 버튼을 눌러보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">
          총 <strong className="text-purple-400">{state.extractedKeywords.length}개</strong>의 타겟 키워드 발굴 완료
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={actions.addAllToCart}
            disabled={state.extractedKeywords.length === 0}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 h-9"
          >
            전체 장바구니 담기
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsCartViewerOpen(true)}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 h-9"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            장바구니 ({state.cartKeywords.length})
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            disabled={state.selectedKeywords.length === 0}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-9 shadow-lg shadow-purple-500/20"
          >
            선택 항목 내보내기 ({state.selectedKeywords.length}) <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <CartViewerModal 
        isOpen={isCartViewerOpen}
        onOpenChange={setIsCartViewerOpen}
      />

      <SendToModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedKeywordsObj={state.extractedKeywords.filter(k => state.selectedKeywords.includes(k.keyword))}
        onConfirm={actions.handleSendToDestination}
      />

      <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
        <table className="w-full text-sm text-left align-middle">
          <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 w-10 text-center">
                <button 
                  onClick={actions.toggleAllSelection}
                  className="text-slate-400 hover:text-white transition-colors focus:outline-none"
                >
                  {state.selectedKeywords.length === state.extractedKeywords.length && state.extractedKeywords.length > 0 
                    ? <CheckSquare className="w-5 h-5 text-blue-400 mx-auto" /> 
                    : <Square className="w-5 h-5 mx-auto" />}
                </button>
              </th>
              <th className="px-4 py-3">딥 타겟 키워드</th>
              <th className="px-4 py-3 text-center">유형</th>
              <th className="px-4 py-3 text-center">비즈니스 가치</th>
              <th className="px-4 py-3">AI 추천 글 유형</th>
              <th className="px-4 py-3 text-center w-24">장바구니</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {state.extractedKeywords.map((item, idx) => {
              const isSelected = state.selectedKeywords.includes(item.keyword);
              const isInCart = state.cartKeywords.some(k => k.keyword === item.keyword);
              const tInfo = TYPE_LABELS[item.type] || TYPE_LABELS.longtail;

              return (
                <tr 
                  key={idx} 
                  className={cn(
                    "hover:bg-white/5 transition-colors group cursor-pointer",
                    isSelected && "bg-blue-500/10 hover:bg-blue-500/20"
                  )}
                  onClick={() => actions.toggleSelection(item.keyword)}
                >
                  <td className="px-4 py-4 text-center">
                    <button className="text-slate-400 hover:text-white transition-colors focus:outline-none">
                      {isSelected ? <CheckSquare className="w-5 h-5 text-blue-400" /> : <Square className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category || '미분류'}
                      </span>
                      <span className="text-[11px] text-purple-400 font-medium">
                        주제어: {item.mainKeyword || item.keyword}
                      </span>
                    </div>
                    <div className="font-bold text-white text-base mb-1">{item.keyword}</div>
                    <div className="text-xs text-slate-400 pr-4 line-clamp-1 group-hover:line-clamp-none transition-all">
                      {item.reason}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn("px-2 py-1 rounded text-[11px] font-bold border", tInfo.color)}>
                      {tInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">검색량</span>
                        <span className={cn(
                          "font-bold",
                          item.estimatedVolume === "높음" ? "text-emerald-400" : item.estimatedVolume === "중간" ? "text-amber-400" : "text-slate-500"
                        )}>{item.estimatedVolume}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">수익성</span>
                        <span className={cn(
                          "font-bold",
                          item.profitability === "높음" ? "text-blue-400" : item.profitability === "중간" ? "text-indigo-400" : "text-slate-500"
                        )}>{item.profitability}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">경쟁도</span>
                        <span className={cn(
                          "font-bold",
                          item.competition === "낮음" ? "text-emerald-400" : item.competition === "중간" ? "text-amber-400" : "text-red-400"
                        )}>{item.competition}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    <div className="flex items-center gap-1.5 font-medium">
                      <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> 
                      {ARTICLE_TYPE_LABELS[item.expectedArticleType]}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => actions.toggleCartSelection(item)}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        isInCart ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      )}
                      title={isInCart ? "장바구니에서 제거" : "장바구니 담기"}
                    >
                      {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
