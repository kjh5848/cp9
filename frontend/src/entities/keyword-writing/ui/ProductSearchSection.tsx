"use client";

import React from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { Search, Link as LinkIcon, Layers, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  COUPANG_CATEGORIES,
  COUPANG_PL_BRANDS,
  SEARCH_MODE_LABELS,
  type CoupangSearchMode,
} from "@/shared/constants/coupang-constants";

type ProductSearchSectionProps = {
  searchMode: CoupangSearchMode;
  onSwitchSearchMode: (mode: CoupangSearchMode) => void;
  productSearchTerm: string;
  onSetProductSearchTerm: (val: string) => void;
  linkValue: string;
  onSetLinkValue: (val: string) => void;
  categoryValue: string;
  onSetCategoryValue: (val: string) => void;
  plBrandValue: string;
  onSetPlBrandValue: (val: string) => void;
  onSearch: (mode: CoupangSearchMode, value: string) => void;
  isSearching: boolean;
  layout?: "compact" | "large";
};

export const ProductSearchSection = ({
  searchMode,
  onSwitchSearchMode,
  productSearchTerm,
  onSetProductSearchTerm,
  linkValue,
  onSetLinkValue,
  categoryValue,
  onSetCategoryValue,
  plBrandValue,
  onSetPlBrandValue,
  onSearch,
  isSearching,
  layout = "compact",
}: ProductSearchSectionProps) => {
  const isLarge = layout === "large";

  const getSearchValue = () => {
    if (searchMode === "keyword") return productSearchTerm;
    if (searchMode === "link") return linkValue;
    if (searchMode === "category") return categoryValue;
    if (searchMode === "pl_brand") return plBrandValue;
    return "";
  };

  const handleSearch = () => {
    const value = getSearchValue();
    if (!value || String(value).trim() === "") return;
    onSearch(searchMode, value);
  };

  const renderTabs = () => (
    <div className={cn("flex flex-wrap p-1 bg-white/5 disabled border border-white/10", isLarge ? "justify-center rounded-2xl w-fit mx-auto gap-1 mb-6 backdrop-blur-md" : "gap-1 rounded-xl mb-4")}>
      {(["keyword", "link", "category", "pl_brand"] as CoupangSearchMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onSwitchSearchMode(m)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
            isLarge && "px-5 py-2.5 rounded-xl",
            searchMode === m
              ? isLarge ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-orange-600 text-white shadow"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          {SEARCH_MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {isLarge && renderTabs()}
      
      <GlassCard className={isLarge ? "p-8" : "p-6"}>
        <div className={isLarge ? "space-y-6" : "space-y-4"}>
          {isLarge && (
            <div className="flex items-center gap-3 mb-2">
              {searchMode === "keyword" && <Search className="w-5 h-5 text-blue-400" />}
              {searchMode === "link" && <LinkIcon className="w-5 h-5 text-emerald-400" />}
              {(searchMode === "category" || searchMode === "pl_brand") && <Layers className="w-5 h-5 text-purple-400" />}
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                {searchMode.replace('_', ' ')} Search
              </h2>
            </div>
          )}

          {!isLarge && renderTabs()}

          <div className={cn(
            isLarge ? "" : (searchMode === "link" ? "space-y-2" : "flex gap-2")
          )}>
            {searchMode === "keyword" && (
              <input
                type="text"
                value={productSearchTerm}
                onChange={(e) => onSetProductSearchTerm(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" && productSearchTerm.trim()) ? handleSearch() : undefined}
                placeholder={isLarge ? "예: 로봇청소기, 에어프라이어, 냉장고..." : "쿠팡 검색 키워드"}
                className={cn(
                  "w-full bg-background/50 border border-border text-foreground focus:outline-none focus:ring-2",
                  isLarge ? "h-14 rounded-2xl px-6 text-white placeholder-slate-500 focus:ring-blue-500/50" : "rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 flex-1"
                )}
              />
            )}

            {searchMode === "link" && (
              <textarea
                value={linkValue}
                onChange={(e) => onSetLinkValue(e.target.value)}
                placeholder="쿠팡 상품 URL을 입력하세요 (여러 줄 가능)"
                className={cn(
                  "w-full bg-background/50 border border-border text-foreground focus:outline-none focus:ring-2 resize-none",
                  isLarge ? "h-32 rounded-2xl p-4 text-white placeholder-slate-500 focus:ring-blue-500/50" : "h-24 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500"
                )}
              />
            )}

            {searchMode === "category" && (
              <div className="relative flex-1">
                <select
                  value={categoryValue}
                  onChange={(e) => onSetCategoryValue(e.target.value)}
                  className={cn(
                    "w-full bg-background/50 border border-border text-foreground focus:outline-none focus:ring-2 appearance-none cursor-pointer",
                    isLarge ? "h-14 rounded-2xl px-6 pr-12 text-white placeholder-slate-500 focus:ring-blue-500/50" : "rounded-lg px-3 py-2 pr-8 text-sm focus:ring-1 focus:ring-purple-500"
                  )}
                >
                  <option value="" disabled className={isLarge ? "text-slate-500" : ""}>카테고리를 선택하세요</option>
                  {COUPANG_CATEGORIES.map((cat: {id: string; name: string}) => (
                    <option key={cat.id} value={cat.id} className={isLarge ? "text-black" : ""}>{cat.name}</option>
                  ))}
                </select>
                <div className={cn(
                  "pointer-events-none absolute inset-y-0 right-0 flex items-center",
                  isLarge ? "px-4 text-slate-400" : "px-3 right-0 text-muted-foreground -mr-1"
                )}>
                  <ChevronDown className={isLarge ? "w-5 h-5" : "w-4 h-4"} />
                </div>
              </div>
            )}

            {searchMode === "pl_brand" && (
              <div className="relative flex-1">
                <select
                  value={plBrandValue}
                  onChange={(e) => onSetPlBrandValue(e.target.value)}
                  className={cn(
                    "w-full bg-background/50 border border-border text-foreground focus:outline-none focus:ring-2 appearance-none cursor-pointer",
                    isLarge ? "h-14 rounded-2xl px-6 pr-12 text-white placeholder-slate-500 focus:ring-blue-500/50" : "rounded-lg px-3 py-2 pr-8 text-sm focus:ring-1 focus:ring-purple-500"
                  )}
                >
                  <option value="" disabled className={isLarge ? "text-slate-500" : ""}>PL 브랜드를 선택하세요</option>
                  {COUPANG_PL_BRANDS.map((cat: {id: string; name: string}) => (
                    <option key={cat.id} value={cat.id} className={isLarge ? "text-black" : ""}>{cat.name}</option>
                  ))}
                </select>
                <div className={cn(
                  "pointer-events-none absolute inset-y-0 right-0 flex items-center",
                  isLarge ? "px-4 text-slate-400" : "px-3 right-0 text-muted-foreground -mr-1"
                )}>
                  <ChevronDown className={isLarge ? "w-5 h-5" : "w-4 h-4"} />
                </div>
              </div>
            )}

            {!isLarge && (
              <Button
                size="sm"
                onClick={handleSearch}
                disabled={isSearching || !getSearchValue()}
                className={searchMode === "link" ? "w-full" : undefined}
              >
                {searchMode === "link" ? (
                  <><LinkIcon className="w-4 h-4 mr-1" />딥링크 변환</>
                ) : (
                  <>{searchMode === "keyword" ? <Search className="w-4 h-4 mr-1" /> : <Layers className="w-4 h-4 mr-1" />}검색</>
                )}
              </Button>
            )}
          </div>

          {isLarge && (
            <Button
              onClick={handleSearch}
              disabled={isSearching || !getSearchValue()}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20"
            >
              {isSearching ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />검색 중...</> : "상품 검색"}
            </Button>
          )}
        </div>
      </GlassCard>
    </>
  );
};
