import React from 'react';
import { Type, Code, Palette, Lock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { PRESET_THEME_NAMES } from '@/features/design-theme/model/constants';
import { getThemePreviewTokens } from '@/entities/design/model/utils';

export interface ThemeSelectionGroupProps {
  themes?: import('@/entities/design/ui/ThemeSwitcher').ThemeSwitcherTheme[];
  themeId?: string | null;
  setThemeId?: (v: string | null) => void;
  hideTheme?: boolean;
}

export function ThemeSelectionGroup({
  themes,
  themeId,
  setThemeId,
  hideTheme,
}: ThemeSelectionGroupProps) {
  if (hideTheme || !setThemeId || !themes || themes.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-300 tracking-tight">문서 디자인 테마 선택</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {themes.map((theme) => {
          const previewTokens = getThemePreviewTokens(theme.config);
          const isPreset = (PRESET_THEME_NAMES as readonly string[]).includes(theme.name);
          
          let styleMode = 'inline';
          try {
            if (theme.config) {
              const parsedConfig = typeof theme.config === 'string' ? JSON.parse(theme.config) : theme.config;
              styleMode = parsedConfig?.advanced?.styleMode || 'inline';
            }
          } catch {}

          return (
            <button
              key={theme.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setThemeId(theme.id);
              }}
              className={cn(
                "relative p-4 rounded-xl border flex flex-col items-start justify-between gap-3 text-left transition-all duration-300 overflow-hidden group min-h-[100px]",
                themeId === theme.id
                  ? "bg-slate-900 border-indigo-500/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-indigo-500/30"
                  : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/80"
              )}
            >
              {themeId === theme.id && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48ZmlsdGVyIGlkPSJuIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] before:opacity-30" />
              )}
              
              <div className="flex w-full items-center justify-between z-10">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border transition-all shadow-inner",
                    themeId === theme.id 
                      ? "bg-slate-950 border-indigo-500" 
                      : "bg-slate-950/80 border-slate-700/80 group-hover:border-slate-500"
                  )}>
                    <span className={cn(
                      "text-[10px] font-bold",
                      themeId === theme.id ? "text-indigo-400" : "text-slate-500"
                    )}>
                      {theme.name.charAt(0)}
                    </span>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold tracking-tight transition-colors",
                    themeId === theme.id ? "text-indigo-50" : "text-slate-300 group-hover:text-slate-200"
                  )}>
                    {theme.name}
                  </span>
                </div>
                {themeId === theme.id && (
                  <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center animate-in zoom-in fade-in duration-200">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="z-10 w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    {previewTokens.map((token: any, i: number) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white/10 relative group/token"
                        style={{ backgroundColor: token.color }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/token:block z-10 w-max pointer-events-none">
                          <div className="bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                            {token.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative group/mode flex items-center justify-center w-5 h-5 rounded bg-slate-950 border border-slate-800">
                      {styleMode === 'none' ? <Type className="w-3 h-3 text-slate-400" /> : null}
                      {styleMode === 'class-only' ? <Code className="w-3 h-3 text-emerald-400" /> : null}
                      {styleMode === 'inline' ? <Palette className="w-3 h-3 text-blue-400" /> : null}
                      
                      <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/mode:block z-20 w-max pointer-events-none">
                        <div className="bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                          {styleMode === 'none' ? '텍스트 전용' : null}
                          {styleMode === 'class-only' ? '클래스 스킨' : null}
                          {styleMode === 'inline' ? '완성형 디자인' : null}
                        </div>
                      </div>
                    </div>
                    
                    {isPreset && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-950/80 border border-slate-800 relative group/lock">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/lock:block z-20 w-max pointer-events-none">
                          <div className="bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                            기본 테마 (수정 불가)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {theme.isDefault && (
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-500/10 text-indigo-400 mb-1.5 border border-indigo-500/20">
                    기본 테마
                  </span>
                )}
                {theme.description && (
                  <p className="text-[11px] leading-relaxed text-slate-500 flex-1 group-hover:text-slate-400 transition-colors line-clamp-2">
                     {theme.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
