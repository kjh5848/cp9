'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/* ═══════════════════ 타입 ═══════════════════ */

interface FontSizeStepperProps {
  /** 필드 라벨 */
  label: string;
  /** 현재 값 (예: "24px", "1.8") */
  value: string;
  /** 값 변경 콜백 */
  onChange: (v: string) => void;
  /** 최소값 (기본: 10) */
  min?: number;
  /** 최대값 (기본: 60) */
  max?: number;
  /** 증감 단위 (기본: 1) */
  step?: number;
  /** 단위 문자열 (기본: "px") */
  unit?: string;
}

/* ═══════════════════ 유틸 ═══════════════════ */

/** 값 문자열에서 숫자를 파싱합니다 */
function parseValue(value: string, unit: string): number {
  const num = parseFloat(value.replace(unit, ''));
  return isNaN(num) ? 0 : num;
}

/* ═══════════════════ 컴포넌트 ═══════════════════ */

/**
 * [Entities/Design Layer]
 * 폰트 크기 스테퍼 — Up/Down 버튼으로 값을 조절하는 순수 시각 컴포넌트.
 * 디자인 에디터에서 폰트 크기, 줄간격 등의 입력에 사용됩니다.
 */
export function FontSizeStepper({
  label,
  value,
  onChange,
  min = 10,
  max = 60,
  step = 1,
  unit = 'px',
}: FontSizeStepperProps) {
  const numValue = parseValue(value, unit);

  // 증가 핸들러
  const handleIncrement = () => {
    const next = Math.min(numValue + step, max);
    onChange(`${next}${unit}`);
  };

  // 감소 핸들러
  const handleDecrement = () => {
    const next = Math.max(numValue - step, min);
    onChange(`${next}${unit}`);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <label className="text-[11px] text-slate-500 block mb-0.5">{label}</label>
        <div className="flex items-center gap-1">
          {/* 값 표시 */}
          <div className="h-7 flex-1 flex items-center px-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-300 font-mono tabular-nums">
            {numValue}{unit}
          </div>

          {/* Up/Down 버튼 */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={numValue >= max}
              className="h-3.5 w-6 flex items-center justify-center rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={numValue <= min}
              className="h-3.5 w-6 flex items-center justify-center rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
