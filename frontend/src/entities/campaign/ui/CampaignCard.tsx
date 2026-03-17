import React from 'react';
import { RefreshCw, CheckSquare } from 'lucide-react';
import type { CategoryCampaign } from '../model/types';
import { formatInterval } from '@/shared/lib/interval';

interface CampaignCardProps {
  campaign: CategoryCampaign;
  isSelected: boolean;
  onSelect: (campaign: CategoryCampaign) => void;
  onToggleCheck: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onEdit: (campaign: CategoryCampaign, e: React.MouseEvent) => void;
}

export function CampaignCard({
  campaign,
  isSelected,
  onSelect,
  onToggleCheck,
  onDelete,
  onEdit,
}: CampaignCardProps) {
  const hasTargeting = Boolean(
    campaign.targetAge ||
    campaign.targetGender ||
    campaign.targetPrice ||
    campaign.targetIndustry
  );

  return (
    <div
      onClick={() => onSelect(campaign)}
      className={`p-4 bg-slate-800/40 cursor-pointer rounded-xl border flex flex-col gap-3 relative group transition-all shadow-sm hover:shadow-md ${
        isSelected
          ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/50'
          : 'border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/60'
      }`}
    >
      <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => onToggleCheck(campaign.id, e)}
          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-indigo-500 text-white'
              : 'bg-slate-900 border border-slate-600 text-transparent hover:border-indigo-400'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="absolute top-3 right-3 flex gap-1 z-10">
        <button
          onClick={(e) => onEdit(campaign, e)}
          className="text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 rounded-md p-1 border border-slate-700 hover:bg-slate-800 hover:border-blue-500/50"
          title="수정"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
        </button>
        <button
          onClick={(e) => onDelete(campaign.id, e)}
          className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 rounded-md p-1 border border-slate-700 hover:bg-slate-800 hover:border-red-500/50"
          title="삭제"
        >
          <RefreshCw className="w-3.5 h-3.5 rotate-45" />
        </button>
      </div>
      
      <div
        className="font-bold text-blue-400 mb-1 leading-tight pr-[60px] pl-6 line-clamp-2"
        title={campaign.categoryName}
      >
        {campaign.categoryName}
      </div>

      {hasTargeting ? (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-700/50 pt-2.5">
          {campaign.targetAge ? (
            <span className="px-1.5 py-0.5 bg-slate-700/30 text-slate-400 text-[10px] rounded border border-slate-600/50">
              {campaign.targetAge}
            </span>
          ) : null}
          {campaign.targetGender ? (
            <span className="px-1.5 py-0.5 bg-slate-700/30 text-slate-400 text-[10px] rounded border border-slate-600/50">
              {campaign.targetGender}
            </span>
          ) : null}
          {campaign.targetPrice ? (
            <span className="px-1.5 py-0.5 bg-slate-700/30 text-slate-400 text-[10px] rounded border border-slate-600/50">
              {campaign.targetPrice}
            </span>
          ) : null}
          {campaign.targetIndustry ? (
            <span className="px-1.5 py-0.5 bg-slate-700/30 text-slate-400 text-[10px] rounded border border-slate-600/50">
              {campaign.targetIndustry}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 flex flex-col gap-2 mt-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium tracking-tight">발행 설정</span>
          <span className="text-xs text-slate-300 font-semibold">
            {campaign.batchSize}개 / {formatInterval(campaign.intervalHours)} 마다
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium tracking-tight">페르소나</span>
          <span
            className="text-xs text-slate-300 truncate max-w-[120px]"
            title={campaign.persona?.name || '미설정'}
          >
            {campaign.persona?.name || '미설정'}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 mt-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-xs text-slate-400 font-medium">대기열 현황</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
            {campaign._count?.queues || 0}개 대기
          </span>
        </div>
      </div>
    </div>
  );
}
