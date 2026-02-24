import React from "react";
import { ResearchItem } from "../model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { 
  CalendarPlus,
  PenTool,
  Image as ImageIcon,
  CheckCircle2,
  Clock
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ResearchCardProps {
  research: ResearchItem;
  hasDraft?: boolean;
  onDetailClick?: (itemId: string) => void;
  onEditClick?: (itemId: string) => void;
  onGenerateSEO?: (itemId: string) => void;
  onScheduleClick?: (itemId: string) => void;
  className?: string;
}

/**
 * [Entities Layer]
 * 리서치 데이터를 티스토리 블로그 리스트 스타일로 보여주는 컴포넌트입니다.
 */
export const ResearchCard = ({ 
  research, 
  hasDraft, 
  onDetailClick, 
  onEditClick, 
  onGenerateSEO,
  onScheduleClick,
  className 
}: ResearchCardProps) => {
  const { pack, itemId, updatedAt } = research;

  const formatPrice = (price?: number | null) => {
    if (!price) return "가격 미상";
    return `${price.toLocaleString()}원`;
  };

  // 본문 요약 생성 (특징이나 장점을 결합하여 텍스트로 표시)
  const summaryText = [
    ...(pack.features || []),
    ...(pack.pros || [])
  ].join(" ").slice(0, 150) + "...";

  return (
    <div className={cn(
      "group flex flex-col sm:flex-row gap-5 p-5 bg-card border border-border rounded-2xl hover:border-border/80 hover:bg-muted/50 transition-all duration-300",
      className
    )}>
      {/* 좌측: 썸네일 영역 */}
      <div className="w-full sm:w-48 h-36 shrink-0 bg-muted rounded-xl border border-border flex flex-col items-center justify-center text-muted-foreground overflow-hidden relative">
        {pack.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pack.thumbnailUrl} alt={pack.title || "상품 이미지"} className="w-full h-full object-cover" />
        ) : (
          <>
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">No Image</span>
          </>
        )}
        {hasDraft && (
          <div className="absolute top-2 left-2 bg-blue-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            초안있음
          </div>
        )}
      </div>

      {/* 우측: 콘텐츠 및 액션 영역 */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* 헤더: 카테고리/프로젝트ID 및 작성일 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-medium hover:text-primary cursor-pointer transition-colors" onClick={() => onEditClick?.(itemId)}>
            {research.projectId || "카테고리"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(updatedAt).toLocaleDateString("ko-KR")}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => onEditClick?.(itemId)}>
          {pack.title || itemId}
        </h3>

        {/* 메타 정보 (가격배송 등) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
          <span className="text-emerald-500 font-medium">{formatPrice(pack.priceKRW)}</span>
          {pack.isRocket !== null && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className={pack.isRocket ? "text-blue-500" : "text-muted-foreground"}>
                로켓배송 {pack.isRocket ? "가능" : "불가"}
              </span>
            </>
          )}
        </div>

        {/* 본문 요약 */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {summaryText.length > 3 ? summaryText : "분석된 상품 특징 정보가 부족합니다."}
        </p>

        {/* 태그 영역 */}
        {pack.keywords && pack.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
            {pack.keywords.slice(0, 5).map((keyword, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-muted text-muted-foreground hover:bg-muted/80 px-2.5 py-0.5 text-xs font-normal border-none"
              >
                #{keyword}
              </Badge>
            ))}
          </div>
        )}

        {/* 하단 액션 버튼 그룹 */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
          <Button 
            size="sm" 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-9"
            onClick={(e) => { e.stopPropagation(); onGenerateSEO?.(itemId); }}
          >
            <PenTool className="w-4 h-4 mr-2" />
            즉시 글쓰기
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1 border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg h-9"
            onClick={(e) => { e.stopPropagation(); onScheduleClick?.(itemId); }}
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            스케줄 등록
          </Button>
        </div>

      </div>
    </div>
  );
};
