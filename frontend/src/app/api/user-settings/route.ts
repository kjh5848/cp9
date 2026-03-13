import { NextResponse } from 'next/server';
import { UserSettingsDTO } from '@/entities/user-settings/model/types';
import { mockDb } from './db';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/infrastructure/clients/prisma";
import { authOptions } from "@/shared/config/auth-options";

// ============================================================================
// [Route Handlers]
// ============================================================================

export async function GET() {
  try {
    // 🚀 [Vercel Best Practice]: 병렬 패칭(Parallel Fetching) 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 200));

    // Get current user session
    const session = await getServerSession(authOptions);
    let coupangAccessKey = '';
    let coupangSecretKey = '';

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { coupangAccessKey: true, coupangSecretKey: true }
      });
      if (user) {
        coupangAccessKey = user.coupangAccessKey || '';
        coupangSecretKey = user.coupangSecretKey || '';
      }
    }

    const dto: UserSettingsDTO = {
      profile: mockDb.profile,
      articleSettings: {
        ...mockDb.articleSettings,
        coupangAccessKey,
        coupangSecretKey,
      },
      themeSettings: mockDb.themeSettings,
      autopilotSettings: mockDb.autopilotSettings
    };

    return NextResponse.json(dto);
  } catch (error) {
    console.error('[API_USER_SETTINGS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to loaded user settings' }, { status: 500 });
  }
}
