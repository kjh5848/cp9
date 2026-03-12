import React, { useState } from 'react';
import { useCategoryCampaignViewModel } from '../model/useCategoryCampaignViewModel';
import { AutopilotQueueItem } from '@/entities/autopilot/model/types';
import { CheckSquare, Square, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  queue: AutopilotQueueItem[];
  onApproveSuccess: () => void; // queue refetch trigger
}

export function ApprovalInbox({ queue, onApproveSuccess }: Props) {
  const { approveQueues, isLoading } = useCategoryCampaignViewModel();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const waitingItems = queue.filter(q => q.status === 'WAITING_APPROVAL');

  const toggleAll = () => {
    if (selectedIds.size === waitingItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(waitingItems.map(item => item.id)));
    }
  };

  const toggleItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleApprove = async () => {
    if (selectedIds.size === 0) return;
    const success = await approveQueues(Array.from(selectedIds));
    if (success) {
      alert(`${selectedIds.size}개 항목이 승인되어 발행 스케줄에 편입되었습니다.`);
      setSelectedIds(new Set());
      onApproveSuccess();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            승인 대기함 (Inbox)
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-semibold">
              {waitingItems.length}
            </span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            오토파일럿 AI가 제안한 키워드 기획을 검토하고 승인하세요.
          </p>
        </div>
        
        <button
          onClick={handleApprove}
          disabled={selectedIds.size === 0 || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          선택 승인 ({selectedIds.size})
        </button>
      </div>

      {waitingItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/20 border border-slate-800/50 rounded-2xl flex flex-col items-center gap-3">
          <CheckCircle className="w-10 h-10 text-slate-500" />
          <p className="text-slate-400 text-sm">현재 대기 중인 승인 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700/50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll} className="text-slate-400 hover:text-white transition-colors">
                    {selectedIds.size === waitingItems.length && waitingItems.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">키워드 (AI 기획안)</th>
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3">생성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {waitingItems.map(item => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${selectedIds.has(item.id) ? 'bg-blue-900/10' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <td className="px-4 py-4">
                    {selectedIds.has(item.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-200">
                    {item.keyword}
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">
                      {item.articleType === 'single' ? '단일' : item.articleType === 'compare' ? '비교' : item.articleType === 'curation' ? '큐레이션' : '자동'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
