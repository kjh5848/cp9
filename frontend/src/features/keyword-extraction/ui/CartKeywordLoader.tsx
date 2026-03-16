"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { CheckSquare, Square, ShoppingCart } from "lucide-react";
import { useKeywordLabStore } from "@/entities/keyword-extraction/model/useKeywordLabStore";
import { ExtractedKeyword } from "@/features/keyword-extraction/model/useKeywordExtraction";
import { cn } from "@/shared/lib/utils";

interface CartKeywordLoaderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (keywords: ExtractedKeyword[]) => void;
  maxSelection?: number; // 0 means unlimited
}

export const CartKeywordLoader = ({ isOpen, onOpenChange, onLoad, maxSelection = 0 }: CartKeywordLoaderProps) => {
  const { cartKeywords } = useKeywordLabStore();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const toggleSelection = (keyword: string) => {
    if (selectedKeys.includes(keyword)) {
      setSelectedKeys(selectedKeys.filter(k => k !== keyword));
    } else {
      if (maxSelection > 0 && selectedKeys.length >= maxSelection) {
        // Replace the oldest or just block. For now, max 1 replaces
        if (maxSelection === 1) {
          setSelectedKeys([keyword]);
        }
        return;
      }
      setSelectedKeys([...selectedKeys, keyword]);
    }
  };

  const handleConfirm = () => {
    const selectedObj = cartKeywords.filter(k => selectedKeys.includes(k.keyword));
    onLoad(selectedObj);
    onOpenChange(false);
    setSelectedKeys([]); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-slate-900 border-slate-800 text-white max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 p-6 pb-2 border-b border-white/10">
          <DialogTitle className="text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            장바구니에서 불러오기
          </DialogTitle>
          <DialogDescription className="text-slate-400 mt-2">
            발굴소에서 담아둔 키워드를 선택형으로 불러옵니다.
            {maxSelection > 0 && <span className="text-purple-400 ml-1">최대 {maxSelection}개 선택 가능</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 max-h-[60vh] scrollbar-hide">
          {cartKeywords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-slate-500 py-10">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
              <p>장바구니가 비어 있습니다.</p>
              <p className="text-sm">키워드 발굴소에서 키워드를 장바구니에 담아주세요.</p>
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {cartKeywords.map((item, idx) => {
                const isSelected = selectedKeys.includes(item.keyword);
                return (
                  <div 
                    key={idx}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors group",
                      isSelected ? "bg-emerald-500/10 border-emerald-500/50" : "bg-black/20 border-white/10 hover:bg-white/5"
                    )}
                    onClick={() => toggleSelection(item.keyword)}
                  >
                    <button className="text-slate-400 focus:outline-none shrink-0">
                      {isSelected ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 group-hover:text-slate-300" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-base leading-tight mb-1 truncate">{item.keyword}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-sm bg-slate-800">{item.category || '미분류'}</span>
                        <span className="text-purple-400">주제어: {item.mainKeyword || item.keyword}</span>
                        <span>볼륨: {item.estimatedVolume}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 px-6 py-4 border-t border-white/10 bg-black/10">
          <Button variant="outline" className="text-slate-300 border-white/10" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-500 text-white" 
            onClick={handleConfirm}
            disabled={selectedKeys.length === 0}
          >
            {selectedKeys.length}개 항목 반영하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
