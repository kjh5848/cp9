import { NextResponse } from 'next/server';
import { DefaultThemeSettings } from '@/entities/user-settings/model/types';
import { mockDb } from '../db';

export async function PUT(request: Request) {
  try {
    const body: DefaultThemeSettings = await request.json();
    
    // 시뮬레이티드 DB 지연 (실제 DB 반영 코드 추가 예정지점)
    await new Promise(resolve => setTimeout(resolve, 400));

    // Update the mock DB
    mockDb.themeSettings = { ...mockDb.themeSettings, ...body };

    // 변경된 테마 정보를 그대로 반영하여 프론트에 Response 반환
    return NextResponse.json(mockDb.themeSettings);
  } catch (error) {
    console.error('[API_USER_SETTINGS_THEME_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update theme settings' }, { status: 500 });
  }
}
