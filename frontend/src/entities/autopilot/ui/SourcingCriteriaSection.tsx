import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';

export interface SourcingCriteriaSectionProps {
  sortCriteria: string;
  setSortCriteria: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  isRocketOnly: boolean;
  setIsRocketOnly: (v: boolean) => void;
  hideLoadMySettings?: boolean;
}

export function SourcingCriteriaSection({
  sortCriteria,
  setSortCriteria,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  isRocketOnly,
  setIsRocketOnly,
  hideLoadMySettings,
}: SourcingCriteriaSectionProps) {
  const { autopilotSettings } = useUserSettingsViewModel();

  const applySourcingPreset = (sort: string, isRocket: boolean, min: string, max: string) => {
    setSortCriteria(sort);
    setIsRocketOnly(isRocket);
    setMinPrice(min);
    setMaxPrice(max);
  };

  const loadMySettings = () => {
    if (autopilotSettings) {
      if (autopilotSettings.sortCriteria) setSortCriteria(autopilotSettings.sortCriteria);
      setIsRocketOnly(autopilotSettings.isRocketOnly || false);
      if (autopilotSettings.minPrice !== undefined && autopilotSettings.minPrice !== null) setMinPrice(String(autopilotSettings.minPrice));
      if (autopilotSettings.maxPrice !== undefined && autopilotSettings.maxPrice !== null) setMaxPrice(String(autopilotSettings.maxPrice));
    }
  };

  return (
    <div className="space-y-6">
      {!hideLoadMySettings ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-emerald-400" />
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

      <div>
        <h3 className="text-sm font-semibold text-slate-300 tracking-tight flex-1">아이템 소싱 기준</h3>
        <p className="text-[10.5px] text-slate-500 mt-1 leading-tight">
          * 리뷰 데이터는 쿠팡 API 정책상 제공되지 않아 <strong className="text-slate-400 font-medium">인기/랭킹 기준</strong>으로 우선 소싱됩니다.
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => applySourcingPreset('salePriceAsc', true, '', '50000')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-blue-500/20 hover:text-blue-300 transition-colors">
          인기 로켓 가성비 (5만↓)
        </button>
        <button type="button" onClick={() => applySourcingPreset('salePriceDesc', true, '50000', '')} className="px-2 py-1 text-[11px] font-medium bg-slate-800/50 text-slate-300 rounded border border-slate-700/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors">
          프리미엄 로켓 (5만↑)
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-800/20 rounded-xl border border-slate-800/50">
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">정렬 기준</Label>
          <Select 
            value={sortCriteria} 
            onValueChange={(val: string) => setSortCriteria(val)}
          >
            <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-white cursor-pointer h-11">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              <SelectItem value="salePriceAsc">낮은 가격순</SelectItem>
              <SelectItem value="salePriceDesc">높은 가격순</SelectItem>
              <SelectItem value="RANK" disabled>판매량 랭킹순 (준비중)</SelectItem>
              <SelectItem value="latestAsc" disabled>최신순 (준비중)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex flex-col justify-end pb-3">
          <div className="flex items-center gap-3">
            <Switch 
              id="rocket-switch-sourcing"
              checked={Boolean(isRocketOnly)}
              onCheckedChange={(checked: boolean) => setIsRocketOnly(checked)}
            />
            <Label htmlFor="rocket-switch-sourcing" className="text-slate-300 text-sm cursor-pointer whitespace-nowrap">
              로켓배송 전용 필터 적용
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">최소 가격 필터 (원)</Label>
          <Input 
            type="number"
            placeholder="예: 10000"
            className="bg-slate-950/50 border-slate-800/50 text-white h-11"
            value={minPrice || ''}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">최대 가격 필터 (원)</Label>
          <Input 
            type="number"
            placeholder="예: 150000"
            className="bg-slate-950/50 border-slate-800/50 text-white h-11"
            value={maxPrice || ''}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
