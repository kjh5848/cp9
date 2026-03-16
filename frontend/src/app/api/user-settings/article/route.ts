import { NextResponse } from 'next/server';
import { DefaultArticleSettings } from '@/entities/user-settings/model/types';
import { mockDb } from '../db';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/infrastructure/clients/prisma";
import { authOptions } from "@/shared/config/auth-options";

export async function PUT(request: Request) {
  try {
    const body: DefaultArticleSettings = await request.json();
    
    // 시뮬레이티드 DB 지연
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the mock DB
    mockDb.articleSettings = { ...mockDb.articleSettings, ...body };

    // Save API keys to Prisma if user is logged in
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          coupangAccessKey: body.coupangAccessKey || null,
          coupangSecretKey: body.coupangSecretKey || null,
          openAiApiKey: body.openAiApiKey || null,
          geminiApiKey: body.geminiApiKey || null,
          perplexityApiKey: body.perplexityApiKey || null,
          wordpressUrl: body.wordpressUrl || null,
          wordpressUsername: body.wordpressUsername || null,
          wordpressAppPassword: body.wordpressAppPassword || null,
        }
      });
    }

    return NextResponse.json(mockDb.articleSettings); // 반영된 데이터 반환
  } catch (error) {
    console.error('[API_USER_SETTINGS_ARTICLE_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update article settings' }, { status: 500 });
  }
}
