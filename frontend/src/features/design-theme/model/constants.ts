import { ThemeConfig } from '@/entities/design/model/types';
import { Type, Palette, Quote, List, Table, MousePointerClick } from 'lucide-react';
import React from 'react';

/**
 * [Features/DesignTheme Layer]
 * 디자인 설정 탭 목록 상수
 */
export const TABS = [
  { id: 'heading', label: '제목', icon: React.createElement(Type, { className: 'w-4 h-4' }) },
  { id: 'text', label: '본문', icon: React.createElement(Palette, { className: 'w-4 h-4' }) },
  { id: 'blockquote', label: '인용', icon: React.createElement(Quote, { className: 'w-4 h-4' }) },
  { id: 'list', label: '목록', icon: React.createElement(List, { className: 'w-4 h-4' }) },
  { id: 'table', label: '테이블', icon: React.createElement(Table, { className: 'w-4 h-4' }) },
  { id: 'cta', label: 'CTA', icon: React.createElement(MousePointerClick, { className: 'w-4 h-4' }) },
] as const;

/**
 * 기본 테마 설정값을 반환합니다.
 */
export function getDefaultConfig(): ThemeConfig {
  return {
    heading: {
      h2Color: '#1a1a2e', h2BorderColor: '#2563eb', h2FontSize: '24px',
      h3Color: '#1e293b', h3BorderColor: '#3b82f6', h3FontSize: '20px',
    },
    bold: { color: '#1e293b' },
    blockquote: { borderColor: '#2563eb', bgColor: '#eff6ff', textColor: '#1e40af' },
    list: { markerColor: '#2563eb' },
    table: { headerBg: '#1e293b', headerColor: '#fff', stripeBg: '#f8fafc', borderColor: '#e2e8f0' },
    cta: {
      buttonColor: '#2563eb', buttonTextColor: '#ffffff', buttonRadius: '12px',
      layout: 'card', boxBgColor: '#f8fafc', boxBorderColor: '#e2e8f0',
      headerText: '쿠팡에서 최저가 확인하기', footerText: '쿠팡 최저가 바로가기', midText: '쿠팡에서 가격 확인하기',
      showShadow: true, showProductImage: true, priceColor: '#e53935',
    },
    article: {
      bgColor: 'transparent',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      lineHeight: '1.8',
      textColor: '#334155',
    },
    disclaimer: { position: 'footer-only' },
  };
}


