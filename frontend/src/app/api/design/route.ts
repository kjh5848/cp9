/**
 * 아티클 디자인 테마 CRUD API
 * GET  — 저장된 테마 목록 조회
 * POST — 새 테마 생성 (또는 기본 프리셋 시딩)
 * PUT  — 테마 수정
 * DELETE — 테마 삭제
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

// ── 기본 프리셋 테마 ──
import { DEFAULT_PRESETS } from '@/features/design-theme/model/presets';

// ── GET: 테마 목록 조회 ──
export async function GET() {
  try {
    const themes = await prisma.articleTheme.findMany({
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });

    // 테마가 없으면 기본 프리셋 시딩
    if (themes.length === 0) {
      await Promise.all(
        DEFAULT_PRESETS.map((preset) => prisma.articleTheme.create({ data: preset }))
      );
      const seeded = await prisma.articleTheme.findMany({
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      });
      return NextResponse.json({ themes: seeded });
    }

    return NextResponse.json({ themes });
  } catch (error) {
    console.error('[Design API] GET 에러:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: 새 테마 생성 ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, config, isDefault } = body;

    if (!name || !config) {
      return NextResponse.json({ error: 'name과 config은 필수입니다.' }, { status: 400 });
    }

    // 기본 테마로 설정하면 기존 기본 해제
    if (isDefault) {
      await prisma.articleTheme.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const theme = await prisma.articleTheme.create({
      data: {
        name,
        config: typeof config === 'string' ? config : JSON.stringify(config),
        isDefault: !!isDefault,
      },
    });

    return NextResponse.json({ theme }, { status: 201 });
  } catch (error) {
    console.error('[Design API] POST 에러:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PUT: 테마 수정 ──
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, config, isDefault } = body;

    if (!id) {
      return NextResponse.json({ error: 'id는 필수입니다.' }, { status: 400 });
    }

    // 기본 테마로 설정하면 기존 기본 해제
    if (isDefault) {
      await prisma.articleTheme.updateMany({
        where: { isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    const theme = await prisma.articleTheme.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(config && { config: typeof config === 'string' ? config : JSON.stringify(config) }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('[Design API] PUT 에러:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: 테마 삭제 ──
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id는 필수입니다.' }, { status: 400 });
    }

    await prisma.articleTheme.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Design API] DELETE 에러:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
