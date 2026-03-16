"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useKeywordLabStore } from "@/entities/keyword-extraction/model/useKeywordLabStore";
import { ShoppingCart, Trash2, CheckSquare, Square, ChevronRight, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SendToModal } from "@/features/keyword-extraction/ui/SendToModal";

export default function CartPage() {
  const { data: session } = useSession();
  const { cartKeywords, setCartKeywords, setExportPayload } = useKeywordLabStore();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredKeywords = useMemo(() => {
    if (!searchQuery) return cartKeywords;
    return cartKeywords.filter(k => 
      k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (k.category && k.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [cartKeywords, searchQuery]);

  const toggleSelection = (keyword: string) => {
    if (selectedKeys.includes(keyword)) {
      setSelectedKeys(selectedKeys.filter(k => k !== keyword));
    } else {
      setSelectedKeys([...selectedKeys, keyword]);
    }
  };

  const handleRemove = (keyword: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCartKeywords(cartKeywords.filter(k => k.keyword !== keyword));
    setSelectedKeys(selectedKeys.filter(k => k !== keyword));
    toast.success("장바구니에서 제거되었습니다.");
  };

  const handleRemoveSelected = () => {
    if (selectedKeys.length === 0) return;
    setCartKeywords(cartKeywords.filter(k => !selectedKeys.includes(k.keyword)));
    setSelectedKeys([]);
    toast.success(`${selectedKeys.length}개 항목이 삭제되었습니다.`);
  };

  const handleSelectAll = () => {
    if (selectedKeys.length === filteredKeywords.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(filteredKeywords.map(k => k.keyword));
    }
  };

  const selectedKeywordsObj = cartKeywords.filter(k => selectedKeys.includes(k.keyword));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 pb-32 pt-28">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-emerald-400" />
              키워드 장바구니
            </h1>
            <p className="text-slate-400 mt-2">
              저장해둔 키워드를 한눈에 관리하고, 글쓰기 및 오토파일럿으로 대량 전송하세요.
              총 <span className="text-emerald-400 font-bold">{cartKeywords.length}</span>개의 키워드가 있습니다.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text"
                placeholder="키워드 또는 카테고리 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <Button 
              className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 px-6" 
              onClick={() => setIsSendModalOpen(true)}
              disabled={selectedKeys.length === 0}
            >
              선택 내보내기 ({selectedKeys.length}) <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {selectedKeys.length === filteredKeywords.length && filteredKeywords.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                <span className="font-medium">전체 선택</span>
              </button>
              
              {selectedKeys.length > 0 && (
                <>
                  <div className="w-px h-4 bg-slate-700 mx-2" />
                  <button 
                    onClick={handleRemoveSelected}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1.5 font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    선택 삭제
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            {filteredKeywords.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                 <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                 <h3 className="text-xl font-semibold text-slate-300 mb-2">
                   {searchQuery ? "검색 결과가 없습니다." : "장바구니가 비어 있습니다."}
                 </h3>
                 <p className="text-sm">
                   {searchQuery ? "다른 검색어로 시도해보세요." : "키워드 발굴소에서 유망한 키워드를 담아보세요."}
                 </p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                {filteredKeywords.map((item, idx) => {
                  const isSelected = selectedKeys.includes(item.keyword);
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "flex flex-col p-4 rounded-xl border cursor-pointer transition-all group h-full",
                        isSelected 
                          ? "bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/5" 
                          : "bg-slate-950 border-white/5 hover:border-white/10 hover:bg-white-[0.02]"
                      )}
                      onClick={() => toggleSelection(item.keyword)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <button className="text-slate-400 focus:outline-none shrink-0 mt-0.5" onClick={(e) => { e.stopPropagation(); toggleSelection(item.keyword); }}>
                            {isSelected ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 group-hover:text-slate-300" />}
                          </button>
                          <div>
                            <div className="font-bold text-white text-lg leading-tight mb-1.5 line-clamp-2">{item.keyword}</div>
                            {item.category && (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-300 font-medium">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => handleRemove(item.keyword, e)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="장바구니에서 제거"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-slate-800/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">주제어</span>
                          <span className="text-xs text-purple-400 font-medium truncate" title={item.mainKeyword}>
                            {item.mainKeyword || item.keyword}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">검색량</span>
                          <span className="text-xs text-slate-300 font-medium font-mono">
                            {item.estimatedVolume?.toLocaleString() || '알 수 없음'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
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
          setIsSendModalOpen(false);
          if (destination === 'keyword-writing') {
            router.push(`/keyword`);
          } else {
            router.push(`/autopilot`);
          }
        }}
      />
    </div>
  );
}
