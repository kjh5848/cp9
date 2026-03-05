'use client';

import React from 'react';
import { Palette, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { GlassCard } from '@/shared/ui/GlassCard';

/* ═══════════════════ 타입 ═══════════════════ */

export interface ThemeSwitcherTheme {
  id: string;
  name: string;
  isDefault: boolean;
  config: string;
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

/** 테마 config JSON에서 미리보기용 색상 4개를 추출합니다. */
function extractPreviewColors(configJson: string): string[] {
  try {
    const cfg = JSON.parse(configJson);
    return [
      cfg.heading?.h2BorderColor || '#2563eb',
      cfg.cta?.buttonColor || '#2563eb',
      cfg.blockquote?.borderColor || '#2563eb',
      cfg.table?.headerBg || '#1e293b',
    ];
  } catch {
    return ['#2563eb', '#2563eb', '#2563eb', '#1e293b'];
  }
}

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
    <GlassCard className="p-6 space-y-4">
      <h3 className="font-bold flex items-center gap-2">
        <Palette className="w-4 h-4 text-violet-400" />디자인 변경
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />테마 로딩 중...
        </div>
      ) : (
        <div className="space-y-2">
          {/* 기본 (스타일 없음) */}
          <button
            onClick={() => onSelect(null)}
            disabled={applying}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group',
              !activeThemeId
                ? 'bg-slate-700/50 border-slate-500 text-slate-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-slate-500 hover:bg-white/10'
            )}
          >
            <div className="flex gap-1">
              {['#94a3b8', '#64748b', '#475569', '#334155'].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-xs font-medium flex-1">기본 (스타일 없음)</span>
          </button>

          {/* 저장된 테마 목록 */}
          {themes.map((theme) => {
            const previewColors = extractPreviewColors(theme.config);
            const isActive = activeThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelect(theme.id)}
                disabled={applying}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group',
                  isActive
                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-200'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-slate-500 hover:bg-white/10'
                )}
              >
                <div className="flex gap-1">
                  {previewColors.map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-xs font-medium flex-1">{theme.name}</span>
                {theme.isDefault && (
                  <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full">기본</span>
                )}
              </button>
            );
          })}

          {applying && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-violet-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />디자인 적용 중...
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
