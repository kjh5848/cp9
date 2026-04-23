import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Archive } from 'lucide-react';
import type { CategoryCampaign } from '@/entities/campaign/model/types';
import { formatInterval } from '@/shared/lib/interval';

interface CampaignDetailModalProps {
  campaign: CategoryCampaign | null;
  onClose: () => void;
}

export function CampaignDetailModal({ campaign, onClose }: CampaignDetailModalProps) {
  if (!campaign) return null;

  let enabledTargets: any[] = [];
  try {
    if (campaign.publishTargets) {
      const parsedTargets = JSON.parse(campaign.publishTargets);
      enabledTargets = parsedTargets.filter((t: any) => t.enabled);
    }
  } catch (e) {
    // ignore parse error
  }

  return (
    <Dialog open={!!campaign} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700/50 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Archive className="w-5 h-5 text-emerald-400" />
            캠페인 상세 설정 정보
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1 font-medium">캠페인 키워드 / 카테고리</div>
              <div className="font-bold text-slate-200 text-lg">{campaign.categoryName}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/50">
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium">등록 일시</div>
                <div className="text-sm font-semibold text-slate-300">
                  {new Date(campaign.createdAt).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium">1회 보충당 생성 수</div>
                <div className="text-sm font-semibold text-blue-400">{campaign.batchSize}개</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/50">
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium">발행 주기 (간격)</div>
                <div className="text-sm font-semibold text-blue-400">
                  {formatInterval(campaign.intervalHours)} 마다 순차 발행
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/50">
              <div className="text-xs text-slate-500 mb-1 font-medium">적용된 페르소나</div>
              <div className="text-sm text-slate-300">
                {campaign.persona?.name || '기본 (미설정)'}
              </div>
            </div>

            {(campaign.targetAge ||
              campaign.targetGender ||
              campaign.targetPrice ||
              campaign.targetIndustry) ? (
              <div className="pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 mb-2 font-medium">타겟팅 정보</div>
                <div className="flex flex-wrap gap-2">
                  {campaign.targetAge ? (
                    <span className="px-2 py-1 bg-slate-700/30 text-slate-300 text-xs rounded border border-slate-600/50">
                      {campaign.targetAge}
                    </span>
                  ) : null}
                  {campaign.targetGender ? (
                    <span className="px-2 py-1 bg-slate-700/30 text-slate-300 text-xs rounded border border-slate-600/50">
                      {campaign.targetGender}
                    </span>
                  ) : null}
                  {campaign.targetPrice ? (
                    <span className="px-2 py-1 bg-slate-700/30 text-slate-300 text-xs rounded border border-slate-600/50">
                      {campaign.targetPrice}
                    </span>
                  ) : null}
                  {campaign.targetIndustry ? (
                    <span className="px-2 py-1 bg-slate-700/30 text-slate-300 text-xs rounded border border-slate-600/50">
                      {campaign.targetIndustry}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            {campaign.activeTimeStart !== null &&
            campaign.activeTimeEnd !== null &&
            campaign.activeTimeStart !== undefined ? (
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/50">
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-medium">활성 시작 시간</div>
                  <div className="text-sm text-slate-300">
                    {Number(campaign.activeTimeStart) === -1
                      ? '제한없음'
                      : `${campaign.activeTimeStart}시`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-medium">활성 종료 시간</div>
                  <div className="text-sm text-slate-300">
                    {Number(campaign.activeTimeEnd) === -1
                      ? '제한없음'
                      : `${campaign.activeTimeEnd}시`}
                  </div>
                </div>
              </div>
            ) : null}

            {enabledTargets.length > 0 ? (
              <div className="pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 mb-2 font-medium">연동된 플랫폼 (자동 발행)</div>
                <div className="flex flex-wrap gap-2">
                  {enabledTargets.map((t: any, i: number) => {
                    const nameMap: Record<string, string> = {
                      wordpress: 'WordPress',
                      tistory: 'Tistory',
                    };
                    const displayName = nameMap[t.platform] || t.platform;
                    return (
                      <span
                        key={i}
                        className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20 font-medium"
                      >
                        {displayName}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center">
              <div className="text-xs text-slate-500 font-medium">현재 자동화 대기열</div>
              <div className="text-sm font-bold px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
                {campaign._count?.queues || 0}개 대기 중
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors border border-slate-700/50"
            >
              닫기
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
