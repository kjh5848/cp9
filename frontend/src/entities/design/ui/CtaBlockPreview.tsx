import React from 'react';
import { CtaBlockConfig } from '../model/types';

interface CtaBlockPreviewProps {
  block: CtaBlockConfig;
  previewMode?: 'standalone' | 'inline';
}

export function CtaBlockPreview({ block, previewMode = 'standalone' }: CtaBlockPreviewProps) {
  const { design } = block;

  const isHorizontal = ['banner', 'outline', 'modern'].includes(design.layout) && design.showProductImage && design.layout !== 'minimal';

  const boxStyle: React.CSSProperties = (() => {
    const shadow = design.showShadow ? '0 4px 16px rgba(0,0,0,0.10)' : 'none';
    const strongShadow = design.showShadow ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none';
    const base: React.CSSProperties = { textAlign: isHorizontal ? 'left' : 'center', borderRadius: '16px', boxShadow: shadow, margin: '20px auto', maxWidth: '400px', width: '100%', boxSizing: 'border-box' };
    
    if (isHorizontal) {
      base.display = 'flex';
      base.alignItems = 'center';
      base.gap = '20px';
      base.maxWidth = '500px';
    }

    switch (design.layout) {
      case 'minimal':
        return { ...base, padding: '16px 0', background: 'transparent', border: 'none', boxShadow: 'none' };
      case 'banner':
        return { ...base, padding: '24px 20px', background: design.boxBgColor, borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: `6px solid ${design.buttonColor}`, borderRadius: '8px' };
      case 'gradient':
        return { ...base, padding: '24px 20px', background: `linear-gradient(135deg, ${design.boxBgColor}, ${design.buttonColor})` };
      case 'outline':
        return { ...base, padding: '20px', background: 'transparent', border: `2px solid ${design.boxBorderColor}`, borderRadius: '12px' };
      case 'shadow':
        return { ...base, padding: '24px', background: design.boxBgColor, border: 'none', borderRadius: '20px', boxShadow: strongShadow };
      case 'neon':
        return { ...base, padding: '20px', background: '#0f172a', border: `1px solid ${design.buttonColor}`, borderRadius: '12px', boxShadow: `0 0 15px ${design.buttonColor}40, inset 0 0 20px ${design.buttonColor}20`, color: '#fff' };
      case 'coupon':
        return { ...base, padding: '24px 20px', background: design.boxBgColor, border: `2px dashed ${design.boxBorderColor}`, borderRadius: '8px', position: 'relative' };
      case 'modern':
        return { ...base, padding: '24px 0', background: 'transparent', borderTop: `1px solid ${design.boxBorderColor}`, borderBottom: `1px solid ${design.boxBorderColor}`, borderLeft: 'none', borderRight: 'none', borderRadius: '0', boxShadow: 'none' };
      case 'luxury':
        return { ...base, padding: '24px 20px', background: '#171717', border: '1px solid #333', borderRadius: '16px', color: '#f3f4f6' };
      case 'card':
      default:
        return { ...base, padding: '20px', background: design.boxBgColor, border: `1px solid ${design.boxBorderColor}` };
    }
  })();

  const btnStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      display: 'inline-block',
      padding: '12px 32px',
      borderRadius: design.buttonRadius || '8px',
      fontWeight: 600,
      fontSize: '14px',
      textDecoration: 'none',
      cursor: 'pointer',
      marginTop: '12px',
    };
    switch (design.layout) {
      case 'gradient':
        return { ...base, background: 'rgba(255,255,255,0.95)', color: design.buttonColor };
      case 'outline':
        return { ...base, background: 'transparent', color: design.buttonColor, border: `2px solid ${design.buttonColor}` };
      case 'neon':
        return { ...base, background: 'transparent', color: design.buttonColor, border: `1px solid ${design.buttonColor}`, boxShadow: `0 0 10px ${design.buttonColor}80` };
      case 'luxury':
        return { ...base, background: design.buttonColor, color: design.buttonTextColor, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' };
      default:
        return { ...base, background: design.buttonColor || '#2563eb', color: design.buttonTextColor || '#ffffff' };
    }
  })();

  const isDarkLayout = design.layout === 'gradient' || design.layout === 'neon' || design.layout === 'luxury';

  const getTextColor = (type: 'headline' | 'product' | 'urgency') => {
    if (type === 'headline') return isDarkLayout ? '#ffffff' : '#1e293b';
    if (type === 'product') return isDarkLayout ? 'rgba(255,255,255,0.9)' : '#64748b';
    return isDarkLayout ? 'rgba(255,255,255,0.7)' : '#94a3b8';
  };

  const alignStyle = isHorizontal ? 'left' : 'center';
  const isInline = previewMode === 'inline';

  return (
    <div 
      className={isInline 
        ? "w-full" 
        : "bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm flex items-center justify-center w-full min-h-[150px]"
      } 
      style={{ fontFamily: 'sans-serif' }}
    >
      <div 
        style={{...boxStyle, transition: 'all 0.3s ease'}} 
        className="group hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 duration-300"
      >
        {/* 상품 이미지 */}
        {design.showProductImage && design.layout !== 'minimal' && design.layout !== 'modern' ? (
          <div style={{
            flexShrink: 0,
            width: isHorizontal ? 100 : 80, height: isHorizontal ? 100 : 80, margin: isHorizontal ? 0 : '0 auto 12px',
            borderRadius: 12, backgroundColor: '#fff', border: '1px solid #eee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, padding: '8px',
          }}>
            📦
          </div>
        ) : null}

        {/* 텍스트 컬럼 */}
        <div style={{ flex: 1, textAlign: alignStyle }}>
          {/* 헤드라인 */}
          {design.headline ? (
            <p style={{ textAlign: alignStyle, fontSize: 16, fontWeight: 700, color: getTextColor('headline'), margin: '0 0 8px' }}>
              {design.headline}
            </p>
          ) : null}

          {/* 상품명 */}
          {design.layout !== 'minimal' ? (
            <p style={{ textAlign: alignStyle, fontSize: 13, color: getTextColor('product'), margin: '0 0 4px' }}>
              가상의 추천 상품 예시 모델
            </p>
          ) : null}
          
          {/* 가격 */}
          {design.priceColor && design.layout !== 'minimal' ? (
            <p style={{ textAlign: alignStyle, fontSize: 18, fontWeight: 700, color: isDarkLayout ? '#fff' : design.priceColor, margin: '4px 0 12px' }}>
              1,590,000원
            </p>
          ) : null}

          {/* 긴급성 문구 */}
          {design.showUrgency ? (
            <p style={{ textAlign: alignStyle, fontSize: 12, color: getTextColor('urgency'), margin: '0 0 12px' }}>
              오전 타임세일 진행 중
            </p>
          ) : null}

          {/* 버튼 */}
          <div style={{ textAlign: alignStyle }}>
            <div 
              style={{...btnStyle, transition: 'all 0.2s ease'}} 
              className="group-hover:brightness-110 group-hover:scale-105 duration-200"
            >
              {design.text || '최저가 확인하기'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
