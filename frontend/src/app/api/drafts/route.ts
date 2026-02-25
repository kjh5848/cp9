export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

// GET - 프로젝트의 초안 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const itemId = searchParams.get('itemId');

  if (!projectId) {
    return NextResponse.json(
      { success: false, error: 'PROJECT_ID_REQUIRED' },
      { status: 400 }
    );
  }

  try {
    const whereClause: any = { projectId };
    if (itemId) {
      whereClause.itemId = itemId;
    }

    const data = await prisma.draft.findMany({
      where: whereClause,
      select: {
        projectId: true,
        itemId: true,
        meta: true,
        markdown: true,
        version: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const drafts = data.map((item: any) => {
      let parsedMeta = null;
      try {
        parsedMeta = JSON.parse(item.meta || '{}');
      } catch (e) {
        console.warn(`[Draft] JSON parse error for ${item.itemId}:`, item.meta);
        parsedMeta = {};
      }
      return {
        projectId: item.projectId,
        itemId: item.itemId,
        meta: parsedMeta,
        markdown: item.markdown,
        version: item.version,
        updatedAt: item.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: drafts
    });

  } catch (error) {
    console.error('Drafts API error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
