import React from 'react';
import { Eye } from 'lucide-react';
import { ThemeConfig } from '../model/types';

/** ThemePreview Props 타입 */
interface ThemePreviewProps {
  /** 현재 테마 설정 */
  config: ThemeConfig;
}

/**
 * [Entities/Design Layer]
 * 아티클 디자인 실시간 미리보기 — Dumb 컴포넌트
 * ThemeConfig를 받아 H2/H3/본문/인용구/목록/테이블/CTA를 렌더링합니다.
 */
export function ThemePreview({ config }: ThemePreviewProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-300">미리보기</h3>
      </div>

      {/* 미리보기 영역 */}
      <div
        className="rounded-xl border border-slate-700 p-6 overflow-y-auto max-h-[70vh]"
        style={{
          backgroundColor: config.article.bgColor === 'transparent' ? '#ffffff' : config.article.bgColor,
          fontFamily: config.article.fontFamily,
          lineHeight: config.article.lineHeight,
          color: config.article.textColor,
        }}
      >
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

        {/* 본문 + 볼드 미리보기 */}
        <p style={{ color: config.article.textColor, marginBottom: '16px' }}>
          올해 출시된 노트북 중에서 <strong style={{ color: config.bold.color, fontWeight: 700 }}>가장 주목할 만한 제품</strong>을 엄선하여 소개합니다.
          성능, 디자인, 가성비를 종합적으로 분석해 <strong style={{ color: config.bold.color, fontWeight: 700 }}>최적의 선택</strong>을 도와드립니다.
        </p>

        {/* H3 미리보기 */}
        <h3 style={{
          color: config.heading.h3Color,
          fontSize: config.heading.h3FontSize,
          fontWeight: 600,
          borderBottom: `2px solid ${config.heading.h3BorderColor}`,
          paddingBottom: '8px',
          marginBottom: '12px',
          marginTop: '24px',
        }}>
          1. 핵심 스펙 비교
        </h3>

        <p style={{ marginBottom: '16px' }}>
          각 제품의 프로세서, 메모리, 디스플레이 등 핵심 사양을 비교해보겠습니다.
        </p>

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
          &ldquo;가격 대비 성능을 고려한다면, M3 칩 탑재 맥북 에어가 2026년 최고의 선택입니다.&rdquo;
        </blockquote>

        {/* 목록 미리보기 */}
        <ul style={{ listStyle: 'none', paddingLeft: '0', marginBottom: '16px' }}>
          {['프로세서: Apple M3 / Intel Core Ultra 7', '메모리: 16GB / 32GB LPDDR5', '디스플레이: 15.3" Liquid Retina'].map((item, i) => (
            <li key={i} style={{ paddingLeft: '20px', marginBottom: '6px', position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 0, top: '2px',
                color: config.list.markerColor, fontWeight: 700, fontSize: '14px',
              }}>•</span>
              {item}
            </li>
          ))}
        </ul>

        {/* 테이블 미리보기 */}
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${config.table.borderColor}`, marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: config.table.headerBg, color: config.table.headerColor }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>모델</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>가격</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>평점</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['맥북 에어 M3', '1,590,000원', '★★★★★'],
                ['삼성 갤럭시북4', '1,290,000원', '★★★★☆'],
                ['LG 그램 16', '1,450,000원', '★★★★☆'],
              ].map(([model, price, rating], i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 1 ? config.table.stripeBg : 'transparent' }}>
                  <td style={{ padding: '10px 14px', borderTop: `1px solid ${config.table.borderColor}` }}>{model}</td>
                  <td style={{ padding: '10px 14px', borderTop: `1px solid ${config.table.borderColor}`, fontWeight: 600, color: '#dc2626' }}>{price}</td>
                  <td style={{ padding: '10px 14px', borderTop: `1px solid ${config.table.borderColor}` }}>{rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA 버튼 미리보기 */}
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <a
            href="#"
            style={{
              display: 'inline-block',
              backgroundColor: config.cta.buttonColor,
              color: config.cta.buttonTextColor,
              padding: '14px 36px',
              borderRadius: config.cta.buttonRadius,
              fontSize: '16px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: `0 4px 12px ${config.cta.buttonColor}40`,
            }}
            onClick={e => e.preventDefault()}
          >
            쿠팡에서 최저가 확인하기
          </a>
        </div>

        {/* 파트너스 문구 */}
        <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginTop: '32px' }}>
          ※ 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
        </p>
      </div>
    </div>
  );
}
