import React, { useState } from 'react';
import { useCategoryCampaignViewModel } from '../model/useCategoryCampaignViewModel';
import { Loader2, Plus, RefreshCw, Archive } from 'lucide-react';

interface Props {
  personaId: string;
  themeId: string | null;
  intervalHours: string;
  activeTimeStart: string;
  activeTimeEnd: string;
  configNode: React.ReactNode;
  quickPresetNode: React.ReactNode;
}

export function CategoryCampaignWizard({
  personaId,
  themeId,
  intervalHours,
  activeTimeStart,
  activeTimeEnd,
  configNode,
  quickPresetNode
}: Props) {
  const { createCampaign, isLoading, campaigns, deleteCampaign, fetchCampaigns } = useCategoryCampaignViewModel();
  const [categoryName, setCategoryName] = useState('');
  const [batchSize, setBatchSize] = useState(15);

  React.useEffect(() => {
    fetchCampaigns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!categoryName) return alert('카테고리명을 입력해주세요.');
    
    // config 항목들 가져와서 전송
    await createCampaign({
      categoryName,
      personaId,
      themeId,
      intervalHours,
      activeTimeStart,
      activeTimeEnd,
      batchSize,
      isAutoApprove: false,
    });
    setCategoryName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 bg-slate-800/40 p-5 rounded-xl border border-slate-700/50">
        <h3 className="text-lg font-bold text-slate-200">새 카테고리 캠페인 생성</h3>
        <p className="text-sm text-slate-400">
          "전자기기", "건강식품" 등의 카테고리를 입력하고 하단에서 배치 사이즈를 조절하세요.
          해당 분야로 AI가 부족한 스케줄 큐를 주기적으로 채워 넣습니다.
        </p>
        
        <div className="flex items-center gap-3 mt-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="카테고리명 (예: 캠핑용품, 주방가전)"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <div className="flex flex-col w-32">
            <span className="text-xs text-slate-500 mb-1">배치 생성 수</span>
            <input
              type="number"
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="py-4 border-t border-slate-800/50 mt-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-slate-300">공통 스케줄 및 디자인 설정</h4>
            {quickPresetNode}
          </div>
          {configNode}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleCreate}
            disabled={isLoading || !categoryName}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-500 hover:to-indigo-500 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            캠페인 등록
          </button>
        </div>
      </div>

      <div className="pt-6">
        <h3 className="text-md font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Archive className="w-4 h-4 text-emerald-400" /> 운영 중인 캠페인 목록
        </h3>
        {campaigns.length === 0 ? (
           <div className="text-center py-10 bg-slate-900/30 rounded-xl border border-slate-800/50">
             <p className="text-slate-500 text-sm">등록된 카테고리 캠페인이 없습니다.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col gap-2 relative group">
                <button
                  onClick={() => deleteCampaign(camp.id)}
                  className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="삭제"
                >
                  <RefreshCw className="w-4 h-4 rotate-45" /> {/* Delete Icon placeholder */}
                </button>
                <div className="font-bold text-blue-400">{camp.categoryName}</div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>배치: {camp.batchSize}개</span>
                  <span>주기: {camp.intervalHours}시간</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>페르소나: {camp.persona?.name || '미설정'}</span>
                  <span className="text-purple-400 font-semibold text-right">대기열: {camp._count?.queues || 0}개</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
