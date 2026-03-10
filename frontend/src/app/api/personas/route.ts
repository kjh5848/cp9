import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

export const dynamic = 'force-dynamic';

import { SYSTEM_PERSONAS } from '@/entities/persona/model/types';

// 페르소나 목록 전체 조회
export async function GET() {
  try {
    // 시스템 페르소나 데이터베이스 시딩 (DB FK 무결성 유지 위함)
    for (const sys of SYSTEM_PERSONAS) {
      await prisma.persona.upsert({
        where: { id: sys.id },
        update: {
          name: sys.name,
          systemPrompt: sys.systemPrompt,
          toneDescription: sys.toneDescription,
          negativePrompt: sys.negativePrompt,
        },
        create: {
          id: sys.id,
          name: sys.name,
          systemPrompt: sys.systemPrompt,
          toneDescription: sys.toneDescription,
          negativePrompt: sys.negativePrompt,
        }
      });
    }

    const personas = await prisma.persona.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const systemIds = new Set(SYSTEM_PERSONAS.map(s => s.id));
    const formattedPersonas = personas.map((p: any) => ({
      ...p,
      isSystem: systemIds.has(p.id)
    }));

    return NextResponse.json({ success: true, data: formattedPersonas });
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
