import { useState, useEffect } from 'react';
import { ResearchItem, ResearchPack, WriteRequest, WriteResponse } from '@/shared/types/research';
import { toast } from 'react-hot-toast';

interface UseResearchReturn {
  research: ResearchItem[];
  loading: boolean;
  error: string | null;
  fetchResearch: (projectId: string) => Promise<void>;
  updateResearch: (projectId: string, itemId: string, pack: ResearchPack) => Promise<void>;
  generateSEO: (request: WriteRequest) => Promise<WriteResponse | null>;
  refreshResearch: () => Promise<void>;
}

export function useResearch(): UseResearchReturn {
  const [research, setResearch] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');

  const fetchResearch = async (projectId: string) => {
    setLoading(true);
    setError(null);
    setCurrentProjectId(projectId);

    try {
      const response = await fetch(`/api/research?projectId=${projectId}`);
      const result = await response.json();

      if (result.success) {
        setResearch(result.data);
      } else {
        setError(result.error);
        toast.error(`리서치 데이터 로드 실패: ${result.error}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      toast.error(`네트워크 오류: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const updateResearch = async (projectId: string, itemId: string, pack: ResearchPack) => {
    try {
      const response = await fetch('/api/research', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          itemId,
          pack
        })
      });

      const result = await response.json();

      if (result.success) {
        // 로컬 상태 업데이트
        setResearch(prev => prev.map(item => 
          item.itemId === itemId 
            ? { ...item, pack, updatedAt: new Date().toISOString() }
            : item
        ));
        toast.success('리서치 정보가 업데이트되었습니다');
      } else {
        toast.error(`업데이트 실패: ${result.error}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`업데이트 오류: ${errorMsg}`);
    }
  };

  const generateSEO = async (request: WriteRequest): Promise<WriteResponse | null> => {
    try {
      const response = await fetch('/api/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`SEO 글 생성 완료: ${result.data.written}개 성공, ${result.data.failed.length}개 실패`);
        return result;
      } else {
        toast.error(`SEO 글 생성 실패: ${result.error}`);
        return result;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`SEO 생성 오류: ${errorMsg}`);
      return null;
    }
  };

  const refreshResearch = async () => {
    if (currentProjectId) {
      await fetchResearch(currentProjectId);
    }
  };

  return {
    research,
    loading,
    error,
    fetchResearch,
    updateResearch,
    generateSEO,
    refreshResearch
  };
}