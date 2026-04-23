import React from 'react';
import { TabsContent } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Edit3, Save, X, Loader2, AlertCircle, PenTool, RefreshCw, FileText } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentTabProps {
  pack: any;
  isEditing: boolean;
  editContent: string;
  savingEdit: boolean;
  actions: {
    fetchItem: () => void;
    openRetryDialog: () => void;
    cancelEdit: () => void;
    saveEdit: () => void;
    setEditContent: (v: string) => void;
  };
}

export function ContentTab({ pack, isEditing, editContent, savingEdit, actions }: ContentTabProps) {
  return (
    <TabsContent value="content" className="mt-0 focus-visible:outline-none">
      {pack.status === 'PROCESSING' ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card/30 rounded-3xl border border-border/40 shadow-xl">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <PenTool className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-foreground">AI가 글을 작성하고 있습니다</h3>
            <p className="text-muted-foreground text-sm">리서치 → 본문 작성 → 이미지 생성 → HTML 변환 순으로 진행됩니다.</p>
            <p className="text-muted-foreground text-xs">보통 1~3분 정도 소요됩니다. 잠시만 기다려주세요.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => actions.fetchItem()}>
            <Loader2 className="w-4 h-4" />새로고침
          </Button>
        </div>
      ) : pack.status === 'FAILED' || pack.content?.includes('작성 실패') ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card/30 rounded-3xl border border-red-500/20 shadow-xl">
          <div className="p-4 bg-red-500/10 rounded-full">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-foreground">글 생성에 실패했습니다</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {pack.error || 'AI 파이프라인 실행 중 오류가 발생했습니다.'}
            </p>
            {pack.textModel && (
              <p className="text-xs text-muted-foreground">
                사용된 모델: <code className="bg-white/10 px-1.5 py-0.5 rounded text-red-400">{pack.textModel}</code>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={actions.openRetryDialog}>
              <RefreshCw className="w-4 h-4" />모델 변경 후 재시도
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => actions.fetchItem()}>
              <Loader2 className="w-4 h-4" />새로고침
            </Button>
          </div>
        </div>
      ) : pack.content ? (
        isEditing ? (
          /* === 편집 모드 === */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-card/30 p-4 rounded-2xl border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-foreground">글 편집 모드</span>
                <span className="text-xs text-muted-foreground">{pack.contentType === 'html' ? '(HTML 소스)' : '(마크다운)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={actions.cancelEdit} disabled={savingEdit}>
                  <X className="w-4 h-4" />취소
                </Button>
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500" onClick={actions.saveEdit} disabled={savingEdit}>
                  {savingEdit ? <><Loader2 className="w-4 h-4 animate-spin" />저장 중...</> : <><Save className="w-4 h-4" />저장</>}
                </Button>
              </div>
            </div>
            <textarea
              className="w-full min-h-[600px] bg-background/50 border border-border rounded-2xl px-6 py-5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono leading-relaxed resize-y"
              value={editContent}
              onChange={(e) => actions.setEditContent(e.target.value)}
              placeholder="콘텐츠를 편집하세요..."
            />
          </div>
        ) : (
          /* === 미리보기 모드 === */
          <article className="prose-tistory p-8 md:p-12 rounded-3xl border border-border/40 shadow-xl bg-card">
            {pack.contentType === 'html' ? (
              <div className={cn("article-html-content themed", pack.appliedThemeId ? "custom-themed" : null)} dangerouslySetInnerHTML={{ __html: pack.content! }} />
            ) : (
              <div className="article-html-content themed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{pack.content!}</ReactMarkdown>
              </div>
            )}
          </article>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card/30 rounded-3xl border border-border/40 shadow-xl">
          <div className="p-4 bg-muted rounded-full">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-foreground">본문이 생성되지 않았습니다</h3>
            <p className="text-muted-foreground text-sm">재생성 버튼을 눌러 글을 생성해주세요.</p>
          </div>
        </div>
      )}
    </TabsContent>
  );
}
