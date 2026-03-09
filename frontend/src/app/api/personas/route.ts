import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

export const dynamic = 'force-dynamic';

// 페르소나 목록 전체 조회
export async function GET() {
  try {
    const personas = await prisma.persona.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: personas });
  } catch (error) {
    console.error('Failed to fetch personas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 새 페르소나 템플릿 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, systemPrompt, toneDescription, negativePrompt } = body;

    if (!name || !systemPrompt || !toneDescription) {
      return NextResponse.json(
        { error: 'Name, systemPrompt, and toneDescription are required' },
        { status: 400 }
      );
    }

    const newPersona = await prisma.persona.create({
      data: {
        name,
        systemPrompt,
        toneDescription,
        negativePrompt: negativePrompt || null,
      },
    });

    return NextResponse.json({ success: true, data: newPersona });
  } catch (error) {
    console.error('Failed to create persona:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
