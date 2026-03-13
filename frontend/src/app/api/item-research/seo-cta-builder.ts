import fs from 'fs';
import path from 'path';
import { PERSONA_CTA_FILE, selectVariant, addUtmParams, getSocialProofText, buildPriceBlock, getUrgencyText } from './cta-constants';
import { buildDynamicCta, buildMidContentCta, buildCtaBlockHtml, CtaBuildResult } from './cta-html-builders';

export interface CtaTemplateData {
  productName: string;
  productImage: string;
  buyUrl: string;
  persona: string;
  productPrice?: number;
  isRocket?: boolean;
  itemId?: string;
  projectId?: string;
  articleType?: 'single' | 'compare' | 'curation';
  themeCtaConfig?: {
    layout?: 'minimal' | 'card' | 'banner' | 'gradient';
    boxBgColor?: string;
    boxBorderColor?: string;
    headerText?: string;
    footerText?: string;
    midText?: string;
    showShadow?: boolean;
    showProductImage?: boolean;
    priceColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonRadius?: string;
    showHeaderCta?: boolean;
    showMidCta?: boolean;
    showFooterCta?: boolean;
    footerHeadline?: string;
    showUrgency?: boolean;
    showDisclaimer?: boolean;
  };
}

export { buildCtaBlockHtml };
export type { CtaBuildResult };

export function buildCtaHtml(data: CtaTemplateData): CtaBuildResult {
  const articleType = data.articleType || 'single';
  const variant = selectVariant(data.persona, articleType);
  const buyUrlWithUtm = addUtmParams(data.buyUrl, data.persona);

  const hasCustomTheme = !!data.themeCtaConfig && Object.keys(data.themeCtaConfig).length > 0;
  if (hasCustomTheme) {
    return buildDynamicCta(data, buyUrlWithUtm, variant);
  }

  const ARTICLE_TYPE_CTA_FILE: Record<string, string> = {
    'compare': 'cta-compare.html',
    'curation': 'cta-curation.html',
  };
  const templateFile = ARTICLE_TYPE_CTA_FILE[articleType] || PERSONA_CTA_FILE[data.persona] || 'cta-default.html';
  const templatePath = path.join(
    process.cwd(), '..', '.agents', 'skills', 'seo-pipeline', 'references', 'cta-templates', templateFile
  );

  let rawTemplate = '';
  try {
    if (fs.existsSync(templatePath)) {
      rawTemplate = fs.readFileSync(templatePath, 'utf-8');
    } else {
      const defaultPath = path.join(
        process.cwd(), '..', '.agents', 'skills', 'seo-pipeline', 'references', 'cta-templates', 'cta-default.html'
      );
      if (fs.existsSync(defaultPath)) {
        rawTemplate = fs.readFileSync(defaultPath, 'utf-8');
      }
    }
  } catch (err) {
    console.warn(`[CTA Builder] 템플릿 읽기 실패: ${templateFile}`, err);
  }

  if (!rawTemplate) {
    console.warn('[CTA Builder] 템플릿 없음, 동적 CTA 사용');
    return buildDynamicCta(data, buyUrlWithUtm, variant);
  }

  const priceBlock = data.productPrice ? buildPriceBlock(data.productPrice, !!data.isRocket) : '';
  const urgencyBanner = `<p class="cp9-cta__urgency" style="text-align:center;">${getUrgencyText()}</p>`;

  let html = rawTemplate
    .replace(/\{\{PRODUCT_IMAGE\}\}/g, data.productImage)
    .replace(/\{\{PRODUCT_NAME\}\}/g, data.productName)
    .replace(/\{\{BUY_URL\}\}/g, buyUrlWithUtm)
    .replace(/\{\{PRICE_BLOCK\}\}/g, priceBlock)
    .replace(/\{\{URGENCY_BANNER\}\}/g, urgencyBanner)
    .replace(/\{\{SOCIAL_PROOF\}\}/g, getSocialProofText(data.persona));

  let headerDone = false;
  let footerDone = false;
  html = html.replace(/class="cp9-cta__button([^"]*)">/g, (match, classes) => {
    if (!headerDone && !classes.includes('--large')) {
      headerDone = true;
      return `class="cp9-cta__button${classes}">`;
    }
    if (!footerDone && classes.includes('--large')) {
      footerDone = true;
      return `class="cp9-cta__button${classes}">`;
    }
    return match;
  });

  const parts = html.split(/<!-- ── 하단/);
  const headerPart = parts[0];
  const footerPart = parts.length > 1 ? `<!-- ── 하단${parts[1]}` : '';

  const midContentHtml = buildMidContentCta(data, buyUrlWithUtm, variant);

  const showHeader = data.themeCtaConfig?.showHeaderCta !== false;
  const showMid = data.themeCtaConfig?.showMidCta !== false;
  const showFooter = data.themeCtaConfig?.showFooterCta !== false;

  return {
    headerHtml: showHeader ? headerPart : '',
    midContentHtml: showMid ? midContentHtml : '',
    footerHtml: showFooter ? footerPart : '',
  };
}
