'use client';

import React from 'react';
import { DefaultAutopilotSettings } from '../model/types';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Loader2 } from 'lucide-react';
import { SourcingCriteriaSection } from '@/entities/autopilot/ui/SourcingCriteriaSection';
import { ScheduleSettingsSection } from '@/entities/autopilot/ui/ScheduleSettingsSection';

interface AutopilotSettingsFormProps {
  settings?: DefaultAutopilotSettings;
  isLoading?: boolean;
  onSave?: (newSettings: DefaultAutopilotSettings) => void;
  isSaving?: boolean;
}

export const AutopilotSettingsForm: React.FC<AutopilotSettingsFormProps> = ({
  settings,
  isLoading = false,
  onSave,
  isSaving = false,
}) => {
  const [formData, setFormData] = React.useState<DefaultAutopilotSettings>({
    sortCriteria: 'salePriceAsc',
    minPrice: undefined,
    maxPrice: undefined,
    isRocketOnly: false,
    intervalHours: 360,
    activeTimeStart: 9,
    activeTimeEnd: 22,
  });

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof DefaultAutopilotSettings, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-4 w-1/2" /></div>
        <div className="space-y-4"><Skeleton className="h-24 w-full" /></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:border-white/20 text-white">
      <div className="absolute inset-0 bg-[url('/noise.svg')] mix-blend-soft-light opacity-20 pointer-events-none rounded-2xl" />
      
      <div className="relative z-10 flex flex-col gap-10 cursor-default">
        {/* 헤더 부분 */}
        <div>
          <h4 className="text-xl font-syne font-semibold tracking-tight">아이템 소싱 & 발행 설정</h4>
          <p className="text-sm font-jakarta text-slate-400 mt-1">대량 발행 및 예약 스케줄에 사용될 기본값을 설정합니다.</p>
        </div>

        {/* 1. 소싱 필터 설정 */}
        <div className="space-y-6 bg-black/20 p-6 border border-white/5 rounded-xl">
          <SourcingCriteriaSection 
            sortCriteria={formData.sortCriteria || 'salePriceAsc'}
            setSortCriteria={(v: string) => handleChange('sortCriteria', v)}
            minPrice={formData.minPrice?.toString() || ''}
            setMinPrice={(v: string) => handleChange('minPrice', v ? parseInt(v, 10) : undefined)}
            maxPrice={formData.maxPrice?.toString() || ''}
            setMaxPrice={(v: string) => handleChange('maxPrice', v ? parseInt(v, 10) : undefined)}
            isRocketOnly={formData.isRocketOnly || false}
            setIsRocketOnly={(v: boolean) => handleChange('isRocketOnly', v)}
            hideLoadMySettings={true}
          />
        </div>

        {/* 2. 자동 발행(스케줄) & 다중모드 설정 */}
        <div className="space-y-6 bg-black/20 p-6 border border-white/5 rounded-xl">
          <ScheduleSettingsSection 
            intervalHours={formData.intervalHours?.toString() || '0'}
            setIntervalHours={(v: string) => handleChange('intervalHours', parseInt(v, 10))}
            activeTimeStart={formData.activeTimeStart?.toString() || '0'}
            setActiveTimeStart={(v: string) => handleChange('activeTimeStart', parseInt(v, 10))}
            activeTimeEnd={formData.activeTimeEnd?.toString() || '0'}
            setActiveTimeEnd={(v: string) => handleChange('activeTimeEnd', parseInt(v, 10))}
            startDate=""
            setStartDate={() => {}}
            expiresAt=""
            setExpiresAt={() => {}}
            hideLoadMySettings={true}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-syne font-bold tracking-wide h-11 px-8 rounded-full transition-all duration-300"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 저장 중...</>
            ) : "변경사항 저장"}
          </Button>
        </div>
      </div>
    </div>
  );
};
