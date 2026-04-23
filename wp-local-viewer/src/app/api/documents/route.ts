export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

// GET: 문서 목록 조회 (최신순)
export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ success: true, documents });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : '문서 조회 실패',
    }, { status: 500 });
  }
}

// POST: 문서 임시 저장 또는 상태 업데이트
export async function POST(request: NextRequest) {
  try {
    const { id, title, markdown, categoryId, thumbnailUrl, status, publishedUrl } = await request.json();

    if (!title && !markdown) {
      return NextResponse.json({ error: 'title이나 markdown 값 중 하나는 필수입니다.' }, { status: 400 });
    }

    let document;
    
    // id가 있으면 업데이트, 없으면 생성
    if (id) {
      document = await prisma.document.update({
        where: { id },
        data: {
          title: title ?? '',
          markdown: markdown ?? '',
          categoryId: categoryId || null,
          thumbnailUrl: thumbnailUrl || null,
          status: status || 'DRAFT',
          publishedUrl: publishedUrl || null,
        }
      });
    } else {
      document = await prisma.document.create({
        data: {
          title: title ?? '',
          markdown: markdown ?? '',
          categoryId: categoryId || null,
          thumbnailUrl: thumbnailUrl || null,
          status: status || 'DRAFT',
          publishedUrl: publishedUrl || null,
        }
      });
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('❌ 문서 저장 실패:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '문서 저장 실패',
    }, { status: 500 });
  }
}
