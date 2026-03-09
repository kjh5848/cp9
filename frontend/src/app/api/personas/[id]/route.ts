import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

// 단일 페르소나 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const persona = await prisma.persona.findUnique({
      where: { id },
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: persona });
  } catch (error) {
    console.error('Failed to fetch persona:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 단일 페르소나 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, systemPrompt, toneDescription, negativePrompt } = body;

    const updatedPersona = await prisma.persona.update({
      where: { id },
      data: {
        name,
        systemPrompt,
        toneDescription,
        negativePrompt: negativePrompt || null,
      },
    });

    return NextResponse.json({ success: true, data: updatedPersona });
  } catch (error) {
    console.error('Failed to update persona:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 단일 페르소나 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    await prisma.persona.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete persona:', error);
    // 지우려는 페르소나가 이미 다른 테이블(AutopilotQueue 등)에 참조되어 외래키 제약조건 위반 시 에러 처리 가능
    if ((error as any).code === 'P2003') {
       return NextResponse.json({ error: 'Cannot delete because it is being used by queues.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
