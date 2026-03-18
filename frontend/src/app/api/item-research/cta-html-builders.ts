import { CtaTemplateData } from './seo-cta-builder';
import { formatPrice, getUrgencyText, getSocialProofText, addUtmParams } from './cta-constants';

export interface CtaBuildResult {
  headerHtml: string;
  midContentHtml: string;
  footerHtml: string;
}

export function buildMidContentCta(data: CtaTemplateData, buyUrlWithUtm: string, variant: { id: string; midText: string }): string {
  const tc = data.themeCtaConfig;
  const socialProof = getSocialProofText(data.persona);
  const priceColor = tc?.priceColor || '#e53935';
  const btnColor = tc?.buttonColor || '#2563eb';
  const btnText = tc?.buttonTextColor || '#fff';
  const btnRadius = tc?.buttonRadius || '12px';
  const midLabel = tc?.midText || variant.midText;
  const priceInfo = data.productPrice
    ? `<span style="font-weight:700;color:${priceColor};font-size:16px;">${formatPrice(data.productPrice)}</span>`
    : '';
  const btnStyle = `display:inline-block;background:linear-gradient(135deg, ${btnColor}, #1e3a8a);color:${btnText};padding:14px 28px;border-radius:${btnRadius};font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 8px 16px -4px rgba(30,58,138,0.4);text-shadow:0 1px 2px rgba(0,0,0,0.1);`;
  const blockId = `cp9-cta-mid-${Math.random().toString(36).substring(2, 9)}`;

  return `<style>.${blockId} .cp9-cta__button { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); } .${blockId} .cp9-cta__button:hover { filter: brightness(1.15); transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 20px -4px rgba(30,58,138,0.6) !important; }</style><div class="cp9-cta cp9-cta--mid ${blockId}" style="text-align:center;padding:24px 0;margin:24px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;"><p style="text-align:center;font-size:13px;color:#94a3b8;margin:0 0 10px;font-weight:500;">${socialProof}</p>${priceInfo ? `<p style="text-align:center;margin:0 0 16px;">${priceInfo}</p>` : ''}<div style="text-align:center;"><a href="${buyUrlWithUtm}" target="_blank" rel="noopener sponsored" class="cp9-cta__button cp9-cta__button--mid" style="${btnStyle}">${midLabel}</a></div></div>`;
}

export function buildDynamicCta(
  data: CtaTemplateData,
  buyUrlWithUtm: string,
  variant: { id: string; headerText: string; footerText: string; midText: string }
): CtaBuildResult {
  const tc = data.themeCtaConfig;
  const layout = tc?.layout || 'card';
  const boxBg = tc?.boxBgColor || '#f8fafc';
  const boxBorder = tc?.boxBorderColor || '#e2e8f0';
  const btnColor = tc?.buttonColor || '#2563eb';
  const btnText = tc?.buttonTextColor || '#fff';
  const btnRadius = tc?.buttonRadius || '12px';
  const priceColor = tc?.priceColor || '#e53935';
  const showShadow = tc?.showShadow !== false;
  const showImage = tc?.showProductImage !== false;

  const headerLabel = (tc?.headerText || variant.headerText || '쿠팡에서 최저가 확인하기').replace(/\\s*\\n\\s*/g, ' ').trim();
  const footerLabel = (tc?.footerText || variant.footerText || '할인가 확인하기').replace(/\\s*\\n\\s*/g, ' ').trim();

  const priceInfo = data.productPrice
    ? `<p style="text-align:center;font-size:18px;font-weight:700;color:${priceColor};margin:4px 0 12px;">${formatPrice(data.productPrice)}</p>`
    : '';

  const boxStyle = (() => {
    const shadow = showShadow ? 'box-shadow:0 4px 16px rgba(0,0,0,0.10);' : '';
    switch (layout) {
      case 'minimal':
        return `text-align:center;padding:16px 0;`;
      case 'banner':
        return `text-align:center;padding:24px 20px;background:${boxBg};border:none;border-left:6px solid ${btnColor};border-radius:8px;${shadow}`;
      case 'gradient':
        return `text-align:center;padding:24px 20px;background:linear-gradient(135deg, ${boxBg}, ${btnColor});border-radius:16px;${shadow}`;
      case 'card':
      default:
        return `text-align:center;padding:20px;background:${boxBg};border:1px solid ${boxBorder};border-radius:16px;${shadow}`;
    }
  })();

  const imageHtml = showImage && data.productImage && layout !== 'minimal'
    ? `<img src="${data.productImage}" alt="${data.productName}" style="max-width:160px;height:auto;border-radius:12px;margin:0 auto 12px;display:block;border:1px solid #eee;background:#fff;padding:8px;" />`
    : '';

  const btnStyle = `display:inline-block;background:linear-gradient(135deg, ${btnColor}, #1e3a8a);color:${btnText};padding:14px 34px;border-radius:${btnRadius};font-weight:700;font-size:16px;text-decoration:none;box-shadow:0 8px 16px -4px rgba(30,58,138,0.4);text-shadow:0 1px 2px rgba(0,0,0,0.1);`;
  const gradientBtnStyle = layout === 'gradient'
    ? `display:inline-block;background:rgba(255,255,255,0.95);color:${btnColor};padding:14px 34px;border-radius:${btnRadius};font-weight:700;font-size:16px;text-decoration:none;box-shadow:0 8px 16px -4px rgba(0,0,0,0.2);`
    : btnStyle;

  const showHeader = tc?.showHeaderCta !== false;
  const showMid = tc?.showMidCta !== false;
  const showFooter = tc?.showFooterCta !== false;

  const blockId = `cp9-cta-dyn-${Math.random().toString(36).substring(2, 9)}`;
  const styleBlock = `<style>.${blockId} .cp9-cta__button { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); } .${blockId} .cp9-cta__button:hover { filter: brightness(1.15); transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 20px -4px rgba(30,58,138,0.6) !important; }</style>`;

  const headerHtml = showHeader ? `<div class="cp9-cta cp9-cta--header ${blockId}" style="${boxStyle}margin:32px 0;">${imageHtml}<p style="text-align:center;font-size:14px;color:#64748b;margin:0 0 6px;font-weight:500;">${data.productName}</p>${priceInfo}<div style="text-align:center;"><a href="${buyUrlWithUtm}" target="_blank" rel="noopener sponsored" class="cp9-cta__button" style="${layout === 'gradient' ? gradientBtnStyle : btnStyle}">${headerLabel}</a></div></div>` : '';

  const midContentHtml = showMid ? buildMidContentCta(data, buyUrlWithUtm, variant) : '';

  const footerHeadlineText = tc?.footerHeadline || '망설이면 품절! 지금 바로 구매하세요';
  const showUrgency = tc?.showUrgency !== false;
  const urgencyLine = showUrgency
    ? `<p style="text-align:center;font-size:13px;font-weight:600;color:${layout === 'gradient' ? 'rgba(255,255,255,0.9)' : '#ef4444'};margin:0 0 16px;">${getUrgencyText()}</p>`
    : '';

  const footerHtml = showFooter ? `<div class="cp9-cta cp9-cta--footer ${blockId}" style="${boxStyle}margin:32px 0;"><p style="text-align:center;font-size:18px;font-weight:800;color:${layout === 'gradient' ? '#fff' : '#1e293b'};margin:0 0 10px;">${footerHeadlineText}</p>${urgencyLine}<div style="text-align:center;"><a href="${buyUrlWithUtm}" target="_blank" rel="noopener sponsored" class="cp9-cta__button cp9-cta__button--large" style="${layout === 'gradient' ? gradientBtnStyle : btnStyle}">${footerLabel}</a></div></div>` : '';

  return { headerHtml: styleBlock + headerHtml, midContentHtml, footerHtml };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildCtaBlockHtml(data: CtaTemplateData, blockConfig: any): string {
  const design = blockConfig.design;
  const layout = design.layout || 'card';
  const buyUrlWithUtm = addUtmParams(data.buyUrl, data.persona);

  if (layout === 'custom') {
    let customHtml = design.customHtml || '';
    customHtml = customHtml.replace(/\{\{productName\}\}/g, data.productName || '');
    customHtml = customHtml.replace(/\{\{productPrice\}\}/g, data.productPrice ? formatPrice(data.productPrice) : '');
    customHtml = customHtml.replace(/\{\{productImage\}\}/g, data.productImage || '');
    customHtml = customHtml.replace(/\{\{buyUrl\}\}/g, buyUrlWithUtm || '');
    
    return `<div class="cp9-cta cp9-cta-block cp9-cta-custom" style="margin:24px 0;">${customHtml}</div>`;
  }

  const boxBg = design.boxBgColor || '#f8fafc';
  const boxBorder = design.boxBorderColor || '#e2e8f0';
  const btnColor = design.buttonColor || '#2563eb';
  const btnText = design.buttonTextColor || '#ffffff';
  const btnRadius = design.buttonRadius || '12px';
  const priceColor = design.priceColor || '#e53935';
  const showShadow = design.showShadow !== false;
  const showImage = design.showProductImage !== false;

  const priceInfo = data.productPrice
    ? `<p style="text-align:center;font-size:18px;font-weight:700;color:${priceColor};margin:4px 0 12px;">${formatPrice(data.productPrice)}</p>`
    : '';

  const blockId = `cp9-cta-${Math.random().toString(36).substring(2, 9)}`;
  const isHorizontal = ['banner', 'outline', 'modern'].includes(layout) && showImage && data.productImage && layout !== 'minimal';

  const boxStyle = (() => {
    const shadow = showShadow ? 'box-shadow:0 4px 16px rgba(0,0,0,0.10);' : '';
    const strongShadow = showShadow ? 'box-shadow:0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);' : '';
    const flexStyles = isHorizontal ? 'display:flex;align-items:center;gap:24px;text-align:left;' : 'text-align:center;';
    
    switch (layout) {
      case 'minimal': return `padding:16px 0;margin:24px 0;${flexStyles}`;
      case 'banner': return `padding:24px 20px;background:${boxBg};border:none;border-left:6px solid ${btnColor};border-radius:8px;${shadow}margin:24px 0;${flexStyles}`;
      case 'gradient': return `padding:24px 20px;background:linear-gradient(135deg, ${boxBg}, ${btnColor});border-radius:16px;${shadow}margin:24px 0;${flexStyles}`;
      case 'outline': return `padding:20px;background:transparent;border:2px solid ${boxBorder};border-radius:12px;${shadow}margin:24px 0;${flexStyles}`;
      case 'shadow': return `padding:24px;background:${boxBg};border:none;border-radius:20px;${strongShadow}margin:24px 0;${flexStyles}`;
      case 'neon': return `padding:20px;background:#0f172a;border:1px solid ${btnColor};border-radius:12px;box-shadow:0 0 15px ${btnColor}40, inset 0 0 20px ${btnColor}20;margin:24px 0;color:#fff;${flexStyles}`;
      case 'coupon': return `padding:24px 20px;background:${boxBg};border:2px dashed ${boxBorder};border-radius:8px;margin:24px 0;position:relative;${flexStyles}`;
      case 'modern': return `padding:24px 0;background:transparent;border-top:1px solid ${boxBorder};border-bottom:1px solid ${boxBorder};margin:24px 0;${flexStyles}`;
      case 'luxury': return `padding:24px 20px;background:#171717;border:1px solid #333;border-radius:16px;${shadow}margin:24px 0;color:#f3f4f6;${flexStyles}`;
      case 'card': default: return `padding:20px;background:${boxBg};border:1px solid ${boxBorder};border-radius:16px;${shadow}margin:24px 0;${flexStyles}`;
    }
  })();

  const imageStyle = isHorizontal 
    ? `flex-shrink:0;width:120px;height:auto;border-radius:12px;margin:0;display:block;border:1px solid #eee;background:#fff;padding:8px;`
    : `max-width:160px;height:auto;border-radius:12px;margin:0 auto 12px;display:block;border:1px solid #eee;background:#fff;padding:8px;`;

  const imageHtml = showImage && data.productImage && layout !== 'minimal' && layout !== 'modern'
    ? `<img src="${data.productImage}" alt="${data.productName}" style="${imageStyle}" />`
    : '';

  const baseBtnStyle = `display:inline-block;padding:14px 36px;border-radius:${btnRadius};font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 8px 16px -4px rgba(30,58,138,0.4);text-shadow:0 1px 2px rgba(0,0,0,0.1);`;
  const btnStyleObj = (() => {
    switch (layout) {
      case 'gradient': return `${baseBtnStyle}background:rgba(255,255,255,0.95);color:${btnColor};box-shadow:0 8px 16px -4px rgba(0,0,0,0.2);`;
      case 'outline': return `${baseBtnStyle}background:transparent;color:${btnColor};border:2px solid ${btnColor};box-shadow:none;text-shadow:none;`;
      case 'neon': return `${baseBtnStyle}background:transparent;color:${btnColor};border:1px solid ${btnColor};box-shadow:0 0 15px ${btnColor}80, inset 0 0 10px ${btnColor}40;text-shadow:0 0 5px ${btnColor};`;
      case 'luxury': return `${baseBtnStyle}background:linear-gradient(135deg, ${btnColor}, #000000);color:${btnText};box-shadow:0 10px 20px -5px rgba(0,0,0,0.6);`;
      default: return `${baseBtnStyle}background:linear-gradient(135deg, ${btnColor}, #1e3a8a);color:${btnText};`;
    }
  })();

  const isDarkLayout = layout === 'gradient' || layout === 'neon' || layout === 'luxury';
  
  const getTextColor = (type: 'headline' | 'product' | 'urgency') => {
    if (type === 'headline') return isDarkLayout ? '#ffffff' : '#1e293b';
    if (type === 'product') return isDarkLayout ? 'rgba(255,255,255,0.9)' : '#64748b';
    return isDarkLayout ? 'rgba(255,255,255,0.7)' : '#94a3b8';
  };

  const contentWrapperStart = isHorizontal ? `<div style="flex:1;">` : '';
  const contentWrapperEnd = isHorizontal ? `</div>` : '';

  const getAlignValue = () => isHorizontal ? 'left' : 'center';

  const cleanBtnText = (design.text || '최저가 확인하기').replace(/\\s*\\n\\s*/g, ' ').trim();
  const cleanHeadline = (design.headline || '').replace(/\\s*\\n\\s*/g, ' ').trim();

  const headlineHtml = cleanHeadline
    ? `<p style="text-align:${getAlignValue()};font-size:16px;font-weight:700;color:${getTextColor('headline')};margin:0 0 8px;">${cleanHeadline}</p>`
    : '';

  const showUrgency = design.showUrgency !== false;
  const urgencyLine = showUrgency
    ? `<p style="text-align:${getAlignValue()};font-size:12px;color:${getTextColor('urgency')};margin:0 0 12px;">${getUrgencyText()}</p>`
    : '';
    
  const priceInfoAdjusted = data.productPrice
    ? `<p style="text-align:${getAlignValue()};font-size:18px;font-weight:700;color:${priceColor};margin:4px 0 12px;">${formatPrice(data.productPrice)}</p>`
    : '';

  return `<style>.${blockId} { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1); } .${blockId}:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2) !important; } .${blockId} .cp9-cta__button { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: inline-block; } .${blockId} .cp9-cta__button:hover { filter: brightness(1.15); transform: translateY(-3px) scale(1.03); box-shadow: 0 15px 25px -5px rgba(30,58,138,0.6) !important; }</style><div class="cp9-cta cp9-cta-block ${blockId}" style="${boxStyle}">${imageHtml}${contentWrapperStart}${headlineHtml}<p style="text-align:${getAlignValue()};font-size:13px;color:${getTextColor('product')};margin:0 0 4px;">${data.productName}</p>${priceInfoAdjusted}${urgencyLine}<div style="text-align:${getAlignValue()};margin-top:14px;"><a href="${buyUrlWithUtm}" target="_blank" rel="noopener sponsored" class="cp9-cta__button" style="${btnStyleObj}">${cleanBtnText}</a></div>${contentWrapperEnd}</div>`;
}
