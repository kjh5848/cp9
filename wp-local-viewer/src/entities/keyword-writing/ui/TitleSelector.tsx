/**
 * [Entities/KeywordWriting] 제목 선택 리스트 컴포넌트
 * AI가 생성한 제목 후보를 선택하고 편집할 수 있는 순수 UI 컴포넌트입니다.
 */
import { Check, Edit3 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { GlassCard } from "@/shared/ui/GlassCard";
import { TitleCandidate } from "@/features/keyword-writing/api/keyword-api";

interface TitleSelectorProps {
  /** 제목 후보 목록 */
  titles: TitleCandidate[];
  /** 현재 선택된 제목 인덱스 */
  selectedIdx: number | null;
  /** 제목 선택 핸들러 */
  onSelect: (idx: number) => void;
  /** 편집 중인 제목 텍스트 */
  editedTitle: string;
  /** 편집 모드 여부 */
  isEditing: boolean;
  /** 편집 모드 토글 핸들러 */
  onEditToggle: () => void;
  /** 제목 편집 핸들러 */
  onEditChange: (v: string) => void;
}

export function TitleSelector({
  titles,
  selectedIdx,
  onSelect,
  editedTitle,
  isEditing,
  onEditToggle,
  onEditChange,
}: TitleSelectorProps) {
  return (
    <>
      <div className="space-y-3">
        {titles.map((t, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={cn(
              "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
              selectedIdx === idx
                ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/5"
                : "border-border/50 bg-background/30 hover:border-purple-500/20 hover:bg-muted/30"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0",
                selectedIdx === idx ? "bg-purple-500 text-white" : "bg-muted text-muted-foreground"
              )}>
                {selectedIdx === idx ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-semibold text-foreground leading-snug">{t.title}</h4>
                <p className="text-xs text-muted-foreground mt-1.5">{t.subtitle}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{t.targetAudience}</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">{t.searchIntent}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedIdx !== null && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">선택된 제목 편집</span>
            <button onClick={onEditToggle} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              {isEditing ? "완료" : "수정"}
            </button>
          </div>
          {isEditing ? (
            <input
              type="text"
              className="w-full bg-background/50 border border-blue-500/30 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={editedTitle}
              onChange={(e) => onEditChange(e.target.value)}
            />
          ) : (
            <p className="text-sm font-medium text-foreground">{editedTitle}</p>
          )}
        </GlassCard>
      )}
    </>
  );
}
