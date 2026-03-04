'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog';
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
  Link2,
  RefreshCw,
  Globe,
  Copy
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import { GlassCard } from '@/shared/ui/GlassCard';

/** 재시도 시 선택 가능한 텍스트 모델 목록 */
const TEXT_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (추천)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (빠름)' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
];

/** 재시도 시 선택 가능한 이미지 모델 목록 */
/** WPCode에 넣을 CP9 전용 CSS (복사 버튼용) */
const WP_CSS_FOR_COPY = `/* CP9 Styles — WPCode에 붙여넣기 */
/* ── 본문 좌측정렬 (테마 center 오버라이드) ── */
.entry-content p,.entry-content h2,.entry-content h3,.entry-content h4,.entry-content ul,.entry-content ol,.entry-content blockquote,.entry-content figcaption{text-align:left}
.entry-content .wp-block-heading{text-align:left}
/* ── CTA 스타일 ── */
.cp9-cta{max-width:680px;margin:2em auto;padding:28px 24px;border-radius:16px;text-align:center;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif}
.cp9-cta--header{background:linear-gradient(135deg,#f8f9ff,#eef1ff);border:1px solid #d4d9f7;color:#1a1a2e}
.cp9-cta--footer{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff}
.cp9-cta--tech.cp9-cta--header{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;color:#0c4a6e}
.cp9-cta--tech.cp9-cta--footer{background:linear-gradient(135deg,#0c4a6e,#0369a1);color:#fff}
.cp9-cta__image{max-width:260px;height:auto;margin:0 auto 16px;border-radius:12px;display:block;background:#fff;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,.06);border:1px solid #eee}
.cp9-cta__image--footer{max-width:180px}
.cp9-cta__button{display:inline-block;background:#2563eb;color:#fff!important;padding:14px 36px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none!important;margin:10px 0;box-shadow:0 4px 12px rgba(37,99,235,.25)}
.cp9-cta__button:hover{background:#1d4ed8;transform:translateY(-2px);box-shadow:0 6px 20px rgba(37,99,235,.35)}
.cp9-cta__button--large{padding:18px 48px;font-size:18px}
.cp9-cta__button--tech{background:#0284c7;box-shadow:0 4px 12px rgba(2,132,199,.25)}
.cp9-cta__headline{font-size:20px;font-weight:800;margin:0 0 8px}
.cp9-cta__sub-text{font-size:14px;opacity:.85;margin:8px 0;line-height:1.6}
.cp9-cta__disclaimer{font-size:11px;opacity:.5;margin-top:14px}
.cp9-cta__social-proof{font-size:13px;opacity:.75;margin:6px 0}
.cp9-cta__urgency{color:#dc2626;font-size:13px;font-weight:600;margin:6px 0}
.cp9-cta--footer .cp9-cta__urgency{color:#fbbf24}
.cp9-cta__spec-badge,.cp9-cta__compare-badge,.cp9-cta__editor-badge,.cp9-cta__price-badge,.cp9-cta__trend-badge,.cp9-cta__living-badge,.cp9-cta__curator-badge{display:inline-block;background:rgba(37,99,235,.08);color:#2563eb;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:12px}
.cp9-cta--footer .cp9-cta__spec-badge{background:rgba(255,255,255,.15);color:#fff}
.cp9-cta__price-block{margin:12px 0}
.cp9-cta__current-price{font-size:24px;font-weight:800;color:#dc2626}
.cp9-cta--footer .cp9-cta__current-price{color:#fbbf24}
.cp9-cta__rocket-badge{display:inline-block;background:#2563eb;color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px;vertical-align:middle}
.cp9-cta__inline-price{display:block;font-size:18px;font-weight:700;color:#dc2626;margin:4px 0 8px}
.cp9-cta--mid{background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:12px;max-width:680px;margin:1.5em auto}
/* ── 상품 이미지 ── */
.cp9-product-image{text-align:center;margin:2em auto;max-width:420px}
.cp9-product-image img{max-width:100%;height:auto;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #eee}
.cp9-product-image figcaption{font-size:13px;color:#94a3b8;margin-top:8px}
/* ── 테이블 ── */
.entry-content table,.entry-content table th,.entry-content table td{border-collapse:collapse;text-align:left}
.entry-content table th{background:#f1f5f9;color:#334155;font-weight:600;padding:12px 16px;border-bottom:2px solid #e2e8f0}
.entry-content table td{padding:10px 16px;border-bottom:1px solid #f1f5f9}
`;

const IMAGE_MODELS = [
  { value: 'dall-e-3', label: 'DALL-E 3 ($0.04/장)' },
  { value: 'nano-banana', label: 'Nano Banana (무료)' },
  { value: 'none', label: '이미지 생성 안함' },
];

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
  // 재시도 다이얼로그 상태
  const [retryDialogOpen, setRetryDialogOpen] = useState(false);
  const [retryModel, setRetryModel] = useState('gpt-4o');
  const [retryImageModel, setRetryImageModel] = useState('dall-e-3');
  const [retryLoading, setRetryLoading] = useState(false);
  // WordPress 발행 상태
  const [wpPublishing, setWpPublishing] = useState(false);
  const [wpDialogOpen, setWpDialogOpen] = useState(false);
  const [wpCategories, setWpCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [wpSelectedCats, setWpSelectedCats] = useState<number[]>([]);
  const [wpCatLoading, setWpCatLoading] = useState(false);

  /** 글이 실패 상태인지 판별 (FAILED 상태, 마크다운/HTML에 '작성 실패' 포함) */
  const isArticleFailed = item?.pack?.status === 'FAILED' || item?.pack?.content?.includes('작성 실패');
  /** WP 발행 완료 여부 */
  const isWpPublished = item?.pack?.status === 'WP_PUBLISHED' || !!item?.pack?.wordpress?.postUrl;

  /** WordPress 발행 다이얼로그 열기 + 카테고리 조회 */
  const openWpDialog = async () => {
    setWpDialogOpen(true);
    setWpSelectedCats([]);
    setWpCatLoading(true);
    try {
      const res = await fetch('/api/wordpress/categories');
      const data = await res.json();
      if (data.success && data.categories) {
        // '미분류' 카테고리는 하단으로 정렬
        const sorted = (data.categories as Array<{ id: number; name: string; slug: string }>)
          .sort((a, b) => {
            if (a.slug === 'uncategorized') return 1;
            if (b.slug === 'uncategorized') return -1;
            return a.name.localeCompare(b.name);
          });
        setWpCategories(sorted);
      }
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      toast.error('카테고리 목록을 가져오지 못했습니다.');
    } finally {
      setWpCatLoading(false);
    }
  };

  /** 카테고리 체크박스 토글 */
  const toggleCategory = (catId: number) => {
    setWpSelectedCats(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  /** WordPress 발행 핸들러 (다이얼로그에서 확인 시 호출) */
  const handleWpPublish = async () => {
    if (!item || !projectId) return;
    setWpPublishing(true);
    try {
      const res = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          itemId: item.itemId,
          categoryIds: wpSelectedCats,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'WP 발행 실패');
      toast.success(`WordPress 발행 완료! 포스트 ID: ${data.postId}`);
      setWpDialogOpen(false);
      // DB 업데이트 후 UI 갱신
      await fetchItem();
    } catch (error) {
      console.error('WP publish error:', error);
      toast.error(error instanceof Error ? error.message : 'WordPress 발행에 실패했습니다.');
    } finally {
      setWpPublishing(false);
    }
  };

  /** 재시도 다이얼로그 열기 */
  const openRetryDialog = () => {
    // 이전 사용 모델이 있으면 기본값으로 설정
    const prevModel = item?.pack?.textModel;
    // 이전 모델이 목록에 있으면 다른 모델을, 없으면 gpt-4o를 기본값으로
    const defaultModel = TEXT_MODELS.find(m => m.value !== prevModel)?.value || 'gpt-4o';
    setRetryModel(defaultModel);
    setRetryDialogOpen(true);
  };

  /** 선택된 모델로 재생성 API 호출 */
  const handleRetry = async () => {
    if (!item || !projectId) return;

    setRetryLoading(true);
    try {
      const response = await fetch('/api/item-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: item.pack.title || item.itemId,
          projectId: projectId,
          itemId: item.itemId,
          productData: {
            productName: item.pack.title || '',
            productPrice: item.pack.priceKRW || 0,
            productImage: item.pack.productImage || '',
            productUrl: item.pack.productUrl || '',
            categoryName: item.pack.categoryName || '',
            isRocket: item.pack.isRocket || false,
            isFreeShipping: item.pack.isFreeShipping || false,
          },
          // 비교/큐레이션일 경우 관련 아이템 다시 전달
          items: item.pack.relatedItems?.map(ri => ({
            ...ri,
            productId: '',
            categoryName: '',
            isFreeShipping: false,
          })),
          seoConfig: {
            persona: item.pack.persona || 'IT',
            textModel: retryModel,
            imageModel: retryImageModel,
            actionType: 'NOW',
            charLimit: 2000,
            articleType: item.pack.articleType || 'single',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('재시도 요청에 실패했습니다.');
      }

      toast.success(`${TEXT_MODELS.find(m => m.value === retryModel)?.label || retryModel} 모델로 재생성을 시작합니다.`);
      setRetryDialogOpen(false);

      // PROCESSING 상태로 즉시 UI 갱신
      await fetchItem();
    } catch (error) {
      console.error('Retry error:', error);
      toast.error(error instanceof Error ? error.message : '재시도에 실패했습니다.');
    } finally {
      setRetryLoading(false);
    }
  };

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
          <Button size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-500 rounded-lg" 
            onClick={openWpDialog}
            disabled={wpPublishing || !pack.content || pack.status === 'PROCESSING'}
          >
            {wpPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                발행 중...
              </>
            ) : isWpPublished ? (
              <>
                <Globe className="w-4 h-4" />
                WP 재발행
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                WP 발행
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => {
              navigator.clipboard.writeText(WP_CSS_FOR_COPY);
              toast.success('CSS가 클립보드에 복사되었습니다!\nWPCode → Add Snippet → CSS Snippet에 붙여넣기');
            }}
          >
            <Copy className="w-3.5 h-3.5" />
            CSS 복사
          </Button>
          {/* WP 발행 결과 링크 */}
          {pack.wordpress?.postUrl && (
            <a
              href={pack.wordpress.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              발행된 글 보기
            </a>
          )}
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
                 {/* 상태별 분기: PROCESSING → 로딩, FAILED → 에러, content 있음 → 본문, 없음 → 안내 */}
                 {pack.status === 'PROCESSING' ? (
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
                     <Button variant="outline" size="sm" className="gap-2" onClick={() => fetchItem()}>
                       <Loader2 className="w-4 h-4" />
                       새로고침
                     </Button>
                   </div>
                  ) : (pack.status === 'FAILED' || pack.content?.includes('작성 실패')) ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card/30 rounded-3xl border border-red-500/20 shadow-xl">
                      <div className="p-4 bg-red-500/10 rounded-full">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                      </div>
                      <div className="text-center space-y-3">
                        <h3 className="text-xl font-bold text-foreground">글 생성에 실패했습니다</h3>
                        <p className="text-muted-foreground text-sm max-w-md">
                          {pack.error || 'AI 파이프라인 실행 중 오류가 발생했습니다.'}
                        </p>
                        {pack.textModel && (
                          <p className="text-xs text-muted-foreground">
                            사용된 모델: <code className="bg-white/10 px-1.5 py-0.5 rounded text-red-400">{pack.textModel}</code>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={openRetryDialog}
                        >
                          <RefreshCw className="w-4 h-4" />
                          모델 변경 후 재시도
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2 text-muted-foreground"
                          onClick={() => fetchItem()}
                        >
                          <Loader2 className="w-4 h-4" />
                          새로고침
                        </Button>
                      </div>
                    </div>
                 ) : pack.content ? (
                 <article className="prose-tistory bg-card/30 p-8 md:p-12 rounded-3xl border border-border/40 shadow-xl">
                    {pack.contentType === 'html' ? (
                      <div
                        className="article-html-content"
                        dangerouslySetInnerHTML={{ __html: pack.content! }}
                      />
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {pack.content!}
                      </ReactMarkdown>
                    )}
                 </article>
                 ) : (
                   <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card/30 rounded-3xl border border-border/40 shadow-xl">
                     <div className="p-4 bg-muted rounded-full">
                       <FileText className="w-10 h-10 text-muted-foreground" />
                     </div>
                     <div className="text-center space-y-2">
                       <h3 className="text-xl font-bold text-foreground">본문이 생성되지 않았습니다</h3>
                       <p className="text-muted-foreground text-sm">재생성 버튼을 눌러 글을 생성해주세요.</p>
                     </div>
                   </div>
                 )}
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
                <div className="space-y-6">
                  {/* 비교/큐레이션: 전체 아이템 목록 카드 */}
                  {pack.relatedItems && pack.relatedItems.length > 0 && (
                    <GlassCard className="p-6 space-y-4">
                      <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-white/5 pb-4">
                        <Layers className="w-5 h-5" />
                        {pack.articleType === 'compare' ? '비교 상품 목록' : '큐레이션 상품 목록'} ({pack.relatedItems.length}개)
                      </div>
                      <div className="space-y-3">
                        {pack.relatedItems.map((ri: any, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <span className="text-lg font-bold text-muted-foreground w-6 text-center shrink-0">{i + 1}</span>
                            {ri.productImage && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={ri.productImage} alt={ri.productName} className="w-14 h-14 rounded-lg object-contain bg-white/10 shrink-0 p-1" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-200 line-clamp-1">{ri.productName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-emerald-400 font-bold text-sm">{ri.productPrice?.toLocaleString()}원</span>
                                {ri.isRocket && <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">🚀 로켓</span>}
                              </div>
                            </div>
                            {ri.productUrl && (
                              <a href={ri.productUrl} target="_blank" rel="noopener sponsored" className="text-blue-400 hover:text-blue-300 shrink-0">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

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
                          {pack.categoryName && (
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                               <span className="text-muted-foreground">카테고리</span>
                               <span className="text-slate-300">{pack.categoryName}</span>
                            </div>
                          )}
                          {pack.articleType && pack.articleType !== 'single' && (
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                               <span className="text-muted-foreground">글 유형</span>
                               <span className="text-purple-400 font-medium">
                                 {pack.articleType === 'compare' ? '비교 분석' : '큐레이션'}
                               </span>
                            </div>
                          )}
                       </div>
                    </GlassCard>
                  </div>
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
                 {/* WordPress 발행 버튼 */}
                 <Button 
                   variant="outline" 
                   className={cn(
                     'w-full justify-start gap-3 rounded-xl border-white/10',
                     isWpPublished 
                       ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                       : 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300'
                   )}
                   onClick={openWpDialog}
                   disabled={wpPublishing || !pack.content || pack.status === 'PROCESSING'}
                 >
                   {wpPublishing ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     <Globe className="w-4 h-4" />
                   )}
                   {wpPublishing ? 'WP 발행 중...' : isWpPublished ? 'WP 재발행' : 'WordPress 발행'}
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
                              .replace('phase4-html-transform', 'P4 HTML 변환')
                              .replace('phase5-wordpress-publish', 'P5 WP 발행')}
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

      {/* 재시도 다이얼로그 팝업 */}
      <Dialog open={retryDialogOpen} onOpenChange={setRetryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-400" />
              글 재생성
            </DialogTitle>
            <DialogDescription>
              다른 AI 모델을 선택하여 글을 다시 생성할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 텍스트 모델 선택 드롭다운 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">텍스트 모델 선택</label>
              <select
                value={retryModel}
                onChange={(e) => setRetryModel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
              >
                {TEXT_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 이미지 모델 선택 드롭다운 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">이미지 모델 선택</label>
              <select
                value={retryImageModel}
                onChange={(e) => setRetryImageModel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
              >
                {IMAGE_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 이전 실패 정보 */}
            {item?.pack && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-1.5">
                <p className="text-xs text-red-400 font-medium">이전 실패 정보</p>
                {item.pack.textModel && (
                  <p className="text-xs text-slate-400">
                    모델: <code className="bg-white/10 px-1 py-0.5 rounded text-red-300">{item.pack.textModel}</code>
                  </p>
                )}
                {item.pack.error && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    오류: {item.pack.error}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRetryDialogOpen(false)}
              disabled={retryLoading}
              className="text-slate-400"
            >
              취소
            </Button>
            <Button
              onClick={handleRetry}
              disabled={retryLoading}
              className="gap-2 bg-blue-600 hover:bg-blue-500"
            >
              {retryLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  재생성 중...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  재시도
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WordPress 발행 다이얼로그 */}
      <Dialog open={wpDialogOpen} onOpenChange={setWpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              WordPress 발행
            </DialogTitle>
            <DialogDescription>
              카테고리를 선택하고 WordPress에 즉시 발행합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 발행 대상 글 정보 */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-200 line-clamp-1">{pack.title || '제목 없음'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {pack.personaName || '페르소나'} · {pack.articleType || 'single'}
                {isWpPublished && <span className="ml-2 text-emerald-400">✓ 기존 발행 이력 있음</span>}
              </p>
            </div>

            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">카테고리 선택</label>
              {wpCatLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  카테고리 목록을 불러오는 중...
                </div>
              ) : wpCategories.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-lg border border-slate-700 bg-slate-900/50">
                  {wpCategories.map((cat) => (
                    <label
                      key={cat.id}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                        wpSelectedCats.includes(cat.id)
                          ? 'bg-blue-500/15 border border-blue-500/30'
                          : 'hover:bg-white/5 border border-transparent'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={wpSelectedCats.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500/30 bg-slate-800"
                      />
                      <span className="text-sm text-slate-300">{cat.name}</span>
                      {cat.slug === 'uncategorized' && (
                        <span className="text-[10px] text-muted-foreground ml-auto">기본</span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2">카테고리가 없습니다.</p>
              )}
              {wpSelectedCats.length > 0 && (
                <p className="text-xs text-blue-400">{wpSelectedCats.length}개 카테고리 선택됨</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-slate-600 text-slate-300 hover:bg-slate-700 mr-auto"
              onClick={() => {
                navigator.clipboard.writeText(WP_CSS_FOR_COPY);
                toast.success('CSS가 클립보드에 복사되었습니다!\nWPCode → Add Snippet → CSS Snippet에 붙여넣기');
              }}
            >
              <Copy className="w-3.5 h-3.5" />
              WP CSS 복사
            </Button>
            <Button
              variant="ghost"
              onClick={() => setWpDialogOpen(false)}
              disabled={wpPublishing}
              className="text-slate-400"
            >
              취소
            </Button>
            <Button
              onClick={handleWpPublish}
              disabled={wpPublishing}
              className="gap-2 bg-blue-600 hover:bg-blue-500"
            >
              {wpPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  발행 중...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  {isWpPublished ? 'WP 재발행' : 'WP 발행하기'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}