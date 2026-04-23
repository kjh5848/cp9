import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { GlassCard } from '@/shared/ui/GlassCard';
import { ArrowLeft, PenTool, X, AlertCircle, Loader2, Globe, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import { useRouter } from 'next/navigation';

interface QuickActionsPanelProps {
  pack: any;
  isEditing: boolean;
  isWpPublished: boolean;
  wpPublishing: boolean;
  actions: {
    cancelEdit: () => void;
    startEdit: () => void;
    openWpDialog: () => void;
    openRetryDialog: () => void;
  };
}

export function QuickActionsPanel({ pack, isEditing, isWpPublished, wpPublishing, actions }: QuickActionsPanelProps) {
  const router = useRouter();
  
  return (
    <AccordionItem value="quick-actions" className="border-none">
      <GlassCard className="p-0 overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5 data-[state=open]:border-b data-[state=open]:border-white/5">
          <h3 className="font-bold flex items-center gap-2 m-0 text-sm text-foreground">
            <PenTool className="w-4 h-4 text-blue-400" />Quick Actions
          </h3>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-4">
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl hover:bg-white/5 border-white/10" onClick={() => router.push('/research')}>
              <ArrowLeft className="w-4 h-4" />목록으로
            </Button>
            
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start gap-3 rounded-xl border-white/10',
                isEditing ?
                'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'hover:bg-white/5'
              )}
              onClick={isEditing ? actions.cancelEdit : actions.startEdit}
              disabled={!pack.content || pack.status === 'PROCESSING'}>
              {isEditing ? (
                <><X className="w-4 h-4" />편집 취소</>
              ) : (
                <><PenTool className="w-4 h-4" />글 수정하기</>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl hover:bg-white/5 border-white/10"
              onClick={actions.openRetryDialog}
              disabled={pack.status === 'PROCESSING'}>
              <RefreshCw className="w-4 h-4" />다시 글 쓰기
            </Button>

            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl hover:bg-white/5 border-white/10 text-red-400 hover:text-red-300" onClick={() => toast('준비 중인 기능입니다.')}>
              <AlertCircle className="w-4 h-4" />데이터 초기화
            </Button>
            
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start gap-3 rounded-xl border-white/10',
                isWpPublished ?
                'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300' :
                'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300'
              )}
              onClick={actions.openWpDialog}
              disabled={wpPublishing || !pack.content || pack.status === 'PROCESSING'}>
              
              {wpPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              {wpPublishing ? 'WP 발행 중...' : isWpPublished ? 'WP 재발행' : 'WordPress 발행'}
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Keywords</h4>
            <div className="flex flex-wrap gap-1.5">
              {pack.keywords?.map((k: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-white/5 text-slate-400 border-none font-normal text-[10px] hover:bg-white/10 transition-colors">
                  #{k}
                </Badge>
              ))}
            </div>
          </div>
        </AccordionContent>
      </GlassCard>
    </AccordionItem>
  );
}
