import React from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';

import { ColorField } from '@/entities/design/ui/ColorField';
import { CtaLayoutSelector } from '@/entities/design/ui/CtaLayoutSelector';
import { CtaBlockPreview } from '@/entities/design/ui/CtaBlockPreview';
import { FontSizeStepper } from '@/entities/design/ui/FontSizeStepper';
import type { CtaLayout } from '@/entities/design/ui/CtaLayoutSelector';
import type { ThemeConfig } from '@/entities/design/model/types';

interface ThemeCtaSettingsTabProps {
  config: ThemeConfig;
  updateConfig: <K extends keyof ThemeConfig>(section: K, updates: Partial<ThemeConfig[K]>) => void;
}

export function ThemeCtaSettingsTab({ config, updateConfig }: ThemeCtaSettingsTabProps) {
  return (
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
            updateConfig('ctaBlocks', [...(config.ctaBlocks || []), newBlock]);
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
            updateConfig('ctaBlocks', (config.ctaBlocks || []).map((b: any) => b.id === block.id ? { ...b, ...updates } : b));
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
                      const idx = newBlocks.findIndex((b: any) => b.id === block.id);
                      newBlocks.splice(idx + 1, 0, dupBlock);
                      updateConfig('ctaBlocks', newBlocks);
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
                      updateConfig('ctaBlocks', (config.ctaBlocks || []).filter((b: any) => b.id !== block.id));
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
  );
}
