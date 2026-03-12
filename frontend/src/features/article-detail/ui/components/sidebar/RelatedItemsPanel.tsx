import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';
import { GlassCard } from '@/shared/ui/GlassCard';
import { Link2, ExternalLink } from 'lucide-react';

interface RelatedItemsPanelProps {
  pack: any;
}

export function RelatedItemsPanel({ pack }: RelatedItemsPanelProps) {
  if (!pack.relatedItems || pack.relatedItems.length === 0) return null;

  return (
    <AccordionItem value="related" className="border-none">
      <GlassCard className="p-0 overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5 data-[state=open]:border-b data-[state=open]:border-white/5">
          <h3 className="font-bold flex items-center gap-2 m-0 text-sm text-foreground">
            <Link2 className="w-4 h-4 text-purple-400" />
            {pack.articleType === 'compare' ? '비교 상품' : '큐레이션 상품'} ({pack.relatedItems?.length})
          </h3>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-4">
          <div className="space-y-2">
            {pack.relatedItems?.map((ri: any, i: number) => (
              <a key={i} href={ri.productUrl} target="_blank" rel="noopener sponsored"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                {ri.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ri.productImage} alt={ri.productName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : null}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 line-clamp-1 group-hover:text-blue-400 transition-colors">{ri.productName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ri.productPrice?.toLocaleString()}원
                    {ri.isRocket ? <span className="ml-1 text-cyan-400">로켓</span> : null}
                  </p>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-blue-400 shrink-0" />
              </a>
            ))}
          </div>
        </AccordionContent>
      </GlassCard>
    </AccordionItem>
  );
}
