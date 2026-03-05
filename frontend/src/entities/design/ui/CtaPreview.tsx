'use client';

import React from 'react';

/* ═══════════════════ 타입 ═══════════════════ */

export interface CtaPreviewConfig {
  layout: 'minimal' | 'card' | 'banner' | 'gradient';
  boxBgColor: string;
  boxBorderColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonRadius: string;
  priceColor: string;
  showShadow: boolean;
  showProductImage: boolean;
  headerText: string;
}

interface CtaPreviewProps {
  /** CTA 설정 */
  config: CtaPreviewConfig;
}

/* ═══════════════════ 컴포넌트 ═══════════════════ */

/**
 * [Entities/Design Layer]
 * CTA 미리보기 — CTA 설정을 시각적으로 미리 볼 수 있는 순수 시각 컴포넌트.
 * 디자인 에디터 CTA 탭에서 사용됩니다.
 */
export function CtaPreview({ config }: CtaPreviewProps) {
  const { layout, boxBgColor, boxBorderColor, buttonColor, buttonTextColor, buttonRadius, priceColor, showShadow, showProductImage, headerText } = config;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: layout === 'gradient'
          ? `linear-gradient(135deg, ${boxBgColor}, ${buttonColor})`
          : layout === 'banner' || layout === 'card'
            ? boxBgColor
            : 'transparent',
        border: layout !== 'minimal' ? `1px solid ${boxBorderColor}` : 'none',
        boxShadow: showShadow ? '0 4px 16px rgba(0,0,0,0.12)' : 'none',
        padding: layout === 'minimal' ? '12px 0' : '20px',
        textAlign: 'center' as const,
      }}
    >
      {/* 상품 이미지 자리표시자 */}
      {showProductImage && layout !== 'minimal' && (
        <div style={{
          width: 80, height: 80, margin: '0 auto 12px',
          borderRadius: 12, backgroundColor: '#e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          📦
        </div>
      )}

      {/* 상품명 */}
      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>상품명 예시</p>

      {/* 가격 */}
      <p style={{ fontSize: 16, fontWeight: 700, color: priceColor, marginBottom: 12 }}>29,900원</p>

      {/* CTA 버튼 */}
      <div
        style={{
          display: 'inline-block',
          background: layout === 'gradient' ? 'rgba(255,255,255,0.95)' : buttonColor,
          color: layout === 'gradient' ? buttonColor : buttonTextColor,
          padding: '10px 28px',
          borderRadius: buttonRadius,
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        {headerText || '쿠팡에서 최저가 확인하기'}
      </div>

      {/* 면책 문구 */}
      <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 8 }}>
        ※ 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다.
      </p>
    </div>
  );
}
