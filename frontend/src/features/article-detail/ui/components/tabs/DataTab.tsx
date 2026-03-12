import React from 'react';
import { TabsContent } from '@/shared/ui/tabs';
import { Layers, CheckCircle2, ShoppingBag, TrendingUp, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';

interface DataTabProps {
  pack: any;
}

export function DataTab({ pack }: DataTabProps) {
  return (
    <TabsContent value="data" className="mt-0">
      <div className="space-y-6">
        {/* 비교/큐레이션 아이템 목록 */}
        {(pack.relatedItems ? pack.relatedItems.length > 0 : null) ? (
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-white/5 pb-4">
              <Layers className="w-5 h-5" />
              {pack.articleType === 'compare' ? '비교 상품 목록' : '큐레이션 상품 목록'} ({pack.relatedItems.length}개)
            </div>
            <div className="space-y-3">
              {pack.relatedItems.map((ri: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-lg font-bold text-muted-foreground w-6 text-center shrink-0">{i + 1}</span>
                  {ri.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ri.productImage} alt={ri.productName} className="w-14 h-14 rounded-lg object-contain bg-white/10 shrink-0 p-1" />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 line-clamp-1">{ri.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-emerald-400 font-bold text-sm">{ri.productPrice?.toLocaleString()}원</span>
                      {ri.isRocket ? <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">🚀 로켓</span> : null}
                    </div>
                  </div>
                  {ri.productUrl ? (
                    <a href={ri.productUrl} target="_blank" rel="noopener sponsored" className="text-blue-400 hover:text-blue-300 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </GlassCard>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 주요 특장점 */}
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-white/5 pb-4">
              <TrendingUp className="w-5 h-5" />주요 특장점 (Features)
            </div>
            <ul className="space-y-3">
              {pack.features?.map((f: string, i: number) => (
                <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{f}
                </li>
              )) || <li className="text-muted-foreground text-sm">데이터 없음</li>}
            </ul>
          </GlassCard>

          {/* 상품 요약 정보 */}
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-orange-400 font-bold border-b border-white/5 pb-4">
              <ShoppingBag className="w-5 h-5" />
              {pack.articleType === 'single' || !pack.relatedItems?.length ? '상품 요약 정보' : '대표 상품 정보'}
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="text-muted-foreground">판매 가격</span>
                <span className="text-emerald-400 font-bold text-lg">{pack.priceKRW?.toLocaleString() || '-'}원</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="text-muted-foreground">배송 서비스</span>
                <span className={pack.isRocket ? "text-blue-400 font-bold" : "text-muted-foreground"}>
                  {pack.isRocket ? "🚀 로켓배송" : "일반배송"}
                </span>
              </div>
              {pack.categoryName ? (
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-muted-foreground">카테고리</span>
                  <span className="text-slate-300">{pack.categoryName}</span>
                </div>
              ) : null}
              {(pack.articleType ? pack.articleType !== 'single' : null) ? (
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-muted-foreground">글 유형</span>
                  <span className="text-purple-400 font-medium">
                    {pack.articleType === 'compare' ? '비교 분석' : '큐레이션'}
                  </span>
                </div>
              ) : null}
            </div>
          </GlassCard>
        </div>
      </div>
    </TabsContent>
  );
}
