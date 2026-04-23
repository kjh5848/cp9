'use client';

import React from 'react';
import { Input } from '@/shared/ui/input';

/** ColorField Props 타입 */
interface ColorFieldProps {
  /** 필드 라벨 */
  label: string;
  /** 현재 색상값 (hex) */
  value: string;
  /** 색상 변경 콜백 */
  onChange: (v: string) => void;
}

/**
 * [Entities/Design Layer]
 * 색상 입력 필드 — Dumb 컴포넌트
 * 색상 미리보기 스와치 + 텍스트 입력을 제공합니다.
 */
export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer shrink-0 shadow-inner"
        style={{ backgroundColor: value }}
        onClick={() => {
          // 네이티브 색상 선택기 활용
          const input = document.createElement('input');
          input.type = 'color';
          input.value = value;
          input.addEventListener('input', (e) => onChange((e.target as HTMLInputElement).value));
          input.click();
        }}
      />
      <div className="flex-1">
        <label className="text-[11px] text-slate-500 block mb-0.5">{label}</label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300 font-mono"
        />
      </div>
    </div>
  );
}
