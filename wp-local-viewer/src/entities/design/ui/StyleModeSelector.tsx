'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';

/* ═══════════════════ 타입 ═══════════════════ */

export type StyleMode = 'inline' | 'class-only' | 'none';

interface StyleModeSelectorProps {
  /** 현재 선택된 모드 */
  selectedMode: StyleMode;
  /** 모드 선택 콜백 */
  onSelect: (mode: StyleMode) => void;
}

/** 모드 옵션 정의 — 유저 친화적 언어 + 플랫폼 추천 */
const MODE_OPTIONS: {
  id: StyleMode;
  label: string;
  desc: string;
  emoji: string;
  platforms: string[];
  tip: string;
}[] = [
  {
    id: 'inline',
    label: '완성형 디자인',
    desc: '모든 스타일이 글에 포함됩니다',
    emoji: '🎨',
    platforms: ['티스토리', '네이버', '워드프레스'],
    tip: '어디에 붙여넣어도 동일하게 보여요',
  },
  {
    id: 'class-only',
    label: '내 블로그 스킨 활용',
    desc: '블로그 스킨/테마가 디자인을 담당합니다',
    emoji: '🏷️',
    platforms: ['티스토리 스킨', '워드프레스 테마'],
    tip: 'CSS를 복사해서 블로그에 등록하세요',
  },
  {
    id: 'none',
    label: '텍스트만 발행',
    desc: '순수 텍스트와 이미지만 출력합니다',
    emoji: '📄',
    platforms: ['네이버 블로그', '브런치'],
    tip: '플랫폼 기본 디자인에 맡길 때',
  },
];

/* ═══════════════════ 컴포넌트 ═══════════════════ */

/**
 * [Entities/Design Layer]
 * 스타일 모드 선택기 — 유저 친화적 3가지 발행 모드를 선택하는 컴포넌트.
 * 플랫폼 추천 배지와 사용 팁을 포함합니다.
 */
export function StyleModeSelector({ selectedMode, onSelect }: StyleModeSelectorProps) {
  return (
    <div className="space-y-2">
      {MODE_OPTIONS.map(opt => {
        const isSelected = selectedMode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={cn(
              'w-full p-4 rounded-xl border text-left transition-all duration-200',
              isSelected
                ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            )}
          >
            {/* 상단: 이모지 + 라벨 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{opt.emoji}</span>
              <span className="text-sm font-semibold text-slate-200">{opt.label}</span>
              {isSelected && (
                <span className="ml-auto text-[10px] font-medium text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded">
                  선택됨
                </span>
              )}
            </div>

            {/* 설명 */}
            <p className="text-[11px] text-slate-400 mb-2 ml-7">{opt.desc}</p>

            {/* 플랫폼 배지 + 팁 */}
            <div className="flex items-center gap-1.5 ml-7 flex-wrap">
              {opt.platforms.map(p => (
                <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600/50">
                  {p}
                </span>
              ))}
              <span className="text-[9px] text-slate-500 ml-1">— {opt.tip}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
