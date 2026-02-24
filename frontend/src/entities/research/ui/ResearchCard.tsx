import React from "react";
import { ResearchItem } from "../model/types";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { 
  Check, 
  Star, 
  AlertTriangle, 
  Tag, 
  DollarSign, 
  Truck,
  ExternalLink,
  Edit
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ResearchCardProps {
  research: ResearchItem;
  hasDraft?: boolean;
  onDetailClick?: (itemId: string) => void;
  onEditClick?: (itemId: string) => void;
  onGenerateSEO?: (itemId: string) => void;
  className?: string;
}

/**
 * [Entities Layer]
 * 리서치 데이터(ResearchItem)를 시각화하는 순수 UI 컴포넌트입니다.
 * 비즈니스 로직이나 수정 상태를 직접 관리하지 않습니다.
 */
export const ResearchCard = ({ 
  research, 
  hasDraft, 
  onDetailClick, 
  onEditClick, 
  onGenerateSEO,
  className 
}: ResearchCardProps) => {
  const { pack, itemId, updatedAt } = research;

  const formatPrice = (price?: number | null) => {
    if (!price) return "가격 정보 없음";
    return `${price.toLocaleString()}원`;
  };

  return (
    <GlassCard className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white line-clamp-1">
            {pack.title || itemId}
          </h3>
          {hasDraft && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              초안 생성됨
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {onDetailClick && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 border-white/10 hover:bg-white/5"
              onClick={() => onDetailClick(itemId)}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              상세
            </Button>
          )}
          {onEditClick && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 border-white/10 hover:bg-white/5"
              onClick={() => onEditClick(itemId)}
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              수정
            </Button>
          )}
        </div>
      </div>

      {/* 기본 메타 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{formatPrice(pack.priceKRW)}</span>
        </div>
        {pack.isRocket !== null && (
          <div className="flex items-center gap-2 text-slate-300">
            <Truck className={cn("w-4 h-4", pack.isRocket ? "text-blue-400" : "text-slate-500")} />
            <span className="text-sm">
              로켓배송 {pack.isRocket ? "가능" : "불가능"}
            </span>
          </div>
        )}
      </div>

      <Separator className="bg-white/5" />

      {/* 특징 및 요약 정보 */}
      <div className="space-y-4 flex-grow">
        {pack.features && pack.features.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              주요 특징
            </h4>
            <ul className="text-sm text-slate-300 space-y-1.5 pl-1">
              {pack.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-slate-500 mt-1.5 w-1 h-1 rounded-full bg-slate-500 shrink-0" />
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pack.pros && pack.pros.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-xs font-semibold text-emerald-400/80 uppercase tracking-wider mb-2">
                <Check className="w-3.5 h-3.5" />
                장점
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 pl-1">
                {pack.pros.slice(0, 2).map((pro, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">+</span>
                    <span className="line-clamp-1">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pack.cons && pack.cons.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-xs font-semibold text-rose-400/80 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                단점
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 pl-1">
                {pack.cons.slice(0, 2).map((con, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">-</span>
                    <span className="line-clamp-1">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {pack.keywords && pack.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {pack.keywords.slice(0, 4).map((keyword, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-[10px] bg-white/5 border-white/5 text-slate-400"
            >
              #{keyword}
            </Badge>
          ))}
        </div>
      )}

      <div className="pt-2 text-[10px] text-slate-500 flex justify-between items-center">
        <span>ID: {itemId}</span>
        <span>최근 업데이트: {new Date(updatedAt).toLocaleDateString("ko-KR")}</span>
      </div>
    </GlassCard>
  );
};
