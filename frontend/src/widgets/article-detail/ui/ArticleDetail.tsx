'use client';

import React, { Suspense } from 'react';
import { useArticleDetailViewModel } from '@/features/article-detail/model/useArticleDetailViewModel';
import { ArticleDetailView } from '@/features/article-detail/ui/ArticleDetailView';
import { Loader2 } from 'lucide-react';

/**
 * [Widgets/ArticleDetail Layer]
 * 글 상세 위젯입니다.
 * ViewModel을 생성하고 ArticleDetailView에 주입합니다.
 */
function ArticleDetailInner() {
  const vm = useArticleDetailViewModel();
  return <ArticleDetailView vm={vm} />;
}

export function ArticleDetail() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-muted-foreground animate-pulse">페이지를 로드하는 중...</p>
      </div>
    }>
      <ArticleDetailInner />
    </Suspense>
  );
}
