import React from 'react';
import { CtaBlockConfig } from '../model/types';

interface CtaBlockPreviewProps {
  block: CtaBlockConfig;
}

export function CtaBlockPreview({ block }: CtaBlockPreviewProps) {
  const { design } = block;

  const boxStyle: React.CSSProperties = (() => {
    const shadow = design.showShadow ? '0 4px 16px rgba(0,0,0,0.10)' : 'none';
    const base: React.CSSProperties = { textAlign: 'center', borderRadius: '16px', boxShadow: shadow, margin: '20px auto', maxWidth: '400px', width: '100%', boxSizing: 'border-box' };
    switch (design.layout) {
      case 'minimal':
        return { ...base, padding: '16px 0', background: 'transparent', border: 'none', boxShadow: 'none' };
      case 'banner':
        return { ...base, padding: '24px 20px', background: design.boxBgColor, borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: `6px solid ${design.buttonColor}`, borderRadius: '8px' };
      case 'gradient':
        return { ...base, padding: '24px 20px', background: `linear-gradient(135deg, ${design.boxBgColor}, ${design.buttonColor})` };
      case 'card':
      default:
        return { ...base, padding: '20px', background: design.boxBgColor, border: `1px solid ${design.boxBorderColor}` };
    }
  })();

  const btnStyle: React.CSSProperties = {
    display: 'inline-block',
    background: design.layout === 'gradient' ? 'rgba(255,255,255,0.95)' : (design.buttonColor || '#2563eb'),
    color: design.layout === 'gradient' ? design.buttonColor : (design.buttonTextColor || '#ffffff'),
    padding: '12px 32px',
    borderRadius: design.buttonRadius || '8px',
    fontWeight: 600,
    fontSize: '14px',
    textDecoration: 'none',
    cursor: 'pointer',
    marginTop: '12px',
  };

  const textColor = design.layout === 'gradient' ? '#fff' : '#1e293b';
  const subTextColor = design.layout === 'gradient' ? 'rgba(255,255,255,0.7)' : '#94a3b8';

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mt-4 mb-2 shadow-sm flex items-center justify-center w-full" style={{ fontFamily: 'sans-serif' }}>
      <div style={boxStyle}>
        {/* 헤드라인 */}
        {design.headline && (
          <p style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: textColor, margin: '0 0 8px' }}>
            {design.headline}
          </p>
        )}
        
        {/* 긴급성 상단 */}
        {design.showUrgency && design.layout === 'gradient' && (
          <p style={{ textAlign: 'center', fontSize: 12, color: subTextColor, margin: '0 0 12px' }}>
            오전 타임세일 진행 중
          </p>
        )}

        {/* 상품 이미지 */}
        {design.showProductImage && design.layout !== 'minimal' && (
          <div style={{
            width: 100, height: 100, margin: '0 auto 12px',
            borderRadius: 12, backgroundColor: '#fff', border: '1px solid #eee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, padding: '8px',
          }}>
            📦
          </div>
        )}

        {/* 상품명 */}
        {design.layout !== 'minimal' && (
          <p style={{ textAlign: 'center', fontSize: 13, color: design.layout === 'gradient' ? subTextColor : '#64748b', margin: '0 0 4px' }}>
            가상의 추천 상품 예시 모델
          </p>
        )}
        
        {/* 가격 */}
        {design.priceColor && design.layout !== 'minimal' && (
          <p style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: design.layout === 'gradient' ? '#fff' : design.priceColor, margin: '4px 0 12px' }}>
            1,590,000원
          </p>
        )}

         {/* 긴급성 문구 (일반) */}
         {design.showUrgency && design.layout !== 'gradient' && (
          <p style={{ textAlign: 'center', fontSize: 12, color: subTextColor, margin: '0 0 12px' }}>
            오전 타임세일 진행 중
          </p>
        )}

        {/* 버튼 */}
        <div style={btnStyle}>
          {design.text || '최저가 확인하기'}
        </div>
      </div>
    </div>
  );
}
