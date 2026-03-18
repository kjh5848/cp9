'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog';
import { RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { TEXT_MODELS, IMAGE_MODELS } from '../model/constants';
import type { ArticleDetailViewModel } from '../model/useArticleDetailViewModel';

interface RetryDialogProps {
  vm: ArticleDetailViewModel;
}

/**
 * [Features/ArticleDetail Layer]
 * 글 재생성(재시도) 다이얼로그 UI 컴포넌트
 */
export function RetryDialog({ vm }: RetryDialogProps) {
  const { retryDialogOpen, retryModel, retryImageModel, retryLoading, item, actions } = vm;

  return (
    <Dialog open={retryDialogOpen} onOpenChange={actions.setRetryDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            글 재생성
          </DialogTitle>
          <DialogDescription>
            다른 AI 모델을 선택하여 글을 다시 생성할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 텍스트 모델 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">텍스트 모델 선택</label>
            <select
              value={retryModel}
              onChange={(e) => actions.setRetryModel(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            >
              {TEXT_MODELS.map((model) => (
                <option key={model.value} value={model.value}>{model.label}</option>
              ))}
            </select>
          </div>

          {/* 이미지 모델 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">이미지 모델 선택</label>
            <select
              value={retryImageModel}
              onChange={(e) => actions.setRetryImageModel(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            >
              {IMAGE_MODELS.map((model) => (
                <option key={model.value} value={model.value}>{model.label}</option>
              ))}
            </select>
          </div>

          {/* 이전 생성 정보 (실패 또는 기존) */}
          {item?.pack && (
            <div className={cn(
              "border rounded-lg p-3 space-y-1.5",
              item.pack.status === 'FAILED' || item.pack.error ? "bg-red-500/5 border-red-500/20" : "bg-slate-800/30 border-slate-700/50"
            )}>
              <p className={cn(
                "text-xs font-medium",
                item.pack.status === 'FAILED' || item.pack.error ? "text-red-400" : "text-blue-400"
              )}>
                {item.pack.status === 'FAILED' || item.pack.error ? '이전 실패 정보' : '기존 설정 정보'}
              </p>
              {item.pack.textModel && (
                <p className="text-xs text-slate-400">
                  <span className="mr-1">사용된 모델:</span>
                  <code className={cn(
                    "px-1 py-0.5 rounded",
                    item.pack.status === 'FAILED' || item.pack.error ? "bg-red-500/10 text-red-300" : "bg-blue-500/10 text-blue-300"
                  )}>
                    {item.pack.textModel}
                  </code>
                </p>
              )}
              {item.pack.error && (
                <p className="text-xs text-slate-500 line-clamp-2">오류: {item.pack.error}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => actions.setRetryDialogOpen(false)} disabled={retryLoading} className="text-slate-400">
            취소
          </Button>
          <Button onClick={actions.handleRetry} disabled={retryLoading} className="gap-2 bg-blue-600 hover:bg-blue-500">
            {retryLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />재생성 중...</>) : (<><RefreshCw className="w-4 h-4" />재시도</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
