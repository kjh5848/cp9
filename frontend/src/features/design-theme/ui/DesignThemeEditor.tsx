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

/**
 * [Features/DesignTheme Layer]
 * 아티클 디자인 테마 에디터 — 스마트 컴포넌트
 * ViewModel에서 상태와 액션을 받아 Entities 컴포넌트에 주입합니다.
 */
export function DesignThemeEditor() {
  const {
    themes, selectedThemeId, themeName, config, activeTab, saving, loading, showDeleteConfirm, isPublishModeOpen, isPresetTheme, router,
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
            {selectedThemeId && !isPresetTheme && (
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
            {selectedThemeId && isPresetTheme && (
              <>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white" onClick={actions.handleDuplicate} title="프리셋 복제 후 수정 가능">
                  <Copy className="w-4 h-4 mr-1" /> 복제해서 편집
                </Button>
                <span className="text-[10px] px-2 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  🔒 프리셋 (읽기 전용)
                </span>
              </>
            )}
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white" onClick={actions.handleReset} title="기본값으로 리셋">
              <RotateCcw className="w-4 h-4" />
            </Button>
            {!isPresetTheme && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white" onClick={actions.handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> {saving ? '저장 중...' : '저장'}
              </Button>
            )}
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-300">다중 CTA 블록 설정</h4>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        if ((config.ctaBlocks?.length || 0) >= 10) {
                          toast.error('CTA 블록은 최대 10개까지만 추가할 수 있습니다.');
                          return;
                        }
                        const newBlock = {
                          id: Date.now().toString(),
                          name: `새 CTA 블록 ${(config.ctaBlocks?.length || 0) + 1}`,
                          placement: { position: 'random-p' as const, frequency: '1' as const },
                          design: {
                            layout: 'card' as const, buttonColor: '#2563eb', buttonTextColor: '#ffffff', buttonRadius: '12px',
                            boxBgColor: '#f8fafc', boxBorderColor: '#e2e8f0', text: '쿠팡에서 가격 확인하기',
                            headline: '', showShadow: true, showProductImage: true, priceColor: '#e53935', showUrgency: false,
                            customHtml: '',
                          }
                        };
                        actions.updateConfig('ctaBlocks', [...(config.ctaBlocks || []), newBlock]);
                      }}
                      className="h-7 text-xs bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20"
                    >
                      <Plus className="w-3 h-3 mr-1"/> CTA 추가
                    </Button>
                  </div>

                  {(!config.ctaBlocks || config.ctaBlocks.length === 0) && (
                    <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
                      <p className="text-xs text-slate-400">등록된 CTA 블록이 없습니다.<br/>우측 상단의 추가 버튼을 눌러 CTA를 배치하세요.</p>
                    </div>
                  )}

                  <Accordion type="multiple" className="space-y-2">
                    {(config.ctaBlocks || []).map((block) => {
                      const updateBlock = (updates: any) => {
                        actions.updateConfig('ctaBlocks', (config.ctaBlocks || []).map(b => b.id === block.id ? { ...b, ...updates } : b));
                      };
                      const updatePlacement = (updates: any) => updateBlock({ placement: { ...block.placement, ...updates } });
                      const updateDesign = (updates: any) => updateBlock({ design: { ...block.design, ...updates } });
                      
                      return (
                      <AccordionItem key={block.id} value={block.id} className="border border-slate-700 last:border last:border-slate-700 rounded-lg bg-slate-800/30 overflow-hidden px-3">
                        <AccordionTrigger className="hover:no-underline py-3 px-1 group">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-slate-200">{block.name}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">{block.placement.position} ({block.placement.frequency})</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                              <div 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if ((config.ctaBlocks?.length || 0) >= 10) {
                                    toast.error('CTA 블록은 최대 10개까지만 추가할 수 있습니다.');
                                    return;
                                  }
                                  const dupBlock = JSON.parse(JSON.stringify(block));
                                  dupBlock.id = Date.now().toString();
                                  dupBlock.name = `${block.name} (복사본)`;
                                  const newBlocks = [...(config.ctaBlocks || [])];
                                  const idx = newBlocks.findIndex(b => b.id === block.id);
                                  newBlocks.splice(idx + 1, 0, dupBlock);
                                  actions.updateConfig('ctaBlocks', newBlocks);
                                }} 
                                className="h-7 w-7 flex items-center justify-center rounded-md cursor-pointer text-white hover:bg-white/10 transition-colors"
                                title="설정 모두 복제"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </div>
                              <div 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  actions.updateConfig('ctaBlocks', (config.ctaBlocks || []).filter(b => b.id !== block.id));
                                }} 
                                className="h-7 w-7 flex items-center justify-center rounded-md cursor-pointer text-white hover:bg-white/10 hover:text-red-400 transition-colors" 
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 space-y-4 px-1 border-t border-slate-700/50">
                          {/* 블록명 영역 */}
                          <div>
                            <label className="text-[11px] text-slate-500 block mb-0.5">블록 이름 (관리용)</label>
                            <Input value={block.name} onChange={e => updateBlock({ name: e.target.value })} className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300 w-full" />
                          </div>

                          
                          <hr className="border-slate-800" />
                          
                          {/* 노출 위치 설정 */}
                          <h5 className="text-[12px] font-semibold text-slate-300">노출 위치 (Placement)</h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-slate-500 block mb-0.5">삽입 위치</label>
                              <select value={block.placement.position} onChange={e => updatePlacement({ position: e.target.value })} className="h-7 w-full px-2 text-xs bg-slate-900 border border-slate-700 text-slate-300 rounded focus:outline-none focus:border-blue-500">
                                <option value="article-start">글 최상단 (가장 처음)</option>
                                <option value="before-h1">H1(큰 제목) 직전</option>
                                <option value="after-h1">H1(큰 제목) 직후</option>
                                <option value="before-h2">H2(대제목) 직전</option>
                                <option value="after-h2">H2(대제목) 직후</option>
                                <option value="before-h3">H3(소제목) 직전</option>
                                <option value="after-h3">H3(소제목) 직후</option>
                                <option value="first-p">가장 처음 P(문단) 직전</option>
                                <option value="last-p">가장 마지막 P(문단) 직후</option>
                                <option value="random-p">문단(P) 무작위 삽입</option>
                                <option value="article-end">글 최하단 (가장 마지막)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-500 block mb-0.5">출현 빈도</label>
                              <select value={block.placement.frequency} onChange={e => updatePlacement({ frequency: e.target.value })} className="h-7 w-full px-2 text-xs bg-slate-900 border border-slate-700 text-slate-300 rounded focus:outline-none focus:border-blue-500">
                                <option value="all">조건 맞는 모든 곳에</option>
                                <option value="1">최대 1개만 노출</option>
                                <option value="2">최대 2개 노출</option>
                                <option value="3">최대 3개 노출</option>
                              </select>
                            </div>
                          </div>

                          <hr className="border-slate-800" />

                          {/* 레이아웃 & 디자인 */}
                          <h5 className="text-[12px] font-semibold text-slate-300">디자인 & 내용 (Design)</h5>
                          <CtaLayoutSelector selectedLayout={block.design.layout} onSelect={(layout: CtaLayout) => updateDesign({ layout })} />
                          
                          {/* 개별 CTA 스니펫 미리보기 (위치 상향 조정) */}
                          <div className="mt-4 mb-4 pb-4 border-b border-slate-700/50">
                            <h5 className="text-[12px] font-semibold text-slate-300 mb-2">실시간 스타일 미리보기</h5>
                            {block.design.layout === 'custom' ? (
                              <div className="p-3 bg-slate-900 border border-slate-700/50 rounded flex items-center justify-center text-slate-500 text-xs text-center min-h-[60px]">
                                커스텀 렌더링은 에디터 미리보기를 확인해 주세요.
                              </div>
                            ) : (
                              <div className="sticky top-2 z-10 shadow-xl shadow-black/20 ring-1 ring-white/5 rounded-md overflow-hidden">
                                <CtaBlockPreview block={block} />
                              </div>
                            )}
                          </div>
                          
                          {block.design.layout === 'custom' ? (
                            <div className="space-y-3 mt-3">
                              <div>
                                <label className="text-[11px] text-slate-400 block mb-1">
                                  커스텀 HTML 템플릿 작성
                                  <span className="text-[10px] text-slate-500 block">치환자: {'{{productName}}'}, {'{{productPrice}}'}, {'{{productImage}}'}, {'{{buyUrl}}'}</span>
                                </label>
                                <textarea
                                  value={block.design.customHtml || ''}
                                  onChange={e => updateDesign({ customHtml: e.target.value })}
                                  placeholder={`<div class="my-custom-btn">\n  <a href="{{buyUrl}}">{{productName}} 구매하기</a>\n</div>`}
                                  className="w-full h-40 p-3 text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 rounded focus:border-blue-500 focus:outline-none resize-y whitespace-pre"
                                  spellCheck={false}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 mt-3">
                              <div>
                                <label className="text-[11px] text-slate-500 block mb-0.5">상단 헤드라인 (선택)</label>
                                <Input value={block.design.headline || ''} onChange={e => updateDesign({ headline: e.target.value })} placeholder="지금 바로 구매하세요!" className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
                              </div>
                              <div>
                                <label className="text-[11px] text-slate-500 block mb-0.5">버튼 텍스트</label>
                                <Input value={block.design.text} onChange={e => updateDesign({ text: e.target.value })} placeholder="최저가 확인하기" className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300" />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-x-2 gap-y-3 pt-2">
                                <ColorField label="버튼 색상" value={block.design.buttonColor} onChange={v => updateDesign({ buttonColor: v })} />
                                <ColorField label="버튼 글자색" value={block.design.buttonTextColor} onChange={v => updateDesign({ buttonTextColor: v })} />
                                <ColorField label="박스 배경색" value={block.design.boxBgColor} onChange={v => updateDesign({ boxBgColor: v })} />
                                <ColorField label="박스 테두리색" value={block.design.boxBorderColor} onChange={v => updateDesign({ boxBorderColor: v })} />
                                <ColorField label="가격 색상" value={block.design.priceColor} onChange={v => updateDesign({ priceColor: v })} />
                                <FontSizeStepper label="버튼 둥글기" value={block.design.buttonRadius} onChange={v => updateDesign({ buttonRadius: v })} min={0} max={50} />
                              </div>

                              <div className="flex flex-wrap gap-4 mt-2">
                                {!['minimal', 'neon', 'coupon', 'modern', 'custom'].includes(block.design.layout) && (
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={block.design.showShadow} onChange={e => updateDesign({ showShadow: e.target.checked })} className="accent-blue-500" />
                                    <span className="text-xs text-slate-400">그림자 효과</span>
                                  </label>
                                )}
                                {!['minimal', 'modern', 'custom'].includes(block.design.layout) && (
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={block.design.showProductImage} onChange={e => updateDesign({ showProductImage: e.target.checked })} className="accent-blue-500" />
                                    <span className="text-xs text-slate-400">상품 이미지 스니펫</span>
                                  </label>
                                )}
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={block.design.showUrgency} onChange={e => updateDesign({ showUrgency: e.target.checked })} className="accent-blue-500" />
                                  <span className="text-xs text-slate-400">긴급성 문구</span>
                                </label>
                              </div>
                            </div>

                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )})}
                  </Accordion>
                </div>
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
      {isPublishModeOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">발행 모드 설정</h3>
                  <p className="text-xs text-slate-400">블로그에 글이 발행될 때 스타일을 어떻게 적용할지 설정합니다.</p>
                </div>
              </div>
              <button onClick={() => actions.setPublishModeOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              <div>
                <StyleModeSelector
                  selectedMode={config.advanced.styleMode}
                  onSelect={(mode: StyleMode) => actions.updateConfig('advanced', { styleMode: mode })}
                />
              </div>

              {/* ── 모드별 코드 출력 미리보기 ── */}
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">출력 코드 미리보기</h4>
                <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap">
                    {config.advanced.styleMode === 'inline' && (
                      <code className="text-emerald-400">{`<!-- 완성형 디자인: 인라인 스타일 포함 -->
<style type="text/css">
  .entry-content h1 {
    color: ${config.heading.h1Color};
    font-size: ${config.heading.h1FontSize};
    border-bottom: 2px solid ${config.heading.h1BorderColor};
  }
  .entry-content h2 {
    color: ${config.heading.h2Color};
    font-size: ${config.heading.h2FontSize};
    border-left: 4px solid ${config.heading.h2BorderColor};
  }
  /* ... 테마 CSS 전체 ... */
</style>

<h1 style="color:${config.heading.h1Color};
  font-size:${config.heading.h1FontSize};
  font-weight:800;
  border-bottom:2px solid ${config.heading.h1BorderColor};
  padding-bottom:12px;
  margin:40px 0 20px;">
  문서 제목
</h1>
<h2 style="color:${config.heading.h2Color};
  font-size:${config.heading.h2FontSize};
  border-left:4px solid ${config.heading.h2BorderColor};
  padding-left:12px;">
  상품 제목
</h2>
<p style="text-align:justify;color:${config.article.textColor};">
  본문 텍스트...
</p>`}</code>
                    )}
                    {config.advanced.styleMode === 'class-only' && (
                      <code className="text-amber-400">{`<!-- 스킨 활용: 클래스만 출력 -->
<h1 class="${config.advanced.classPrefix}heading-h1">
  문서 제목
</h1>
<h2 class="${config.advanced.classPrefix}heading-h2">
  상품 제목
</h2>
<p class="${config.advanced.classPrefix}paragraph">
  본문 텍스트...
</p>
<div class="${config.advanced.classPrefix}cta ${config.advanced.classPrefix}cta--header">
  <a class="${config.advanced.classPrefix}cta__button">구매하기</a>
</div>

<!-- 👆 스타일은 블로그 스킨 CSS에서 정의 -->
<!-- 👇 아래 CSS를 블로그에 등록하세요 -->`}</code>
                    )}
                    {config.advanced.styleMode === 'none' && (
                      <code className="text-slate-400">{`<!-- 텍스트만: 스타일 코드 없음 -->
<h2>상품 제목</h2>
<p>본문 텍스트...</p>
<blockquote>인용문...</blockquote>
<ul>
  <li>목록 아이템</li>
</ul>

<!-- 디자인 코드 없이 깔끔한 텍스트만 발행 -->`}</code>
                    )}
                  </pre>
                </div>
              </div>

              {/* ── class-only 모드: CSS 출력 + 복사 + 접두어 설정 ── */}
              {config.advanced.styleMode === 'class-only' && (
                <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-500 mb-2">📋 블로그 스킨에 등록할 CSS</h4>
                  <p className="text-[11px] text-amber-500/70 mb-3">CSS를 복사하여 블로그 디자인(스킨)의 CSS 항목에 붙여넣으세요.</p>

                  <div className="relative">
                    <textarea
                      readOnly
                      value={(() => {
                        const pfx = config.advanced.classPrefix || 'cp9-';
                        const h = config.heading;
                        const b = config.bold;
                        const bq = config.blockquote;
                        const li = config.list;
                        const tb = config.table;
                        const cta = config.cta;
                        const art = config.article;
                        
                        return `/* CP9 블로그 테마 스킨 적용용 CSS */
.${pfx}article {
  font-family: ${art.fontFamily};
  line-height: ${art.lineHeight};
  color: ${art.textColor};
  ${art.bgColor && art.bgColor !== 'transparent' ? `background-color: ${art.bgColor};` : ''}
}
.${pfx}paragraph {
  text-align: justify;
  color: ${art.textColor};
}
.${pfx}heading-h1 {
  color: ${h.h1Color};
  font-size: ${h.h1FontSize};
  font-weight: 800;
  border-bottom: 2px solid ${h.h1BorderColor};
  padding-bottom: 12px;
  margin: 40px 0 20px;
}
.${pfx}heading-h2 {
  color: ${h.h2Color};
  font-size: ${h.h2FontSize};
  font-weight: 700;
  border-left: 4px solid ${h.h2BorderColor};
  padding-left: 12px;
  margin: 32px 0 16px;
}
.${pfx}heading-h3 {
  color: ${h.h3Color};
  font-size: ${h.h3FontSize};
  font-weight: 600;
  border-bottom: 2px solid ${h.h3BorderColor};
  padding-bottom: 8px;
  margin: 28px 0 12px;
}
.${pfx}bold {
  color: ${b.color};
  font-weight: 700;
}
.${pfx}blockquote {
  border-left: 4px solid ${bq.borderColor};
  background-color: ${bq.bgColor};
  color: ${bq.textColor};
  padding: 16px 20px;
  border-radius: 0 8px 8px 0;
  margin: 20px 0;
  font-style: italic;
}
.${pfx}list {
  padding-left: 20px;
}
.${pfx}list-item::marker {
  color: ${li.markerColor};
}
.${pfx}table {
  border-collapse: collapse;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${tb.borderColor};
}
.${pfx}table-th {
  background-color: ${tb.headerBg};
  color: ${tb.headerColor};
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
}
.${pfx}table-td {
  padding: 10px 14px;
  border-top: 1px solid ${tb.borderColor};
  color: ${art.textColor};
}
.${pfx}table-tr-even {
  background-color: ${tb.stripeBg};
}`;
                      })()}
                      className="w-full h-48 bg-slate-950 border border-amber-500/30 rounded-lg p-3 text-[11px] text-amber-300 font-mono resize-y focus:outline-none scrollbar-hide"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const pfx = config.advanced.classPrefix || 'cp9-';
                        const h = config.heading;
                        const b = config.bold;
                        const bq = config.blockquote;
                        const li = config.list;
                        const tb = config.table;
                        const art = config.article;
                        
                        const css = `/* CP9 블로그 테마 스킨 적용용 CSS */
.${pfx}article {
  font-family: ${art.fontFamily};
  line-height: ${art.lineHeight};
  color: ${art.textColor};
  ${art.bgColor && art.bgColor !== 'transparent' ? `background-color: ${art.bgColor};` : ''}
}
.${pfx}paragraph {
  text-align: justify;
  color: ${art.textColor};
}
.${pfx}heading-h1 {
  color: ${h.h1Color};
  font-size: ${h.h1FontSize};
  font-weight: 800;
  border-bottom: 2px solid ${h.h1BorderColor};
  padding-bottom: 12px;
  margin: 40px 0 20px;
}
.${pfx}heading-h2 {
  color: ${h.h2Color};
  font-size: ${h.h2FontSize};
  font-weight: 700;
  border-left: 4px solid ${h.h2BorderColor};
  padding-left: 12px;
  margin: 32px 0 16px;
}
.${pfx}heading-h3 {
  color: ${h.h3Color};
  font-size: ${h.h3FontSize};
  font-weight: 600;
  border-bottom: 2px solid ${h.h3BorderColor};
  padding-bottom: 8px;
  margin: 28px 0 12px;
}
.${pfx}bold {
  color: ${b.color};
  font-weight: 700;
}
.${pfx}blockquote {
  border-left: 4px solid ${bq.borderColor};
  background-color: ${bq.bgColor};
  color: ${bq.textColor};
  padding: 16px 20px;
  border-radius: 0 8px 8px 0;
  margin: 20px 0;
  font-style: italic;
}
.${pfx}list {
  padding-left: 20px;
}
.${pfx}list-item::marker {
  color: ${li.markerColor};
}
.${pfx}table {
  border-collapse: collapse;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${tb.borderColor};
}
.${pfx}table-th {
  background-color: ${tb.headerBg};
  color: ${tb.headerColor};
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
}
.${pfx}table-td {
  padding: 10px 14px;
  border-top: 1px solid ${tb.borderColor};
  color: ${art.textColor};
}
.${pfx}table-tr-even {
  background-color: ${tb.stripeBg};
}`;
                        navigator.clipboard.writeText(css);
                        toast.success('전체 CSS가 클립보드에 복사되었습니다');
                      }}
                      className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                    >
                      📋 전체 복사
                    </button>
                  </div>

                  <div className="mt-4 border-t border-amber-500/10 pt-4">
                    <label className="text-[11px] font-bold text-amber-500 block mb-1">CSS 클래스 접두어 변경</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={config.advanced.classPrefix}
                        onChange={e => actions.updateConfig('advanced', { classPrefix: e.target.value })}
                        placeholder="cp9-"
                        className="h-8 text-xs bg-slate-900 border-amber-500/30 text-amber-100 w-32 font-mono placeholder:text-amber-500/30"
                      />
                      <span className="text-[11px] text-amber-500/50">예: {config.advanced.classPrefix}heading-h2</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 커스텀 HTML & CSS ── */}
              <div className="space-y-6 pt-4 border-t border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">테마 커스텀 CSS</h4>
                  <p className="text-[11px] text-slate-500 mb-3">직접 작성한 CSS 코드가 생성되는 글의 &lt;style&gt; 내부 최하단에 삽입되어 덮어씌워집니다.</p>
                  <textarea
                    value={config.advanced.customCss}
                    onChange={e => actions.updateConfig('advanced', { customCss: e.target.value })}
                    placeholder={`/* 예시: 커스텀 CSS */\n.entry-content h2 {\n  font-size: 28px !important;\n}`}
                    className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-green-400 font-mono resize-y placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors scrollbar-hide"
                    spellCheck={false}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">커스텀 HTML — 상단 삽입</h4>
                    <textarea
                      value={config.advanced.customHtmlHeader}
                      onChange={e => actions.updateConfig('advanced', { customHtmlHeader: e.target.value })}
                      placeholder={`<!-- 상단 배너 등의 HTML 템플릿 -->`}
                      className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-orange-400 font-mono resize-y placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors scrollbar-hide"
                      spellCheck={false}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">커스텀 HTML — 하단 삽입</h4>
                    <textarea
                      value={config.advanced.customHtmlFooter}
                      onChange={e => actions.updateConfig('advanced', { customHtmlFooter: e.target.value })}
                      placeholder={`<!-- 하단 서명 등의 HTML 템플릿 -->`}
                      className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-orange-400 font-mono resize-y placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors scrollbar-hide"
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-5 border-t border-slate-800 flex justify-end gap-2 bg-slate-900/80 rounded-b-2xl">
              <span className="text-xs text-slate-500 mr-auto my-auto flex items-center gap-1">
                {isPresetTheme ? (
                  <>🔒 프리셋 테마의 경우 <strong>'모드 설정'</strong>만 변경/저장됩니다.</>
                ) : (
                  <>상단의 <strong>저장</strong> 버튼을 눌러야 최종 반영됩니다.</>
                )}
              </span>
              <Button variant="outline" onClick={() => actions.setPublishModeOpen(false)} className="border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white">
                닫기
              </Button>
              {isPresetTheme ? (
                <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={() => {
                  actions.handleSave();
                  actions.setPublishModeOpen(false);
                }} disabled={saving}>
                  <Save className="w-4 h-4 mr-1" /> {saving ? '저장...' : '모드 저장'}
                </Button>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={() => {
                  actions.handleSave();
                  actions.setPublishModeOpen(false);
                }} disabled={saving}>
                  <Save className="w-4 h-4 mr-1" /> 완료 후 저장
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
