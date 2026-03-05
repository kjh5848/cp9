'use client';

import React from 'react';
import { DesignThemeEditor } from '@/features/design-theme/ui/DesignThemeEditor';

/**
 * [Widgets Layer]
 * 아티클 디자인 테마 에디터 위젯입니다.
 * features/design-theme의 DesignThemeEditor를 조합하여 독립적인 UI 블록으로 제공합니다.
 */
export function DesignTheme() {
  return <DesignThemeEditor />;
}
