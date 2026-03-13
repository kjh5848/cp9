import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useResearchViewModel } from "@/features/research-analysis/model/useResearchViewModel";
import { useAutopilotViewModel } from "@/features/autopilot/model/useAutopilotViewModel";

export function useScheduleManagementViewModel() {
  const { researchList, loading: researchLoading, error: researchError, fetchResearch } = useResearchViewModel();
  const { queue: autopilotQueue, isLoading: autopilotLoading, fetchQueue: fetchAutopilotQueue, deleteFromQueue, bulkDeleteFromQueue, rescheduleQueue } = useAutopilotViewModel();

  const loading = researchLoading || autopilotLoading;
  const error = researchError;

  useEffect(() => {
    fetchResearch();
    fetchAutopilotQueue();
  }, [fetchResearch, fetchAutopilotQueue]);

  // DB에서 가져온 데이터로 목록 분리
  const manualScheduled = researchList.filter(item => item.pack.status === 'SCHEDULED').map(item => ({
    id: `${item.projectId}_${item.itemId}`,
    title: item.pack.title || '제목 없음',
    persona: item.pack.seoConfig?.persona || 'IT',
    date: item.pack.scheduledAt || item.updatedAt,
    status: 'PENDING',
    isAutopilot: false,
    category: item.pack.categoryName || '카테고리 미지정',
    rawItem: item as any
  }));

  const autoScheduled = autopilotQueue.filter(item => ['PENDING', 'PROCESSING', 'FAILED'].includes(item.status)).map((item: any) => ({
    id: `auto_${item.id}`,
    title: item.keyword, // "[Autopilot]" prefix 제거 (배지로 대체 예정)
    persona: item.persona?.name || '기본 페르소나',
    date: item.nextRunAt || item.createdAt,
    status: item.status === 'FAILED' ? 'FAILED' : 'PENDING',
    isAutopilot: true,
    category: '오토파일럿 대기중',
    trafficKeyword: item.trafficKeyword || '',
    coupangSearchTerm: item.coupangSearchTerm || '',
    rawItem: item as any
  }));

  const scheduledItems = [...manualScheduled, ...autoScheduled].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const manualCompleted = researchList.filter(item => item.pack.status === 'PUBLISHED' || item.pack.content).map(item => ({
    id: `${item.projectId}_${item.itemId}`,
    title: item.pack.title || '제목 없음',
    persona: item.pack.seoConfig?.persona || 'IT',
    date: item.pack.scheduledAt || item.updatedAt,
    status: 'COMPLETED',
    isAutopilot: false,
    category: item.pack.categoryName || '카테고리 미지정',
    content: item.pack.content || ''
  }));

  const autoCompleted = autopilotQueue.filter(item => item.status === 'COMPLETED' || item.status === 'EXPIRED').map((item: any) => ({
    id: `auto_${item.id}`,
    title: item.keyword, // "[Autopilot]" prefix 제거
    persona: item.persona?.name || '기본 페르소나',
    date: item.nextRunAt || item.createdAt,
    status: item.status === 'EXPIRED' ? 'EXPIRED' : 'COMPLETED',
    isAutopilot: true,
    category: '오토파일럿 (완료)',
    trafficKeyword: item.trafficKeyword || '',
    coupangSearchTerm: item.coupangSearchTerm || '',
    resultUrl: item.resultUrl === 'undefined' ? null : item.resultUrl,
    content: (item.resultUrl && item.resultUrl !== 'undefined') ? '' : '스케줄에 등록된 아이템입니다.'
  }));

  const completedItems = [...manualCompleted, ...autoCompleted].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 상태 관리
  const [previewItem, setPreviewItem] = useState<{ isOpen: boolean; title: string; markdown: string }>({
    isOpen: false,
    title: "",
    markdown: "",
  });

  const [autopilotModal, setAutopilotModal] = useState<{ isOpen: boolean; item: any }>({
    isOpen: false,
    item: null,
  });

  const [showAutopilotOnly, setShowAutopilotOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'>('ALL');
  const [personaFilter, setPersonaFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const allCategories = Array.from(new Set([...scheduledItems, ...completedItems].map(i => i.category))).filter(Boolean) as string[];

  const applyFilters = (items: any[]) => {
    return items.filter(i => {
      if (showAutopilotOnly && !i.isAutopilot) return false;
      if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
      if (personaFilter !== 'ALL') {
        if (typeof i.persona === 'string' && !i.persona.includes(personaFilter) && i.persona !== personaFilter) return false;
      }
      if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
      
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = i.title?.toLowerCase().includes(q);
        const matchesTraffic = i.trafficKeyword?.toLowerCase().includes(q);
        const matchesCoupang = i.coupangSearchTerm?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTraffic && !matchesCoupang) return false;
      }

      if (startDateFilter || endDateFilter) {
        const itemDate = new Date(i.date);
        
        if (startDateFilter) {
          const start = new Date(startDateFilter);
          start.setHours(0, 0, 0, 0);
          if (itemDate < start) return false;
        }
        
        if (endDateFilter) {
          const end = new Date(endDateFilter);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) return false;
        }
      }
      
      return true;
    });
  };

  const displayScheduledItems = applyFilters(scheduledItems);
  const displayCompletedItems = applyFilters(completedItems);

  const [viewMode, setViewMode] = useState<'board' | 'calendar' | 'list'>('list');

  const [queueRunning, setQueueRunning] = useState(false);
  const [queueProgress, setQueueProgress] = useState({ current: 0, total: 0 });

  const overdueItems = displayScheduledItems.filter(item =>
    item.status === 'PENDING' && new Date(item.date) < new Date()
  );

  const runPublishQueue = useCallback(async () => {
    if (overdueItems.length === 0) {
      toast.error('밀린 스케줄이 없습니다.');
      return;
    }
    setQueueRunning(true);
    setQueueProgress({ current: 0, total: overdueItems.length });

    for (let i = 0; i < overdueItems.length; i++) {
      const item = overdueItems[i];
      setQueueProgress({ current: i + 1, total: overdueItems.length });
      try {
        const raw = item.rawItem;
        const res = await fetch('/api/item-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemName: raw.pack.title || '상품',
            projectId: raw.projectId,
            itemId: raw.itemId,
            productData: {
              productName: raw.pack.title,
              productPrice: raw.pack.priceKRW || 0,
              productImage: raw.pack.productImage || '',
              productUrl: raw.pack.productUrl || '',
              categoryName: raw.pack.categoryName || '',
              isRocket: raw.pack.isRocket || false,
              isFreeShipping: raw.pack.isFreeShipping || false,
            },
            seoConfig: {
              persona: raw.pack.persona || raw.pack.seoConfig?.persona || 'IT',
              toneAndManner: '전문적이면서 친근한',
              textModel: raw.pack.textModel || 'gpt-4o',
              imageModel: 'dall-e-3',
              actionType: 'NOW',
              charLimit: 2000,
              articleType: raw.pack.articleType || 'single',
            },
          }),
        });
        if (res.ok) {
          toast.success(`${i + 1}/${overdueItems.length} 발행 시작: ${item.title.slice(0, 20)}...`);
        } else {
          toast.error(`발행 실패: ${item.title.slice(0, 20)}...`);
        }
      } catch {
        toast.error(`발행 오류: ${item.title.slice(0, 20)}...`);
      }
      if (i < overdueItems.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setQueueRunning(false);
    toast.success('밀린 스케줄 실행 완료! 목록을 새로고침합니다.');
    fetchResearch();
  }, [overdueItems, fetchResearch]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const executeCancelSchedule = async (item: any) => {
    try {
      if (item.isAutopilot) {
        await deleteFromQueue(item.rawItem.id);
        toast.success('오토파일럿 큐에서 삭제되었습니다.');
        setCancelConfirmId(null);
        fetchAutopilotQueue();
      } else {
        const res = await fetch(`/api/research?projectId=${encodeURIComponent(item.rawItem.projectId)}&itemId=${encodeURIComponent(item.rawItem.itemId)}`, {
          method: 'DELETE',
        });
        const result = await res.json();
        if (result.success) {
          toast.success('스케줄이 취소되었습니다.');
          setCancelConfirmId(null);
          fetchResearch();
        } else {
          toast.error(`취소 실패: ${result.error}`);
        }
      }
    } catch {
      toast.error('스케줄 취소 중 오류가 발생했습니다.');
    }
  };

  const handleStartEdit = (id: string, currentDate: string) => {
    setEditingId(id);
    const d = new Date(currentDate);
    setEditDate(d.toISOString().split('T')[0]);
    setEditTime(d.toTimeString().slice(0, 5));
  };

  const handleSaveEdit = async (item: any) => {
    if (!editDate || !editTime) {
      toast.error('날짜와 시간을 입력해주세요.');
      return;
    }
    const newScheduledAt = new Date(`${editDate}T${editTime}:00`).toISOString();

    if (item.isAutopilot) {
      try {
        const res = await fetch('/api/autopilot/queue', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.rawItem.id, nextRunAt: newScheduledAt }),
        });
        const result = await res.json();
        if (result.success) {
          toast.success('오토파일럿 스케줄이 수정되었습니다.');
          setEditingId(null);
          fetchAutopilotQueue();
        } else {
          toast.error(`수정 실패: ${result.error}`);
        }
      } catch {
        toast.error('오토파일럿 스케줄 수정 중 오류가 발생했습니다.');
      }
    } else {
      const updatedPack = { ...item.rawItem.pack, scheduledAt: newScheduledAt };
      try {
        const res = await fetch('/api/research', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: item.rawItem.projectId, itemId: item.rawItem.itemId, pack: updatedPack }),
        });
        const result = await res.json();
        if (result.success) {
          toast.success('스케줄이 수정되었습니다.');
          setEditingId(null);
          fetchResearch();
        } else {
          toast.error(`수정 실패: ${result.error}`);
        }
      } catch {
        toast.error('스케줄 수정 중 오류가 발생했습니다.');
      }
    }
  };

  return {
    loading,
    error,
    scheduledItems,
    completedItems,
    displayScheduledItems,
    displayCompletedItems,
    overdueItems,
    allCategories,
    
    // 뷰 옵션 상태
    viewMode, setViewMode,
    previewItem, setPreviewItem,
    autopilotModal, setAutopilotModal,
    showAutopilotOnly, setShowAutopilotOnly,
    statusFilter, setStatusFilter,
    personaFilter, setPersonaFilter,
    searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter,
    startDateFilter, setStartDateFilter,
    endDateFilter, setEndDateFilter,
    queueRunning, setQueueRunning,
    queueProgress, setQueueProgress,
    
    // 편집 및 취소 상태
    editingId, setEditingId,
    editDate, setEditDate,
    editTime, setEditTime,
    cancelConfirmId, setCancelConfirmId,

    // 액션 핸들러
    fetchResearch,
    fetchAutopilotQueue,
    runPublishQueue,
    executeCancelSchedule,
    handleStartEdit,
    handleSaveEdit,
    deleteFromQueue,
    bulkDeleteFromQueue,
    rescheduleQueue
  };
}
