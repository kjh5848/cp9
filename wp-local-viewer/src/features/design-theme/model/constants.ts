import { ThemeConfig, CtaBlockConfig } from '@/entities/design/model/types';
import { Type, Palette, Quote, List, Table, MousePointerClick, Code } from 'lucide-react';
import React from 'react';

/**
 * 프리셋(시스템) 테마 이름 목록 — 이 이름의 테마는 읽기 전용(수정·삭제 불가)
 */
export const PRESET_THEME_NAMES = ['기본', '클린 블루', '미니멀 다크', '웜 코랄', '포레스트 그린'] as const;

/**
 * [Features/DesignTheme Layer]
 * 디자인 설정 탭 목록 상수
 */
export const TABS = [
  { id: 'heading', label: '제목', icon: React.createElement(Type, { className: 'w-4 h-4' }) as any },
  { id: 'text', label: '본문', icon: React.createElement(Palette, { className: 'w-4 h-4' }) as any },
  { id: 'blockquote', label: '인용', icon: React.createElement(Quote, { className: 'w-4 h-4' }) as any },
  { id: 'list', label: '목록', icon: React.createElement(List, { className: 'w-4 h-4' }) as any },
  { id: 'table', label: '테이블', icon: React.createElement(Table, { className: 'w-4 h-4' }) as any },
  { id: 'cta', label: 'CTA', icon: React.createElement(MousePointerClick, { className: 'w-4 h-4' }) as any },
] as const;

/**
 * 기존 단일 CTA 설정을 다중 블록(ctaBlocks) 구조로 마이그레이션합니다.
 */
export function createMigratedBlocks(legacyCta: Partial<ThemeConfig['cta']> | undefined): CtaBlockConfig[] {
  if (!legacyCta) return [];
  const blocks: CtaBlockConfig[] = [];
  
  if (legacyCta.showHeaderCta !== false) {
    blocks.push({
      id: `migrated-header-${Date.now()}`,
      name: '상단 추천 상품',
      placement: { position: 'before-h2', frequency: '1' },
      design: {
        layout: legacyCta.layout || 'card',
        boxBgColor: legacyCta.boxBgColor || '#f8fafc',
        boxBorderColor: legacyCta.boxBorderColor || '#e2e8f0',
        buttonColor: legacyCta.buttonColor || '#2563eb',
        buttonTextColor: legacyCta.buttonTextColor || '#ffffff',
        buttonRadius: legacyCta.buttonRadius || '12px',
        text: legacyCta.headerText || '최저가 확인하기',
        showShadow: legacyCta.showShadow !== false,
        showProductImage: legacyCta.showProductImage !== false,
        priceColor: legacyCta.priceColor || '#e53935',
        showUrgency: false,
      }
    });
  }
  if (legacyCta.showMidCta !== false) {
    blocks.push({
      id: `migrated-mid-${Date.now() + 1}`,
      name: '중간 추천 상품',
      placement: { position: 'after-h3', frequency: '1' },
      design: {
        layout: 'minimal',
        boxBgColor: legacyCta.boxBgColor || '#f8fafc',
        boxBorderColor: legacyCta.boxBorderColor || '#e2e8f0',
        buttonColor: legacyCta.buttonColor || '#2563eb',
        buttonTextColor: legacyCta.buttonTextColor || '#ffffff',
        buttonRadius: legacyCta.buttonRadius || '12px',
        text: legacyCta.midText || '할인가격 확인하기',
        showShadow: false,
        showProductImage: false,
        priceColor: legacyCta.priceColor || '#e53935',
        showUrgency: false,
      }
    });
  }
  if (legacyCta.showFooterCta !== false) {
    blocks.push({
      id: `migrated-footer-${Date.now() + 2}`,
      name: '하단 추천 상품',
      placement: { position: 'article-end', frequency: 'all' },
      design: {
        layout: legacyCta.layout || 'card',
        boxBgColor: legacyCta.boxBgColor || '#f8fafc',
        boxBorderColor: legacyCta.boxBorderColor || '#e2e8f0',
        buttonColor: legacyCta.buttonColor || '#2563eb',
        buttonTextColor: legacyCta.buttonTextColor || '#ffffff',
        buttonRadius: legacyCta.buttonRadius || '12px',
        text: legacyCta.footerText || '최저가 혜택 바로가기',
        headline: legacyCta.footerHeadline || '지금 바로 구매하세요!',
        showShadow: legacyCta.showShadow !== false,
        showProductImage: false,
        priceColor: legacyCta.priceColor || '#e53935',
        showUrgency: legacyCta.showUrgency !== false,
      }
    });
  }
  return blocks;
}

/**
 * 기본 테마 설정값을 반환합니다.
 */
export function getDefaultConfig(): ThemeConfig {
  const defaultLegacyCta: ThemeConfig['cta'] = {
    buttonColor: '#2563eb', buttonTextColor: '#ffffff', buttonRadius: '12px',
    layout: 'card', boxBgColor: '#f8fafc', boxBorderColor: '#e2e8f0',
    headerText: '안전하게 최저가 확인하기', footerText: '최저가 혜택 바로가기', midText: '할인가격 확인하기',
    showShadow: true, showProductImage: true, priceColor: '#e53935',
    showHeaderCta: true, showMidCta: true, showFooterCta: true,
    footerHeadline: '지금 바로 구매하세요!', showUrgency: true, showDisclaimer: true,
  };

  return {
    heading: {
      h1Color: '#0f172a', h1BorderColor: '#e2e8f0', h1FontSize: '28px',
      h2Color: '#1a1a2e', h2BorderColor: '#2563eb', h2FontSize: '24px',
      h3Color: '#1e293b', h3BorderColor: '#3b82f6', h3FontSize: '20px',
    },
    bold: { color: '#1e293b' },
    blockquote: { borderColor: '#2563eb', bgColor: '#eff6ff', textColor: '#1e40af' },
    list: { markerColor: '#2563eb' },
    table: { headerBg: '#1e293b', headerColor: '#fff', stripeBg: '#f8fafc', borderColor: '#e2e8f0' },
    cta: defaultLegacyCta,
    ctaBlocks: createMigratedBlocks(defaultLegacyCta),
    article: {
      bgColor: '#ffffff',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      lineHeight: '1.8',
      textColor: '#334155',
    },
    disclaimer: { position: 'footer-only' },
    advanced: {
      customCss: '',
      customHtmlHeader: '',
      customHtmlFooter: '',
      styleMode: 'inline',
      classPrefix: 'cp9-',
    },
  };
}


