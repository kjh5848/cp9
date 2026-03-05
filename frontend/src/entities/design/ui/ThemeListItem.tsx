import React from 'react';
import { cn } from '@/shared/lib/utils';
import { ArticleTheme } from '../model/types';
import { getThemePreviewColors } from '../model/utils';

/** ThemeListItem Props 타입 */
interface ThemeListItemProps {
  /** 테마 데이터 */
  theme: ArticleTheme;
  /** 현재 선택 여부 */
  isSelected: boolean;
  /** 클릭 콜백 */
  onClick: () => void;
}

/**
 * [Entities/Design Layer]
 * 테마 목록 항목 카드 — Dumb 컴포넌트
 * 테마 이름, 기본 뱃지, 미리보기 컬러 도트를 표시합니다.
 */
export function ThemeListItem({ theme, isSelected, onClick }: ThemeListItemProps) {
  const previewColors = getThemePreviewColors(theme.config);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all duration-200",
        isSelected
          ? "bg-blue-600/15 border-blue-500/50 text-blue-100"
          : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{theme.name}</span>
        {theme.isDefault && (
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">기본</span>
        )}
      </div>
      <div className="flex gap-1 mt-2">
        {previewColors.map((c, i) => (
          <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
        ))}
      </div>
    </button>
  );
}
