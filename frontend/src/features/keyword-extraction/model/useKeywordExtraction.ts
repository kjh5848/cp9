import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface ExtractedKeyword {
  keyword: string;
  type: 'longtail' | 'compare' | 'problem-solving';
  estimatedVolume: '높음' | '중간' | '낮음';
  profitability: '높음' | '중간' | '낮음';
  competition: '높음' | '중간' | '낮음';
  expectedArticleType: 'single' | 'compare' | 'curation';
  reason: string;
}

export function useKeywordExtraction() {
  const router = useRouter();

  // 1. 탐색 조건 State
  const [seedKeyword, setSeedKeyword] = useState("");
  const [targetAge, setTargetAge] = useState("all"); // 20s, 30s, 40s, 50s, all
  const [targetGender, setTargetGender] = useState("all"); // m, f, all
  const [category, setCategory] = useState("tech");
  const [searchIntent, setSearchIntent] = useState("all"); // info, review, compare, all

  // 2. 결과 처리 State
  const [extractedKeywords, setExtractedKeywords] = useState<ExtractedKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

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
          targetAge,
          targetGender,
          category,
          searchIntent
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
    setSelectedKeywords(prev => 
      prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
    );
  };

  const sendToKeywordWriting = () => {
    if (selectedKeywords.length === 0) {
      toast.error("선택된 키워드가 없습니다.");
      return;
    }
    // 가장 첫 번째 키워드를 기본으로 넘기는 플로우 (향후 벌크 확장 가능)
    const primaryKw = selectedKeywords[0];
    // query string으로 넘기거나 localStorage 사용
    router.push(`/keyword?kw=${encodeURIComponent(primaryKw)}`);
  };

  return {
    state: {
      seedKeyword, targetAge, targetGender, category, searchIntent,
      extractedKeywords, isLoading, selectedKeywords
    },
    actions: {
      setSeedKeyword, setTargetAge, setTargetGender, setCategory, setSearchIntent,
      handleExtract, toggleSelection, sendToKeywordWriting
    }
  };
}
