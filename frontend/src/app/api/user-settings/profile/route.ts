import { NextResponse } from 'next/server';
import { UserProfile } from '@/entities/user-settings/model/types';
import { mockDb } from '../db';

export async function PUT(request: Request) {
  try {
    const body: Partial<UserProfile> = await request.json();
    
    // 시뮬레이티드 DB 지연
    await new Promise(resolve => setTimeout(resolve, 400));

    // Update the mock DB
    mockDb.profile = { ...mockDb.profile, ...body };

    return NextResponse.json(mockDb.profile);
  } catch (error) {
    console.error('[API_USER_SETTINGS_PROFILE_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update profile settings' }, { status: 500 });
  }
}
