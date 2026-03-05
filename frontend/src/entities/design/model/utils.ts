import { ThemeConfig } from './types';

/**
 * [Entities/Design Layer]
 * 테마 설정 JSON 문자열에서 미리보기 색상 4개를 추출합니다.
 */
export function getThemePreviewColors(configStr: string): string[] {
  try {
    const cfg: ThemeConfig = JSON.parse(configStr);
    return [cfg.heading.h2BorderColor, cfg.cta.buttonColor, cfg.blockquote.borderColor, cfg.table.headerBg];
  } catch {
    return ['#2563eb', '#2563eb', '#2563eb', '#1e293b'];
  }
}
