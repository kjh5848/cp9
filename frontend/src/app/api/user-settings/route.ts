import { NextResponse } from 'next/server';
import { UserSettingsDTO } from '@/entities/user-settings/model/types';
import { mockDb } from './db';

// ============================================================================
// [Route Handlers]
// ============================================================================

export async function GET() {
  try {
    // 🚀 [Vercel Best Practice]: 병렬 패칭(Parallel Fetching) 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 200));

    const dto: UserSettingsDTO = {
      profile: mockDb.profile,
      articleSettings: mockDb.articleSettings,
      themeSettings: mockDb.themeSettings,
      autopilotSettings: mockDb.autopilotSettings
    };

    return NextResponse.json(dto);
  } catch (error) {
    console.error('[API_USER_SETTINGS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to loaded user settings' }, { status: 500 });
  }
}
