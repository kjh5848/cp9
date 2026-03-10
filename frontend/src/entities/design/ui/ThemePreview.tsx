import React from 'react';
import { Eye } from 'lucide-react';
import { ThemeConfig } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { CtaBlockPreview } from './CtaBlockPreview';

/** ThemePreview Props 타입 */
interface ThemePreviewProps {
  /** 현재 테마 설정 */
  config: ThemeConfig;
}

/**
 * [Entities/Design Layer]
 * 전역 디자인 실시간 미리보기 — Dumb 컴포넌트
 * ThemeConfig를 받아 H1/H2/본문/인용구/목록/테이블과 함께
 * 사용자가 등록한 CTA 블록들을 지정된 위치(상단/중단/하단)에 문맥과 함께 자연스럽게 렌더링합니다.
 */
export function ThemePreview({ config }: ThemePreviewProps) {
  const { ctaBlocks } = config;
  const styleMode = config.advanced?.styleMode || 'inline';
  const isTextOnly = styleMode === 'none';

  // 11가지 위치별 CTA 분류
  const ctaArticleStart = (ctaBlocks || []).filter((b) => b.placement.position === 'article-start');
  const ctaBeforeH1 = (ctaBlocks || []).filter((b) => b.placement.position === 'before-h1');
  const ctaAfterH1 = (ctaBlocks || []).filter((b) => b.placement.position === 'after-h1');
  const ctaBeforeH2 = (ctaBlocks || []).filter((b) => b.placement.position === 'before-h2');
  const ctaAfterH2 = (ctaBlocks || []).filter((b) => b.placement.position === 'after-h2');
  const ctaBeforeH3 = (ctaBlocks || []).filter((b) => b.placement.position === 'before-h3');
  const ctaAfterH3 = (ctaBlocks || []).filter((b) => b.placement.position === 'after-h3');
  const ctaFirstP = (ctaBlocks || []).filter((b) => b.placement.position === 'first-p');
  const ctaLastP = (ctaBlocks || []).filter((b) => b.placement.position === 'last-p');
  const ctaRandomP = (ctaBlocks || []).filter((b) => b.placement.position === 'random-p');
  const ctaArticleEnd = (ctaBlocks || []).filter((b) => b.placement.position === 'article-end');

  // CTA 렌더링 헬퍼 함수
  const renderCtas = (blocks: NonNullable<ThemeConfig['ctaBlocks']>, label: string) => {
    if (blocks.length === 0) return null;
    return (
      <div className="my-8 flex flex-col gap-6 relative">
        <div className="absolute -left-3 -top-3 z-10 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-md border border-indigo-500/30">
          [{label}] 영역 CTA ({blocks.length}개)
        </div>
        <div className="p-4 border border-indigo-500/20 rounded-xl bg-indigo-500/5 flex flex-col gap-6 relative mt-2">
          {blocks.map((block) => (
            block.design.layout === 'custom' ? (
              <div key={block.id} className="p-4 bg-slate-900 border border-slate-700 border-dashed rounded flex flex-col items-center justify-center text-slate-400 text-xs min-h-[100px]">
                <span className="mb-2">🛠️ 커스텀 HTML 레이아웃</span>
                <span className="text-[10px] text-slate-500">실제 렌더링은 빌드 후 확인 가능합니다.</span>
              </div>
            ) : (
              <div key={block.id} className="text-slate-200">
                <CtaBlockPreview block={block} previewMode="inline" />
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
      {/* 모드 배지 */}
      {(styleMode === 'none' || styleMode === 'class-only') ? (
        <div className="flex justify-end mb-2">
          {styleMode === 'none' ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-400">📄 텍스트만</span>
          ) : null}
          {styleMode === 'class-only' ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">🏷️ 스킨 활용</span>
          ) : null}
        </div>
      ) : null}

      {/* 스킨 모드 안내 */}
      {styleMode === 'class-only' ? (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 mb-3 text-[11px] text-amber-300/80">
          ⚠️ 실제 스타일은 블로그 스킨/테마에 따라 달라집니다. 아래는 참고용 미리보기입니다.
        </div>
      ) : null}
      {styleMode === 'none' ? (
        <div className="rounded-lg bg-slate-700/30 border border-slate-600/30 p-3 mb-3 text-[11px] text-slate-400">
          📄 스타일 없이 발행됩니다. 아래는 텍스트만 출력한 모습입니다.
        </div>
      ) : null}

      {/* 동적 스타일 인젝션 */}
      {!isTextOnly ? (
        <style dangerouslySetInnerHTML={{
          __html: `
            .theme-preview-container {
              background-color: ${config.article.bgColor === 'transparent' ? '#ffffff' : config.article.bgColor} !important;
              font-family: ${config.article.fontFamily} !important;
              line-height: ${config.article.lineHeight} !important;
              color: ${config.article.textColor} !important;
            }
          `
        }} />
      ) : null}

      {/* 단일 미리보기 영역 (글 + CTA 문맥 렌더링) */}
      <div
        className={cn(
          "theme-preview-container rounded-xl border border-slate-700 p-6 overflow-y-auto max-h-[85vh] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          styleMode === 'class-only' && "opacity-70"
        )}
        style={isTextOnly ? {
          backgroundColor: '#ffffff',
          fontFamily: 'serif',
          lineHeight: '1.8',
          color: '#333',
        } : undefined}
      >
        {renderCtas(ctaArticleStart, '글 최상단')}
        
        {renderCtas(ctaBeforeH1, 'H1 직전')}

        {/* H1 미리보기 */}
        <h1 style={{
          color: config.heading.h1Color,
          fontSize: config.heading.h1FontSize,
          fontWeight: 800,
          borderBottom: `2px solid ${config.heading.h1BorderColor}`,
          paddingBottom: '12px',
          marginBottom: '20px',
          marginTop: '10px',
        }}>
          문서 제목 (가장 큰 제목)
        </h1>

        {renderCtas(ctaAfterH1, 'H1 직후')}
        
        {renderCtas(ctaBeforeH2, 'H2 직전')}

        {/* H2 미리보기 */}
        <h2 style={{
          color: config.heading.h2Color,
          fontSize: config.heading.h2FontSize,
          fontWeight: 700,
          borderLeft: `4px solid ${config.heading.h2BorderColor}`,
          paddingLeft: '12px',
          marginBottom: '16px',
        }}>
          2026년 추천 노트북 완벽 가이드
        </h2>

        {renderCtas(ctaAfterH2, 'H2 직후')}
        
        {renderCtas(ctaFirstP, '가장 처음 P 직전')}

        {/* 첫번째 본문 + 볼드 미리보기 */}
        <p style={{ color: config.article.textColor, marginBottom: '16px' }}>
          올해 출시된 노트북 중에서 <strong style={{ color: config.bold.color, fontWeight: 700 }}>가장 주목할 만한 제품</strong>을 엄선하여 소개합니다.
          성능, 디자인, 가성비를 종합적으로 분석해 <strong style={{ color: config.bold.color, fontWeight: 700 }}>최적의 선택</strong>을 도와드립니다.
        </p>

        {renderCtas(ctaRandomP, '무작위 P (예시)')}

        <p style={{ color: config.article.textColor, marginBottom: '24px' }}>
          특히 인공지능(AI) 프로세서가 탑재된 최신 모델들은 기존 대비 압도적인 배터리 효율과 연산 능력을 보여줍니다. 웹 서핑이나 문서 작업 같은 가벼운 용도부터 무거운 영상 편집 프로젝트까지 무리 없이 소화할 수 있는 강력한 퍼포먼스를 자랑하는, 말 그대로 전천후의 성능을 보여주고 있습니다.
        </p>

        {renderCtas(ctaBeforeH3, 'H3 직전')}

        {/* H3 미리보기 */}
        <h3 style={{
          color: config.heading.h3Color,
          fontSize: config.heading.h3FontSize,
          fontWeight: 600,
          borderBottom: `2px solid ${config.heading.h3BorderColor}`,
          paddingBottom: '8px',
          marginBottom: '12px',
          marginTop: '32px',
        }}>
          1. 핵심 스펙 비교
        </h3>

        {renderCtas(ctaAfterH3, 'H3 직후')}

        <p style={{ color: config.article.textColor, marginBottom: '16px' }}>
          각 제품의 뛰어난 프로세서 성능과 메모리, 그리고 시각적인 만족감을 극대화해주는 혁신적인 디스플레이 등 핵심 사양을 구체적으로 비교 분석해보겠습니다.
        </p>

        {/* 예약된 가상 이미지 영역 */}
        <div style={{ backgroundColor: styleMode === 'none' ? '#f8f9fa' : 'rgba(255, 255, 255, 0.05)', width: '100%', height: '180px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: styleMode === 'none' ? '#adb5bd' : 'rgba(255, 255, 255, 0.3)', fontSize: '13px', marginBottom: '24px', border: `1px dashed ${styleMode === 'none' ? '#dee2e6' : 'rgba(255,255,255,0.1)'}` }}>
          📷 매력적인 디스플레이 화면 (이미지 예시)
        </div>

        {/* 인용구 미리보기 */}
        <blockquote style={{
          borderLeft: `4px solid ${config.blockquote.borderColor}`,
          backgroundColor: config.blockquote.bgColor,
          color: config.blockquote.textColor,
          padding: '16px 20px',
          borderRadius: '0 8px 8px 0',
          margin: '20px 0',
          fontStyle: 'italic',
        }}>
          &ldquo;가격 대비 우수한 성능과 휴대성을 모두 잡고자 한다면, 뛰어난 칩셋이 탑재된 2026년 맥북 에어 모델은 단연코 최고의 선택이자 기준점이 될 것입니다.&rdquo;
        </blockquote>

        <p style={{ color: config.article.textColor, marginBottom: '24px' }}>
          뿐만 아니라 Windows 진영의 윈도우 기반 프리미엄 랩탑 시리즈 또한 NPU(신경망 처리 장치)를 탑재하여 눈에 띄게 발전된 로컬 AI 호환성과 연동성을 제공하고 있어 사용자의 호평을 받고 있습니다.
        </p>

        {/* H2 미리보기 (추가 영역) */}
        <h2 style={{
          color: config.heading.h2Color,
          fontSize: config.heading.h2FontSize,
          fontWeight: 700,
          borderLeft: `4px solid ${config.heading.h2BorderColor}`,
          paddingLeft: '12px',
          marginBottom: '16px',
          marginTop: '40px',
        }}>
          디자인과 휴대성의 중요성
        </h2>

        <p style={{ color: config.article.textColor, marginBottom: '16px' }}>
          노트북을 선택할 때 최고의 깡성능 만큼이나 중요한 것이 바로 <strong style={{ color: config.bold.color, fontWeight: 700 }}>휴대성</strong>과 타이핑의 피로도를 결정짓는 <strong style={{ color: config.bold.color, fontWeight: 700 }}>키보드 타건감</strong>입니다.
        </p>

        <p style={{ color: config.article.textColor, marginBottom: '20px' }}>
          매일 들고 다니며 백팩에 수납해 이동하고 장시간 집중해서 사용해야 하는 기기인 만큼, 두께와 1g의 무게조차도 전체적인 이용자 경험에 미치는 영향은 지대합니다.
        </p>

        {/* 목록 미리보기 */}
        <ul style={{ listStyle: 'none', paddingLeft: '0', marginBottom: '32px', color: config.article.textColor }}>
          {['프로세서: 새로운 아키텍처, 압도적인 전력 대비 퍼포먼스', '메모리: 대용량 고속 LPDDR5 탑재로 멀티태스킹 최적화', '디스플레이: 더 밝고, 더 선명해진 Liquid / OLED 패널 적용', '연결성: Wi-Fi 7 지원 및 Thunderbolt 5 채택 여부'].map((item, i) => (
            <li key={i} style={{ paddingLeft: '20px', marginBottom: '8px', position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 0, top: '2px',
                color: config.list.markerColor, fontWeight: 700, fontSize: '14px',
              }}>•</span>
              {item}
            </li>
          ))}
        </ul>

        {/* 테이블 미리보기 */}
        <h3 style={{
          color: config.heading.h3Color,
          fontSize: config.heading.h3FontSize,
          fontWeight: 600,
          borderBottom: `2px solid ${config.heading.h3BorderColor}`,
          paddingBottom: '8px',
          marginBottom: '16px',
        }}>
          2. 주요 모델별 비교 표
        </h3>

        <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${config.table.borderColor}`, marginBottom: '32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: config.table.headerBg, color: config.table.headerColor }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>모델명</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>공식 가격</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>전문가 평점</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['맥북 에어 초경량 에디션', '1,590,000원', '★★★★★'],
                ['플래그십 갤럭시북 시리즈', '1,290,000원', '★★★★☆'],
                ['초경량 프리미엄 LG 그램', '1,450,000원', '★★★★☆'],
                ['게이밍 브랜드 로그 제피러스', '2,100,000원', '★★★★☆'],
              ].map(([model, price, rating], i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 1 ? config.table.stripeBg : 'transparent', color: config.article.textColor }}>
                  <td style={{ padding: '10px 14px', borderTop: `1px solid ${config.table.borderColor}` }}>{model}</td>
                  <td style={{ padding: '10px 14px', borderTop: `1px solid ${config.table.borderColor}`, fontWeight: 600, color: '#dc2626' }}>{price}</td>
                  <td style={{ padding: '10px 14px', borderTop: `1px solid ${config.table.borderColor}` }}>{rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: config.article.textColor, marginBottom: '24px' }}>
          이 외에도 사용 목적과 예산에 맞춘 다양한 신제품 라인업이 준비되어 있습니다. 성능과 예산의 타협점을 찾는 것이 무엇보다 중요합니다.
        </p>

        {renderCtas(ctaLastP, '마지막 P 직후')}
        
        {renderCtas(ctaArticleEnd, '글 최하단')}

        {/* 최하단 파트너스 문구 */}
        <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginTop: '40px', paddingBottom: '20px' }}>
          ※ 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
        </p>
      </div>
    </div>
  );
}
