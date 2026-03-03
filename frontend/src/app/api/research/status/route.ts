export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

/**
 * 글 생성 상태 폴링 API
 * GET /api/research/status?projectId=xxx&itemId=yyy
 * 
 * 응답: { status: 'PROCESSING' | 'PUBLISHED' | 'FAILED', pack: {...} }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const itemId = searchParams.get('itemId');

    if (!projectId || !itemId) {
      return NextResponse.json(
        { error: 'projectId와 itemId가 필요합니다.' },
        { status: 400 }
      );
    }

    const research = await prisma.research.findUnique({
      where: { projectId_itemId: { projectId, itemId } },
    });

    if (!research) {
      return NextResponse.json(
        { status: 'NOT_FOUND', message: '해당 글이 존재하지 않습니다.' },
        { status: 404 }
      );
    }

    // pack JSON에서 status 추출
    let pack: Record<string, unknown> = {};
    try {
      pack = JSON.parse(research.pack);
    } catch {
      pack = { status: 'UNKNOWN' };
    }

    const status = (pack.status as string) || 'UNKNOWN';

    return NextResponse.json({
      success: true,
      projectId,
      itemId,
      status,
      title: pack.title || null,
      completedAt: pack.completedAt || null,
      failedAt: pack.failedAt || null,
      error: pack.error || null,
    });
  } catch (error) {
    console.error('Research status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
