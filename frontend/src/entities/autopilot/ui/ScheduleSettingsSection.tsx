import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';

export interface ScheduleSettingsSectionProps {
  intervalHours: string;
  setIntervalHours: (v: string) => void;
  activeTimeStart: string;
  setActiveTimeStart: (v: string) => void;
  activeTimeEnd: string;
  setActiveTimeEnd: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  expiresAt: string;
  setExpiresAt: (v: string) => void;
  startDateError?: string;
  hideLoadMySettings?: boolean;
}

export function ScheduleSettingsSection({
  intervalHours,
  setIntervalHours,
  activeTimeStart,
  setActiveTimeStart,
  activeTimeEnd,
  setActiveTimeEnd,
  startDate,
  setStartDate,
  expiresAt,
  setExpiresAt,
  startDateError,
  hideLoadMySettings,
}: ScheduleSettingsSectionProps) {

  const { autopilotSettings } = useUserSettingsViewModel();

  const applySchedulePreset = (interval: string, start: string, end: string) => {
    setIntervalHours(interval);
    setActiveTimeStart(start);
    setActiveTimeEnd(end);
  };

  const loadMySettings = () => {
    if (autopilotSettings) {
      if (autopilotSettings.intervalHours !== undefined && autopilotSettings.intervalHours !== null) setIntervalHours(String(autopilotSettings.intervalHours));
      if (autopilotSettings.activeTimeStart !== undefined && autopilotSettings.activeTimeStart !== null) setActiveTimeStart(String(autopilotSettings.activeTimeStart));
      if (autopilotSettings.activeTimeEnd !== undefined && autopilotSettings.activeTimeEnd !== null) setActiveTimeEnd(String(autopilotSettings.activeTimeEnd));
    }
  };

  return (
    <div className="space-y-6">
      {!hideLoadMySettings ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-300">내 기본 설정 불러오기</span>
          </div>
        <div className="flex items-center gap-2">
           <Button type="button" variant="outline" size="sm" onClick={loadMySettings} className="h-8 bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800">
            마이페이지 설정 불러오기
          </Button>
          <Link href="/my-page" target="_blank">
            <Button type="button" variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-white px-2">
              설정으로 이동
            </Button>
          </Link>
        </div>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-300 tracking-tight shrink-0">발행 스케줄링</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => applySchedulePreset('24', '14', '22')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-blue-500/20 hover:text-blue-300 transition-colors">
            오후 (14~22시)
          </button>
          <button type="button" onClick={() => applySchedulePreset('12', '22', '6')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-purple-500/20 hover:text-purple-300 transition-colors">
            심야 (밤샘)
          </button>
          <button type="button" onClick={() => applySchedulePreset('6', '-1', '-1')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors">
            종일 (제한없음)
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-800/20 rounded-xl border border-slate-800/50">
        

        <div className="space-y-2 md:col-span-2">
          <Label className="text-slate-300 text-sm">발행 주기/빈도 (Interval)</Label>
          <Select 
            value={intervalHours || '0'} 
            onValueChange={(val: string) => setIntervalHours(val)}
          >
            <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-white cursor-pointer h-11">
              <SelectValue placeholder="지금 즉시 실행" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              <SelectItem value="0">스케줄 없음 (즉시 1회성 발행)</SelectItem>
              <SelectItem value="1">1시간마다 실행</SelectItem>
              <SelectItem value="3">3시간마다 실행</SelectItem>
              <SelectItem value="6">6시간마다 실행</SelectItem>
              <SelectItem value="12">12시간마다 실행</SelectItem>
              <SelectItem value="24">매일 1회 (24시간) 실행</SelectItem>
              <SelectItem value="168">매주 1회 (168시간) 실행</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">허용 시작 시간 (Start Time)</Label>
          <Select 
            value={activeTimeStart || '0'} 
            onValueChange={(val: string) => setActiveTimeStart(val)}
          >
            <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-white cursor-pointer h-11">
              <SelectValue placeholder="시간대 제한 없음" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white max-h-60">
              <SelectItem value="-1">제한 없음 (24시간 동작)</SelectItem>
              {Array.from({length: 24}).map((_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {i.toString().padStart(2, '0')}:00 부터
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">허용 종료 시간 (End Time)</Label>
          <Select 
            value={activeTimeEnd || '0'} 
            onValueChange={(val: string) => setActiveTimeEnd(val)}
          >
            <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-white cursor-pointer h-11">
              <SelectValue placeholder="시간대 제한 없음" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white max-h-60">
              <SelectItem value="-1">제한 없음</SelectItem>
              {Array.from({length: 24}).map((_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {i.toString().padStart(2, '0')}:00 까지만
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        
      </div>
    </div>
  );
}
