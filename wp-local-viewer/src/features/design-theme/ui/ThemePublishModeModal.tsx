import React from 'react';
import { Settings2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { StyleModeSelector } from '@/entities/design/ui/StyleModeSelector';
import type { StyleMode } from '@/entities/design/ui/StyleModeSelector';
import type { ThemeConfig } from '@/entities/design/model/types';

interface ThemePublishModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ThemeConfig;
  updateConfig: <K extends keyof ThemeConfig>(section: K, updates: Partial<ThemeConfig[K]>) => void;
  isPresetTheme: boolean;
  saving: boolean;
  onSave: () => void;
}

export function ThemePublishModeModal({
  isOpen,
  onClose,
  config,
  updateConfig,
  isPresetTheme,
  saving,
  onSave
}: ThemePublishModeModalProps) {
  if (!isOpen) return null;

  const generateCss = () => {
    const pfx = config.advanced.classPrefix || 'cp9-';
    const h = config.heading;
    const b = config.bold;
    const bq = config.blockquote;
    const li = config.list;
    const tb = config.table;
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
  };

  return (
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
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          <div>
            <StyleModeSelector
              selectedMode={config.advanced.styleMode}
              onSelect={(mode: StyleMode) => updateConfig('advanced', { styleMode: mode })}
            />
          </div>

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

          {config.advanced.styleMode === 'class-only' && (
            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
              <h4 className="text-sm font-semibold text-amber-500 mb-2">📋 블로그 스킨에 등록할 CSS</h4>
              <p className="text-[11px] text-amber-500/70 mb-3">CSS를 복사하여 블로그 디자인(스킨)의 CSS 항목에 붙여넣으세요.</p>

              <div className="relative">
                <textarea
                  readOnly
                  value={generateCss()}
                  className="w-full h-48 bg-slate-950 border border-amber-500/30 rounded-lg p-3 text-[11px] text-amber-300 font-mono resize-y focus:outline-none scrollbar-hide"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateCss());
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
                    onChange={e => updateConfig('advanced', { classPrefix: e.target.value })}
                    placeholder="cp9-"
                    className="h-8 text-xs bg-slate-900 border-amber-500/30 text-amber-100 w-32 font-mono placeholder:text-amber-500/30"
                  />
                  <span className="text-[11px] text-amber-500/50">예: {config.advanced.classPrefix}heading-h2</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6 pt-4 border-t border-slate-800">
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">테마 커스텀 CSS</h4>
              <p className="text-[11px] text-slate-500 mb-3">직접 작성한 CSS 코드가 생성되는 글의 &lt;style&gt; 내부 최하단에 삽입되어 덮어씌워집니다.</p>
              <textarea
                value={config.advanced.customCss}
                onChange={e => updateConfig('advanced', { customCss: e.target.value })}
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
                  onChange={e => updateConfig('advanced', { customHtmlHeader: e.target.value })}
                  placeholder={`<!-- 상단 배너 등의 HTML 템플릿 -->`}
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-orange-400 font-mono resize-y placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors scrollbar-hide"
                  spellCheck={false}
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">커스텀 HTML — 하단 삽입</h4>
                <textarea
                  value={config.advanced.customHtmlFooter}
                  onChange={e => updateConfig('advanced', { customHtmlFooter: e.target.value })}
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
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white">
            닫기
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={() => {
            onSave();
            onClose();
          }} disabled={saving}>
            <Save className="w-4 h-4 mr-1" /> {isPresetTheme ? (saving ? '저장...' : '모드 저장') : '완료 후 저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}
