import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';
import { GlassCard } from '@/shared/ui/GlassCard';
import { Target } from 'lucide-react';

interface GenerationInfoPanelProps {
  pack: any;
}

export function GenerationInfoPanel({ pack }: GenerationInfoPanelProps) {
  return (
    <AccordionItem value="generation-info" className="border-none">
      <GlassCard className="p-0 overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5 data-[state=open]:border-b data-[state=open]:border-white/5">
          <h3 className="font-bold flex items-center gap-2 m-0 text-sm text-foreground">
            <Target className="w-4 h-4 text-rose-400" />포스팅 생성 정보
          </h3>
        </AccordionTrigger>
        <AccordionContent className="p-4 bg-black/10">
          <div className="space-y-3 text-sm">
            <div className="flex flex-col gap-1 px-2 pt-1">
              <span className="text-xs text-muted-foreground font-bold">타겟 키워드</span>
              <span className="text-slate-200 font-medium">
                {pack.autopilotData?.keyword || pack.keywordMode?.keyword || pack.title || '-'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 px-2 border-t border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-bold">작성 페르소나</span>
                <span className="text-slate-300 font-medium">{pack.personaName || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-bold">글 형식</span>
                <span className="text-slate-300 font-medium">
                  {pack.articleType === 'single' ? '단일 리뷰' : pack.articleType === 'compare' ? '비교 분석' : pack.articleType === 'curation' ? '큐레이션' : '단일 리뷰'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-bold">목표 분량</span>
                <span className="text-slate-300 font-medium">
                  {pack.charLimit ? `${pack.charLimit.toLocaleString()}자 이상` : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-bold">디자인 템플릿</span>
                <span className="text-slate-300 font-medium">{pack.themeName || '기본 테마'}</span>
              </div>
            </div>
          </div>
        </AccordionContent>
      </GlassCard>
    </AccordionItem>
  );
}
