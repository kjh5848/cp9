import { useState, useCallback } from "react";
import { ResearchItem, ResearchPack, WriteRequest, WriteResponse } from "@/entities/research/model/types";
import { toast } from "react-hot-toast";

interface UseResearchViewModelReturn {
  researchList: ResearchItem[];
  loading: boolean;
  error: string | null;
  fetchResearch: (projectId: string) => Promise<void>;
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

  const fetchResearch = useCallback(async (projectId: string) => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/research?projectId=${projectId}`);
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
    try {
      const response = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`SEO 글 생성 작업이 시작되었습니다. (${result.data?.written || 0}개 진행 중)`);
        return result;
      } else {
        toast.error(`SEO 글 생성 실패: ${result.error}`);
        return result;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Generation error";
      toast.error(`SEO 생성 오류: ${errorMsg}`);
      return null;
    }
  }, []);

  return {
    researchList,
    loading,
    error,
    fetchResearch,
    updateResearch,
    generateSEO,
  };
};
