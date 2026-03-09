"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type View,
  type Event as RBCEvent,
} from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./bigcalendar-theme.css";

/** date-fns 기반 한국어 로컬라이저 */
const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // 월요일 시작
  getDay,
  locales,
});

/** 한국어 메시지 */
const messages = {
  today: "오늘",
  previous: "이전",
  next: "다음",
  month: "월",
  week: "주",
  day: "일",
  agenda: "목록",
  date: "날짜",
  time: "시간",
  event: "일정",
  showMore: (count: number) => `+${count}개 더보기`,
  noEventsInRange: "이 기간에 일정이 없습니다.",
};

/** 캘린더 이벤트 타입 (react-big-calendar용) */
export interface ScheduleEvent extends RBCEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: "PENDING" | "COMPLETED" | "FAILED";
  persona?: string;
  articleType?: string;
  content?: string;
  rawItem?: any;
}

interface BigCalendarViewProps {
  events: ScheduleEvent[];
  onEventClick?: (event: ScheduleEvent) => void;
}

/**
 * [Widgets Layer]
 * react-big-calendar 기반 스케줄 캘린더 뷰
 * 월간/주간 뷰 전환, 상태별 이벤트 색상, 한국어 지원
 */
export const BigCalendarView: React.FC<BigCalendarViewProps> = ({
  events,
  onEventClick,
}) => {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  /** 뷰 전환 핸들러 */
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  /** 네비게이션 핸들러 */
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  /** 이벤트 클릭 핸들러 — 더보기 팝업 오버레이도 닫음 */
  const handleSelectEvent = useCallback(
    (event: ScheduleEvent) => {
      // 더보기 팝업이 열려있으면 닫기 (오버레이 DOM 제거)
      const overlay = document.querySelector('.rbc-overlay');
      if (overlay) {
        (overlay as HTMLElement).style.display = 'none';
      }
      // 오버레이 배경도 제거
      const backdrop = document.querySelector('.rbc-overlay-backdrop');
      if (backdrop) {
        (backdrop as HTMLElement).click();
      }
      onEventClick?.(event);
    },
    [onEventClick]
  );

  /** 상태별 이벤트 스타일 (eventPropGetter) */
  const eventStyleGetter = useCallback((event: ScheduleEvent) => {
    let backgroundColor = "";
    let borderLeft = "";
    let borderTop = "none";
    let borderRight = "none";
    let borderBottom = "none";

    switch (event.status) {
      case "PENDING":
        backgroundColor = "rgba(245, 158, 11, 0.15)";
        borderTop = "none"; borderRight = "none"; borderBottom = "none";
        borderLeft = "3px solid #f59e0b";
        break;
      case "COMPLETED":
        backgroundColor = "rgba(16, 185, 129, 0.15)";
        borderTop = "none"; borderRight = "none"; borderBottom = "none";
        borderLeft = "3px solid #10b981";
        break;
      case "FAILED":
        backgroundColor = "rgba(239, 68, 68, 0.15)";
        borderTop = "none"; borderRight = "none"; borderBottom = "none";
        borderLeft = "3px solid #ef4444";
        break;
      default:
        backgroundColor = "rgba(59, 130, 246, 0.15)";
        borderTop = "none"; borderRight = "none"; borderBottom = "none";
        borderLeft = "3px solid #3b82f6";
    }

    return {
      style: {
        backgroundColor,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
        color: "var(--foreground)",
        opacity: 1,
      },
    };
  }, []);

  /** 사용할 뷰 목록 */
  const views = useMemo<View[]>(() => ["month", "week"], []);

  return (
    <div style={{ height: "70vh", minHeight: "500px" }}>
      <Calendar<ScheduleEvent>
        culture="ko"
        localizer={localizer}
        events={events}
        date={date}
        view={view}
        views={views}
        defaultView="month"
        startAccessor="start"
        endAccessor="end"
        step={30}
        timeslots={2}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        popup
        popupOffset={10}
        drilldownView={null}
        selectable={false}
        style={{ height: "100%" }}
      />
    </div>
  );
};
