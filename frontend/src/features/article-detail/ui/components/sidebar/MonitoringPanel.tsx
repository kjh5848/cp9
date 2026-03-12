import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';
import { GlassCard } from '@/shared/ui/GlassCard';
import { Activity, Clock, DollarSign, Zap, Loader2 } from 'lucide-react';

interface MonitoringPanelProps {
  monitoring: any;
  monitoringLoading: boolean;
}

export function MonitoringPanel({ monitoring, monitoringLoading }: MonitoringPanelProps) {
  return (
    <AccordionItem value="monitoring" className="border-none">
      <GlassCard className="p-0 overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5 data-[state=open]:border-b data-[state=open]:border-white/5">
          <h3 className="font-bold flex items-center gap-2 m-0 text-sm text-foreground">
            <Activity className="w-4 h-4 text-emerald-400" />생성 모니터링
          </h3>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-4">
          {monitoringLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />로딩 중...
            </div>
          ) : monitoring?.hasMonitoring ? (
            <div className="space-y-3 text-sm">
              {monitoring.monitoring.totalLatencyMs != null && monitoring.monitoring.totalLatencyMs > 0 ? (
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />총 소요시간
                  </span>
                  <span className="text-blue-400 font-bold">
                    {monitoring.monitoring.totalLatencyMs > 60000 ?
                      `${Math.floor(monitoring.monitoring.totalLatencyMs / 60000)}분 ${Math.round(monitoring.monitoring.totalLatencyMs % 60000 / 1000)}초` :
                      `${Math.round(monitoring.monitoring.totalLatencyMs / 1000)}초`}
                  </span>
                </div>
              ) : null}
              
              {monitoring.monitoring.estimatedImageCost != null && monitoring.monitoring.estimatedImageCost > 0 ? (
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="w-3.5 h-3.5" />이미지 비용
                  </span>
                  <span className="text-emerald-400 font-bold">${monitoring.monitoring.estimatedImageCost.toFixed(2)}</span>
                </div>
              ) : null}
              
              {(monitoring.monitoring.phases?.length ?? 0) > 0 ? (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Phase 상세</span>
                  {monitoring.monitoring.phases?.map((phase: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        {phase.name.
                          replace('phase1-perplexity-research', 'P1 리서치').
                          replace('phase2-llm-article', 'P2 본문 생성').
                          replace('phase3-image-generation', 'P3 이미지').
                          replace('phase4-html-transform', 'P4 HTML 변환').
                          replace('phase5-wordpress-publish', 'P5 WP 발행')}
                      </span>
                      <span className="text-slate-300">
                        {phase.latencyMs ? `${(phase.latencyMs / 1000).toFixed(1)}s` : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">텍스트 모델</span>
                  <span className="text-slate-300 font-mono text-[11px]">{monitoring.monitoring.textModel || '-'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">이미지 모델</span>
                  <span className="text-slate-300 font-mono text-[11px]">{monitoring.monitoring.imageModel || '-'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">페르소나</span>
                  <span className="text-slate-300">{monitoring.monitoring.persona || '-'}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">모니터링 데이터가 없습니다.</p>
          )}
        </AccordionContent>
      </GlassCard>
    </AccordionItem>
  );
}
