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
  title: string;
  defaultAction?: 'NOW' | 'SCHEDULE';
  onExecute: (params: { persona: string; personaName: string; textModel: string; imageModel: string; actionType: 'NOW' | 'SCHEDULE'; scheduledAt?: string; charLimit?: number }) => void;
}

const PERSONA_OPTIONS = [
  { id: "IT", label: "💻 IT/테크 전문가", desc: "스펙 비교표 · 벤치마크 · 호환성 분석" },
  { id: "LIVING", label: "🏠 살림/인테리어 고수", desc: "공간별 활용 · 유지관리 · 가성비 판정" },
  { id: "BEAUTY", label: "✨ 패션/뷰티 쇼퍼", desc: "트렌드 핏 · 실착 후기 · 스타일링 가이드" },
  { id: "HUNTER", label: "🔥 가성비/할인 헌터", desc: "가격 비교표 · 할인 분석 · 구매 긴박성 CTA" },
  { id: "MASTER_CURATOR_H", label: "⭐ 마스터 큐레이터", desc: "렌탈 딥다이브 · 하이엔드 비교 · SEO 구조화" },
];

export const WriteActionModal = ({ isOpen, onClose, title, defaultAction = 'NOW', onExecute }: WriteActionModalProps) => {
  const [selectedPersona, setSelectedPersona] = useState<string>("IT");
  // 커스텀 닉네임 (MASTER_CURATOR_H 전용, 기본값: '마스터 큐레이터 H')
  const [personaName, setPersonaName] = useState<string>("마스터 큐레이터 H");
  const [selectedTextModel, setSelectedTextModel] = useState<string>("claude-sonnet-4-6");
  const [selectedImageModel, setSelectedImageModel] = useState<string>("dall-e-3");
  const [actionType, setActionType] = useState<'NOW' | 'SCHEDULE'>(defaultAction);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [charLimit, setCharLimit] = useState<number>(2000);
  // 'custom' 선택 시 직접 입력 모드 활성화
  const [charLimitMode, setCharLimitMode] = useState<string>('2000');

  // 프리셋 글자수 옵션
  const CHAR_LIMIT_PRESETS = [
    { value: '2000', label: '2,000자', desc: '간결 요약' },
    { value: '5000', label: '5,000자', desc: '표준 리뷰' },
    { value: '8000', label: '8,000자', desc: '심층 분석' },
    { value: '10000', label: '10,000자', desc: '하이엔드 딥다이브' },
    { value: 'custom', label: '직접 입력', desc: '원하는 글자수' },
  ];

  const handleConfirm = () => {
    // 최종 사용할 닉네임: 비어있으면 기본값 사용
    const finalPersonaName = personaName.trim() || '마스터 큐레이터 H';
    if (actionType === 'SCHEDULE') {
      if (!scheduleDate || !scheduleTime) {
        alert("예약 날짜와 시간을 선택해주세요.");
        return;
      }
      const dateObj = new Date(`${scheduleDate}T${scheduleTime}:00`);
      onExecute({ persona: selectedPersona, personaName: finalPersonaName, textModel: selectedTextModel, imageModel: selectedImageModel, actionType, scheduledAt: dateObj.toISOString(), charLimit });
    } else {
      onExecute({ persona: selectedPersona, personaName: finalPersonaName, textModel: selectedTextModel, imageModel: selectedImageModel, actionType, charLimit });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">포스팅 생성 설정</DialogTitle>
          <DialogDescription className="text-slate-400">
            [{title}] 아이템의 포스팅 페르소나와 작성 방식을 선택하세요.
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
            {/* MASTER_CURATOR_H 선택 시 닉네임 입력 필드 노출 */}
            {selectedPersona === 'MASTER_CURATOR_H' && (
              <div className="pt-1">
                <label className="text-xs text-slate-500 mb-1 block">작성자 닉네임 (글 본문에 반영됩니다)</label>
                <input
                  type="text"
                  placeholder="예: 마스터 큐레이터 H"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  className="w-full bg-slate-900 border border-blue-500/50 text-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-400 placeholder:text-slate-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">비워두면 기본값 &apos;마스터 큐레이터 H&apos; 로 작성됩니다.</p>
              </div>
            )}
          </div>

          {/* AI 모델 선택 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">사용할 AI 모델 선택</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">텍스트 작성 모델</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-500"
                  value={selectedTextModel}
                  onChange={(e) => setSelectedTextModel(e.target.value)}
                >
                  <optgroup label="— OpenAI —">
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o mini</option>
                    <option value="o4-mini-2025-04-16">o4-mini</option>
                    <option value="gpt-5-pro-2025-10-06">GPT-5 Pro</option>
                  </optgroup>
                  <optgroup label="— Anthropic (Claude) —">
                    <option value="claude-sonnet-4-6">Claude Sonnet 4.6 ⭐</option>
                    <option value="claude-opus-4-6">Claude Opus 4.6</option>
                    <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                  </optgroup>
                  <optgroup label="— Google (Gemini) —">
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                  </optgroup>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">이미지 생성 모델</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-500"
                  value={selectedImageModel}
                  onChange={(e) => setSelectedImageModel(e.target.value)}
                >
                  <option value="dall-e-3">DALL-E 3 (OpenAI)</option>
                  <option value="nano-banana">Nano Banana (Gemini 2.5 Flash Image) ⭐</option>
                  <option value="none">사용 안 함</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="text-xs text-slate-500 block">목표 글자수 (공백 포함)</label>
              {/* 프리셋 버튼 그리드 */}
              <div className="grid grid-cols-5 gap-1.5">
                {CHAR_LIMIT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setCharLimitMode(preset.value);
                      if (preset.value !== 'custom') setCharLimit(Number(preset.value));
                    }}
                    className={cn(
                      "flex flex-col items-center py-2 px-1 rounded-md border text-center transition-all duration-200 cursor-pointer",
                      charLimitMode === preset.value
                        ? "bg-blue-600/20 border-blue-500 text-blue-100"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500"
                    )}
                  >
                    <span className="text-xs font-bold leading-tight">{preset.label}</span>
                    <span className="text-[9px] opacity-70 mt-0.5 leading-tight">{preset.desc}</span>
                  </button>
                ))}
              </div>
              {/* 직접 입력 모드일 때만 숫자 필드 표시 */}
              {charLimitMode === 'custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-blue-500/50 text-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-400"
                    value={charLimit}
                    onChange={(e) => setCharLimit(Number(e.target.value) || 2000)}
                    min={500}
                    step={500}
                    placeholder="글자수 직접 입력"
                  />
                  <span className="text-sm text-slate-400 whitespace-nowrap">자 내외</span>
                </div>
              )}
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
