'use client';

import React from 'react';
import { Palette, Save, Plus, Trash2, Check, ArrowLeft, Copy, Download, Upload, RotateCcw, Settings2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';

// Entities Layer — Dumb 컴포넌트
import { ColorField } from '@/entities/design/ui/ColorField';
import { ThemeListItem } from '@/entities/design/ui/ThemeListItem';
import { ThemePreview } from '@/entities/design/ui/ThemePreview';
import { CtaLayoutSelector } from '@/entities/design/ui/CtaLayoutSelector';
import { CtaBlockPreview } from '@/entities/design/ui/CtaBlockPreview';
import { FontSizeStepper } from '@/entities/design/ui/FontSizeStepper';
import { StyleModeSelector } from '@/entities/design/ui/StyleModeSelector';
import type { CtaLayout } from '@/entities/design/ui/CtaLayoutSelector';
import type { StyleMode } from '@/entities/design/ui/StyleModeSelector';

// Features Layer — ViewModel & 상수
import { useDesignViewModel } from '../model/useDesignViewModel';
import { TABS } from '../model/constants';
import { useLeaveConfirm } from '@/shared/lib/hooks/useLeaveConfirm';
import { ThemePublishModeModal } from './ThemePublishModeModal';
import { ThemeCtaSettingsTab } from './tabs/ThemeCtaSettingsTab';

/**
 * [Features/DesignTheme Layer]
 * 아티클 디자인 테마 에디터 — 스마트 컴포넌트
 * ViewModel에서 상태와 액션을 받아 Entities 컴포넌트에 주입합니다.
 */
export function DesignThemeEditor() {
  const {
    themes, selectedThemeId, themeName, config, activeTab, saving, loading, showDeleteConfirm, isPublishModeOpen, isPresetTheme, isDirty, router,
    actions,
  } = useDesignViewModel();

  useLeaveConfirm(isDirty);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="animate-pulse">테마 로딩중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Palette className="w-6 h-6 text-blue-400" />
                아티클 디자인 설정
              </h1>
              <p className="text-sm text-slate-500 mt-1">글 생성 시 적용될 CSS 디자인을 설정합니다</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 유틸리티 버튼 */}
            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" onClick={() => actions.setPublishModeOpen(true)}>
              <Settings2 className="w-4 h-4 mr-1" /> 발행 모드
            </Button>
            <div className="w-px h-4 bg-slate-800 mx-1 border-r border-slate-800" />
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white" onClick={actions.handleImport} title="JSON 가져오기">
              <Upload className="w-4 h-4 mr-1" /> 가져오기
            </Button>
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white" onClick={actions.handleExport} title="JSON 내보내기">
              <Download className="w-4 h-4 mr-1" /> 내보내기
            </Button>
            {selectedThemeId && (
              <>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white" onClick={actions.handleDuplicate} title="테마 복제">
                  <Copy className="w-4 h-4 mr-1" /> 복제
                </Button>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white" onClick={actions.handleSetDefault}>
                  <Check className="w-4 h-4 mr-1" /> 기본 테마로 설정
                </Button>
                <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={actions.handleDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> 삭제
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white" onClick={actions.handleReset} title="기본값으로 리셋">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white" onClick={actions.handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-1" /> {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-[280px_1fr_1fr] gap-6">
          {/* ══════ 좌측: 테마 목록 ══════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">테마 목록</h3>
              <button onClick={actions.handleNewTheme} className="text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {themes.map(theme => (
                <ThemeListItem
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedThemeId === theme.id}
                  onClick={() => actions.selectTheme(theme)}
                  liveConfig={config}
                />
              ))}
            </div>
          </div>

          {/* ══════ 중앙: 설정 패널 ══════ */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            {/* 테마 이름 */}
            <div className="mb-5">
              <label className="text-xs text-slate-500 mb-1.5 block">테마 이름</label>
              <Input
                value={themeName}
                onChange={(e) => actions.setThemeName(e.target.value)}
                placeholder="예: 깔끔한 블루"
                className="bg-slate-900 border-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPresetTheme}
              />
            </div>

            {/* 탭 */}
            <div className="flex gap-1 mb-5 bg-slate-800/50 rounded-lg p-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => actions.setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors",
                    activeTab === tab.id
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 설정 내용 */}
            <div className="space-y-4">
              {activeTab === 'heading' && (
                <>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">H1 가장 큰 제목</h4>
                  <ColorField label="글자 색상" value={config.heading.h1Color} onChange={v => actions.updateConfig('heading', { h1Color: v })} />
                  <ColorField label="하단 밑줄 색상" value={config.heading.h1BorderColor} onChange={v => actions.updateConfig('heading', { h1BorderColor: v })} />
                  <FontSizeStepper label="폰트 크기" value={config.heading.h1FontSize} onChange={v => actions.updateConfig('heading', { h1FontSize: v })} min={18} max={56} />
                  <hr className="border-slate-800 my-4" />
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">H2 대제목</h4>
                  <ColorField label="글자 색상" value={config.heading.h2Color} onChange={v => actions.updateConfig('heading', { h2Color: v })} />
                  <ColorField label="좌측 바 색상" value={config.heading.h2BorderColor} onChange={v => actions.updateConfig('heading', { h2BorderColor: v })} />
                  <FontSizeStepper label="폰트 크기" value={config.heading.h2FontSize} onChange={v => actions.updateConfig('heading', { h2FontSize: v })} min={14} max={48} />
                  <hr className="border-slate-800 my-4" />
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">H3 소제목</h4>
                  <ColorField label="글자 색상" value={config.heading.h3Color} onChange={v => actions.updateConfig('heading', { h3Color: v })} />
                  <ColorField label="하단 밑줄 색상" value={config.heading.h3BorderColor} onChange={v => actions.updateConfig('heading', { h3BorderColor: v })} />
                  <FontSizeStepper label="폰트 크기" value={config.heading.h3FontSize} onChange={v => actions.updateConfig('heading', { h3FontSize: v })} min={12} max={36} />
                </>
              )}

              {activeTab === 'text' && (
                <>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">본문 스타일</h4>
                  <ColorField label="본문 글자 색상" value={config.article.textColor} onChange={v => actions.updateConfig('article', { textColor: v })} />
                  <ColorField label="볼드 강조 색상" value={config.bold.color} onChange={v => actions.updateConfig('bold', { color: v })} />
                  <FontSizeStepper label="줄간격 (line-height)" value={config.article.lineHeight} onChange={v => actions.updateConfig('article', { lineHeight: v })} min={1} max={3} step={0.1} unit="" />
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-500 block mb-0.5">폰트 패밀리</label>
                    <select
                      value={config.article.fontFamily}
                      onChange={e => actions.updateConfig('article', { fontFamily: e.target.value })}
                      className="h-7 w-full px-2 text-xs bg-slate-900 border border-slate-700 text-slate-300 rounded focus:outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif">Pretendard (추천)</option>
                      <option value="'Noto Sans KR', sans-serif">Noto Sans KR (구글 고딕)</option>
                      <option value="'Nanum Gothic', sans-serif">나눔고딕 (네이버)</option>
                      <option value="'Nanum Myeongjo', serif">나눔명조 (네이버)</option>
                      <option value="'Gmarket Sans', sans-serif">지마켓 산스 (Gmarket)</option>
                      <option value="'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif">기본 고딕 (애플/맑은고딕)</option>
                      <option value="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif">시스템 기본 폰트</option>
                    </select>
                  </div>
                  <ColorField label="배경 색상" value={config.article.bgColor} onChange={v => actions.updateConfig('article', { bgColor: v })} />
                </>
              )}

              {activeTab === 'blockquote' && (
                <>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">인용구 스타일</h4>
                  <ColorField label="좌측 바 색상" value={config.blockquote.borderColor} onChange={v => actions.updateConfig('blockquote', { borderColor: v })} />
                  <ColorField label="배경 색상" value={config.blockquote.bgColor} onChange={v => actions.updateConfig('blockquote', { bgColor: v })} />
                  <ColorField label="글자 색상" value={config.blockquote.textColor} onChange={v => actions.updateConfig('blockquote', { textColor: v })} />
                </>
              )}

              {activeTab === 'list' && (
                <>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">목록 스타일</h4>
                  <ColorField label="마커(불릿) 색상" value={config.list.markerColor} onChange={v => actions.updateConfig('list', { markerColor: v })} />
                </>
              )}

              {activeTab === 'table' && (
                <>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">테이블 스타일</h4>
                  <ColorField label="헤더 배경색" value={config.table.headerBg} onChange={v => actions.updateConfig('table', { headerBg: v })} />
                  <ColorField label="헤더 글자색" value={config.table.headerColor} onChange={v => actions.updateConfig('table', { headerColor: v })} />
                  <ColorField label="스트라이프 배경색" value={config.table.stripeBg} onChange={v => actions.updateConfig('table', { stripeBg: v })} />
                  <ColorField label="테두리 색상" value={config.table.borderColor} onChange={v => actions.updateConfig('table', { borderColor: v })} />
                </>
              )}

              {activeTab === 'cta' && (
                <ThemeCtaSettingsTab config={config} updateConfig={actions.updateConfig} />
              )}
            </div>
          </div>

          {/* ══════ 우측: 실시간 미리보기 ══════ */}
          <ThemePreview config={config} />
        </div>
      </div>

      {/* ══════ 삭제 확인 모달 ══════ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[380px] shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">테마 삭제</h3>
                <p className="text-[11px] text-slate-500">이 작업은 되돌릴 수 없습니다</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              <span className="font-semibold text-slate-300">&ldquo;{themeName}&rdquo;</span> 테마를 삭제하시겠습니까?
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={actions.cancelDelete} className="border-slate-600 text-slate-400 hover:text-slate-200">
                취소
              </Button>
              <Button size="sm" onClick={actions.confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ 발행 모드 설정 모달 ══════ */}
      <ThemePublishModeModal
        isOpen={isPublishModeOpen}
        onClose={() => actions.setPublishModeOpen(false)}
        config={config}
        updateConfig={actions.updateConfig}
        isPresetTheme={isPresetTheme}
        saving={saving}
        onSave={actions.handleSave}
      />
    </div>
  );
}
