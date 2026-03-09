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
const DEFAULT_PRESETS = [
  {
    name: '기본',
    isDefault: true,
    config: JSON.stringify({
      heading: {
        h1Color: '#0f172a',
        h1BorderColor: '#cbd5e1',
        h1FontSize: '28px',
        h2Color: '#1e293b',
        h2BorderColor: '#64748b',
        h2FontSize: '24px',
        h3Color: '#334155',
        h3BorderColor: '#94a3b8',
        h3FontSize: '20px',
      },
      bold: { color: '#1e293b' },
      blockquote: {
        borderColor: '#94a3b8',
        bgColor: '#f8fafc',
        textColor: '#475569',
      },
      list: { markerColor: '#64748b' },
      table: {
        headerBg: '#334155',
        headerColor: '#f8fafc',
        stripeBg: '#f8fafc',
        borderColor: '#e2e8f0',
      },
      cta: {
        buttonColor: '#475569',
        buttonTextColor: '#ffffff',
        buttonRadius: '12px',
      },
      article: {
        bgColor: '#ffffff',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: '1.8',
        textColor: '#334155',
      },
      disclaimer: { position: 'footer-only' },
    }),
  },
  {
    name: '클린 블루',
    isDefault: false,
    config: JSON.stringify({
      heading: {
        h1Color: '#0f172a',
        h1BorderColor: '#bfdbfe',
        h1FontSize: '28px',
        h2Color: '#1a1a2e',
        h2BorderColor: '#2563eb',
        h2FontSize: '24px',
        h3Color: '#1e293b',
        h3BorderColor: '#3b82f6',
        h3FontSize: '20px',
      },
      bold: { color: '#1e293b' },
      blockquote: {
        borderColor: '#2563eb',
        bgColor: '#eff6ff',
        textColor: '#1e40af',
      },
      list: { markerColor: '#2563eb' },
      table: {
        headerBg: '#1e293b',
        headerColor: '#fff',
        stripeBg: '#f8fafc',
        borderColor: '#e2e8f0',
      },
      cta: {
        buttonColor: '#2563eb',
        buttonTextColor: '#ffffff',
        buttonRadius: '12px',
      },
      article: {
        bgColor: '#ffffff',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: '1.8',
        textColor: '#334155',
      },
      disclaimer: { position: 'footer-only' },
    }),
  },
  {
    name: '미니멀 다크',
    isDefault: false,
    config: JSON.stringify({
      heading: {
        h1Color: '#f8fafc',
        h1BorderColor: '#334155',
        h1FontSize: '28px',
        h2Color: '#f1f5f9',
        h2BorderColor: '#6366f1',
        h2FontSize: '24px',
        h3Color: '#e2e8f0',
        h3BorderColor: '#818cf8',
        h3FontSize: '20px',
      },
      bold: { color: '#e2e8f0' },
      blockquote: {
        borderColor: '#6366f1',
        bgColor: '#1e1b4b',
        textColor: '#c7d2fe',
      },
      list: { markerColor: '#818cf8' },
      table: {
        headerBg: '#312e81',
        headerColor: '#e0e7ff',
        stripeBg: '#1e1b4b',
        borderColor: '#3730a3',
      },
      cta: {
        buttonColor: '#6366f1',
        buttonTextColor: '#ffffff',
        buttonRadius: '12px',
      },
      article: {
        bgColor: '#0f172a',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: '1.8',
        textColor: '#cbd5e1',
      },
      disclaimer: { position: 'footer-only' },
    }),
  },
  {
    name: '웜 코랄',
    isDefault: false,
    config: JSON.stringify({
      heading: {
        h1Color: '#0f172a',
        h1BorderColor: '#fecdd3',
        h1FontSize: '28px',
        h2Color: '#1a1a2e',
        h2BorderColor: '#f43f5e',
        h2FontSize: '24px',
        h3Color: '#374151',
        h3BorderColor: '#fb7185',
        h3FontSize: '20px',
      },
      bold: { color: '#1a1a2e' },
      blockquote: {
        borderColor: '#f43f5e',
        bgColor: '#fff1f2',
        textColor: '#9f1239',
      },
      list: { markerColor: '#f43f5e' },
      table: {
        headerBg: '#1a1a2e',
        headerColor: '#fff',
        stripeBg: '#fff5f5',
        borderColor: '#fecdd3',
      },
      cta: {
        buttonColor: '#f43f5e',
        buttonTextColor: '#ffffff',
        buttonRadius: '12px',
      },
      article: {
        bgColor: '#ffffff',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: '1.8',
        textColor: '#374151',
      },
      disclaimer: { position: 'footer-only' },
    }),
  },
  {
    name: '포레스트 그린',
    isDefault: false,
    config: JSON.stringify({
      heading: {
        h1Color: '#064e3b',
        h1BorderColor: '#bbf7d0',
        h1FontSize: '28px',
        h2Color: '#14532d',
        h2BorderColor: '#16a34a',
        h2FontSize: '24px',
        h3Color: '#166534',
        h3BorderColor: '#22c55e',
        h3FontSize: '20px',
      },
      bold: { color: '#14532d' },
      blockquote: {
        borderColor: '#16a34a',
        bgColor: '#f0fdf4',
        textColor: '#15803d',
      },
      list: { markerColor: '#16a34a' },
      table: {
        headerBg: '#14532d',
        headerColor: '#f0fdf4',
        stripeBg: '#f0fdf4',
        borderColor: '#bbf7d0',
      },
      cta: {
        buttonColor: '#16a34a',
        buttonTextColor: '#ffffff',
        buttonRadius: '12px',
      },
      article: {
        bgColor: '#ffffff',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: '1.8',
        textColor: '#1e293b',
      },
      disclaimer: { position: 'footer-only' },
    }),
  },
];

// ── GET: 테마 목록 조회 ──
export async function GET() {
  try {
    const themes = await prisma.articleTheme.findMany({
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });

    // 테마가 없으면 기본 프리셋 시딩
    if (themes.length === 0) {
      for (const preset of DEFAULT_PRESETS) {
        await prisma.articleTheme.create({ data: preset });
      }
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
