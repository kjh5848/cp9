'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';

/* ═══════════════════ 타입 ═══════════════════ */

export type CtaLayout = 'minimal' | 'card' | 'banner' | 'gradient' | 'outline' | 'shadow' | 'neon' | 'coupon' | 'modern' | 'luxury' | 'custom';

/** 레이아웃 프리셋 정의 */
const CTA_LAYOUT_PRESETS = [
  { id: 'minimal' as const, label: '미니멀', desc: '텍스트+버튼만', colors: ['transparent', '#2563eb'] },
  { id: 'card' as const, label: '카드', desc: '기본형(테두리)', colors: ['#f8fafc', '#2563eb'] },
  { id: 'banner' as const, label: '배너', desc: '좌측 포인트 바', colors: ['#1e293b', '#3b82f6'] },
  { id: 'gradient' as const, label: '그라데이션', desc: '화려한 컬러 배경', colors: ['#667eea', '#764ba2'] },
  { id: 'outline' as const, label: '아웃라인', desc: '얇고 깔끔한 외곽선', colors: ['#ffffff', '#2563eb'] },
  { id: 'shadow' as const, label: '섀도우', desc: '깊이감 있는 그림자', colors: ['#ffffff', '#2563eb'] },
  { id: 'neon' as const, label: '다크 네온', desc: '다크 배경+글로우', colors: ['#0f172a', '#06b6d4'] },
  { id: 'coupon' as const, label: '쿠폰형', desc: '점선 테두리/할인', colors: ['#fffbeb', '#f59e0b'] },
  { id: 'modern' as const, label: '모던 라인', desc: '상하 구분선 엣지', colors: ['#fafafa', '#0f172a'] },
  { id: 'luxury' as const, label: '럭셔리 다크', desc: '고급형 진한 배경', colors: ['#171717', '#d4af37'] },
  { id: 'custom' as const, label: '커스텀', desc: '직접 HTML 작성', colors: ['#334155', '#94a3b8'] },
] as const;

interface CtaLayoutSelectorProps {
  /** 현재 선택된 레이아웃 */
  selectedLayout: CtaLayout;
  /** 레이아웃 선택 콜백 */
  onSelect: (layout: CtaLayout) => void;
}

/* ═══════════════════ 컴포넌트 ═══════════════════ */

/**
 * [Entities/Design Layer]
 * CTA 레이아웃 선택기 — 4가지 CTA 레이아웃 프리셋을 선택하는 순수 시각 컴포넌트.
 * 디자인 에디터 CTA 탭에서 사용됩니다.
 */
export function CtaLayoutSelector({ selectedLayout, onSelect }: CtaLayoutSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CTA_LAYOUT_PRESETS.map(preset => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset.id)}
          className={cn(
            'p-3 rounded-xl border text-left transition-all duration-200',
            selectedLayout === preset.id
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          )}
        >
          <div className="flex gap-1.5 mb-1.5">
            {preset.colors.map((c, i) => (
              <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
            ))}
          </div>
          <p className="text-xs font-medium text-slate-200">{preset.label}</p>
          <p className="text-[10px] text-slate-500">{preset.desc}</p>
        </button>
      ))}
    </div>
  );
}
