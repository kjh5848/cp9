import { NextResponse } from 'next/server';
import { DefaultAutopilotSettings } from '@/entities/user-settings/model/types';
import { mockDb } from '../db';

export async function PUT(request: Request) {
  try {
    const body = await request.json() as DefaultAutopilotSettings;
    
    // Simulate DB delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    mockDb.autopilotSettings = {
      ...mockDb.autopilotSettings,
      ...body
    };

    return NextResponse.json(mockDb.autopilotSettings);
  } catch (error) {
    console.error('[API_USER_SETTINGS_AUTOPILOT_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update autopilot settings' }, { status: 500 });
  }
}
