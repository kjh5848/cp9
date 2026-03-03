export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

// GET - 프로젝트의 리서치 데이터 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const itemId = searchParams.get('itemId');

  try {
    const whereClause: any = {};
    if (projectId) whereClause.projectId = projectId;
    if (itemId) whereClause.itemId = itemId;

    const data = await prisma.research.findMany({
      where: whereClause,
      select: {
        projectId: true,
        itemId: true,
        pack: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const research = data.map((item: any) => {
      let parsedPack = null;
      try {
        parsedPack = JSON.parse(item.pack || '{}');
      } catch (e) {
        console.warn(`[Research] JSON parse error for ${item.itemId}:`, item.pack);
        parsedPack = {};
      }
      return {
        projectId: item.projectId,
        itemId: item.itemId,
        pack: parsedPack,
        updatedAt: item.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: research
    });

  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT - 리서치 데이터 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, itemId, pack } = body;

    if (!projectId || !itemId || !pack) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    await prisma.research.upsert({
      where: {
        projectId_itemId: {
          projectId,
          itemId
        }
      },
      update: {
        pack: JSON.stringify(pack)
      },
      create: {
        projectId,
        itemId,
        pack: JSON.stringify(pack)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Research updated successfully'
    });

  } catch (error: any) {
    console.error('Research update API error:', error);
    return NextResponse.json(
      { success: false, error: 'UPDATE_FAILED', detail: error.message },
      { status: 500 }
    );
  }
}

// DELETE - 리서치/스케줄 데이터 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const itemId = searchParams.get('itemId');

    if (!projectId || !itemId) {
      return NextResponse.json(
        { success: false, error: 'projectId and itemId are required' },
        { status: 400 }
      );
    }

    await prisma.research.delete({
      where: {
        projectId_itemId: { projectId, itemId }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Research deleted successfully'
    });

  } catch (error: any) {
    console.error('Research delete API error:', error);
    return NextResponse.json(
      { success: false, error: 'DELETE_FAILED', detail: error.message },
      { status: 500 }
    );
  }
}
