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
 * AI가 생성한 마크다운 초안(Draft) 또는 최종 결과를 
 * 티스토리 블로그 스타일(.prose-tistory)로 가독성 있게 보여주는 상세 뷰 모달입니다.
 */
export const DraftDetailModal = ({ isOpen, onClose, title, markdown }: DraftDetailModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 bg-white dark:bg-[#23272f] border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        
        {/* 헤더 영역 (고정) */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </DialogTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 본문 영역 (스크롤) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="max-w-3xl mx-auto prose-tistory">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown || "*내용이 없습니다.*"}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* 푸터 영역 (고정 기능 버튼 등 필요 시 확장 가능) */}
        <div className="flex-shrink-0 flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 text-white">
            확인
          </Button>
        </div>
        
      </DialogContent>
    </Dialog>
  );
};
