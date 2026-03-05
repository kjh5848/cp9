import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ResearchItem } from '@/entities/research/model/types';
import { TEXT_MODELS } from './constants';

/* ══════════════════════════ 타입 ══════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MonitoringData {
  hasMonitoring: boolean;
  monitoring: {
    totalLatencyMs?: number;
    estimatedImageCost?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    phases?: any[];
    textModel?: string;
    imageModel?: string;
    persona?: string;
  };
}

export interface WpCategory {
  id: number;
  name: string;
  slug: string;
}

/* ══════════════════════════ ViewModel ══════════════════════════ */

/**
 * [Features/ArticleDetail Layer]
 * 글 상세 페이지의 상태 관리와 비즈니스 로직(API 통신)을 담당하는 ViewModel 훅입니다.
 */
export function useArticleDetailViewModel() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const projectId = searchParams.get('projectId');

  // ── 글 데이터 ──
  const [item, setItem] = useState<ResearchItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── 모니터링 데이터 ──
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  // ── 재시도 다이얼로그 ──
  const [retryDialogOpen, setRetryDialogOpen] = useState(false);
  const [retryModel, setRetryModel] = useState('gpt-4o');
  const [retryImageModel, setRetryImageModel] = useState('dall-e-3');
  const [retryLoading, setRetryLoading] = useState(false);

  // ── 글 편집 ──
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // ── 테마 재적용 ──
  const [themes, setThemes] = useState<{ id: string; name: string; isDefault: boolean; config: string }[]>([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [applyingTheme, setApplyingTheme] = useState(false);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);

  // ── WordPress 발행 ──
  const [wpPublishing, setWpPublishing] = useState(false);
  const [wpDialogOpen, setWpDialogOpen] = useState(false);
  const [wpCategories, setWpCategories] = useState<WpCategory[]>([]);
  const [wpSelectedCats, setWpSelectedCats] = useState<number[]>([]);
  const [wpCatLoading, setWpCatLoading] = useState(false);

  // ── 파생 상태 ──
  const isArticleFailed = item?.pack?.status === 'FAILED' || item?.pack?.content?.includes('작성 실패');
  const isWpPublished = item?.pack?.status === 'WP_PUBLISHED' || !!item?.pack?.wordpress?.postUrl;

  // ── 데이터 조회 ──
  const fetchItem = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/research');
      if (!response.ok) throw new Error('Failed to fetch research list');
      const json = await response.json();
      const researchList = json.data || [];
      const found = researchList.find((i: ResearchItem) =>
        projectId ? i.itemId === id && i.projectId === projectId : i.itemId === id
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
  }, [id, projectId]);

  useEffect(() => { fetchItem(); }, [fetchItem]);

  // ── 모니터링 조회 ──
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

  // ── 테마 목록 조회 ──
  const fetchThemes = useCallback(async () => {
    setThemesLoading(true);
    try {
      const res = await fetch('/api/design');
      const data = await res.json();
      setThemes(data.themes || []);
    } catch (e) {
      console.warn('테마 목록 조회 실패:', e);
    } finally {
      setThemesLoading(false);
    }
  }, []);

  // 글이 로드되면 테마 목록도 조회
  useEffect(() => {
    if (item?.pack?.content) fetchThemes();
  }, [item, fetchThemes]);

  // ── 테마 재적용 ──
  const applyTheme = useCallback(async (themeId: string | null) => {
    if (!item || !projectId) return;
    setApplyingTheme(true);
    try {
      const res = await fetch('/api/design/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, itemId: item.itemId, themeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '테마 적용 실패');
      toast.success('디자인이 변경되었습니다!');
      setPreviewThemeId(themeId);
      await fetchItem();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '테마 적용에 실패했습니다.');
    } finally {
      setApplyingTheme(false);
    }
  }, [item, projectId, fetchItem]);

  // ── 글 편집 액션 ──
  const startEdit = useCallback(() => {
    if (!item?.pack?.content) return;
    setEditContent(item.pack.content);
    setIsEditing(true);
  }, [item]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent('');
  }, []);

  const saveEdit = useCallback(async () => {
    if (!item || !projectId) return;
    setSavingEdit(true);
    try {
      const response = await fetch('/api/research', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          itemId: item.itemId,
          pack: { ...item.pack, content: editContent },
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('글이 성공적으로 저장되었습니다.');
        setIsEditing(false);
        await fetchItem();
      } else {
        toast.error(`저장 실패: ${result.error}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSavingEdit(false);
    }
  }, [item, projectId, editContent, fetchItem]);

  // ── 재시도 다이얼로그 ──
  const openRetryDialog = useCallback(() => {
    const prevModel = item?.pack?.textModel;
    const defaultModel = TEXT_MODELS.find(m => m.value !== prevModel)?.value || 'gpt-4o';
    setRetryModel(defaultModel);
    setRetryDialogOpen(true);
  }, [item]);

  const handleRetry = useCallback(async () => {
    if (!item || !projectId) return;
    setRetryLoading(true);
    try {
      const response = await fetch('/api/item-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: item.pack.title || item.itemId,
          projectId,
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
          items: item.pack.relatedItems?.map(ri => ({
            ...ri, productId: '', categoryName: '', isFreeShipping: false,
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
      if (!response.ok) throw new Error('재시도 요청에 실패했습니다.');
      toast.success(`${TEXT_MODELS.find(m => m.value === retryModel)?.label || retryModel} 모델로 재생성을 시작합니다.`);
      setRetryDialogOpen(false);
      await fetchItem();
    } catch (error) {
      console.error('Retry error:', error);
      toast.error(error instanceof Error ? error.message : '재시도에 실패했습니다.');
    } finally {
      setRetryLoading(false);
    }
  }, [item, projectId, retryModel, retryImageModel, fetchItem]);

  // ── WordPress 발행 ──
  const openWpDialog = useCallback(async () => {
    setWpDialogOpen(true);
    setWpSelectedCats([]);
    setWpCatLoading(true);
    try {
      const res = await fetch('/api/wordpress/categories');
      const data = await res.json();
      if (data.success && data.categories) {
        const sorted = (data.categories as WpCategory[]).sort((a, b) => {
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
  }, []);

  const toggleCategory = useCallback((catId: number) => {
    setWpSelectedCats(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  }, []);

  const handleWpPublish = useCallback(async () => {
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
      await fetchItem();
    } catch (error) {
      console.error('WP publish error:', error);
      toast.error(error instanceof Error ? error.message : 'WordPress 발행에 실패했습니다.');
    } finally {
      setWpPublishing(false);
    }
  }, [item, projectId, wpSelectedCats, fetchItem]);

  return {
    // 상태
    item, isLoading, monitoring, monitoringLoading,
    isArticleFailed, isWpPublished,
    router, projectId,
    // 편집
    isEditing, editContent, savingEdit,
    // 재시도
    retryDialogOpen, retryModel, retryImageModel, retryLoading,
    // 테마
    themes, themesLoading, applyingTheme, previewThemeId,
    // WP 발행
    wpDialogOpen, wpPublishing, wpCategories, wpSelectedCats, wpCatLoading,
    // 액션
    actions: {
      fetchItem, openRetryDialog, handleRetry,
      setRetryDialogOpen, setRetryModel, setRetryImageModel,
      openWpDialog, handleWpPublish, toggleCategory, setWpDialogOpen,
      startEdit, cancelEdit, saveEdit, setEditContent,
      applyTheme, setPreviewThemeId, fetchThemes,
    },
  };
}

export type ArticleDetailViewModel = ReturnType<typeof useArticleDetailViewModel>;
