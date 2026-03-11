import { NextResponse } from 'next/server';
import { DefaultArticleSettings } from '@/entities/user-settings/model/types';
import { mockDb } from '../db';

export async function PUT(request: Request) {
  try {
    const body: DefaultArticleSettings = await request.json();
    
    // 시뮬레이티드 DB 지연
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the mock DB
    mockDb.articleSettings = { ...mockDb.articleSettings, ...body };

    return NextResponse.json(mockDb.articleSettings); // 반영된 데이터 반환
  } catch (error) {
    console.error('[API_USER_SETTINGS_ARTICLE_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update article settings' }, { status: 500 });
  }
}
