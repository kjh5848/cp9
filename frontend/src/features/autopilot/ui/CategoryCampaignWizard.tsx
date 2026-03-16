import React, { useState } from 'react';
import { useCategoryCampaignViewModel } from '../model/useCategoryCampaignViewModel';
import type { CategoryCampaign } from '@/entities/campaign/model/types';
import { Plus, Archive, CheckSquare, Square, Trash2 } from 'lucide-react';
import { CampaignCard } from '@/entities/campaign/ui/CampaignCard';
import { CampaignEmptyState } from '@/entities/campaign/ui/CampaignEmptyState';
import { CampaignCreateModal } from './CampaignCreateModal';
import { CampaignDetailModal } from './CampaignDetailModal';

interface Props {
  personaId: string;
  themeId: string | null;
  intervalHours: string;
  publishTimes?: string;
  publishDays?: string;
  jitterMinutes?: string;
  dailyCap?: string;
  activeTimeStart: string;
  activeTimeEnd: string;
  publishTargets?: any[];
  configNode: React.ReactNode;
  quickPresetNode: React.ReactNode;
  publishTargetNode?: React.ReactNode;
  depth1: string;
  setDepth1: (v: string) => void;
  depth2: string;
  setDepth2: (v: string) => void;
  depth3: string;
  setDepth3: (v: string) => void;
  customCategory: string;
  setCustomCategory: (v: string | ((prev: string) => string)) => void;
}

export function CategoryCampaignWizard(props: Props) {
  const { campaigns, isLoading, createCampaign, deleteCampaign, deleteCampaigns } = useCategoryCampaignViewModel();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CategoryCampaign | null>(null);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());

  const handleToggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedCampaignIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCampaignIds(newSet);
  };

  const handleToggleSelectAll = () => {
    if (selectedCampaignIds.size === campaigns.length) {
      setSelectedCampaignIds(new Set());
    } else {
      setSelectedCampaignIds(new Set(campaigns.map((c) => c.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`${selectedCampaignIds.size}개의 캠페인을 정말 삭제하시겠습니까?`)) return;
    const success = await deleteCampaigns(Array.from(selectedCampaignIds));
    if (success) {
      setSelectedCampaignIds(new Set());
    }
  };

  const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteCampaign(id);
  };

  return (
    <div className="space-y-6">
      {/* 캠페인 리스트 섹션 */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
              <Archive className="w-4 h-4 text-emerald-400" /> 운영 중인 캠페인 목록
            </h3>
            {campaigns.length > 0 ? (
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  {selectedCampaignIds.size === campaigns.length ? (
                    <CheckSquare className="w-3.5 h-3.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  전체선택
                </button>
                {selectedCampaignIds.size > 0 ? (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 rounded border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    선택 삭제 ({selectedCampaignIds.size})
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            새 캠페인 등록
          </button>
        </div>

        {campaigns.length === 0 ? (
          <CampaignEmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {campaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                isSelected={selectedCampaignIds.has(camp.id)}
                onSelect={(c) => setSelectedCampaign(c)}
                onToggleCheck={handleToggleCheck}
                onDelete={handleDeleteSingle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Feature 모달 맵핑 */}
      <CampaignCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isLoading={isLoading}
        onCreate={createCampaign}
        {...props}
      />

      <CampaignDetailModal
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </div>
  );
}
