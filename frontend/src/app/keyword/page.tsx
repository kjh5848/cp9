import React from "react";
import { KeywordWriting } from "@/widgets/keyword-writing/ui/KeywordWriting";

/**
 * [Keyword Page]
 * 키워드 기반 SEO 글 작성 페이지입니다.
 * 유저가 키워드를 입력/추천받아 제목을 선택하고 글을 생성합니다.
 */
export default function KeywordPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 relative flex flex-col justify-center items-center z-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">키워드 글쓰기</h1>
            <p className="text-slate-400">키워드를 입력하면 AI가 최적의 제목과 SEO 포스팅을 자동으로 생성합니다.</p>
          </div>
        </header>

        <KeywordWriting />
      </div>
    </div>
  );
}
