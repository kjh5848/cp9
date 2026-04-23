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
  ChevronDown, ChevronUp, Target } from
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
import { ContentTab } from './components/tabs/ContentTab';
import { ResearchTab } from './components/tabs/ResearchTab';
import { DataTab } from './components/tabs/DataTab';
import { QuickActionsPanel } from './components/sidebar/QuickActionsPanel';
import { GenerationInfoPanel } from './components/sidebar/GenerationInfoPanel';
import { AutopilotMetaPanel } from './components/sidebar/AutopilotMetaPanel';
import { ThemeSettingsPanel } from './components/sidebar/ThemeSettingsPanel';
import { RelatedItemsPanel } from './components/sidebar/RelatedItemsPanel';
import { MonitoringPanel } from './components/sidebar/MonitoringPanel';
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
            <ContentTab 
              pack={pack} 
              isEditing={isEditing} 
              editContent={editContent} 
              savingEdit={savingEdit} 
              actions={actions}
            />

            {/* 리서치 원문 탭 */}
            <ResearchTab pack={pack} />

            {/* 기초 데이터 탭 */}
            <DataTab pack={pack} />
          </Tabs>
        </div>

        {/* 사이드바 (오른쪽 1칸) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide pb-10 pr-2">
            <Accordion type="multiple" defaultValue={['generation-info', 'quick-actions', 'theme', 'related', 'monitoring']} className="space-y-6">
              <QuickActionsPanel 
                pack={pack} 
                isEditing={isEditing} 
                isWpPublished={isWpPublished} 
                wpPublishing={wpPublishing} 
                actions={actions}
              />

              <GenerationInfoPanel pack={pack} />
              
              <AutopilotMetaPanel pack={pack} />

              <ThemeSettingsPanel 
                pack={pack} 
                themes={themes} 
                previewThemeId={previewThemeId} 
                themesLoading={themesLoading} 
                applyingTheme={applyingTheme} 
                onApplyTheme={actions.applyTheme}
              />

              <RelatedItemsPanel pack={pack} />

              <MonitoringPanel 
                monitoring={monitoring} 
                monitoringLoading={monitoringLoading} 
              />
            </Accordion>
          </div>
        </div>
      </div>

      {/* 다이얼로그들 */}
      <RetryDialog vm={vm} />
      <WpPublishDialog vm={vm} />
    </div>);

}