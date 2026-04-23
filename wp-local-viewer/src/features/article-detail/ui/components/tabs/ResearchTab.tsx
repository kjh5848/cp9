import React from 'react';
import { TabsContent } from '@/shared/ui/tabs';
import { Search } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResearchTabProps {
  pack: any;
}

export function ResearchTab({ pack }: ResearchTabProps) {
  return (
    <TabsContent value="research" className="mt-0">
      <GlassCard className="p-8 md:p-12 border-border/40 min-h-[500px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Search className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold">Perplexity AI 리서치 원문</h2>
        </div>
        <div className="prose-tistory text-slate-400">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {pack.researchRaw || '수집된 리서치 데이터가 없습니다.'}
          </ReactMarkdown>
        </div>
      </GlassCard>
    </TabsContent>
  );
}
