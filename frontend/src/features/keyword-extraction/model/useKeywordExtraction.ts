import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useKeywordLabStore } from "@/entities/keyword-extraction/model/useKeywordLabStore";

export interface ExtractedKeyword {
  keyword: string;
  mainKeyword: string; // 주제어 (단일키워드)
  category: string; // 우리 서비스 맞춤 카테고리
  type: 'longtail' | 'compare' | 'problem-solving';
  estimatedVolume: '높음' | '중간' | '낮음';
  profitability: '높음' | '중간' | '낮음';
  competition: '높음' | '중간' | '낮음';
  expectedArticleType: 'single' | 'compare' | 'curation';
  reason: string;
}

export function useKeywordExtraction() {
  const router = useRouter();

  // 1. 전역 상태 연동 (Draft)
  const {
    seedKeyword, targetCount, targetAge, targetGender, category, searchIntent, searchModel,
    extractedKeywords, selectedKeywords, isLoading, cartKeywords, exportPayload,
    setSeedKeyword, setTargetCount, setTargetAge, setTargetGender, setCategory, setSearchIntent, setSearchModel,
    setExtractedKeywords, setSelectedKeywords, setIsLoading, setCartKeywords, setExportPayload
  } = useKeywordLabStore();
  const [isStoreReady, setIsStoreReady] = useState(false);

  // Client-side hydration 처리
  useEffect(() => {
    setIsStoreReady(true);
  }, []);

  // 액션: AI 키워드 탐색
  const handleExtract = async () => {
    if (!seedKeyword.trim()) {
      toast.error("시드 단어를 입력해주세요");
      return;
    }

    setIsLoading(true);
    setExtractedKeywords([]);
    setSelectedKeywords([]);

    try {
      const res = await fetch("/api/keyword-explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedKeyword,
          targetCount,
          targetAge,
          targetGender,
          category,
          searchIntent,
          searchModel
        }),
      });

      if (!res.ok) throw new Error("분석 요청 실패");

      const data = await res.json();
      if (data.success && data.data) {
        setExtractedKeywords(data.data);
      } else {
        throw new Error(data.error || "결과를 받아오지 못했습니다.");
      }
    } catch (error: any) {
      toast.error(error.message || "에러가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (keyword: string) => {
    setSelectedKeywords(
      selectedKeywords.includes(keyword) 
        ? selectedKeywords.filter((k: string) => k !== keyword) 
        : [...selectedKeywords, keyword]
    );
  };

  const handleSendToDestination = (destination: 'keyword-writing' | 'autopilot-single' | 'autopilot-category') => {
    if (selectedKeywords.length === 0) {
      toast.error("선택된 키워드가 없습니다.");
      return;
    }

    const selectedKeywordsObj = extractedKeywords.filter(k => selectedKeywords.includes(k.keyword));

    if (destination === 'keyword-writing' && selectedKeywordsObj.length > 1) {
      toast.error("키워드 글쓰기는 1개의 키워드만 선택 가능합니다.");
      return;
    }

    setExportPayload({
      destination,
      keywords: selectedKeywordsObj
    });

    if (destination === 'keyword-writing') {
      router.push(`/keyword`);
    } else {
      router.push(`/autopilot`);
    }
  };

  return {
    state: {
      seedKeyword, targetCount, targetAge, targetGender, category, searchIntent, searchModel,
      extractedKeywords, isLoading, selectedKeywords, cartKeywords
    },
    actions: {
      setSeedKeyword, setTargetCount, setTargetAge, setTargetGender, setCategory, setSearchIntent, setSearchModel,
      handleExtract, toggleSelection, handleSendToDestination,
      toggleCartSelection: (keywordObj: ExtractedKeyword) => {
        const isAlreadyInCart = cartKeywords.some((k) => k.keyword === keywordObj.keyword);
        if (isAlreadyInCart) {
          setCartKeywords(cartKeywords.filter((k) => k.keyword !== keywordObj.keyword));
          toast.success("장바구니에서 제거되었습니다.");
        } else {
          setCartKeywords([...cartKeywords, keywordObj]);
          toast.success("장바구니에 담겼습니다.");
        }
      },
      toggleAllSelection: () => {
        if (selectedKeywords.length === extractedKeywords.length && extractedKeywords.length > 0) {
          setSelectedKeywords([]);
        } else {
          setSelectedKeywords(extractedKeywords.map(k => k.keyword));
        }
      },
      addAllToCart: () => {
        const newCartKeywords = [...cartKeywords];
        let addedCount = 0;
        extractedKeywords.forEach(extKw => {
          if (!newCartKeywords.some(cartKw => cartKw.keyword === extKw.keyword)) {
            newCartKeywords.push(extKw);
            addedCount++;
          }
        });
        if (addedCount > 0) {
          setCartKeywords(newCartKeywords);
          toast.success(`${addedCount}개 항목이 장바구니에 담겼습니다.`);
        } else if (extractedKeywords.length > 0) {
          toast.success(`이미 모든 항목이 장바구니에 있습니다.`);
        }
      }
    }
  };
}
