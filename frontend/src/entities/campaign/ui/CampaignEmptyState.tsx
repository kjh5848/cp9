import React from 'react';
import { Archive } from 'lucide-react';

export function CampaignEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-slate-800/20 rounded-xl border border-slate-700/50">
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <Archive className="w-8 h-8 text-slate-500" />
      </div>
      <p className="text-slate-400 font-medium mb-1">등록된 캠페인이 없습니다</p>
      <p className="text-slate-500 text-sm max-w-sm text-center">우측 상단의 '새 캠페인 등록' 버튼을 눌러 정기적으로 발행할 제품 카테고리나 키워드를 등록해보세요.</p>
    </div>
  );
}
