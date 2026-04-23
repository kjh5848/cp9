"use client";

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

  /**
   * SEO 글 생성/재생성 — /api/item-research 통합 파이프라인 호출
   * 기존 리서치 데이터에서 상품 정보를 추출하여 동일한 파이프라인으로 재실행합니다.
   */
  const generateSEO = useCallback(async (request: WriteRequest): Promise<WriteResponse | null> => {
    try {
      const itemIds = request.itemIds || [];
      let successCount = 0;

      for (const itemId of itemIds) {
        // 기존 리서치 데이터에서 상품 정보 조회
        const existing = researchList.find(
          (r) => r.itemId === itemId && r.projectId === request.projectId
        );
        const pack = existing?.pack;

        const response = await fetch("/api/item-research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: pack?.title || itemId,
            projectId: request.projectId,
            itemId,
            productData: {
              productName: pack?.title || itemId,
              productPrice: pack?.priceKRW || 0,
              productImage: pack?.productImage || '',
              productUrl: pack?.productUrl || '',
              categoryName: '',
              isRocket: pack?.isRocket || false,
              isFreeShipping: false,
            },
            seoConfig: {
              persona: request.persona,
              textModel: request.textModel,
              imageModel: request.imageModel,
              actionType: request.actionType,
              scheduledAt: request.scheduledAt,
              charLimit: request.charLimit,
              themeId: request.themeId,
              publishTargets: request.publishTargets,
            },
            customTitles: request.customTitles,
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          console.error(`리서치 재생성 실패 (상품 ID: ${itemId})`);
        }
      }

      if (successCount > 0) {
        toast.success(`글 생성이 시작되었습니다! (${successCount}개)\n완료 시 알림을 보내드립니다.`);
        return { success: true, data: { written: successCount, failed: [] } };
      } else {
        toast.error('SEO 글 생성 요청에 실패했습니다.');
        return { success: false, error: '모든 항목 생성 실패' };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Generation error";
      toast.error(`SEO 생성 오류: ${errorMsg}`);
      return null;
    }
  }, [fetchResearch, researchList]);

  return {
    researchList,
    loading,
    error,
    fetchResearch,
    updateResearch,
    generateSEO,
  };
};
