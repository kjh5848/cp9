"use client";

import React, { useMemo } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** 캘린더 아이템 타입 */
export interface CalendarItem {
  id: string;
  title: string;
  persona: string;
  date: string; // ISO string
  status: "PENDING" | "COMPLETED" | "FAILED";
  articleType?: string;
  rawItem?: any;
}

interface WeeklyCalendarProps {
  items: CalendarItem[];
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  onItemClick?: (item: CalendarItem) => void;
}

/** 요일 한글 매핑 */
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 주간 캘린더 뷰 — 7일 컬럼에 예약된 글을 시간순으로 배치합니다.
 */
export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  items,
  weekOffset,
  onWeekChange,
  onItemClick,
}) => {
  // 현재 주의 시작일(월요일) 계산
  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0(일) ~ 6(토)
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  // 날짜별 아이템 그룹핑
  const groupedItems = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const day of weekDays) {
      const key = day.toISOString().slice(0, 10);
      map.set(key, []);
    }
    for (const item of items) {
      const key = new Date(item.date).toISOString().slice(0, 10);
      if (map.has(key)) {
        map.get(key)!.push(item);
      }
    }
    // 시간순 정렬
    for (const [, list] of map) {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return map;
  }, [items, weekDays]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const startDate = weekDays[0];
  const endDate = weekDays[6];

  // 주 범위 포맷
  const weekRangeLabel = `${startDate.getMonth() + 1}/${startDate.getDate()} — ${endDate.getMonth() + 1}/${endDate.getDate()}`;

  return (
    <div className="space-y-4">
      {/* 주 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onWeekChange(weekOffset - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onWeekChange(weekOffset + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground ml-2">{weekRangeLabel}</span>
          {weekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-400 hover:text-blue-300 h-7"
              onClick={() => onWeekChange(0)}
            >
              이번 주
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          총 {items.filter(i => {
            const d = new Date(i.date).toISOString().slice(0, 10);
            return d >= startDate.toISOString().slice(0, 10) && d <= endDate.toISOString().slice(0, 10);
          }).length}건 예약됨
        </div>
      </div>

      {/* 7일 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dateStr = day.toISOString().slice(0, 10);
          const dayItems = groupedItems.get(dateStr) || [];
          const isToday = dateStr === todayStr;
          const isPast = day < new Date(todayStr);
          const dayOfWeek = day.getDay();
          const isSunday = dayOfWeek === 0;

          return (
            <div
              key={dateStr}
              className={cn(
                "flex flex-col rounded-xl border min-h-[180px] transition-colors",
                isToday
                  ? "border-blue-500/50 bg-blue-500/5"
                  : isPast
                    ? "border-border/30 bg-muted/20"
                    : "border-border/50 bg-card/30",
              )}
            >
              {/* 날짜 헤더 */}
              <div
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 border-b",
                  isToday ? "border-blue-500/30" : "border-border/30"
                )}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      isSunday ? "text-red-400" : "text-muted-foreground",
                    )}
                  >
                    {DAY_LABELS[dayOfWeek]}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      isToday
                        ? "text-blue-400"
                        : isPast
                          ? "text-muted-foreground/60"
                          : "text-foreground",
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>
                {dayItems.length > 0 && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    {dayItems.length}
                  </span>
                )}
              </div>

              {/* 아이템 목록 */}
              <div className="flex-1 p-1.5 space-y-1 overflow-y-auto max-h-[200px]">
                {dayItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground/30">
                    <span className="text-[10px]">—</span>
                  </div>
                ) : (
                  dayItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onItemClick?.(item)}
                      className={cn(
                        "p-1.5 rounded-lg cursor-pointer transition-all text-[11px] leading-tight group",
                        item.status === "COMPLETED"
                          ? "bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : item.status === "FAILED"
                            ? "bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                            : "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20",
                      )}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Clock className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">
                          {new Date(item.date).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="font-medium text-foreground line-clamp-2 group-hover:text-blue-400 transition-colors">
                        <FileText className="w-2.5 h-2.5 inline mr-0.5 text-muted-foreground" />
                        {item.title}
                      </p>
                      {item.articleType && item.articleType !== "single" && (
                        <span
                          className={cn(
                            "inline-block mt-0.5 text-[9px] font-medium px-1 py-0.5 rounded",
                            item.articleType === "compare"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-amber-500/20 text-amber-400",
                          )}
                        >
                          {item.articleType === "compare" ? "비교" : "큐레이션"}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
