import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';
import { GlassCard } from '@/shared/ui/GlassCard';
import { Activity, Search } from 'lucide-react';
import { formatInterval } from '@/shared/lib/interval';

interface AutopilotMetaPanelProps {
  pack: any;
}

export function AutopilotMetaPanel({ pack }: AutopilotMetaPanelProps) {
  if (!pack.autopilotData) return null;
  
  return (
    <AccordionItem value="autopilot-meta" className="border-none">
      <GlassCard className="p-0 overflow-hidden border-indigo-500/30 bg-indigo-500/5">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5 data-[state=open]:border-b data-[state=open]:border-white/5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm text-indigo-100">Autopilot Metadata</span>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="p-4 bg-black/20 space-y-4">
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground flex items-center gap-1"><Search className="w-3 h-3"/> 타겟 키워드</span>
            <span className="font-medium text-white">{pack.autopilotData.keyword}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">가격 기준</span>
              <span className="font-medium text-slate-300">
                {pack.autopilotData.minPrice ? `${pack.autopilotData.minPrice.toLocaleString()}원` : '0원'} ~ {pack.autopilotData.maxPrice ? `${pack.autopilotData.maxPrice.toLocaleString()}원` : '제한없음'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">로켓 전용</span>
              <span className="font-medium text-slate-300">
                {pack.autopilotData.isRocketOnly ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">쿠팡 소싱 기준</span>
              <span className="font-medium text-slate-300">
                {pack.autopilotData.sortCriteria === 'salePriceAsc' ? '가격낮은순' : 
                 pack.autopilotData.sortCriteria === 'salePriceDesc' ? '가격높은순' : 
                 pack.autopilotData.sortCriteria === 'RANK' ? '쿠팡 랭킹/인기순' : '쿠팡 랭킹/인기순'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">발행 주기</span>
              <span className="font-medium text-slate-300">
                {formatInterval(pack.autopilotData.intervalHours)}
              </span>
            </div>
          </div>
        </AccordionContent>
      </GlassCard>
    </AccordionItem>
  );
}
