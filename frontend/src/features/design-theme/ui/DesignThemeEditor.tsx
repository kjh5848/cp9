'use client';

import React from 'react';
import { Palette, Save, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';

// Entities Layer — Dumb 컴포넌트
import { ColorField } from '@/entities/design/ui/ColorField';
import { ThemeListItem } from '@/entities/design/ui/ThemeListItem';
import { ThemePreview } from '@/entities/design/ui/ThemePreview';

// Features Layer — ViewModel & 상수
import { useDesignViewModel } from '../model/useDesignViewModel';
import { TABS } from '../model/constants';

/**
 * [Features/DesignTheme Layer]
 * 아티클 디자인 테마 에디터 — 스마트 컴포넌트
 * ViewModel에서 상태와 액션을 받아 Entities 컴포넌트에 주입합니다.
 */
export function DesignThemeEditor() {
  const {
    themes, selectedThemeId, themeName, config, activeTab, saving, loading, router,
    actions,
  } = useDesignViewModel();

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
            {selectedThemeId && (
              <>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white" onClick={actions.handleSetDefault}>
                  <Check className="w-4 h-4 mr-1" /> 기본 테마로 설정
                </Button>
                <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={actions.handleDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> 삭제
                </Button>
              </>
            )}
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
                className="bg-slate-900 border-slate-700 text-white"
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
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">H2 대제목</h4>
                  <ColorField label="글자 색상" value={config.heading.h2Color} onChange={v => actions.updateConfig('heading', { h2Color: v })} />
                  <ColorField label="좌측 바 색상" value={config.heading.h2BorderColor} onChange={v => actions.updateConfig('heading', { h2BorderColor: v })} />
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] text-slate-500 block mb-0.5">폰트 크기</label>
                      <Input value={config.heading.h2FontSize} onChange={e => actions.updateConfig('heading', { h2FontSize: e.target.value })} className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
                    </div>
                  </div>
                  <hr className="border-slate-800 my-4" />
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">H3 소제목</h4>
                  <ColorField label="글자 색상" value={config.heading.h3Color} onChange={v => actions.updateConfig('heading', { h3Color: v })} />
                  <ColorField label="하단 밑줄 색상" value={config.heading.h3BorderColor} onChange={v => actions.updateConfig('heading', { h3BorderColor: v })} />
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-500 block mb-0.5">폰트 크기</label>
                    <Input value={config.heading.h3FontSize} onChange={e => actions.updateConfig('heading', { h3FontSize: e.target.value })} className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
                  </div>
                </>
              )}

              {activeTab === 'text' && (
                <>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">본문 스타일</h4>
                  <ColorField label="본문 글자 색상" value={config.article.textColor} onChange={v => actions.updateConfig('article', { textColor: v })} />
                  <ColorField label="볼드 강조 색상" value={config.bold.color} onChange={v => actions.updateConfig('bold', { color: v })} />
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-500 block mb-0.5">줄간격 (line-height)</label>
                    <Input value={config.article.lineHeight} onChange={e => actions.updateConfig('article', { lineHeight: e.target.value })} className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-500 block mb-0.5">폰트 패밀리</label>
                    <Input value={config.article.fontFamily} onChange={e => actions.updateConfig('article', { fontFamily: e.target.value })} className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
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
                <>
                  {/* ── 레이아웃 프리셋 ── */}
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">CTA 레이아웃</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {([
                      { id: 'minimal', label: '미니멀', desc: '텍스트+버튼만', colors: ['transparent', '#2563eb'] },
                      { id: 'card', label: '카드', desc: '박스+이미지+버튼', colors: ['#f8fafc', '#2563eb'] },
                      { id: 'banner', label: '배너', desc: '와이드 배경 CTA', colors: ['#1e293b', '#3b82f6'] },
                      { id: 'gradient', label: '그라데이션', desc: '그라데이션 배경', colors: ['#667eea', '#764ba2'] },
                    ] as const).map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => actions.updateConfig('cta', { layout: preset.id })}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all duration-200',
                          config.cta.layout === preset.id
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

                  {/* ── 버튼 스타일 ── */}
                  <hr className="border-slate-800 my-4" />
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">버튼 스타일</h4>
                  <ColorField label="버튼 색상" value={config.cta.buttonColor} onChange={v => actions.updateConfig('cta', { buttonColor: v })} />
                  <ColorField label="버튼 글자색" value={config.cta.buttonTextColor} onChange={v => actions.updateConfig('cta', { buttonTextColor: v })} />
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-500 block mb-0.5">버튼 둥글기</label>
                    <Input value={config.cta.buttonRadius} onChange={e => actions.updateConfig('cta', { buttonRadius: e.target.value })} className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
                  </div>

                  {/* ── 박스 스타일 ── */}
                  <hr className="border-slate-800 my-4" />
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">박스 스타일</h4>
                  <ColorField label="박스 배경색" value={config.cta.boxBgColor} onChange={v => actions.updateConfig('cta', { boxBgColor: v })} />
                  <ColorField label="박스 테두리색" value={config.cta.boxBorderColor} onChange={v => actions.updateConfig('cta', { boxBorderColor: v })} />
                  <ColorField label="가격 강조 색상" value={config.cta.priceColor} onChange={v => actions.updateConfig('cta', { priceColor: v })} />
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={config.cta.showShadow} onChange={e => actions.updateConfig('cta', { showShadow: e.target.checked })} className="accent-blue-500" />
                      <span className="text-xs text-slate-400">그림자</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={config.cta.showProductImage} onChange={e => actions.updateConfig('cta', { showProductImage: e.target.checked })} className="accent-blue-500" />
                      <span className="text-xs text-slate-400">상품 이미지</span>
                    </label>
                  </div>

                  {/* ── CTA 문구 설정 ── */}
                  <hr className="border-slate-800 my-4" />
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">CTA 문구</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">상단 CTA 버튼 텍스트</label>
                      <Input value={config.cta.headerText} onChange={e => actions.updateConfig('cta', { headerText: e.target.value })} placeholder="쿠팡에서 최저가 확인하기" className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">중간 CTA 버튼 텍스트</label>
                      <Input value={config.cta.midText} onChange={e => actions.updateConfig('cta', { midText: e.target.value })} placeholder="쿠팡에서 가격 확인하기" className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">하단 CTA 버튼 텍스트</label>
                      <Input value={config.cta.footerText} onChange={e => actions.updateConfig('cta', { footerText: e.target.value })} placeholder="쿠팡 최저가 바로가기" className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
                    </div>
                  </div>

                  {/* ── CTA 미리보기 ── */}
                  <hr className="border-slate-800 my-4" />
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">미리보기</h4>
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: config.cta.layout === 'gradient'
                        ? `linear-gradient(135deg, ${config.cta.boxBgColor}, ${config.cta.buttonColor})`
                        : config.cta.layout === 'banner'
                          ? config.cta.boxBgColor
                          : config.cta.layout === 'card'
                            ? config.cta.boxBgColor
                            : 'transparent',
                      border: config.cta.layout !== 'minimal' ? `1px solid ${config.cta.boxBorderColor}` : 'none',
                      boxShadow: config.cta.showShadow ? '0 4px 16px rgba(0,0,0,0.12)' : 'none',
                      padding: config.cta.layout === 'minimal' ? '12px 0' : '20px',
                      textAlign: 'center' as const,
                    }}
                  >
                    {config.cta.showProductImage && config.cta.layout !== 'minimal' && (
                      <div style={{
                        width: 80, height: 80, margin: '0 auto 12px',
                        borderRadius: 12, backgroundColor: '#e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28,
                      }}>
                        📦
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>상품명 예시</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: config.cta.priceColor, marginBottom: 12 }}>29,900원</p>
                    <div
                      style={{
                        display: 'inline-block',
                        background: config.cta.buttonColor,
                        color: config.cta.buttonTextColor,
                        padding: '10px 28px',
                        borderRadius: config.cta.buttonRadius,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {config.cta.headerText || '쿠팡에서 최저가 확인하기'}
                    </div>
                    <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 8 }}>※ 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ══════ 우측: 실시간 미리보기 ══════ */}
          <ThemePreview config={config} />
        </div>
      </div>
    </div>
  );
}
