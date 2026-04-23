"use client";

import React from "react";
import { ResearchItem } from "../model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { 
  Clock,
  ChevronRight,
  ImageIcon,
  FileText,
  PenTool,
  RefreshCw
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useRouter } from "next/navigation";

interface ResearchCardProps {
  research: ResearchItem;
  hasDraft?: boolean;
  selected?: boolean;
  onSelect?: (itemId: string, selected: boolean) => void;
  onEditClick?: (itemId: string) => void;
  onGenerateSEO?: (itemId: string) => void;
  onScheduleClick?: (itemId: string) => void;
  className?: string;
}

/**
 * [Entities Layer]
 * 리서치 데이터를 슬림한 리스트 스타일로 보여주는 컴포넌트입니다.
 */
export const ResearchCard = ({ 
  research, 
  selected,
  onSelect,
  onEditClick, 
  onGenerateSEO,
  className 
}: ResearchCardProps) => {
  const router = useRouter();
  const { pack, itemId, updatedAt } = research;

  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭이나 체크박스 클릭 시 상세 이동 방지
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input[type="checkbox"]')) return;
    // projectId를 쿼리파라미터로 전달하여 동일 itemId의 다른 프로젝트 글 구분
    router.push(`/research/${itemId}?projectId=${research.projectId}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "group relative flex items-center gap-4 p-4 bg-card/50 backdrop-blur-sm border rounded-xl transition-all duration-300 hover:border-blue-500/50 hover:bg-muted/30 cursor-pointer shadow-sm",
        selected ? "border-blue-500/50 bg-blue-500/5" : "border-border",
        className
      )}
    >
      {/* 체크박스 (onSelect가 있을 때만 표시) */}
      {onSelect && (
        <div className="flex-shrink-0">
          <input 
            type="checkbox" 
            checked={!!selected}
            onChange={(e) => onSelect(itemId, e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      )}

      {/* 1. 썸네일 (더 작게) */}
      <div className="w-20 h-20 shrink-0 bg-muted rounded-lg border border-border overflow-hidden relative shadow-inner">
        {pack.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={pack.thumbnailUrl} 
            alt={pack.title || "상품 이미지"} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* 2. 정보 영역 (가로형) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="outline" className="text-[9px] h-4 border-blue-500/30 text-blue-400 bg-blue-500/5 py-0">
            {research.projectId || "General"}
          </Badge>
          {/* 페르소나 배지 */}
          {pack.persona && (
            <Badge variant="outline" className={`text-[9px] h-4 py-0 ${
              pack.persona === 'IT' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' :
              pack.persona === 'BEAUTY' ? 'border-pink-500/30 text-pink-400 bg-pink-500/5' :
              pack.persona === 'LIVING' ? 'border-green-500/30 text-green-400 bg-green-500/5' :
              pack.persona === 'HUNTER' ? 'border-orange-500/30 text-orange-400 bg-orange-500/5' :
              'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
            }`}>
              {pack.persona === 'IT' ? '💻 IT' :
               pack.persona === 'BEAUTY' ? '✨ 뷰티' :
               pack.persona === 'LIVING' ? '🏠 리빙' :
               pack.persona === 'HUNTER' ? '🔥 헌터' :
               '⭐ 큐레이터'}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {new Date(updatedAt).toLocaleDateString("ko-KR")}
          </div>
          {pack.content && (
            <Badge variant="outline" className="text-[9px] h-4 border-emerald-500/30 text-emerald-400 bg-emerald-500/5 py-0">
              작성완료
            </Badge>
          )}
        </div>
        
        <h3 className="text-base font-semibold text-foreground truncate group-hover:text-blue-400 transition-colors">
          {pack.title || itemId}
        </h3>
        
        <div className="flex items-center gap-3 mt-1">
          {pack.priceKRW && (
            <span className="text-xs font-medium text-emerald-500">
              {pack.priceKRW.toLocaleString()}원
            </span>
          )}
          {pack.content && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground line-clamp-1">
              <FileText className="w-3 h-3" />
              본문 있음
            </div>
          )}
        </div>
      </div>

      {/* 3. 액션 버튼 (호버 시 선명하게) */}
      <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
        <Button 
          size="icon" 
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-blue-500/10 hover:text-blue-400"
          onClick={() => onEditClick?.(itemId)}
          title="수정"
        >
          <PenTool className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 rounded-full hover:bg-amber-500/10 hover:text-amber-400"
          onClick={() => onGenerateSEO?.(itemId)}
          title="재생성"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
        <div className="w-8 h-8 flex items-center justify-center text-muted-foreground">
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

