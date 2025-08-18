'use client';

import { ViewMode } from '../types';
import { AnimatedButton } from '@/shared/components/advanced-ui';
import { Grid3x3, Layers, Table, FileText } from 'lucide-react';

interface ViewSwitcherProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}

/**
 * 뷰 전환 컴포넌트
 * 갤러리, 카드, 테이블, 블로그 뷰를 전환하는 버튼 그룹
 */
export default function ViewSwitcher({ current, onChange }: ViewSwitcherProps) {
  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'gallery', icon: <Grid3x3 className="w-4 h-4" />, label: '갤러리' },
    { mode: 'card', icon: <Layers className="w-4 h-4" />, label: '카드' },
    { mode: 'table', icon: <Table className="w-4 h-4" />, label: '테이블' },
    { mode: 'blog', icon: <FileText className="w-4 h-4" />, label: '블로그' }
  ];

  return (
    <div className="flex items-center justify-center gap-2 p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
      {views.map((view) => (
        <AnimatedButton
          key={view.mode}
          variant={current === view.mode ? 'gradient' : 'outline'}
          size="sm"
          onClick={() => onChange(view.mode)}
          className="flex items-center gap-2 min-w-[100px]"
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </AnimatedButton>
      ))}
    </div>
  );
}