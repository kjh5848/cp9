import React, { useState } from "react";
import { ResearchItem } from "@/entities/research/model/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Calendar, Clock, PenTool, CalendarPlus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface WriteActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  research: ResearchItem;
  defaultAction?: 'NOW' | 'SCHEDULE';
  onExecute: (params: { persona: string; actionType: 'NOW' | 'SCHEDULE'; scheduledAt?: string }) => void;
}

const PERSONA_OPTIONS = [
  { id: "IT", label: "💻 IT/테크 전문가", desc: "분석적이고 전문적인 어투, 스펙 비교" },
  { id: "LIVING", label: "🏠 살림/인테리어 고수", desc: "친근하고 실용적인 주부 멘토 가이드" },
  { id: "BEAUTY", label: "✨ 패션/뷰티 트렌드 쇼퍼", desc: "트렌디하고 감성적인 인플루언서 리뷰" },
  { id: "HUNTER", label: "🔥 가성비/할인 헌터", desc: "가심비 중심, 강력한 구매 추천" },
];

export const WriteActionModal = ({ isOpen, onClose, research, defaultAction = 'NOW', onExecute }: WriteActionModalProps) => {
  const [selectedPersona, setSelectedPersona] = useState<string>("IT");
  const [actionType, setActionType] = useState<'NOW' | 'SCHEDULE'>(defaultAction);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduleTime, setScheduleTime] = useState<string>("");

  const handleConfirm = () => {
    if (actionType === 'SCHEDULE') {
      if (!scheduleDate || !scheduleTime) {
        alert("예약 날짜와 시간을 선택해주세요.");
        return;
      }
      const dateObj = new Date(`${scheduleDate}T${scheduleTime}:00`);
      onExecute({ persona: selectedPersona, actionType, scheduledAt: dateObj.toISOString() });
    } else {
      onExecute({ persona: selectedPersona, actionType });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">포스팅 생성 설정</DialogTitle>
          <DialogDescription className="text-slate-400">
            [{research.pack.title || research.itemId}] 아이템의 포스팅 페르소나와 작성 방식을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* 페르소나 선택 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">작성자 페르소나 선택</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERSONA_OPTIONS.map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => setSelectedPersona(opt.id)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all duration-200 flex flex-col gap-1",
                    selectedPersona === opt.id 
                      ? "bg-blue-600/20 border-blue-500 text-blue-100" 
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500"
                  )}
                >
                  <span className="font-bold text-sm">{opt.label}</span>
                  <span className="text-[10px] opacity-80">{opt.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 실행 액션 탭 선택 */}
          <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setActionType('NOW')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors",
                actionType === 'NOW' ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <PenTool className="w-4 h-4" />
              즉시 작성
            </button>
            <button
              onClick={() => setActionType('SCHEDULE')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors",
                actionType === 'SCHEDULE' ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <CalendarPlus className="w-4 h-4" />
              스케줄 예약
            </button>
          </div>

          {/* 스케줄 선택 폼 */}
          {actionType === 'SCHEDULE' && (
            <div className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-semibold text-slate-300">발행 예정 일시</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">날짜</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="pl-9 bg-slate-900 border-slate-700 text-slate-200"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">시간</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="pl-9 bg-slate-900 border-slate-700 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t border-slate-800 pt-4">
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            취소
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={handleConfirm}
          >
            {actionType === 'NOW' ? '지금 글쓰기 시작' : '스케줄 보드에 등록'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
