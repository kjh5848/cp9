'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ResearchItem } from '@/entities/research/model/types';
import { 
  ArrowLeft, 
  FileText, 
  Search, 
  Settings, 
  Share2, 
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  PenTool,
  Loader2,
  ImageIcon,
  Activity,
  DollarSign,
  Clock,
  Zap,
  Layers,
  Link2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import { GlassCard } from '@/shared/ui/GlassCard';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  // 같은 itemId가 여러 프로젝트에 존재할 수 있으므로 projectId로 구분
  const projectId = searchParams.get('projectId');
  const [item, setItem] = useState<ResearchItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // 모니터링 데이터 (Langfuse trace)
  const [monitoring, setMonitoring] = useState<any>(null);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  const fetchItem = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/research`);
      if (!response.ok) throw new Error('Failed to fetch research list');
      
      const json = await response.json();
      const researchList = json.data || [];
      // projectId가 있으면 복합키로 정확하게 찾고, 없으면 itemId만으로 fallback
      const found = researchList.find((i: ResearchItem) =>
        projectId
          ? i.itemId === id && i.projectId === projectId
          : i.itemId === id
      );
      
      if (found) {
        setItem(found);
      } else {
        toast.error('해당 글을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // 모니터링 데이터 조회
  useEffect(() => {
    if (!item || !projectId) return;
    const fetchMonitoring = async () => {
      setMonitoringLoading(true);
      try {
        const res = await fetch(`/api/monitoring/trace?projectId=${projectId}&itemId=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) setMonitoring(data);
        }
      } catch (e) {
        console.warn('모니터링 데이터 조회 실패:', e);
      } finally {
        setMonitoringLoading(false);
      }
    };
    fetchMonitoring();
  }, [item, projectId, id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-muted-foreground animate-pulse">상세 내용을 불러오는 중...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center">
        <div className="p-4 bg-muted rounded-full">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">글을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground">요청하신 데이터가 삭제되었거나 이동되었을 수 있습니다.</p>
        </div>
        <Button onClick={() => router.push('/research')} variant="outline" className="rounded-full">
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const { pack, updatedAt } = item;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-8 space-y-8 animate-in fade-in duration-500">
      {/* 1. 상단 내비게이션 및 액션 */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/research')}
          className="flex items-center gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          글 목록으로
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg">
            <Share2 className="w-4 h-4" />
            공유
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg">
            <Settings className="w-4 h-4" />
            설정
          </Button>
          <Button size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-500 rounded-lg">
            <ExternalLink className="w-4 h-4" />
            블로그 발행
          </Button>
        </div>
      </div>

      {/* 2. 기사 헤더 영역 */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
            {item.projectId || 'General'}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            작성일: {new Date(updatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          {pack.articleType && pack.articleType !== 'single' && (
            <Badge className={cn(
              'px-3 py-1',
              pack.articleType === 'compare'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            )}>
              <Layers className="w-3 h-3 mr-1" />
              {pack.articleType === 'compare' ? '비교 분석' : '큐레이션'}
            </Badge>
          )}
          {pack.isRocket && (
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1">
              로켓배송 상품
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-foreground">
          {pack.title || '제목이 없습니다'}
        </h1>

        <div className="flex items-center gap-4 py-2">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center font-bold text-blue-400">
               {(pack.personaName || 'H')[0]}
             </div>
             <span className="font-medium">{pack.personaName || 'Master Curator H'}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted" />
          <span className="text-muted-foreground">AI Research & Writing</span>
        </div>
      </div>

      {/* 3. 메인 레이아웃 (본문 + 사이드바) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* 본문 (왼쪽 3칸) */}
        <div className="lg:col-span-3 space-y-8">
           <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border shadow-2xl bg-muted">
             {pack.thumbnailUrl ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={pack.thumbnailUrl} alt="Cover" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                 <ImageIcon className="w-16 h-16 mb-2" />
                 <span>이미지를 불러올 수 없습니다</span>
               </div>
             )}
           </div>

           <Tabs defaultValue="content" className="w-full">
             <div className="sticky top-20 z-10 bg-background/80 backdrop-blur-md pb-2 border-b border-border/50 mb-6">
               <TabsList className="bg-transparent gap-6 h-12 p-0">
                 <TabsTrigger value="content" className="relative h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 text-base font-bold">
                   블로그 본문
                 </TabsTrigger>
                 <TabsTrigger value="research" className="relative h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 text-base font-bold">
                   리서치 원문
                 </TabsTrigger>
                 <TabsTrigger value="data" className="relative h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 text-base font-bold">
                   기초 데이터
                 </TabsTrigger>
               </TabsList>
             </div>

              <TabsContent value="content" className="mt-0 focus-visible:outline-none">
                 <article className="prose-tistory bg-card/30 p-8 md:p-12 rounded-3xl border border-border/40 shadow-xl">
                   {pack.contentType === 'html' ? (
                     // HTML 콘텐츠: dangerouslySetInnerHTML로 렌더링 (write API에서 생성한 안전한 HTML)
                     <div
                       className="article-html-content"
                       dangerouslySetInnerHTML={{ __html: pack.content || '<p>본문이 생성되지 않았습니다.</p>' }}
                     />
                   ) : (
                     // 레거시 마크다운 콘텐츠: ReactMarkdown으로 렌더링
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {pack.content || '# 본문이 생성되지 않았습니다.\n재생성 버튼을 눌러주세요.'}
                     </ReactMarkdown>
                   )}
                 </article>
              </TabsContent>

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

             <TabsContent value="data" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <GlassCard className="p-6 space-y-6">
                      <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-white/5 pb-4">
                        <TrendingUp className="w-5 h-5" />
                        주요 특장점 (Features)
                      </div>
                      <ul className="space-y-3">
                        {pack.features?.map((f, i) => (
                          <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        )) || <li className="text-muted-foreground text-sm">데이터 없음</li>}
                      </ul>
                   </GlassCard>

                   <GlassCard className="p-6 space-y-6">
                      <div className="flex items-center gap-2 text-orange-400 font-bold border-b border-white/5 pb-4">
                        <ShoppingBag className="w-5 h-5" />
                        상품 요약 정보
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
                      </div>
                   </GlassCard>
                </div>
             </TabsContent>
           </Tabs>
        </div>

        {/* 사이드바 (오른쪽 1칸) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
           <GlassCard className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                 <Button variant="outline" className="w-full justify-start gap-3 rounded-xl hover:bg-white/5 border-white/10" onClick={() => router.push('/research')}>
                   <ArrowLeft className="w-4 h-4" />
                   목록으로
                 </Button>
                 <Button variant="outline" className="w-full justify-start gap-3 rounded-xl hover:bg-white/5 border-white/10" onClick={() => toast('준비 중인 기능입니다.')}>
                   <PenTool className="w-4 h-4" />
                   글 수정하기
                 </Button>
                 <Button variant="outline" className="w-full justify-start gap-3 rounded-xl hover:bg-white/5 border-white/10 text-red-400 hover:text-red-300" onClick={() => toast('준비 중인 기능입니다.')}>
                   <AlertCircle className="w-4 h-4" />
                   데이터 초기화
                 </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {pack.keywords?.map((k, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/5 text-slate-400 border-none font-normal text-[10px] hover:bg-white/10 transition-colors">
                      #{k}
                    </Badge>
                  ))}
                </div>
              </div>
           </GlassCard>

            {/* 비교/큐레이션 — 관련 상품 목록 */}
            {(pack.relatedItems && pack.relatedItems.length > 0) && (
              <GlassCard className="p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-purple-400" />
                  {pack.articleType === 'compare' ? '비교 상품' : '큐레이션 상품'} ({pack.relatedItems?.length})
                </h3>
                <div className="space-y-2">
                  {pack.relatedItems?.map((ri: any, i: number) => (
                    <a
                      key={i}
                      href={ri.productUrl}
                      target="_blank"
                      rel="noopener sponsored"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                      {ri.productImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ri.productImage} alt={ri.productName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-300 line-clamp-1 group-hover:text-blue-400 transition-colors">{ri.productName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ri.productPrice?.toLocaleString()}원
                          {ri.isRocket && <span className="ml-1 text-cyan-400">로켓</span>}
                        </p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-blue-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* 모니터링 카드 */}
            <GlassCard className="p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                생성 모니터링
              </h3>
              {monitoringLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  로딩 중...
                </div>
              ) : monitoring?.hasMonitoring ? (
                <div className="space-y-3 text-sm">
                  {/* 총 소요시간 */}
                  {monitoring.monitoring.totalLatencyMs != null && monitoring.monitoring.totalLatencyMs > 0 && (
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        총 소요시간
                      </span>
                      <span className="text-blue-400 font-bold">
                        {monitoring.monitoring.totalLatencyMs > 60000
                          ? `${Math.floor(monitoring.monitoring.totalLatencyMs / 60000)}분 ${Math.round((monitoring.monitoring.totalLatencyMs % 60000) / 1000)}초`
                          : `${Math.round(monitoring.monitoring.totalLatencyMs / 1000)}초`}
                      </span>
                    </div>
                  )}
                  {/* 이미지 비용 */}
                  {monitoring.monitoring.estimatedImageCost != null && monitoring.monitoring.estimatedImageCost > 0 && (
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="w-3.5 h-3.5" />
                        이미지 비용
                      </span>
                      <span className="text-emerald-400 font-bold">
                        ${monitoring.monitoring.estimatedImageCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {/* Phase별 상세 */}
                  {monitoring.monitoring.phases?.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Phase 상세</span>
                      {monitoring.monitoring.phases.map((phase: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            {phase.name
                              .replace('phase1-perplexity-research', 'P1 리서치')
                              .replace('phase2-llm-article', 'P2 본문 생성')
                              .replace('phase3-image-generation', 'P3 이미지')
                              .replace('phase4-html-transform', 'P4 HTML 변환')}
                          </span>
                          <span className="text-slate-300">
                            {phase.latencyMs ? `${(phase.latencyMs / 1000).toFixed(1)}s` : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 모델 정보 */}
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
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}