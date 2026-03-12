import React from "react";
import { Button } from "@/shared/ui/button";
import { Package, GitCompare, LayoutList, Loader2 } from "lucide-react";
import { CoupangProductResponse } from "@/shared/types/api";

type ArticleType = "single" | "compare" | "curation";

interface TitleSettingsStepProps {
  articleType: ArticleType;
  selectedItems: CoupangProductResponse[];
  itemCount: number;
  personaName: string;
  customTitles: Record<string, string>;
  setCustomTitles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  suggestedTitles: Record<string, string[]>;
  isGeneratingTitle: Record<string, boolean>;
  handleSuggestTitle: (key: string, itemsForPrompt: CoupangProductResponse[]) => void;
  titleModel: string;
  setTitleModel: (v: string) => void;
  titleExamples: string;
  setTitleExamples: (v: string) => void;
  titleExclusions: string;
  setTitleExclusions: (v: string) => void;
}

import { TitleFormatSettingsGroup } from "@/shared/ui/article-settings/TitleFormatSettingsGroup";

export function TitleSettingsStep({
  articleType,
  selectedItems,
  itemCount,
  personaName,
  customTitles,
  setCustomTitles,
  suggestedTitles,
  isGeneratingTitle,
  handleSuggestTitle,
  titleModel,
  setTitleModel,
  titleExamples,
  setTitleExamples,
  titleExclusions,
  setTitleExclusions,
}: TitleSettingsStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300">포스팅 제목 설정</h4>
        <div className="text-[10px] text-slate-500">
          작성자: <span className="font-semibold text-blue-400">{personaName}</span>
        </div>
      </div>

      <TitleFormatSettingsGroup
        titleModel={titleModel}
        setTitleModel={setTitleModel}
        defaultTitleModel="gpt-4o-mini"
        titleExamples={titleExamples}
        setTitleExamples={setTitleExamples}
        titleExclusions={titleExclusions}
        setTitleExclusions={setTitleExclusions}
      />

      {articleType === 'single' ? (
        <div className="space-y-4">
          {selectedItems.map((item) => {
            const key = item.productId.toString();
            const suggestions = suggestedTitles[key] || [];
            const isLoading = isGeneratingTitle[key];

            return (
              <div key={key} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-300 truncate flex-1">{item.productName}</span>
                </div>

                <div>
                  <input
                    type="text"
                    value={customTitles[key] || ''}
                    onChange={(e) => setCustomTitles(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="포스팅 제목을 입력하세요"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Button
                    onClick={() => handleSuggestTitle(key, [item])}
                    disabled={isLoading}
                    variant="secondary"
                    size="sm"
                    className="text-xs shrink-0 py-1.5 h-auto bg-slate-700/50 hover:bg-emerald-600/20 hover:text-emerald-400 border border-transparent hover:border-emerald-500/30"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> 생성 중...</>
                    ) : (
                      <>✨ AI 추천받기</>
                    )}
                  </Button>

                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {suggestions.map((title, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCustomTitles(prev => ({ ...prev, [key]: title }))}
                          className="text-[11px] text-left px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors text-slate-400"
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-4">
          <div className="flex items-center gap-2">
            {articleType === 'compare' ? <GitCompare className="w-4 h-4 text-purple-400" /> : <LayoutList className="w-4 h-4 text-orange-400" />}
            <span className="text-xs font-medium text-slate-300">
              {articleType === 'compare' ? '비교 분석 그룹' : '큐레이션 리스트'} ({itemCount}개 상품)
            </span>
          </div>

          <div>
            <input
              type="text"
              value={customTitles['main'] || ''}
              onChange={(e) => setCustomTitles(prev => ({ ...prev, ['main']: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              placeholder="포스팅 제목을 입력하세요"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleSuggestTitle('main', selectedItems)}
              disabled={isGeneratingTitle['main']}
              variant="secondary"
              size="sm"
              className="w-full text-xs py-2 h-auto bg-slate-700/50 hover:bg-blue-600/20 hover:text-blue-400 border border-transparent hover:border-blue-500/30"
            >
              {isGeneratingTitle['main'] ? (
                <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> AI가 매력적인 제목을 고민 중입니다...</>
              ) : (
                <>✨ 현재 설정(작성자, 모델) 기반 AI 제목 생생 추천받기</>
              )}
            </Button>

            {suggestedTitles['main']?.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mt-2">
                {suggestedTitles['main'].map((title, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCustomTitles(prev => ({ ...prev, ['main']: title }))}
                    className="text-xs text-left px-3 py-2.5 rounded-md bg-slate-900 border border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 hover:text-blue-300 transition-all font-medium text-slate-300"
                  >
                    {title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
