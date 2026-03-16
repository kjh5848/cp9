"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ShoppingCart, Trash2, ChevronRight, CheckSquare, Square } from "lucide-react";
import { useKeywordLabStore } from "@/entities/keyword-extraction/model/useKeywordLabStore";
import { cn } from "@/shared/lib/utils";
import { SendToModal } from "./SendToModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CartViewerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartViewerModal = ({ isOpen, onOpenChange }: CartViewerModalProps) => {
  const { cartKeywords, setCartKeywords, setExportPayload } = useKeywordLabStore();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const router = useRouter();

  // 선택 토글
  const toggleSelection = (keyword: string) => {
    if (selectedKeys.includes(keyword)) {
      setSelectedKeys(selectedKeys.filter(k => k !== keyword));
    } else {
      setSelectedKeys([...selectedKeys, keyword]);
    }
  };

  // 장바구니에서 제거
  const handleRemove = (keyword: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCartKeywords(cartKeywords.filter(k => k.keyword !== keyword));
    setSelectedKeys(selectedKeys.filter(k => k !== keyword));
    toast.success("장바구니에서 제거되었습니다.");
  };

  const selectedKeywordsObj = cartKeywords.filter(k => selectedKeys.includes(k.keyword));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] bg-slate-900 border-slate-800 text-white max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0 flex flex-row items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                장바구니 ({cartKeywords.length})
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                담아둔 키워드를 확인하고 관리하거나 곧바로 내보낼 수 있습니다.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 min-h-[300px]">
            {cartKeywords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                <p>장바구니가 비어 있습니다.</p>
                <p className="text-sm cursor-pointer hover:text-slate-400" onClick={() => onOpenChange(false)}>
                  키워드 발굴소에서 키워드를 장바구니에 담아주세요.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        if (selectedKeys.length === cartKeywords.length) {
                          setSelectedKeys([]);
                        } else {
                          setSelectedKeys(cartKeywords.map(k => k.keyword));
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {selectedKeys.length === cartKeywords.length && cartKeywords.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      전체 선택
                    </button>
                    {selectedKeys.length > 0 && (
                      <button 
                        onClick={() => {
                          setCartKeywords(cartKeywords.filter(k => !selectedKeys.includes(k.keyword)));
                          setSelectedKeys([]);
                          toast.success(`${selectedKeys.length}개 항목이 삭제되었습니다.`);
                        }}
                        className="text-sm text-red-400 hover:text-red-300 ml-4 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        선택 삭제
                      </button>
                    )}
                  </div>
                </div>

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
                      <button 
                        onClick={(e) => handleRemove(item.keyword, e)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="장바구니에서 제거"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 pt-4 flex items-center justify-between border-t border-white/10">
            <span className="text-sm text-slate-400">
              {selectedKeys.length > 0 ? (
                <span className="text-emerald-400">{selectedKeys.length}개 선택됨</span>
              ) : (
                "키워드를 선택해 목적지로 내보낼 수 있습니다."
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-slate-300 border-white/10" onClick={() => onOpenChange(false)}>
                닫기
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-500 text-white" 
                onClick={() => setIsSendModalOpen(true)}
                disabled={selectedKeys.length === 0}
              >
                선택 항목 내보내기 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 장바구니 전용 내보내기 모달 연동 */}
      <SendToModal 
        isOpen={isSendModalOpen}
        onOpenChange={setIsSendModalOpen}
        selectedKeywordsObj={selectedKeywordsObj}
        onConfirm={(destination) => {
          if (destination === 'keyword-writing' && selectedKeywordsObj.length > 1) {
            toast.error("키워드 글쓰기는 1개의 키워드만 선택 가능합니다.");
            return;
          }
          setExportPayload({
            destination,
            keywords: selectedKeywordsObj
          });
          onOpenChange(false); // Close cart viewer too
          if (destination === 'keyword-writing') {
            router.push(`/keyword`);
          } else {
            router.push(`/autopilot`);
          }
        }}
      />
    </>
  );
};
