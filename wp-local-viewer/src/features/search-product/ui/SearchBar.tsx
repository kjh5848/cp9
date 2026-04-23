"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useSearchStore } from "../model/useSearchStore";
import { cn } from "@/shared/lib/utils";

interface SearchBarProps {
  className?: string;
}

/**
 * [Features/SearchProduct Layer]
 * 사용자 입력을 받아 비즈니스 스토어(useSearchStore)의 상태를 업데이트하고,
 * (추후 확장 시) Search API 통신을 트리거하는 도메인 스마트 위젯입니다.
 */
export const SearchBar = ({ className }: SearchBarProps) => {
  const [keyword, setKeyword] = useState("");
  const { addHistory } = useSearchStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    // TODO: (추후 과제) 실제 Search API 통신 연동 및 결과를 뷰 모델로 이관
    // API 통신을 가정하여 더미 응답 시뮬레이션
    const dummyResult = [
      {
        productId: Date.now(),
        productName: `[테스트 상품] ${keyword} 검색 결과`,
        productPrice: 15000,
        productImage: "",
        productUrl: "#",
        categoryName: "테스트 카테고리",
        isRocket: true,
        isFreeShipping: true,
      }
    ];

    addHistory(keyword, dummyResult);
    setKeyword("");
    alert(`"${keyword}" 검색 결과가 스토어 히스토리에 저장되었습니다. (FSD 테스트)`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={cn(
        "relative flex items-center w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-2 shadow-lg",
        className
      )}
    >
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="어떤 상품을 검색해볼까요?"
        className="flex-1 bg-transparent border-none text-white placeholder-slate-400 focus:outline-none px-4"
      />
      <button 
        type="submit"
        className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white"
        aria-label="상품 검색"
      >
        <Search size={20} />
      </button>
    </form>
  );
};
