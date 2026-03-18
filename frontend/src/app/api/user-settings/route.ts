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
    let realProfile = { ...mockDb.profile }; // Initialize with mock data as fallback
    let dto: UserSettingsDTO = { // Initialize dto with mock data as fallback
      profile: realProfile,
      articleSettings: {
        ...mockDb.articleSettings,
        coupangAccessKey: '',
        coupangSecretKey: '',
      },
      themeSettings: mockDb.themeSettings,
      autopilotSettings: mockDb.autopilotSettings,
      publishSettings: mockDb.publishSettings || { targets: [] }
    };

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          nickname: true,
          createdAt: true,
          coupangAccessKey: true,
          coupangSecretKey: true,
          openAiApiKey: true,
          geminiApiKey: true,
          perplexityApiKey: true,
          claudeApiKey: true,
          wordpressUrl: true,
          wordpressUsername: true,
          wordpressAppPassword: true,
        }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
      }

      realProfile = {
        id: user.id,
        name: user.nickname || 'Unknown User',
        email: user.email,
        profileImageUrl: undefined,
        createdAt: user.createdAt.toISOString()
      };

      dto = {
        profile: realProfile,
        articleSettings: {
          ...mockDb.articleSettings,
          coupangAccessKey: user.coupangAccessKey || '',
          coupangSecretKey: user.coupangSecretKey || '',
          openAiApiKey: user.openAiApiKey || '',
          geminiApiKey: user.geminiApiKey || '',
          perplexityApiKey: user.perplexityApiKey || '',
          claudeApiKey: user.claudeApiKey || '',
          wordpressUrl: user.wordpressUrl || '',
          wordpressUsername: user.wordpressUsername || '',
          wordpressAppPassword: user.wordpressAppPassword || '',
        },
        themeSettings: mockDb.themeSettings,
        autopilotSettings: mockDb.autopilotSettings,
        publishSettings: mockDb.publishSettings || { targets: [] }
      };
    }

    return NextResponse.json(dto);
  } catch (error) {
    console.error('[API_USER_SETTINGS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to loaded user settings' }, { status: 500 });
  }
}
