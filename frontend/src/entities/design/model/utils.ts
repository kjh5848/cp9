import { ThemeConfig } from './types';

/**
 * [Entities/Design Layer]
 * 테마 설정(JSON 문자열 또는 객체)에서 미리보기 색상 토큰 정보를 추출합니다.
 */
export function getThemePreviewTokens(configData: string | ThemeConfig): { label: string; color: string }[] {
  let cfg: ThemeConfig;
  if (typeof configData === 'string') {
    try {
      cfg = JSON.parse(configData);
    } catch {
      return [
        { label: '대제목 좌측 바 색상', color: '#2563eb' },
        { label: '버튼 색상', color: '#2563eb' },
        { label: '인용구 좌측 바 색상', color: '#2563eb' },
        { label: '테이블 헤더 배경색', color: '#1e293b' },
      ];
    }
  } else {
    cfg = configData;
  }

  return [
    { label: '대제목 좌측 바 색상', color: cfg?.heading?.h2BorderColor || '#2563eb' },
    { label: '버튼 색상', color: cfg?.cta?.buttonColor || '#2563eb' },
    { label: '인용구 좌측 바 색상', color: cfg?.blockquote?.borderColor || '#2563eb' },
    { label: '테이블 헤더 배경색', color: cfg?.table?.headerBg || '#1e293b' },
  ];
}
