'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog';
import { Globe, Loader2, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import { WP_CSS_FOR_COPY } from '../model/constants';
import type { ArticleDetailViewModel } from '../model/useArticleDetailViewModel';

interface WpPublishDialogProps {
  vm: ArticleDetailViewModel;
}

/**
 * [Features/ArticleDetail Layer]
 * WordPress 발행 다이얼로그 UI 컴포넌트
 */
export function WpPublishDialog({ vm }: WpPublishDialogProps) {
  const { item, wpDialogOpen, wpPublishing, wpCategories, wpSelectedCats, wpCatLoading, isWpPublished, actions } = vm;
  const pack = item?.pack;

  return (
    <Dialog open={wpDialogOpen} onOpenChange={actions.setWpDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            WordPress 발행
          </DialogTitle>
          <DialogDescription>
            카테고리를 선택하고 WordPress에 즉시 발행합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 발행 대상 글 정보 */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-200 line-clamp-1">{pack?.title || '제목 없음'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {pack?.personaName || '페르소나'} · {pack?.articleType || 'single'}
              {isWpPublished && <span className="ml-2 text-emerald-400">✓ 기존 발행 이력 있음</span>}
            </p>
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">카테고리 선택</label>
            {wpCatLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                카테고리 목록을 불러오는 중...
              </div>
            ) : wpCategories.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-lg border border-slate-700 bg-slate-900/50">
                {wpCategories.map((cat) => (
                  <label
                    key={cat.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                      wpSelectedCats.includes(cat.id)
                        ? 'bg-blue-500/15 border border-blue-500/30'
                        : 'hover:bg-white/5 border border-transparent'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={wpSelectedCats.includes(cat.id)}
                      onChange={() => actions.toggleCategory(cat.id)}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500/30 bg-slate-800"
                    />
                    <span className="text-sm text-slate-300">{cat.name}</span>
                    {cat.slug === 'uncategorized' && (
                      <span className="text-[10px] text-muted-foreground ml-auto">기본</span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">카테고리가 없습니다.</p>
            )}
            {wpSelectedCats.length > 0 && (
              <p className="text-xs text-blue-400">{wpSelectedCats.length}개 카테고리 선택됨</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button
            variant="outline" size="sm"
            className="gap-1.5 text-xs border-slate-600 text-slate-300 hover:bg-slate-700 mr-auto"
            onClick={() => {
              navigator.clipboard.writeText(WP_CSS_FOR_COPY);
              toast.success('CSS가 클립보드에 복사되었습니다!\nWPCode → Add Snippet → CSS Snippet에 붙여넣기');
            }}
          >
            <Copy className="w-3.5 h-3.5" />
            WP CSS 복사
          </Button>
          <Button variant="ghost" onClick={() => actions.setWpDialogOpen(false)} disabled={wpPublishing} className="text-slate-400">
            취소
          </Button>
          <Button onClick={actions.handleWpPublish} disabled={wpPublishing} className="gap-2 bg-blue-600 hover:bg-blue-500">
            {wpPublishing ? (<><Loader2 className="w-4 h-4 animate-spin" />발행 중...</>) : (<><Globe className="w-4 h-4" />{isWpPublished ? 'WP 재발행' : 'WP 발행하기'}</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
