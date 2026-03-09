import React from 'react';
import { cn } from '@/shared/lib/utils';
import { ArticleTheme, ThemeConfig } from '../model/types';
import { getThemePreviewTokens } from '../model/utils';
import { PRESET_THEME_NAMES } from '@/features/design-theme/model/constants';
import { Lock, Type, Code, Palette } from 'lucide-react';

/** ThemeListItem Props 타입 */
interface ThemeListItemProps {
  /** 테마 데이터 */
  theme: ArticleTheme;
  /** 현재 선택 여부 */
  isSelected: boolean;
  /** 클릭 콜백 */
  onClick: () => void;
  /** 에디터에서 진행 중인 설정 객체 (isSelected일 때 최우선 사용) */
  liveConfig?: ThemeConfig;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * [Entities/Design Layer]
 * 테마 목록 항목 카드 — Dumb 컴포넌트
 * 테마 이름, 기본 뱃지, 미리보기 컬러 도트를 표시합니다.
 */
export function ThemeListItem({ theme, isSelected, onClick, liveConfig, disabled }: ThemeListItemProps) {
  const targetData = isSelected && liveConfig ? liveConfig : theme.config;
  const previewTokens = getThemePreviewTokens(targetData);
  const isPreset = (PRESET_THEME_NAMES as readonly string[]).includes(theme.name);
  
  let styleMode = 'inline';
  if (typeof targetData === 'string') {
    try {
      styleMode = JSON.parse(targetData)?.advanced?.styleMode || 'inline';
    } catch {}
  } else {
    styleMode = targetData?.advanced?.styleMode || 'inline';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all duration-200",
        isSelected
          ? "bg-blue-600/15 border-blue-500/50 text-blue-100"
          : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{theme.name}</span>
        {theme.isDefault && (
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">기본</span>
        )}
      </div>
      <div className="flex items-center mt-2 justify-between">
        <div className="flex gap-1.5">
          {previewTokens.map((token, i) => (
            <div 
              key={i} 
              className="w-4 h-4 rounded-full border border-white/10 relative group" 
              style={{ backgroundColor: token.color }} 
            >
              {/* 툴팁 */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 w-max pointer-events-none">
                <div className="bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                  {token.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {/* 발행 모드 아이콘 */}
          <div className="relative group flex items-center justify-center w-5 h-5 rounded bg-slate-800 border border-slate-700/50">
            {styleMode === 'none' && <Type className="w-3 h-3 text-slate-400" />}
            {styleMode === 'class-only' && <Code className="w-3 h-3 text-emerald-400" />}
            {styleMode === 'inline' && <Palette className="w-3 h-3 text-blue-400" />}
            
            <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:block z-10 w-max pointer-events-none">
              <div className="bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                {styleMode === 'none' && '텍스트 전용 (스타일 없음)'}
                {styleMode === 'class-only' && '클래스 스킨 전용'}
                {styleMode === 'inline' && '완성형 디자인'}
              </div>
            </div>
          </div>
          
          {/* 프리셋 테마 잠금 아이콘 */}
          {isPreset && (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700/50 relative group">
              <Lock className="w-3 h-3 text-slate-400" />
              <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:block z-10 w-max pointer-events-none">
                <div className="bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                  기본 테마 (색상 등 디자인 변경 불가)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
