'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Save, Edit3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  ArrowLeft, FileText, Search, Settings, Share2, ExternalLink,
  ShoppingBag, TrendingUp, AlertCircle, CheckCircle2, Calendar,
  PenTool, Loader2, ImageIcon, Activity, DollarSign, Clock,
  Zap, Layers, Link2, RefreshCw, Globe, Copy, X, Palette,
  ChevronDown, ChevronUp } from
'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';
import { ThemeSwitcher } from '@/entities/design/ui/ThemeSwitcher';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import { GlassCard } from '@/shared/ui/GlassCard';
import { WP_CSS_FOR_COPY } from '../model/constants';
import { RetryDialog } from './RetryDialog';
import { WpPublishDialog } from './WpPublishDialog';
import type { ArticleDetailViewModel } from '../model/useArticleDetailViewModel';

interface ArticleDetailViewProps {
  vm: ArticleDetailViewModel;
}

/**
 * [Features/ArticleDetail Layer]
 * 글 상세 페이지의 전체 UI를 렌더링하는 스마트 컴포넌트입니다.
 * ViewModel에서 상태와 액션을 주입받아 표시합니다.
 */
export function ArticleDetailView({ vm }: ArticleDetailViewProps) {
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);
  const {
    item, isLoading, monitoring, monitoringLoading,
    isWpPublished, router, wpPublishing, actions,
    isEditing, editContent, savingEdit,
    themes, themesLoading, applyingTheme, previewThemeId, appliedThemeBgColor
  } = vm;

  /* ── 로딩 상태 ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-muted-foreground animate-pulse">상세 내용을 불러오는 중...</p>
      </div>);

  }

  /* ── 데이터 없음 ── */
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
      </div>);

  }

  const { pack, updatedAt } = item;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-8 space-y-8 animate-in fade-in duration-500">
      {/* 1. 상단 내비게이션 및 액션 */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/research')}
          className="flex items-center gap-2 -ml-2 text-muted-foreground hover:text-foreground">
          
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
          <Button size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
          onClick={actions.openWpDialog}
          disabled={wpPublishing || !pack.content || pack.status === 'PROCESSING'}>
            
            {wpPublishing ?
            <><Loader2 className="w-4 h-4 animate-spin" />발행 중...</> :
            isWpPublished ?
            <><Globe className="w-4 h-4" />WP 재발행</> :

            <><Globe className="w-4 h-4" />WP 발행</>
            }
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => {
            navigator.clipboard.writeText(WP_CSS_FOR_COPY);
            toast.success('CSS가 클립보드에 복사되었습니다!\nWPCode → Add Snippet → CSS Snippet에 붙여넣기');
          }}>
            
            <Copy className="w-3.5 h-3.5" />
            CSS 복사
          </Button>
          {pack.wordpress?.postUrl ?
          <a href={pack.wordpress.postUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              발행된 글 보기
            </a> : null
          }
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
          {(pack.articleType ? pack.articleType !== 'single' : null) ?
          <Badge className={cn(
            'px-3 py-1',
            pack.articleType === 'compare' ?
            'bg-purple-500/10 text-purple-400 border-purple-500/20' :
            'bg-amber-500/10 text-amber-400 border-amber-500/20'
          )}>
              <Layers className="w-3 h-3 mr-1" />
              {pack.articleType === 'compare' ? '비교 분석' : '큐레이션'}
            </Badge> : null
          }
          {pack.isRocket ?
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1">로켓배송 상품</Badge> : null
          }
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
          <span className="text-muted-foreground">AI Research &amp; Writing</span>
        </div>
      </div>

      {/* 3. 메인 레이아웃 (본문 + 사이드바) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* 본문 (왼쪽 3칸) */}
        <div className="lg:col-span-3 space-y-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border shadow-2xl bg-muted">
            {pack.thumbnailUrl ?
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pack.thumbnailUrl} alt="Cover" className="w-full h-full object-cover" /> :

            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                <ImageIcon className="w-16 h-16 mb-2" />
                <span>이미지를 불러올 수 없습니다</span>
              </div>
            }
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

            {/* 블로그 본문 탭 */}
            <TabsContent value="content" className="mt-0 focus-visible:outline-none">
              {pack.status === 'PROCESSING' ?
              <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card/30 rounded-3xl border border-border/40 shadow-xl">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <PenTool className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">AI가 글을 작성하고 있습니다</h3>
                    <p className="text-muted-foreground text-sm">리서치 → 본문 작성 → 이미지 생성 → HTML 변환 순으로 진행됩니다.</p>
                    <p className="text-muted-foreground text-xs">보통 1~3분 정도 소요됩니다. 잠시만 기다려주세요.</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => actions.fetchItem()}>
                    <Loader2 className="w-4 h-4" />새로고침
                  </Button>
                </div> :
              pack.status === 'FAILED' || pack.content?.includes('작성 실패') ?
              <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card/30 rounded-3xl border border-red-500/20 shadow-xl">
                  <div className="p-4 bg-red-500/10 rounded-full">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-bold text-foreground">글 생성에 실패했습니다</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      {pack.error || 'AI 파이프라인 실행 중 오류가 발생했습니다.'}
                    </p>
                    {pack.textModel ?
                  <p className="text-xs text-muted-foreground">
                        사용된 모델: <code className="bg-white/10 px-1.5 py-0.5 rounded text-red-400">{pack.textModel}</code>
                      </p> : null
                  }
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={actions.openRetryDialog}>
                      <RefreshCw className="w-4 h-4" />모델 변경 후 재시도
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => actions.fetchItem()}>
                      <Loader2 className="w-4 h-4" />새로고침
                    </Button>
                  </div>
                </div> :
              pack.content ?
              isEditing ? (
              /* === 편집 모드 === */
              <div className="space-y-4">
                    <div className="flex items-center justify-between bg-card/30 p-4 rounded-2xl border border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold text-foreground">글 편집 모드</span>
                        <span className="text-xs text-muted-foreground">{pack.contentType === 'html' ? '(HTML 소스)' : '(마크다운)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                      variant="ghost" size="sm"
                      className="gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={actions.cancelEdit}
                      disabled={savingEdit}>
                      
                          <X className="w-4 h-4" />취소
                        </Button>
                        <Button
                      size="sm"
                      className="gap-1.5 bg-blue-600 hover:bg-blue-500"
                      onClick={actions.saveEdit}
                      disabled={savingEdit}>
                      
                          {savingEdit ?
                      <><Loader2 className="w-4 h-4 animate-spin" />저장 중...</> :

                      <><Save className="w-4 h-4" />저장</>
                      }
                        </Button>
                      </div>
                    </div>
                    <textarea
                  className="w-full min-h-[600px] bg-background/50 border border-border rounded-2xl px-6 py-5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono leading-relaxed resize-y"
                  value={editContent}
                  onChange={(e) => actions.setEditContent(e.target.value)}
                  placeholder="콘텐츠를 편집하세요..." />
                
                  </div>) : (

              /* === 미리보기 모드 === */
              <article className="prose-tistory p-8 md:p-12 rounded-3xl border border-border/40 shadow-xl bg-card">
                    {pack.contentType === 'html' ?
                <div className={cn("article-html-content themed", pack.appliedThemeId ? "custom-themed" : null)} dangerouslySetInnerHTML={{ __html: pack.content! }} /> :

                <div className="article-html-content themed">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{pack.content!}</ReactMarkdown>
                </div>
                }
                  </article>) :


              <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card/30 rounded-3xl border border-border/40 shadow-xl">
                  <div className="p-4 bg-muted rounded-full">
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">본문이 생성되지 않았습니다</h3>
                    <p className="text-muted-foreground text-sm">재생성 버튼을 눌러 글을 생성해주세요.</p>
                  </div>
                </div>
              }
            </TabsContent>

            {/* 리서치 원문 탭 */}
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

            {/* 기초 데이터 탭 */}
            <TabsContent value="data" className="mt-0">
              <div className="space-y-6">
                {/* 비교/큐레이션 아이템 목록 */}
                {(pack.relatedItems ? pack.relatedItems.length > 0 : null) ?
                <GlassCard className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-white/5 pb-4">
                      <Layers className="w-5 h-5" />
                      {pack.articleType === 'compare' ? '비교 상품 목록' : '큐레이션 상품 목록'} ({pack.relatedItems.length}개)
                    </div>
                    <div className="space-y-3">
                      {pack.relatedItems.map((ri: any, i: number) =>
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-lg font-bold text-muted-foreground w-6 text-center shrink-0">{i + 1}</span>
                          {ri.productImage ?
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ri.productImage} alt={ri.productName} className="w-14 h-14 rounded-lg object-contain bg-white/10 shrink-0 p-1" /> : null
                      }
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 line-clamp-1">{ri.productName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-emerald-400 font-bold text-sm">{ri.productPrice?.toLocaleString()}원</span>
                              {ri.isRocket ? <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">🚀 로켓</span> : null}
                            </div>
                          </div>
                          {ri.productUrl ?
                      <a href={ri.productUrl} target="_blank" rel="noopener sponsored" className="text-blue-400 hover:text-blue-300 shrink-0">
                              <ExternalLink className="w-4 h-4" />
                            </a> : null
                      }
                        </div>
                    )}
                    </div>
                  </GlassCard> : null
                }

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 주요 특장점 */}
                  <GlassCard className="p-6 space-y-6">
                    <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-white/5 pb-4">
                      <TrendingUp className="w-5 h-5" />주요 특장점 (Features)
                    </div>
                    <ul className="space-y-3">
                      {pack.features?.map((f: string, i: number) =>
                      <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{f}
                        </li>
                      ) || <li className="text-muted-foreground text-sm">데이터 없음</li>}
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
                      {pack.categoryName ?
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                          <span className="text-muted-foreground">카테고리</span>
                          <span className="text-slate-300">{pack.categoryName}</span>
                        </div> : null
                      }
                      {(pack.articleType ? pack.articleType !== 'single' : null) ?
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                          <span className="text-muted-foreground">글 유형</span>
                          <span className="text-purple-400 font-medium">
                            {pack.articleType === 'compare' ? '비교 분석' : '큐레이션'}
                          </span>
                        </div> : null
                      }
                    </div>
                  </GlassCard>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 사이드바 (오른쪽 1칸) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide pb-10 pr-2">
            <Accordion type="multiple" defaultValue={['quick-actions', 'theme', 'related', 'monitoring']} className="space-y-6">
              {/* Quick Actions */}
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
                        
                        {isEditing ?
                        <><X className="w-4 h-4" />편집 취소</> :

                        <><PenTool className="w-4 h-4" />글 수정하기</>
                        }
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
                        {pack.keywords?.map((k: string, i: number) =>
                        <Badge key={i} variant="secondary" className="bg-white/5 text-slate-400 border-none font-normal text-[10px] hover:bg-white/10 transition-colors">
                            #{k}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </GlassCard>
              </AccordionItem>

              {/* 테마 변경 아코디언 */}
              {(pack.content ? pack.status !== 'PROCESSING' : null) ?
              <AccordionItem value="theme" className="border-none">
                  <GlassCard className="p-0 overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5 data-[state=open]:border-b data-[state=open]:border-white/5">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-sm text-foreground">디자인 테마 설정</span>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="p-4 bg-black/10">
                      <ThemeSwitcher
                      themes={themes}
                      activeThemeId={previewThemeId ?? pack.appliedThemeId}
                      onSelect={(themeId) => actions.applyTheme(themeId)}
                      loading={themesLoading}
                      applying={applyingTheme} />
                    
                    </AccordionContent>
                  </GlassCard>
                </AccordionItem> : null
              }

              {/* 관련 상품 목록 (사이드바) */}
              {(pack.relatedItems ? pack.relatedItems.length > 0 : null) ?
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
                        {pack.relatedItems?.map((ri: any, i: number) =>
                      <a key={i} href={ri.productUrl} target="_blank" rel="noopener sponsored"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                            {ri.productImage ?
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ri.productImage} alt={ri.productName} className="w-10 h-10 rounded-lg object-cover shrink-0" /> : null
                        }
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-300 line-clamp-1 group-hover:text-blue-400 transition-colors">{ri.productName}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {ri.productPrice?.toLocaleString()}원
                                {ri.isRocket ? <span className="ml-1 text-cyan-400">로켓</span> : null}
                              </p>
                            </div>
                            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-blue-400 shrink-0" />
                          </a>
                      )}
                      </div>
                    </AccordionContent>
                  </GlassCard>
                </AccordionItem> : null
              }

              {/* 모니터링 카드 */}
              <AccordionItem value="monitoring" className="border-none">
                <GlassCard className="p-0 overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5 data-[state=open]:border-b data-[state=open]:border-white/5">
                    <h3 className="font-bold flex items-center gap-2 m-0 text-sm text-foreground">
                      <Activity className="w-4 h-4 text-emerald-400" />생성 모니터링
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-4">
                    {monitoringLoading ?
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />로딩 중...
                      </div> :
                    monitoring?.hasMonitoring ?
                    <div className="space-y-3 text-sm">
                        {monitoring.monitoring.totalLatencyMs != null && monitoring.monitoring.totalLatencyMs > 0 ?
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />총 소요시간
                            </span>
                            <span className="text-blue-400 font-bold">
                              {monitoring.monitoring.totalLatencyMs > 60000 ?
                          `${Math.floor(monitoring.monitoring.totalLatencyMs / 60000)}분 ${Math.round(monitoring.monitoring.totalLatencyMs % 60000 / 1000)}초` :
                          `${Math.round(monitoring.monitoring.totalLatencyMs / 1000)}초`}
                            </span>
                          </div> : null
                      }
                        {monitoring.monitoring.estimatedImageCost != null && monitoring.monitoring.estimatedImageCost > 0 ?
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <DollarSign className="w-3.5 h-3.5" />이미지 비용
                            </span>
                            <span className="text-emerald-400 font-bold">${monitoring.monitoring.estimatedImageCost.toFixed(2)}</span>
                          </div> : null
                      }
                        {(monitoring.monitoring.phases?.length ?? 0) > 0 ?
                      <div className="space-y-2 pt-2 border-t border-white/5">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Phase 상세</span>
                            {monitoring.monitoring.phases?.map((phase: any, i: number) =>
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
                        )}
                          </div> : null
                      }
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
                      </div> :

                    <p className="text-xs text-muted-foreground">모니터링 데이터가 없습니다.</p>
                    }
                  </AccordionContent>
                </GlassCard>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* 다이얼로그들 */}
      <RetryDialog vm={vm} />
      <WpPublishDialog vm={vm} />
    </div>);

}