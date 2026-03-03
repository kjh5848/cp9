export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

/**
 * 글 생성 모니터링 데이터 조회 API
 * GET /api/monitoring/trace?projectId=xxx&itemId=yyy
 *
 * DB에 저장된 pack.monitoring 데이터를 직접 반환합니다 (외부 API 호출 없음).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const itemId = searchParams.get('itemId');

    if (!projectId || !itemId) {
      return NextResponse.json({ error: 'projectId와 itemId가 필요합니다.' }, { status: 400 });
    }

    // DB에서 research 조회
    const research = await prisma.research.findUnique({
      where: { projectId_itemId: { projectId, itemId } },
    });

    if (!research) {
      return NextResponse.json({ error: '해당 글이 존재하지 않습니다.' }, { status: 404 });
    }

    let pack: Record<string, unknown> = {};
    try { pack = JSON.parse(research.pack); } catch { /* 무시 */ }

    // pack에서 모니터링 데이터 추출
    const monitoring = pack.monitoring as Record<string, unknown> | undefined;

    return NextResponse.json({
      success: true,
      hasMonitoring: !!monitoring,
      traceId: (monitoring?.langfuseTraceId || pack.langfuseTraceId || null) as string | null,
      monitoring: {
        // 모니터링 데이터 (DB 저장분)
        totalLatencyMs: monitoring?.totalLatencyMs ?? null,
        phases: monitoring?.phases ?? [],
        estimatedImageCost: monitoring?.estimatedImageCost ?? null,
        // 기본 정보 (pack 루트)
        textModel: pack.textModel || 'unknown',
        imageModel: pack.imageModel || 'unknown',
        persona: pack.persona || 'unknown',
        status: pack.status || 'unknown',
        completedAt: pack.completedAt || null,
      },
    });

  } catch (error) {
    console.error('Monitoring trace error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
