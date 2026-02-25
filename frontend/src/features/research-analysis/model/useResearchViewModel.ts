import { useState, useCallback } from "react";
import { ResearchItem, ResearchPack, WriteRequest, WriteResponse } from "@/entities/research/model/types";
import { toast } from "react-hot-toast";

interface UseResearchViewModelReturn {
  researchList: ResearchItem[];
  loading: boolean;
  error: string | null;
  fetchResearch: (projectId?: string) => Promise<void>;
  updateResearch: (projectId: string, itemId: string, pack: ResearchPack) => Promise<void>;
  generateSEO: (request: WriteRequest) => Promise<WriteResponse | null>;
}

/**
 * [Features/ResearchAnalysis Layer]
 * 리서치 데이터의 상태 관리와 비즈니스 로직(API 통신)을 담당하는 ViewModel 훅입니다.
 */
export const useResearchViewModel = (): UseResearchViewModelReturn => {
  const [researchList, setResearchList] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = useCallback(async (projectId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = projectId ? `/api/research?projectId=${projectId}` : `/api/research`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setResearchList(result.data);
      } else {
        const errorMsg = result.error || "데이터 로드 실패";
        setError(errorMsg);
        toast.error(`리서치 데이터 로드 실패: ${errorMsg}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      setError(errorMsg);
      toast.error(`네트워크 오류: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateResearch = useCallback(async (projectId: string, itemId: string, pack: ResearchPack) => {
    try {
      const response = await fetch("/api/research", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, itemId, pack }),
      });

      const result = await response.json();

      if (result.success) {
        setResearchList((prev) => 
          prev.map((item) => 
            item.itemId === itemId 
              ? { ...item, pack, updatedAt: new Date().toISOString() } 
              : item
          )
        );
        toast.success("리서치 정보가 업데이트되었습니다.");
      } else {
        toast.error(`업데이트 실패: ${result.error}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Update error";
      toast.error(`업데이트 오류: ${errorMsg}`);
    }
  }, []);

  const generateSEO = useCallback(async (request: WriteRequest): Promise<WriteResponse | null> => {
    // 글 생성 중 로딩 Toat 표시
    const loadingToastId = toast.loading('AI가 글을 작성 중입니다... (30초~2분 소요)');
    try {
      const response = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      toast.dismiss(loadingToastId);

      if (result.success) {
        toast.success(`글 생성 완료! (${result.data?.written || 0}개)`);
        // 글 생성 완료 후 목록 자동 갱신
        await fetchResearch();
        return result;
      } else {
        toast.error(`SEO 글 생성 실패: ${result.error}`);
        return result;
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      const errorMsg = err instanceof Error ? err.message : "Generation error";
      toast.error(`SEO 생성 오류: ${errorMsg}`);
      return null;
    }
  }, [fetchResearch]);

  return {
    researchList,
    loading,
    error,
    fetchResearch,
    updateResearch,
    generateSEO,
  };
};
