import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface DraftDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  markdown: string;
}

/**
 * [Features/ResearchAnalysis Layer]
 * AI가 생성한 HTML 또는 마크다운 초안(Draft)을 
 * 가독성 있게 보여주는 상세 뷰 모달입니다.
 * HTML 콘텐츠는 dangerouslySetInnerHTML로, 마크다운은 ReactMarkdown으로 렌더링합니다.
 */
export const DraftDetailModal = ({ isOpen, onClose, title, markdown }: DraftDetailModalProps) => {
  // HTML 태그가 포함된 콘텐츠인지 판별
  const isHtmlContent = markdown && /<[a-z][\s\S]*>/i.test(markdown);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 bg-white border-slate-200 rounded-xl overflow-hidden">
        
        {/* 헤더 영역 (고정) */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <DialogTitle className="text-lg font-bold text-slate-900">
              {title}
            </DialogTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full border-slate-300 text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 본문 영역 (스크롤) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <article className="max-w-3xl mx-auto prose-tistory rounded-xl p-6">
            {isHtmlContent ? (
              // HTML 콘텐츠: dangerouslySetInnerHTML로 렌더링
              <div 
                className="article-html-content themed"
                dangerouslySetInnerHTML={{ __html: markdown }} 
              />
            ) : (
              // 마크다운 콘텐츠: ReactMarkdown으로 렌더링
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown || "*내용이 없습니다.*"}
              </ReactMarkdown>
            )}
          </article>
        </div>
        
        {/* 푸터 영역 (고정 기능 버튼 등 필요 시 확장 가능) */}
        <div className="flex-shrink-0 flex justify-end px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 text-white">
            확인
          </Button>
        </div>
        
      </DialogContent>
    </Dialog>
  );
};
