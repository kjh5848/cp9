"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ExtractedKeyword } from "../model/useKeywordExtraction";
import { PenTool, Layers, Sparkles } from "lucide-react";

interface SendToModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedKeywordsObj: ExtractedKeyword[];
  onConfirm: (destination: 'keyword-writing' | 'autopilot-single' | 'autopilot-category') => void;
}

export const SendToModal = ({ isOpen, onOpenChange, selectedKeywordsObj, onConfirm }: SendToModalProps) => {
  const [selectedDestination, setSelectedDestination] = useState<'keyword-writing' | 'autopilot-single' | 'autopilot-category' | null>(null);

  const handleConfirm = () => {
    if (selectedDestination) {
      onConfirm(selectedDestination);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">선택 항목 내보내기</DialogTitle>
          <DialogDescription className="text-slate-400">
            총 <span className="text-purple-400 font-bold">{selectedKeywordsObj.length}개</span>의 키워드를 어디로 보낼지 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div 
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedDestination === 'keyword-writing' 
                ? 'bg-blue-500/10 border-blue-500' 
                : 'bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20'
            } ${selectedKeywordsObj.length > 1 ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => setSelectedDestination('keyword-writing')}
          >
            <div className="flex items-center gap-3 mb-1">
              <PenTool className={`w-5 h-5 ${selectedDestination === 'keyword-writing' ? 'text-blue-400' : 'text-slate-400'}`} />
              <h4 className={`font-bold ${selectedDestination === 'keyword-writing' ? 'text-blue-400' : 'text-white'}`}>
                키워드 글쓰기
              </h4>
              {selectedKeywordsObj.length > 1 && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-auto">1개만 가능</span>
              )}
            </div>
            <p className="text-sm text-slate-400 pl-8">
              단일 키워드에 대해 SEO 최적화된 블로그 포스팅을 작성합니다.
            </p>
          </div>

          <div 
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedDestination === 'autopilot-single' 
                ? 'bg-purple-500/10 border-purple-500' 
                : 'bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20'
            }`}
            onClick={() => setSelectedDestination('autopilot-single')}
          >
            <div className="flex items-center gap-3 mb-1">
              <Sparkles className={`w-5 h-5 ${selectedDestination === 'autopilot-single' ? 'text-purple-400' : 'text-slate-400'}`} />
              <h4 className={`font-bold ${selectedDestination === 'autopilot-single' ? 'text-purple-400' : 'text-white'}`}>
                오토파일럿 (단일 큐레이션)
              </h4>
            </div>
            <p className="text-sm text-slate-400 pl-8">
              선택한 키워드들을 각각 자동 포스팅 대기열에 개별 등록합니다.
            </p>
          </div>

          <div 
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedDestination === 'autopilot-category' 
                ? 'bg-emerald-500/10 border-emerald-500' 
                : 'bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20'
            }`}
            onClick={() => setSelectedDestination('autopilot-category')}
          >
            <div className="flex items-center gap-3 mb-1">
              <Layers className={`w-5 h-5 ${selectedDestination === 'autopilot-category' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <h4 className={`font-bold ${selectedDestination === 'autopilot-category' ? 'text-emerald-400' : 'text-white'}`}>
                오토파일럿 (주제어 묶음)
              </h4>
            </div>
            <p className="text-sm text-slate-400 pl-8">
              다수의 키워드를 하나의 주제어로 묶어 대규모 상품을 통합 포스팅합니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="text-slate-300 border-white/10" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-500 text-white" 
            onClick={handleConfirm}
            disabled={!selectedDestination}
          >
            내보내기 실행
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
