'use client';

import React from 'react';
import { Palette, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { GlassCard } from '@/shared/ui/GlassCard';
import { ThemeListItem } from '@/entities/design/ui/ThemeListItem';
import { ArticleTheme } from '@/entities/design/model/types';

/* ═══════════════════ 타입 ═══════════════════ */

export interface ThemeSwitcherTheme {
  id: string;
  name: string;
  isDefault: boolean;
  config: string;
  description?: string;
  colors?: { primary: string; secondary?: string };
}

interface ThemeSwitcherProps {
  /** 테마 목록 */
  themes: ThemeSwitcherTheme[];
  /** 현재 적용된 테마 ID */
  activeThemeId?: string | null;
  /** 테마 선택 콜백 (null = 기본 스타일 제거) */
  onSelect: (themeId: string | null) => void;
  /** 테마 목록 로딩 중 */
  loading?: boolean;
  /** 테마 적용 진행 중 */
  applying?: boolean;
}

/* ═══════════════════ 색상 추출 유틸 ═══════════════════ */



/* ═══════════════════ 컴포넌트 ═══════════════════ */

/**
 * [Entities/Design Layer]
 * 테마 스위처 — 테마 목록을 표시하고 선택할 수 있는 순수 시각 컴포넌트.
 * 아티클 상세 페이지 사이드바에서 사용됩니다.
 */
export function ThemeSwitcher({
  themes,
  activeThemeId,
  onSelect,
  loading = false,
  applying = false,
}: ThemeSwitcherProps) {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />테마 로딩 중...
        </div>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide pr-1">
          {/* 저장된 테마 목록 */}
          {themes.map((theme) => (
            <div key={theme.id} className="mb-2">
              <ThemeListItem
                theme={theme as ArticleTheme}
                isSelected={activeThemeId === theme.id}
                onClick={() => onSelect(theme.id)}
                disabled={applying}
              />
            </div>
          ))}

          {applying && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-violet-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />디자인 적용 중...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
