import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Settings2, X } from 'lucide-react';
import Link from 'next/link';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';
import { calcMinutesFromUnit, parseMinutesToUnitAndValue, IntervalUnit, INTERVAL_LABELS } from '@/shared/lib/interval';

export interface ScheduleSettingsSectionProps {
  intervalHours: string;
  setIntervalHours: (v: string) => void;
  publishTimes?: string;       // "09:00,15:00"
  setPublishTimes?: (v: string) => void;
  publishDays?: string;        // "1,2,3,4,5"
  setPublishDays?: (v: string) => void;
  jitterMinutes?: string;
  setJitterMinutes?: (v: string) => void;
  dailyCap?: string;
  setDailyCap?: (v: string) => void;
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
  publishTimes,
  setPublishTimes,
  publishDays,
  setPublishDays,
  jitterMinutes,
  setJitterMinutes,
  dailyCap,
  setDailyCap,
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

  const [intervalVal, setIntervalVal] = React.useState<number>(0);
  const [intervalUnit, setIntervalUnit] = React.useState<IntervalUnit>('hour');
  
  // UI 모드: 주기 vs 특정시간
  const [scheduleMode, setScheduleMode] = React.useState<'interval' | 'specific'>('interval');
  const [inputTime, setInputTime] = React.useState('');

  const daysOfWeek = [
    { label: '일', value: '0' },
    { label: '월', value: '1' },
    { label: '화', value: '2' },
    { label: '수', value: '3' },
    { label: '목', value: '4' },
    { label: '금', value: '5' },
    { label: '토', value: '6' }
  ];

  React.useEffect(() => {
    // publishTimes 가 있으면 specific mode 로 초기화
    if (publishTimes && publishTimes.length > 0) {
      setScheduleMode('specific');
    }
  }, []);

  React.useEffect(() => {
    const minutes = parseInt(intervalHours || '0', 10);
    const { value, unit } = parseMinutesToUnitAndValue(minutes);
    setIntervalVal(value);
    setIntervalUnit(unit);
  }, [intervalHours]);

  const handleIntervalChange = (newVal: number, newUnit: IntervalUnit) => {
    setIntervalVal(newVal);
    setIntervalUnit(newUnit);
    if (newVal === 0) {
      setIntervalHours('0');
    } else {
      const totalMinutes = calcMinutesFromUnit(newVal, newUnit);
      setIntervalHours(String(totalMinutes));
    }
    setPublishTimes?.(''); // 주기 설정이면 특정 시간 비움
  };

  const applySchedulePreset = (intervalMinutes: string, start: string, end: string) => {
    setScheduleMode('interval');
    setIntervalHours(intervalMinutes);
    setActiveTimeStart(start);
    setActiveTimeEnd(end);
    setPublishTimes?.('');
    setPublishDays?.('');
  };

  const applyAdvancePreset = (times: string[], days: string[]) => {
    setScheduleMode('specific');
    if (setPublishTimes) setPublishTimes(times.join(','));
    if (setPublishDays) setPublishDays(days.join(','));
    setIntervalHours('0'); // 비활성
    setActiveTimeStart('-1');
    setActiveTimeEnd('-1');
  }

  const loadMySettings = () => {
    if (autopilotSettings) {
      if (autopilotSettings.intervalHours !== undefined && autopilotSettings.intervalHours !== null) setIntervalHours(String(autopilotSettings.intervalHours));
      if (autopilotSettings.activeTimeStart !== undefined && autopilotSettings.activeTimeStart !== null) setActiveTimeStart(String(autopilotSettings.activeTimeStart));
      if (autopilotSettings.activeTimeEnd !== undefined && autopilotSettings.activeTimeEnd !== null) setActiveTimeEnd(String(autopilotSettings.activeTimeEnd));
      
      // Advanced
      if (autopilotSettings.publishTimes && setPublishTimes) {
        setPublishTimes(autopilotSettings.publishTimes);
        setScheduleMode('specific');
      }
      if (autopilotSettings.publishDays && setPublishDays) setPublishDays(autopilotSettings.publishDays);
      if (autopilotSettings.jitterMinutes !== undefined && autopilotSettings.jitterMinutes !== null && setJitterMinutes) setJitterMinutes(String(autopilotSettings.jitterMinutes));
      if (autopilotSettings.dailyCap !== undefined && autopilotSettings.dailyCap !== null && setDailyCap) setDailyCap(String(autopilotSettings.dailyCap));
    }
  };

  const handleAddTime = () => {
    if (!inputTime || !setPublishTimes) return;
    const currentTimes = publishTimes ? publishTimes.split(',').filter(Boolean) : [];
    if (!currentTimes.includes(inputTime)) {
      setPublishTimes([...currentTimes, inputTime].sort().join(','));
    }
    setInputTime('');
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (!setPublishTimes || !publishTimes) return;
    setPublishTimes(publishTimes.split(',').filter(t => t !== timeToRemove).join(','));
  };

  const toggleDay = (dayValue: string) => {
    if (!setPublishDays) return;
    const currentDays = publishDays ? publishDays.split(',').filter(Boolean) : [];
    if (currentDays.includes(dayValue)) {
      setPublishDays(currentDays.filter(d => d !== dayValue).join(','));
    } else {
      setPublishDays([...currentDays, dayValue].sort().join(','));
    }
  };

  const currentTimesArray = publishTimes ? publishTimes.split(',').filter(Boolean) : [];
  const currentDaysArray = publishDays ? publishDays.split(',').filter(Boolean) : [];

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
          <button type="button" onClick={() => applyAdvancePreset(['09:00', '13:00', '18:00'], ['1', '2', '3', '4', '5'])} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-rose-500/20 hover:text-rose-300 transition-colors">
            평일 출퇴근/점심 타겟
          </button>
          <button type="button" onClick={() => applySchedulePreset('1440', '14', '22')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-blue-500/20 hover:text-blue-300 transition-colors">
            오후 (14~22시 주기)
          </button>
          <button type="button" onClick={() => applySchedulePreset('720', '22', '6')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-purple-500/20 hover:text-purple-300 transition-colors">
            심야 (밤샘)
          </button>
          <button type="button" onClick={() => applySchedulePreset('360', '-1', '-1')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors">
            종일 (제한없음)
          </button>
        </div>
      </div>
      
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-1 w-full max-w-sm flex">
        <button type="button" onClick={() => { setScheduleMode('interval'); setPublishTimes?.(''); }} 
          className={`flex-1 text-xs font-semibold py-2 rounded-md transition-colors ${scheduleMode === 'interval' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'}`}>
          타이머 반복 방식
        </button>
        <button type="button" onClick={() => { setScheduleMode('specific'); setIntervalHours('0'); }} 
          className={`flex-1 text-xs font-semibold py-2 rounded-md transition-colors ${scheduleMode === 'specific' ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}>
          특정 시간 지정 모드
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-800/20 rounded-xl border border-slate-800/50">
        
        <div className="space-y-2 md:col-span-2">
          <Label className="text-slate-300 text-sm">첫 발행 예약 일시 (Start Date)</Label>
          <Input 
            type="datetime-local"
            value={startDate ? new Date(new Date(startDate).getTime() - new Date(startDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
            onChange={(e) => {
              if (e.target.value) {
                setStartDate(new Date(e.target.value).toISOString());
              } else {
                setStartDate("");
              }
            }}
            className="bg-slate-950/50 border-slate-800/50 text-white h-10 [color-scheme:dark]"
          />
          {startDateError && <p className="text-xs text-red-400 mt-1">{startDateError}</p>}
        </div>

        {scheduleMode === 'interval' ? (
          <>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-300 text-sm">발행 주기/빈도 (Interval)</Label>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  min={0}
                  value={intervalVal}
                  onChange={(e) => handleIntervalChange(Number(e.target.value), intervalUnit)}
                  className="bg-slate-950/50 border-slate-800/50 text-white h-10 flex-1"
                  placeholder="0 (즉시 실행)"
                />
                <div className="w-32 shrink-0">
                  <Select 
                    value={intervalUnit} 
                    onValueChange={(val: string) => handleIntervalChange(intervalVal, val as IntervalUnit)}
                  >
                    <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-white cursor-pointer h-10">
                      <SelectValue placeholder="단위" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      <SelectItem value="minute">분 마다</SelectItem>
                      <SelectItem value="hour">시간 마다</SelectItem>
                      <SelectItem value="day">일 마다</SelectItem>
                      <SelectItem value="week">주 마다</SelectItem>
                      <SelectItem value="month">개월 마다</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">※ '0' 입력 시 단발성 즉시 발행으로 예약됩니다.</p>
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
          </>
        ) : (
          <>
            <div className="space-y-3 md:col-span-2">
              <Label className="text-slate-300 text-sm">특정 요일 지정 (선택)</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`w-10 h-10 rounded-full font-medium text-sm flex items-center justify-center transition-all ${
                      currentDaysArray.includes(day.value)
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 border'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">※ 아무것도 선택하지 않으면 '매일' 발행됩니다.</p>
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-slate-300 text-sm">정각 발행 스케줄 편집</Label>
              <div className="flex gap-2">
                <Input 
                  type="time"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  className="bg-slate-950/50 border-slate-800/50 text-white h-10 max-w-[150px] [color-scheme:dark]"
                />
                <Button type="button" variant="secondary" onClick={handleAddTime} className="h-10">추가하기</Button>
              </div>
              
              {currentTimesArray.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                  {currentTimesArray.map((t) => (
                    <div key={t} className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/20 text-sm font-medium">
                      <span>{t}</span>
                      <button type="button" onClick={() => handleRemoveTime(t)} className="ml-1 text-amber-400 hover:text-amber-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {currentTimesArray.length === 0 && (
                <p className="text-xs text-amber-400 mt-1">※ 등록된 시간이 없습니다. 반드시 최소 1개 이상 시간을 추가해주세요!</p>
              )}
            </div>

            {setJitterMinutes && (
              <div className="space-y-2 md:col-span-1">
                <Label className="text-slate-300 text-sm">어뷰징 방지 난수화 (Jitter 봇 탐지 회피용)</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="number"
                    min={0}
                    max={120}
                    value={jitterMinutes || '0'}
                    onChange={(e) => setJitterMinutes(e.target.value)}
                    className="bg-slate-950/50 border-slate-800/50 text-white h-10 flex-1 max-w-[100px]"
                    placeholder="15"
                  />
                  <span className="text-sm text-slate-400">분 랜덤 (±)</span>
                </div>
                <p className="text-xs text-slate-500">예: 분산 설정이 15분이면 09:00 등록 시 08:45 ~ 09:15 사이에 랜덤 발행. (추천값: 15~30분)</p>
              </div>
            )}
            
            {setDailyCap && (
              <div className="space-y-2 md:col-span-1">
                <Label className="text-slate-300 text-sm">일일 발행 상한 (Safety Max)</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="number"
                    min={0}
                    value={dailyCap || ''}
                    onChange={(e) => setDailyCap(e.target.value)}
                    className="bg-slate-950/50 border-slate-800/50 text-white h-10 flex-1 max-w-[100px]"
                    placeholder="무제한"
                  />
                  <span className="text-sm text-slate-400">개 / 일</span>
                </div>
                <p className="text-xs text-slate-500">비워두면 제한없이 모두 발행됩니다.</p>
              </div>
            )}
          </>
        )}

        
      </div>
    </div>
  );
}
